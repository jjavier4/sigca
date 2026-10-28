# Plan de despliegue de SIGCA en Google Cloud

Guía para desplegar SIGCA desde cero en Google Cloud: la imagen se construye con **Cloud Build**, se guarda en **Artifact Registry** y se ejecuta en una **VM de Compute Engine** con **Podman**. En la misma VM, **nginx** termina HTTPS y publica la aplicación en `https://<dominio>/ciidici`. El dominio se administra en **Squarespace**.

Los valores entre `<...>` se sustituyen por los reales:

| Marcador | Ejemplo |
|---|---|
| `<proyecto>` | ID del proyecto de GCP |
| `<dominio>` | `dominio.com` |
| `<zona>` | `us-central1-a` |

La región es `us-central1` y el repositorio `repositorio-sigca`, los mismos que usa `cloudbuild.yaml`.

---

## Arquitectura

```
GitHub (main) ──push──▶ Cloud Build ──imagen──▶ Artifact Registry
                                                      │ pull
Internet ──80/443──▶ VM: nginx ──127.0.0.1:3000──▶ app (Podman) ──▶ db (Podman, red interna)
```

- Solo los puertos 80 y 443 quedan abiertos a internet. SSH entra por IAP.
- `app` escucha únicamente en `127.0.0.1:3000`. `db` no publica ningún puerto.
- La sesión (cookie de next-auth) viaja de forma transparente en todas las peticiones a través del proxy: páginas, Server Actions, `/api/auth/*` y los PDF.

---

## Cómo está preparada la aplicación

| Pieza | Estado |
|---|---|
| `basePath` | Se define una sola vez, en `src/utils/basePath.mjs` (`/ciidici`). Lo usan `next.config.mjs`, next-auth, el `SessionProvider`, los íconos y los enlaces a PDF. |
| URLs absolutas | No hay variables `NEXT_PUBLIC_*`. Los correos usan `APP_URL`, que se lee al ejecutar, así que la misma imagen sirve para cualquier dominio y no necesita argumentos de compilación. |
| API | Quedan tres route handlers: `auth/[...nextauth]`, `works/[id]` (PDF del trabajo) y `user/ref-pay` (PDF de la referencia de pago). Todo lo demás son Server Components y Server Actions. |
| Sesión | next-auth v4 con JWT de 8 h en una cookie. Si `NEXTAUTH_URL` empieza con `https://`, la cookie se llama `__Secure-next-auth.session-token`. |
| PDF | Se generan con puppeteer y el Chromium del sistema (`PUPPETEER_EXECUTABLE_PATH`). |
| Archivos subidos | Se guardan en `UPLOAD_DIR=/app/uploads`, dentro del volumen `uploads`. |
| Límite de peticiones | Se lleva en memoria y por IP, que se lee de `X-Forwarded-For`. Solo funciona bien con **una instancia**. |

## Archivos de despliegue

| Archivo | Uso |
|---|---|
| `Dockerfile` | Construcción en varias etapas sobre `node:22-bookworm-slim`: `deps`, `builder` (`prisma generate` y `next build`) y `runner` (Chromium, fuentes, usuario `node` sin privilegios, `node server.js`). |
| `cloudbuild.yaml` | Construye la imagen y la sube a `us-central1-docker.pkg.dev/$PROJECT_ID/repositorio-sigca/app:latest`. |
| `docker-compose.yml` | **Producción, para la VM.** `app` usa la imagen de Artifact Registry y `db` usa `postgres:16-alpine` con el nombre completo de la imagen. Monta `../db/init`. Va en `/opt/sigca/compose/`. |
| `docker-compose.dev.yml` | Desarrollo local: monta el código y ejecuta `npm run dev`. |
| `db/init/*.sql` | Esquema, secuencias, funciones y administrador inicial. Postgres los ejecuta **solo** cuando el volumen de datos está vacío. |

---

## Paso 0. Cuentas de servicio

Se crean dos cuentas de servicio. Artifact Registry no necesita una propia: solo recibe permisos sobre el repositorio en el paso 1.

