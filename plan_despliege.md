# Plan de despliegue de SIGCA

SIGCA corre en un contenedor Docker (Next.js 15 en modo `standalone`) junto a un contenedor de PostgreSQL 16. Un proxy inverso (nginx) publica la aplicación en `https://<dominio>/ciidici` y reenvía todo el tráfico de esa ruta al contenedor. La sesión (cookie de next-auth) viaja de forma transparente en todas las peticiones: páginas, Server Actions, `/api/auth/*` y los PDF (`/api/works/[id]`, `/api/user/ref-pay`).

---

## 1. Cómo está preparada la aplicación

| Pieza | Estado |
|---|---|
| `basePath` | Definido una sola vez en `src/utils/basePath.mjs` (`/ciidici`). Lo usan `next.config.mjs`, next-auth (`lib/auth.js`), el `SessionProvider`, los íconos y los enlaces a PDF. |
| URLs absolutas | Ninguna variable `NEXT_PUBLIC_*`. El navegador usa rutas relativas con el `basePath`; los correos usan `APP_URL`, que se lee al ejecutar. Una misma imagen sirve para cualquier dominio. |
| API | Solo quedan 3 route handlers: `auth/[...nextauth]`, `works/[id]` (PDF del trabajo) y `user/ref-pay` (PDF de la referencia). Todo lo demás son Server Components y Server Actions. |
| Sesión | next-auth v4 con JWT (8 h) en cookie. Con `NEXTAUTH_URL` en `https`, la cookie se llama `__Secure-next-auth.session-token` y solo viaja por HTTPS. |
| PDF | Los dictámenes y la referencia de pago se generan con puppeteer usando el Chromium del sistema (`PUPPETEER_EXECUTABLE_PATH`). Las plantillas (`templates/`) y el logo (`public/logo-itt.png`) se copian a la imagen. |
| Archivos subidos | `UPLOAD_DIR=/app/uploads`, en el volumen `uploads`. |
| Límite de peticiones | En memoria, por IP (`X-Forwarded-For`). Correcto para **una sola instancia** de la aplicación. |

---

## 2. Archivos de despliegue

| Archivo | Uso |
|---|---|
| `Dockerfile` | Multi-etapa sobre `node:22-bookworm-slim`: `deps` (npm ci sin descargar Chromium), `builder` (`prisma generate` + `next build`), `runner` (Chromium, fuentes, usuario `node` sin privilegios, `node server.js`). |
| `docker-compose.yml` | **Producción.** `db` sin puerto publicado, `app` publicada solo en `127.0.0.1:3000` (la alcanza nginx en el mismo servidor), volúmenes `postgres_data` y `uploads`. Lee las variables de `.env`. |
| `docker-compose.dev.yml` | Desarrollo local (código montado y `npm run dev`). Usa la etapa `deps`; dentro de ese contenedor no hay Chromium, así que los PDF solo se generan si se ejecuta `npm run dev` fuera de Docker. |
| `.env.example` | Plantilla de variables. Copiarla a `.env` en el servidor. `.env` nunca entra a la imagen (`.dockerignore`) ni al repositorio (`.gitignore`). |
| `db/init/*.sql` | Esquema, secuencias y funciones; Postgres los ejecuta solo al crear una base vacía. |

---

## 3. Variables de entorno (`.env`)

| Variable | Ejemplo | Notas |
|---|---|---|
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | `sigca_user`, *(segura)*, `sigca` | Las usa el contenedor `db` y con ellas se arma `DATABASE_URL` en `docker-compose.yml`. |
| `APP_URL` | `https://dominio.com/ciidici` | Base de los enlaces de los correos (verificación, restablecimiento, invitación, "ver mis propuestas"). Sin `/` final. |
| `NEXTAUTH_URL` | `https://dominio.com/ciidici/api/auth` | Debe coincidir exactamente con la URL pública. Con `https` activa las cookies seguras. |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | Firma los JWT. Cambiarlo cierra todas las sesiones. |
| `EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT`, `EMAIL_SERVER_USER`, `EMAIL_SERVER_PASSWORD`, `EMAIL_FROM` | | SMTP. El transporte usa `secure: false` (STARTTLS en 587). |

