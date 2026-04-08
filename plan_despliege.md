# Plan de Despliegue en Producción para SIGCA

El proyecto está desarrollado en **Next.js 15 (App Router)**, con **PostgreSQL (Prisma)** y orquestado con **Docker** (`docker-compose`). Consideraremos específicamente que **será alojado bajo un subdirectorio (`dominio/ciidici`)** y cómo manejar las **rutas dinámicas para la creación y verificación de cuentas**.

---

## 1. Ajustes en la Arquitectura y Enrutamiento (`basePath`)

Actualmente, las páginas del proyecto se alojan dentro de `src/app/ciidici` y tu API dentro de `src/app/api`. Desplegar bajo un subdirectorio mediante proxy inverso es propenso a crear errores "404 Not Found" para tus recursos estáticos (`.js`, `.css`) y el ruteo interno de la API.

**Acciones recomendadas:**
1. **Configurar el `basePath` en Next.js:** 
   En tu `next.config.mjs`, debes indicarle a Next.js que la ruta base del proyecto es `/ciidici`.
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     basePath: '/ciidici',
   };
   export default nextConfig;
   ```
2. **Reestructurar las carpetas:**
   Al implementar el `basePath`, Next.js le agregará automáticamente `/ciidici` a toda la aplicación. **Por lo tanto, debes mover el contenido de `src/app/ciidici` directamente a la raíz de `src/app`**.
   - Tus páginas quedarán así: `src/app/auth/...`, `src/app/admin/...`
   - Tu API también recibirá el prefijo en las peticiones web de forma automática de frente al usuario: `dominio/ciidici/api/...`.

---

## 2. Componentes de Autenticación y Rutas Dinámicas (NextAuth y Tokens)

Tu aplicación cuenta con un módulo de autenticación mediante `next-auth` y manejo de tokens asíncronos en envíos de correo (e.g., registro de revisores, restablecimiento de contraseña).

**Acciones necesarias para producción:**

1. **Configurar correctamente NextAuth:**
   En producción, Next.js Auth pierde referencialidad del subdominio si no se le instruye explícitamente. Se debe asignar:
   ```env
   NEXTAUTH_URL="https://tu-dominio.com/ciidici"
   NEXTAUTH_SECRET="genera_un_hash_seguro_con_openssl"
   ```
2. **Construcción de los enlaces dinámicos por correo:**
   Al crear cuentas (ej. la invitación a revisores a través de `validate-invitation-token`), probablemente mandes un email. Usa la variable de entorno base para la construcción de esas rutas dinámicas enviadas en el email:
   ```javascript
   // Define esto en el .env: NEXT_PUBLIC_APP_URL="https://tu-dominio.com/ciidici"
   
   const urlRegistro = `${process.env.NEXT_PUBLIC_APP_URL}/auth/register-revisor?token=${token}`;
   ```
   **ADVERTENCIA:** Si usas `localhost:3000` hardcodeado en la lógica de generación del email, en producción los usuarios recibirán un link hacia `localhost:3000/ciidici/...` que no funcionará. Revisa todas las rutas de `src/app/api/...` donde utilizas `nodemailer` o `react-email`.

---

## 3. Variables de Entorno en Producción (.env)

No subas el archivo `.env` de desarrollo. Para el despliegue deberás proveer las variables de entorno para conectarlo todo:

```env
# Entorno e infraestructura
NODE_ENV=production
NEXT_PUBLIC_APP_URL="https://tu-dominio.com/ciidici"

# Base de datos (Usar el usuario y password estipulado para la base productiva)
DATABASE_URL="postgresql://usuario_bd:password_fuerte@tu_host_de_bd:5432/sigca?schema=public"

# Configuración de Autenticación NextAuth
NEXTAUTH_URL="https://tu-dominio.com/ciidici"
NEXTAUTH_SECRET="<GENERAR CON: $ openssl rand -base64 32>"

# Servicio SMTP (Tus configuraciones para envío de invitaciones/cuentas)
SMTP_HOST="..."
SMTP_PORT=465
SMTP_USER="..."
SMTP_PASS="..."
```

---

## 4. Configuración de Docker para Producción

En tu `Dockerfile` actual solo se están realizando dos pasos para dev (`npm install` y ejecutar el build de prisma). No obstante, en la fase de producción, Next.js necesita ser **compilado**.

Actualmente en tu `docker-compose.yml`, el `command` lanza la aplicación con `npm run dev`.

**Cambiar `docker-compose.yml` (o un `docker-compose.prod.yml`) para producción:**
En ambiente productivo necesitas hacer un build estático de la plataforma de la siguiente forma:

1. **Modificar el `Dockerfile` para un entorno multi-stage de producción (opcional pero muy recomendado por temas de peso)**, o al menos asegurarte de que ejecutas el build completo:
   ```Dockerfile
   # Instala dependencias y compila (BUILD STAGE)
   FROM node:18-alpine AS base
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY prisma ./prisma/
   RUN npx prisma generate
   COPY . .
   RUN npm run build
   
   # Luego debes levantar solo `npm run start` en producción
   EXPOSE 3000
   CMD ["npm", "run", "start"]
   ```
2. **Ejecutar las migraciones de Base de Datos:**
   Antes de arrancar la aplicación de Next.js (`npm run start`), debes aplicar las actualizaciones de la base de datos con prisma. Normalmente se hace mediante este comando:
   ```bash
   npx prisma migrate deploy
   ```
   Esto asegura que el esquema PostgreSQL se alinee con tu código antes de arrancar los contenedores.

---

## 5. Reverse Proxy (Nginx)

Ya que se ubicará en un dominio existente (`tu-dominio.com`), Nginx suele ser el enrutador frontal (reverse proxy) que atrape este tráfico y lo dirija al contenedor. Tendrías un bloque similar a este para la ubicación de tu app:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location /ciidici {
        # proxy_pass al puerto 3000 de tu contenedor expuesto en host
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Estas cabeceras ayudan a NextAuth a validar redirecciones HTTPS
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Resumen del Flujo de Trabajo para Despliegue Final:

1. Modificar y adaptar las estructura de carpetas de tu servidor local y el `next.config.mjs` para aplicar `basePath: '/ciidici'`.
2. Asegurar que los correos que despachan "tokens de registro dinámicos" implementen el uso de `NEXT_PUBLIC_APP_URL` en las rutas enviadas.
3. Actualizar la configuración de Dockerfile para que emita en "Standalone Mode" (Build Production) o al menos utilice `npm run build` seguido de `npm run start`.
4. Ejecutar el `docker compose up -d` en el VPS/DigitalOcean con las variables del entorno de producción (`.env.production`).
5. Ejecutar la migración inicial de la base de PostgreSQL (`docker exec -it nextjs_app npx prisma migrate deploy`).
6. Configurar Nginx para interceptar el tráfico hacia `/ciidici`, mandándolo transparente al contenedor de tu web.