| Cuenta | Para qué | Roles |
|---|---|---|
| `sigca-cloudbuild` | Ejecuta el trigger de Cloud Build | `roles/artifactregistry.writer` (en el repositorio) y `roles/logging.logWriter` (en el proyecto) |
| `sigca-vm` | Identidad de la VM, para descargar la imagen | `roles/artifactregistry.reader` (en el repositorio) y `roles/logging.logWriter` (en el proyecto) |

```bash
gcloud config set project <proyecto>

gcloud iam service-accounts create sigca-cloudbuild --display-name="SIGCA Cloud Build"
gcloud iam service-accounts create sigca-vm --display-name="SIGCA VM"

gcloud projects add-iam-policy-binding <proyecto> \
  --member="serviceAccount:sigca-cloudbuild@<proyecto>.iam.gserviceaccount.com" \
  --role="roles/logging.logWriter"

gcloud projects add-iam-policy-binding <proyecto> \
  --member="serviceAccount:sigca-vm@<proyecto>.iam.gserviceaccount.com" \
  --role="roles/logging.logWriter"
```

Permisos que necesitan las personas que operan:
- Quien crea el trigger necesita `roles/iam.serviceAccountUser` sobre `sigca-cloudbuild`.
- Quien crea la VM lo necesita sobre `sigca-vm`.
- Quien entra por SSH con IAP necesita `roles/iap.tunnelResourceAccessor` y `roles/compute.instanceAdmin.v1`, o el rol de propietario o editor del proyecto.

## Paso 1. Artifact Registry

1. Activa las APIs que se usarán en toda la guía:
   ```bash
   gcloud services enable artifactregistry.googleapis.com cloudbuild.googleapis.com \
     compute.googleapis.com iap.googleapis.com
   ```
2. Crea el repositorio de imágenes Docker:
   ```bash
   gcloud artifacts repositories create repositorio-sigca \
     --repository-format=docker --location=us-central1 \
     --description="Imágenes de SIGCA"
   ```
3. Da permisos sobre el repositorio a las dos cuentas: escritura a Cloud Build y lectura a la VM.
   ```bash
   gcloud artifacts repositories add-iam-policy-binding repositorio-sigca --location=us-central1 \
     --member="serviceAccount:sigca-cloudbuild@<proyecto>.iam.gserviceaccount.com" \
     --role="roles/artifactregistry.writer"

   gcloud artifacts repositories add-iam-policy-binding repositorio-sigca --location=us-central1 \
     --member="serviceAccount:sigca-vm@<proyecto>.iam.gserviceaccount.com" \
     --role="roles/artifactregistry.reader"
   ```

Opcional: como la etiqueta `latest` se sobrescribe en cada compilación, las versiones viejas quedan sin etiqueta. Una política de limpieza en el repositorio (*Cleanup policies* → borrar imágenes sin etiqueta) evita que ocupen espacio.

## Paso 2. Cloud Build

1. **Conectar GitHub:** Cloud Build → *Repositories*
   - Proveedor GitHub, región `us-central1`.
   - Autoriza la app *Google Cloud Build* en GitHub, con acceso solo al repositorio de SIGCA.
   - *Link repository* para vincularlo.
2. **Crear el trigger:** Cloud Build → *Triggers* → *Create trigger*:

   | Campo | Valor |
   |---|---|
   | Región | `us-central1` |
   | Evento | *Push to a branch* |
   | Rama | `^main$` |
   | Configuración | *Cloud Build configuration file*, ubicación `/cloudbuild.yaml` |
   | Service account | `sigca-cloudbuild@<proyecto>.iam.gserviceaccount.com` |

3. **Probar:** ejecuta el trigger con *Run* y espera a que termine en verde. Comprueba que existe la imagen `app:latest` en Artifact Registry → `repositorio-sigca`.