`DATABASE_URL` y `UPLOAD_DIR` las fija `docker-compose.yml`. **Ya no existe `NEXT_PUBLIC_APP_URL`:** quitarla de cualquier `.env` anterior y agregar `APP_URL`.

---

## 4. Base de datos

### Base nueva
Al primer arranque, Postgres ejecuta `db/init/01-schema.sql`, `02-SecuenciasFunciones.sql` y `03-CreacionAdmin.sql`.

> **Antes de producción, revisar `03-CreacionAdmin.sql`:** crea `admin@example.com` con un hash de contraseña fijo y conocido (el mismo que estaba en el historial de git), con rol `COMITE`. Cambiar el correo y el hash por los reales (hash bcrypt de una contraseña de 12 a 72 caracteres) o, después del primer arranque, inutilizar esa cuenta:
> ```sql
> UPDATE "Usuarios" SET "bloqueada" = TRUE, "password" = '!cuenta-de-ejemplo-inutilizada'
> WHERE "email" = 'admin@example.com';
> ```

### Base existente (migrada desde desarrollo)
Aplicar, una sola vez y en este orden, lo que aún no se haya aplicado:

1. **Tokens con tipo y vencimiento** (módulo de auth). Borra los tokens actuales: los enlaces de verificación, restablecimiento e invitación pendientes dejan de servir.
   ```sql
   BEGIN;
   CREATE TYPE "TipoToken" AS ENUM ('VERIFICACION', 'RESTABLECIMIENTO', 'INVITACION');
   DELETE FROM "Tokens";
   DROP INDEX IF EXISTS idx_tokens_email;
   DROP INDEX IF EXISTS idx_tokens_token;
   DROP INDEX IF EXISTS idx_tokens_createdat;
   ALTER TABLE "Tokens" DROP CONSTRAINT IF EXISTS "Tokens_token_key";
   ALTER TABLE "Tokens"
     ADD COLUMN "tipo" "TipoToken" NOT NULL,
     ADD COLUMN "expiresAt" TIMESTAMPTZ NOT NULL,
     ADD PRIMARY KEY ("token");
   CREATE INDEX idx_tokens_email_tipo ON "Tokens"("email", "tipo");
   CREATE INDEX idx_tokens_expiresAt ON "Tokens"("expiresAt");
   COMMIT;
   ```
2. **Límite de las secuencias** (si la base es anterior a ese cambio):
   ```sql
   ALTER SEQUENCE convocatoria_sequence MAXVALUE 999;
   ALTER SEQUENCE asignacion_sequence MAXVALUE 999;
   ALTER SEQUENCE trabajo_sequence MAXVALUE 999;
   ```
3. **Cierres de convocatoria a las 00:00 UTC** (solo si se editaron cierres antes de la migración del comité):
   ```sql
   UPDATE "Convocatorias" SET fecha_cierre = fecha_cierre + interval '23:59:59.999'
   WHERE (fecha_cierre AT TIME ZONE 'UTC')::time = '00:00:00';
   ```

No se usa `prisma migrate`: la fuente de verdad es `db/init/` y `prisma/schema.prisma` la refleja.

### Respaldos
Respaldar los dos volúmenes: la base (`docker compose exec db pg_dump -U $POSTGRES_USER $POSTGRES_DB > respaldo.sql`) y `uploads` (los PDF de los trabajos).

---

## 5. Proxy inverso (nginx)

nginx termina HTTPS y reenvía `/ciidici` sin quitar el prefijo (el `basePath` lo espera). Configuración mínima dentro del `server { ... }` con TLS:

```nginx
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
```

Por qué cada línea:

