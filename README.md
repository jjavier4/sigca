# SIGCA - Sistema de Gestión de Conferencias Académicas

Sistema web para la gestión integral de conferencias académicas del Congreso Internacional de Investigación y Divulgación de la Ciencia y la Ingeniería (CIIDiCI) del Instituto Tecnológico de Toluca.



## Objetivo

Desarrollar un sistema de gestión de conferencias académicas que permita administrar de manera eficiente la convocatoria, envío de propuestas, revisión por pares, retroalimentación y validación de trabajos académicos, utilizando tecnologías de software libre.

## Tecnologías

| Área | Tecnología |
|---|---|
| Framework | Next.js 15.5 (App Router, JavaScript), React 19 |
| Arquitectura | Server Components y Server Actions; solo 3 route handlers (`auth`, PDF de trabajos, PDF de referencia de pago) |
| Base de datos | PostgreSQL 16 |
| ORM | Prisma 6 |
| Autenticación | next-auth v4 (credenciales, sesión JWT de 8 h) |
| Validación | Zod 4 |
| Estilos | Tailwind CSS 4, íconos lucide-react, gráficas recharts |
| Correo | Nodemailer (SMTP con STARTTLS) |
| PDF | Puppeteer + plantillas Handlebars (`templates/`) |
| Contenedores | Docker (desarrollo), Podman (producción) |
| Nube | Google Cloud: Cloud Build, Artifact Registry y Compute Engine, con nginx como proxy |

La aplicación se publica bajo el `basePath` `/ciidici`, que está definido en `src/utils/basePath.mjs`.

## Estructura del Proyecto

```
sigca/
├── src/
│   ├── app/
│   │   ├── (app)/                 # Páginas protegidas por rol: admin, author, committee, reviewer
│   │   ├── (auth)/                # login, register-revisor, reset-password, verify-email
│   │   ├── api/                   # auth/[...nextauth], works/[id] (PDF), user/ref-pay (PDF)
│   │   ├── about/, convocatories/, unauthorized/
│   │   └── layout.js
│   ├── actions/                   # Server Actions por módulo (auth, trabajos, asignaciones, dictámenes…)
│   ├── components/                # layout/, providers/ y ui/ por rol
│   ├── hooks/useAccion.js         # Ejecuta una Server Action y muestra la alerta del resultado
│   ├── lib/                       # auth, db (Prisma), email, tokens, rate-limit, PDF, reglas de negocio
│   │   └── data/                  # Consultas de lectura para los Server Components
│   ├── utils/                     # Utilidades compartidas (basePath, fechas, evaluación…)
│   └── middleware.js              # Protección de rutas por rol
├── prisma/schema.prisma           # Refleja el esquema de db/init
├── db/init/                       # SQL de creación: esquema, secuencias/funciones y admin inicial
├── templates/                     # Plantillas Handlebars de los PDF
├── public/
├── Dockerfile                     # Imagen de producción (Next standalone + Chromium)
├── cloudbuild.yaml                # Construcción y publicación en Artifact Registry
├── docker-compose.yml             # Producción (VM con Podman)
├── docker-compose.dev.yml         # Desarrollo local
└── plan_despliege.md              # Guía de despliegue en Google Cloud
```

## Modelo de Datos

### Entidades Principales

- **Usuarios**: roles AUTOR, REVISOR, COMITE y ADMIN, con verificación por correo y bloqueo de cuenta.
- **Convocatorias**: periodos de recepción con fecha de cierre.
- **Trabajos**: propuestas en PDF con coautores, niveles de IA y plagio, y estado (REGISTRADO, EN_REVISION, ACEPTADO, RECHAZADO).
- **Asignaciones**: relación entre revisor y trabajo, con su calificación y comentario.
- **Rúbricas**: criterios de evaluación.
- **Tokens**: enlaces de verificación, restablecimiento e invitación, con tipo y vencimiento.

### Roles del Sistema

- **AUTOR**: envía sus trabajos y consulta su estado.
- **REVISOR**: evalúa los trabajos que tiene asignados (máximo 4 activos).
- **COMITE**: registra IA y plagio, asigna revisores, emite dictámenes, invita revisores y administra a revisores y autores.
- **ADMIN**: crea y administra usuarios de comité y revisores.