Notas:
- `cloudbuild.yaml` tiene `options.logging: CLOUD_LOGGING_ONLY`. Cloud Build lo exige cuando el trigger usa una cuenta de servicio propia; sin esa opción la compilación falla antes de empezar. Por eso la cuenta necesita `roles/logging.logWriter`.
- La imagen no lleva secretos ni argumentos de compilación. Todas las variables se leen en la VM al arrancar.
- Cloud Build compila en x86 (amd64), así que la VM también debe ser x86.

## Paso 3. VPC y firewall

Se usa la VPC `default`. Esta red bloquea toda conexión de entrada salvo lo que permitan las reglas. Las reglas abren puertos solo a las VMs que tengan cierta **etiqueta de red** (*network tag*). No hay que confundirla con las *labels* de GCP, que solo sirven para organizar recursos. Aquí la etiqueta es `sigca-web`.

1. **Revisa las reglas actuales:**
   ```bash
   gcloud compute firewall-rules list --filter="network=default"
   ```
2. **Elimina las reglas de riesgo**, que abren puertos a todo internet y a todas las VMs. `default-allow-internal` se conserva.
   ```bash
   gcloud compute firewall-rules delete default-allow-ssh default-allow-rdp
   ```
   `default-allow-icmp` (ping) es opcional: se puede dejar o borrar.
3. **Crea las reglas nuevas**, limitadas a la etiqueta:
   ```bash
   gcloud compute firewall-rules create sigca-allow-web --network=default \
     --direction=INGRESS --action=ALLOW --rules=tcp:80,tcp:443 \
     --source-ranges=0.0.0.0/0 --target-tags=sigca-web

   gcloud compute firewall-rules create sigca-allow-ssh-iap --network=default \
     --direction=INGRESS --action=ALLOW --rules=tcp:22 \
     --source-ranges=35.235.240.0/20 --target-tags=sigca-web
   ```

| Regla | Para qué |
|---|---|
| `sigca-allow-web` | Atiende 80 y 443. El 80 hace falta para que certbot valide el dominio y para redirigir a HTTPS. |
| `sigca-allow-ssh-iap` | SSH solo desde el rango de IAP (`35.235.240.0/20`), nunca desde internet. |

**No abras el 3000 ni el 5432.**

## Paso 4. VM

### 4.1 IP externa estática
```bash
gcloud compute addresses create sigca-ip --region=us-central1
gcloud compute addresses describe sigca-ip --region=us-central1 --format="value(address)"
```
Anota la IP: se usará en Squarespace (paso 6).

### 4.2 Crear la VM
```bash
gcloud compute instances create sigca-vm \
  --zone=<zona> \
  --machine-type=e2-medium \
  --image-family=debian-12 --image-project=debian-cloud \
  --boot-disk-size=30GB --boot-disk-type=pd-balanced \
  --address=sigca-ip \
  --tags=sigca-web \
  --service-account=sigca-vm@<proyecto>.iam.gserviceaccount.com \
  --scopes=cloud-platform
```

| Opción | Motivo |
|---|---|
| Debian 12, x86 | Coincide con la arquitectura de la imagen de Cloud Build. Ya trae `gcloud`. |
| `e2-medium` (2 vCPU, 4 GB) | Chromium (PDF) y Postgres comparten la memoria. Con menos, la generación de dictámenes puede fallar. |
| 30 GB balanceado | Espacio para las imágenes, la base y los PDF subidos. |
| `--tags=sigca-web` | Activa las reglas del paso 3. |
| `--scopes=cloud-platform` | Deja que los roles de `sigca-vm` decidan los permisos. Con el alcance predeterminado, la VM no puede leer Artifact Registry. |

Para entrar por SSH:
```bash
gcloud compute ssh sigca-vm --zone=<zona> --tunnel-through-iap
```