| Ajuste | Motivo |
|---|---|
| `proxy_pass` **sin** `/` final | Conserva `/ciidici` en la ruta; con `/` final nginx lo quitaría y todo daría 404. |
| `Host` y `X-Forwarded-Host` | Las Server Actions comparan el `Origin` del navegador con el host de la petición; si no coinciden, Next rechaza la acción. También los usa el middleware para las redirecciones. |
| `X-Forwarded-Proto` | Para que la aplicación sepa que el usuario entró por HTTPS. |
| `X-Forwarded-For $remote_addr` | **Sobrescribe** (no agrega) la IP del cliente. El límite de peticiones confía en este encabezado; con `$proxy_add_x_forwarded_for` un cliente podría falsearlo. |
| `client_max_body_size 11m` | Los PDF de hasta 10 MB viajan dentro de una Server Action (`bodySizeLimit: '10mb'`) más el sobrecosto del formulario. |
| `proxy_read_timeout 120s` | Aceptar o rechazar un trabajo genera el PDF con Chromium y envía el correo; puede tardar varios segundos. |
| `proxy_buffering off` | Las páginas se transmiten por partes (streaming de React); sin búfer llegan antes. |

Opcional: si la raíz del dominio debe llevar a la aplicación, reenviar también `location = / { proxy_pass http://127.0.0.1:3000; }` (Next redirige `/` a `/ciidici`) o redirigir directo con `return 302 /ciidici;`.

---

## 6. Puesta en marcha

```bash
cp .env.example .env
docker compose build
docker compose up -d
docker compose logs -f app
```

Después del primer arranque: aplicar lo de la sección 4 que corresponda y recargar nginx (`nginx -t && systemctl reload nginx`).

Para actualizar: `git pull`, `docker compose build app`, `docker compose up -d app`. Los volúmenes conservan la base y los PDF.

---

## 7. Verificación después de desplegar

Nada de esto se probó todavía en un navegador real detrás del proxy; revisar en este orden:

1. `https://dominio/ciidici` carga con estilos e ícono (estáticos bajo el `basePath`).
2. Registro de autor → llega el correo → el enlace abre `/ciidici/verify-email` → "Activar mi cuenta" → iniciar sesión.
3. Entrar a una página protegida sin sesión → login → regresa a esa página (`callbackUrl`).
4. Subir un PDF como autor (Server Action con archivo), verlo y descargarlo.
5. Comité: registrar IA/plagio, asignar revisor, evaluar como revisor, aceptar y rechazar (PDF del dictamen + correo), "Reenviar dictamen".
6. Referencia de pago (PDF con puppeteer).
7. Restablecer contraseña e invitar revisores (enlaces de correo con `APP_URL`).
8. Cerrar sesión: debe volver a `/ciidici` y quitar la cookie.
9. Varios intentos fallidos de login desde dos equipos: el límite debe contarse por IP real (comprueba `X-Forwarded-For`).

---

## 8. Pendientes y riesgos conocidos

- **Sesión no refrescada:** un bloqueo de cuenta tarda hasta 8 h en aplicarse a una sesión abierta (decisión tomada; se puede revisar después).
- **Límite de peticiones en memoria:** si algún día se ejecutan varias instancias de `app`, hay que moverlo a un almacén compartido (Redis).
- **Historial de git:** contiene PDFs con RFC/CURP y el hash del administrador de ejemplo. Purgarlo exige `git filter-repo` y *force push*; decidirlo antes de publicar el repositorio.
- **Índice único `(usuarioId, convocatoriaId)` en `Trabajos`:** recomendado para que "ya enviaste una propuesta" sea atómico; agregarlo en `01-schema.sql` y con un `ALTER` en la base existente.
- **`user/ref-pay`:** sigue siendo un marcador (referencia fija `123456789012345677`, única); la segunda referencia fallará hasta conectar el web service.
- **Trabajos con coautores resueltos antes del arreglo:** quedaron sin dictamen; usar "Reenviar dictamen" en la pantalla de trabajos calificados.