En este sistema, "administrar" un usuario significa bloquear o desbloquear su cuenta.

## 🛠️ Desarrollo local

### Prerrequisitos

- Node.js 22 y npm
- Docker y Docker Compose

### Variables de entorno

Crea un archivo `.env` en la raíz. Nunca se sube al repositorio ni entra en la imagen.

```env
DATABASE_URL=postgresql://sigca_user:postgres@localhost:5432/sigca
APP_URL=http://localhost:3000/ciidici
NEXTAUTH_URL=http://localhost:3000/ciidici/api/auth
NEXTAUTH_SECRET=generar-con-openssl-rand-base64-32

EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=tu-email@gmail.com
EMAIL_SERVER_PASSWORD=tu-app-password
EMAIL_FROM=SIGCA <tu-email@gmail.com>

POSTGRES_USER=user
POSTGRES_PASSWORD=pass
POSTGRES_DB=db

PROJECT_ID=google_project
```

`NEXT_PUBLIC_APP_URL` ya no existe: los enlaces de los correos usan `APP_URL`.

### Opción A: base en Docker y Next en el equipo (recomendada)

```bash
npm install
docker compose -f docker-compose.dev.yml up -d db
npx prisma generate
npm run dev
```

Con esta opción, puppeteer usa el Chromium que descargó `npm install`, así que los PDF funcionan.

### Opción B: todo en Docker

```bash
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml logs -f app
```

Ese contenedor no trae Chromium, así que los PDF no se generan.

En ambas opciones la aplicación queda en `http://localhost:3000/ciidici`.

### Base de datos

No se usa `prisma migrate`. Postgres ejecuta los scripts de `db/init/` cuando el volumen está vacío:

1. `01-schema.sql`
2. `02-SecuenciasFunciones.sql`
3. `03-CreacionAdmin.sql`

Si cambias el esquema, actualiza a la vez `db/init/01-schema.sql` y `prisma/schema.prisma`, y después ejecuta `npx prisma generate`. Para empezar con una base vacía:

```bash
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d db
```

Para abrir una consola:

```bash
docker compose -f docker-compose.dev.yml exec db psql -U sigca_user -d sigca
```

> `03-CreacionAdmin.sql` crea una cuenta de ejemplo con una contraseña conocida. Cámbiala antes de usar el sistema en producción.

### Scripts

```bash
npm run dev     # Servidor de desarrollo
npm run build   # Compilación de producción (output standalone)
npm run lint    # ESLint
npx prisma generate
npx prisma studio
```

##  Despliegue

Producción corre en Google Cloud:

1. Cada *push* a `main` dispara Cloud Build.
2. Cloud Build compila el `Dockerfile` y publica `app:latest` en Artifact Registry.
3. Una VM con Debian 12 ejecuta `app` y `db` con Podman (`docker-compose.yml`).
4. nginx, en la misma VM, termina HTTPS con certbot y reenvía `/ciidici` a `127.0.0.1:3000`.

La guía completa, desde las cuentas de servicio hasta nginx, con la verificación, la actualización de versiones, los respaldos y los problemas conocidos, está en [plan_despliege.md](plan_despliege.md).

## Seguridad

- Contraseñas con bcrypt y sesión JWT en una cookie `__Secure-` cuando se usa HTTPS.
- Control de acceso por rol en tres lugares: el middleware, cada página (`requireSession`) y cada Server Action (`autorizarAccion`).
- Validación de entradas con Zod en todas las Server Actions.
- Tokens de un solo uso con vencimiento (15 min para verificación y restablecimiento, 7 días para invitaciones).
- Límite de peticiones por IP en el login y en las acciones sensibles.
- Protección CSRF de next-auth y verificación de `Origin` en las Server Actions.
- Secretos solo en variables de entorno.

## Correo (Gmail SMTP)

1. Activa la verificación en 2 pasos en la cuenta de Gmail.
2. Genera una contraseña de aplicación en https://myaccount.google.com/apppasswords.
3. Úsala en `EMAIL_SERVER_PASSWORD`.

El sistema envía estos correos:
- verificación de cuenta;
- restablecimiento de contraseña;
- invitación a revisores;
- dictamen de aceptación o rechazo, con el PDF adjunto.