### 4.3 Paquetes
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y podman podman-compose uidmap slirp4netns nginx certbot python3-certbot-nginx
```
`uidmap` y `slirp4netns` son necesarios para ejecutar Podman sin root.

### 4.4 Usuario `sigca` y carpetas
Los contenedores se ejecutan con un usuario sin privilegios (Podman *rootless*), que también es dueño de los archivos.

```bash
sudo useradd -m -s /bin/bash sigca
sudo loginctl enable-linger sigca
grep sigca /etc/subuid /etc/subgid
sudo mkdir -p /opt/sigca/compose /opt/sigca/db/init
sudo chown -R sigca:sigca /opt/sigca
```

- `enable-linger` mantiene los servicios del usuario activos sin sesión abierta y permite que arranquen al encender la VM.
- `grep` debe mostrar una línea en cada archivo. Si no aparece, agrégala con `sudo usermod --add-subuids 100000-165535 --add-subgids 100000-165535 sigca`.

Estructura:
```
/opt/sigca/
├── compose/
│   ├── docker-compose.yml     ← el del repositorio
│   └── .env                   ← permisos 600
└── db/
    └── init/
        ├── 01-schema.sql
        ├── 02-SecuenciasFunciones.sql
        └── 03-CreacionAdmin.sql
```
El compose monta `../db/init`, así que `db/` debe quedar al lado de `compose/`. Los datos de Postgres y los PDF no se guardan en esta carpeta, sino en volúmenes de Podman dentro de `/home/sigca/.local/share/containers/storage/volumes/`. Así Podman se encarga de los permisos internos de cada contenedor.

### 4.5 Copiar los archivos a la VM
Desde tu equipo, en la raíz del repositorio:
```bash
gcloud compute scp --zone=<zona> --tunnel-through-iap \
  docker-compose.yml db/init/*.sql sigca-vm:~
```


### 4.6 `.env`
Créalo como `sigca` (`sudo -iu sigca`, luego `nano /opt/sigca/compose/.env`) y ciérralo con `chmod 600 /opt/sigca/compose/.env`.

```
PROJECT_ID=<proyecto>

POSTGRES_USER=sigca_user
POSTGRES_PASSWORD=contraseñaLargaYSegura
POSTGRES_DB=sigca

APP_URL=https://<dominio>/ciidici
NEXTAUTH_URL=https://<dominio>/ciidici/api/auth
NEXTAUTH_SECRET=resultadoDeOpensslRand

EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=cuenta@gmail.com
EMAIL_SERVER_PASSWORD=contraseñaDeAplicacion
EMAIL_FROM=SIGCA <cuenta@gmail.com>
```

> **Sin comillas en ningún valor.** El compose usa el `.env` de dos maneras:
> - Para sustituir `${...}` dentro del compose. Ahí se quitan las comillas; así llegan `PROJECT_ID`, `POSTGRES_*` y `DATABASE_URL`.
> - Con `env_file`, que pasa cada línea a `app` **tal cual, comillas incluidas**.
>
> Con `NEXTAUTH_URL="https://..."`, el middleware busca la cookie sin el prefijo `__Secure-`. El resultado es un ciclo infinito de redirecciones a `/login` y un cierre de sesión que manda a `https://"https`. Ver *Problemas conocidos*.

| Variable | Notas |
|---|---|
| `PROJECT_ID` | Solo sirve para armar el nombre de la imagen en el compose. |
| `POSTGRES_*` | Crean la base en el primer arranque y forman `DATABASE_URL`. Cambiarlos después **no** cambia la contraseña real de la base. |
| `APP_URL` | Base de los enlaces de los correos. Sin `/` final. |
| `NEXTAUTH_URL` | Debe coincidir exactamente con la URL pública y empezar con `https://`. |
| `NEXTAUTH_SECRET` | Se genera con `openssl rand -base64 32`. Si se cambia, se cierran todas las sesiones. |
| `EMAIL_*` | Servidor SMTP con STARTTLS en el 587. Con Gmail se usa una contraseña de aplicación. |

`DATABASE_URL` y `UPLOAD_DIR` las fija el compose. `NEXT_PUBLIC_APP_URL` ya no existe.

## Paso 5. Podman: login en Artifact Registry y arranque

Todo este paso se hace como el usuario `sigca`:


1. **Login.** La VM se autentica con la cuenta `sigca-vm` a través del servidor de metadatos, así que no hace falta ninguna llave. El token dura una hora: repite el login antes de cada descarga.
   ```bash
   gcloud auth print-access-token | podman login -u oauth2accesstoken --password-stdin https://us-central1-docker.pkg.dev
   ```
2. **Descargar y arrancar:**
   ```bash
   podman-compose pull
   podman-compose up -d
   podman ps
   podman logs -f compose_app_1
   ```
   Podman nombra los contenedores `compose_<servicio>_1` porque la carpeta se llama `compose`; `podman ps` muestra los nombres exactos. En el primer arranque, `db` ejecuta los scripts de `db/init`.
3. **Comprobar** desde la VM:
   ```bash
   curl -I http://127.0.0.1:3000/ciidici
   ```
4. **Arranque automático al encender la VM.** `restart: always` no basta en modo rootless: hace falta un servicio de usuario.
   ```bash
   systemctl --user enable --now podman-restart.service
   ```
   Si la versión de Podman no trae esa unidad (`Unit podman-restart.service not found`), crea `~/.config/systemd/user/sigca.service`:
   ```ini
   [Unit]
   Description=SIGCA
   After=network-online.target

   [Service]
   Type=oneshot
   RemainAfterExit=yes
   WorkingDirectory=/opt/sigca/compose
   ExecStart=/usr/bin/podman-compose up -d
   ExecStop=/usr/bin/podman-compose stop

   [Install]
   WantedBy=default.target
   ```
   y actívalo con `systemctl --user daemon-reload && systemctl --user enable sigca.service`.

Notas sobre Podman:
- La imagen de Postgres está escrita con su nombre completo (`docker.io/library/postgres:16-alpine`). Con el nombre corto, Podman se detiene a preguntar de qué registro descargarla.
- La versión de `podman-compose` de Debian 12 puede no esperar a que `db` esté sana (`condition: service_healthy`). Si `app` arranca antes, se reinicia sola gracias a `restart: always` hasta que la base responda.

## Paso 6. Dominio en Squarespace

Squarespace → *Domains* → `<dominio>` → *DNS* → *DNS Settings*:

1. Si el dominio no aloja un sitio de Squarespace, **borra los registros predeterminados** (*Squarespace Defaults*): los A hacia `198.185.159.x` / `198.49.23.x` y el CNAME `www` hacia `ext-cust.squarespace.com`. Desactiva también cualquier *Domain forwarding*.
2. Agrega los registros personalizados:

   | Tipo | Host | Valor |
   |---|---|---|
   | A | `@` | IP estática del paso 4.1 |
   | CNAME | `www` | `<dominio>` |

   Si el dominio raíz debe seguir mostrando un sitio de Squarespace, usa en cambio un subdominio: registro A con host `sigca` hacia la IP. En ese caso, `APP_URL`, `NEXTAUTH_URL` y `server_name` usan `sigca.<dominio>`.
3. Comprueba la propagación, que tarda de minutos a unas horas:
   ```bash
   dig +short <dominio>
   dig +short www.<dominio>
   ```
   Ambos deben devolver la IP de la VM antes de pasar a certbot.

## Paso 7. nginx y HTTPS

nginx recibe las peticiones y las reenvía a `127.0.0.1:3000` **sin quitar** `/ciidici`, porque el `basePath` lo espera.

1. **Crea `/etc/nginx/sites-available/sigca`** con `sudo nano /etc/nginx/sites-available/sigca`:
   ```nginx
   server {
       listen 80;
       listen [::]:80;
       server_name <dominio> www.<dominio>;

       server_tokens off;

       location = / {
           return 302 /ciidici;
       }

       location ^~ /ciidici {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;

           proxy_set_header Host              $host;
           proxy_set_header X-Forwarded-Host  $host;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_set_header X-Forwarded-For   $remote_addr;
           proxy_set_header X-Real-IP         $remote_addr;

           client_max_body_size 11m;
           proxy_read_timeout   120s;
           proxy_buffering      off;
       }
   }
   ```
2. **Actívalo** y quita el sitio por defecto:
   ```bash
   sudo ln -s /etc/nginx/sites-available/sigca /etc/nginx/sites-enabled/sigca
   sudo rm -f /etc/nginx/sites-enabled/default
   sudo nginx -t && sudo systemctl reload nginx
   ```
   En este punto, `http://<dominio>/ciidici` ya debe cargar.
3. **Certificado:** solo cuando el DNS del paso 6 ya apunte a la VM.
   ```bash
   sudo certbot --nginx -d <dominio> -d www.<dominio> --redirect -m <correo> --agree-tos
   sudo certbot renew --dry-run
   systemctl list-timers | grep certbot
   ```
   Certbot modifica el mismo archivo: agrega `listen 443 ssl`, las rutas del certificado y un bloque que redirige del 80 al 443. La renovación queda programada con `certbot.timer`.
4. **Si cambias la configuración después**, valida y recarga con `sudo nginx -t && sudo systemctl reload nginx`.

| Ajuste | Motivo |
|---|---|
| `proxy_pass` **sin** `/` final | Conserva `/ciidici` en la ruta. Con `/` final, nginx lo quitaría y todo respondería 404. |
| `Host` y `X-Forwarded-Host` | Las Server Actions comparan el `Origin` del navegador con el host. Si no coinciden, Next rechaza la acción. |
| `X-Forwarded-Proto` | Le indica a la aplicación que el usuario entró por HTTPS. |
| `X-Forwarded-For $remote_addr` | **Sobrescribe** la IP del cliente en lugar de agregarla. El límite de peticiones confía en este encabezado, y con `$proxy_add_x_forwarded_for` un cliente podría falsearlo. |
| `client_max_body_size 11m` | Los PDF de hasta 10 MB viajan dentro de una Server Action (`bodySizeLimit: '10mb'`), más el formulario. |
| `proxy_read_timeout 120s` | Aceptar o rechazar un trabajo genera el PDF con Chromium y envía un correo, y puede tardar. |
| `proxy_buffering off` | Las páginas se envían por partes (streaming de React). Sin búfer llegan antes. |
| `location = /` | La raíz del dominio lleva a la aplicación. |

---

## Verificación

Recorre esto en un navegador, en este orden:

1. `https://<dominio>` redirige a `/ciidici` y la página carga con estilos e ícono.
2. Registro de autor: llega el correo, el enlace abre `/ciidici/verify-email`, se activa la cuenta y se inicia sesión.
3. Sin sesión, abrir una página protegida lleva al login, y al entrar regresa a esa página (`callbackUrl`).
4. Como autor: subir un PDF, verlo y descargarlo.
5. Como comité: registrar IA y plagio, asignar revisor, evaluar como revisor, aceptar y rechazar (PDF del dictamen y correo), y "Reenviar dictamen".
6. Referencia de pago (PDF).
7. Restablecer contraseña e invitar revisores (enlaces de los correos construidos con `APP_URL`).
8. Cerrar sesión: vuelve a `https://<dominio>/ciidici` y borra la cookie.
9. Varios intentos de login fallidos desde dos equipos: el límite debe contarse por IP real.

## Actualizar a una versión nueva

1. Haz *push* a `main`. El trigger compila y sobrescribe `app:latest`.
2. En la VM, como `sigca` desde `/opt/sigca/compose`:
   ```bash
   gcloud auth print-access-token | podman login -u oauth2accesstoken --password-stdin https://us-central1-docker.pkg.dev
   podman-compose pull app
   podman-compose up -d --force-recreate app
   podman image prune -f
   ```
   Si la versión de `podman-compose` no recrea el contenedor, usa `podman-compose down && podman-compose up -d`. Los volúmenes conservan la base y los PDF.
3. Si solo cambiaste el `.env`, basta con `podman-compose up -d --force-recreate app`.

## Base de datos

### Base nueva
Se crea sola en el primer arranque con `db/init/` (paso 5). No se usa `prisma migrate`: la fuente de verdad es `db/init/`, y `prisma/schema.prisma` la refleja.


Si el administrador de ejemplo llegó a crearse, inutilízalo:
```sql
UPDATE "Usuarios" SET "bloqueada" = TRUE, "password" = '!cuenta-de-ejemplo-inutilizada'
WHERE "email" = 'admin@example.com';
```

### Respaldos
Hay que respaldar los dos volúmenes, la base y los PDF:
```bash
podman exec compose_db_1 pg_dump -U sigca_user sigca > ~/respaldo-$(date +%F).sql
podman volume export compose_uploads > ~/uploads-$(date +%F).tar
```
Copia los respaldos fuera de la VM, por ejemplo con `gcloud compute scp` o a Cloud Storage. Un *snapshot* programado del disco también sirve como respaldo completo.

---

## Problemas conocidos y su causa

| Síntoma | Causa | Solución |
|---|---|---|
| El login funciona, pero las páginas protegidas hacen miles de peticiones `_rsc` a `/login?callbackUrl=...` | `NEXTAUTH_URL` con comillas en el `.env`. El middleware (`getToken`) no detecta `https://`, busca la cookie sin `__Secure-` y redirige al login. El login sí ve la sesión y devuelve al usuario a la página, en ciclo. | Quitar las comillas, `podman-compose up -d --force-recreate app` y borrar las cookies del dominio. |
| Cerrar sesión manda a `https://"https` | La misma causa: next-auth antepone `https://` a un valor que empieza con `"`. La cookie `__Secure-next-auth.callback-url` queda envenenada. | La misma solución. Borrar las cookies es obligatorio. |
| Los enlaces de los correos están rotos | `APP_URL` con comillas. | Quitar las comillas. |
| Podman pregunta de qué registro descargar `postgres` | Nombre corto de imagen. | Usar `docker.io/library/postgres:16-alpine`. |
| `unauthorized` o `denied` al descargar la imagen | Token vencido, falta el rol `artifactregistry.reader` o la VM se creó sin `--scopes=cloud-platform`. | Repetir el login. Revisar el rol. Para cambiar el alcance hay que detener la VM: `gcloud compute instances set-service-account`. |
| La compilación falla: *"logs bucket"* o *"service account ... logging"* | Trigger con cuenta propia sin `CLOUD_LOGGING_ONLY` o sin `roles/logging.logWriter`. | Mantener la opción en `cloudbuild.yaml` y otorgar el rol. |
| `exec format error` al arrancar `app` | Imagen amd64 en una VM ARM (T2A). | Usar una VM x86 (E2, N2). |
| Server Actions rechazadas (`Invalid Server Actions request`) | El proxy no envía `Host` / `X-Forwarded-Host`. | Configuración de nginx del paso 7. |
| Los contenedores no vuelven después de reiniciar la VM | Falta `enable-linger` o el servicio de usuario. | Pasos 4.4 y 5.4. |

## Pendientes y riesgos

- **Sesión no refrescada:** un bloqueo de cuenta tarda hasta 8 h en aplicarse a una sesión abierta. Es una decisión tomada.
- **Límite de peticiones en memoria:** si algún día se ejecutan varias instancias de `app`, hay que moverlo a un almacén compartido, como Redis.
- **Etiqueta única `latest`:** no permite volver a una versión anterior. Se puede etiquetar también con `$SHORT_SHA` en `cloudbuild.yaml` y fijar esa etiqueta en el compose.
- **Historial de git:** contiene PDFs con RFC/CURP y el hash del administrador de ejemplo. Purgarlo exige `git filter-repo` y *force push*. Hay que decidirlo antes de hacer público el repositorio.
- **Índice único `(usuarioId, convocatoriaId)` en `Trabajos`:** recomendado para que la regla "ya enviaste una propuesta" sea atómica.
- **`user/ref-pay`:** sigue siendo un marcador con una referencia fija. La segunda referencia fallará hasta que se conecte el servicio web real.
- **Trabajos con coautores resueltos antes del arreglo:** se quedaron sin dictamen. Usar "Reenviar dictamen".