# SIGCA - Sistema de Gestión de Conferencias Académicas

Sistema web para la gestión integral de conferencias académicas del Congreso Internacional de Investigación y Divulgación de la Ciencia y la Ingeniería (CIIDiCI) del Instituto Tecnológico de Toluca.

## 📋 Información del Proyecto

- **Institución**: Instituto Tecnológico de Toluca
- **Estudiante**: José Javier Palma Aguilar
- **No. Control**: 20280807
- **Carrera**: Ingeniería en Sistemas Computacionales
- **Asesor Externo**: Dra. Eréndira Rendon Lara
- **Periodo**: 8 de septiembre de 2025 - 8 de enero de 2026

## 🎯 Objetivo

Desarrollar un sistema de gestión de conferencias académicas que permita administrar de manera eficiente la convocatoria, envío de propuestas, revisión por pares, retroalimentación y validación de trabajos académicos, utilizando tecnologías de software libre.

## 🚀 Tecnologías

### Stack Principal

- **Frontend/Backend**: Next.js 14+ (App Router) con JavaScript
- **Base de Datos**: PostgreSQL 15/16
- **ORM**: Prisma
- **Autenticación**: NextAuth.js
- **Estilos**: Tailwind CSS
- **Email**: Nodemailer con Gmail SMTP
- **Visualización PDF**: React-PDF
- **Validación**: Zod

### Entorno de Desarrollo

- **Contenedores**: Docker & Docker Compose
- **Editor**: Visual Studio Code
- **Control de Versiones**: Git
- **Node.js**: v20.x LTS o superior

## 📁 Estructura del Proyecto
```
sigca-sistema/
├── src/
│   ├── app/                      # Rutas de Next.js (App Router)
│   │   ├── api/                 # API Routes
│   │   │   ├── auth/           # Endpoints de autenticación
│   │   │   ├── convocatorias/  # Gestión de convocatorias
│   │   │   ├── ponencias/      # Gestión de papers
│   │   │   ├── revisores/      # Asignación y gestión
│   │   │   └── email/          # Sistema de notificaciones
│   │   ├── auth/               # Páginas de autenticación
│   │   ├── dashboard/          # Panel principal
│   │   ├── convocatorias/      # Interfaz de convocatorias
│   │   ├── ponencias/          # Gestión de submissions
│   │   └── layout.js           # Layout principal
│   ├── components/              # Componentes reutilizables
│   │   ├── ui/                 # Componentes de interfaz
│   │   ├── forms/              # Formularios
│   │   └── pdf-viewer/         # Visor de PDF
│   ├── lib/                     # Utilidades y configuraciones
│   │   ├── db.js               # Cliente Prisma
│   │   ├── auth.js             # Configuración NextAuth
│   │   └── email.js            # Configuración Nodemailer
│   ├── utils/                   # Funciones auxiliares
│   └── middleware.js            # Middleware de Next.js
├── prisma/
│   ├── schema.prisma            # Esquema de base de datos
│   └── migrations/              # Migraciones
├── public/
│   ├── uploads/                 # Archivos subidos
│   └── pdfs/                    # PDFs de ponencias
├── docker-compose.yml           # Configuración Docker
├── .env.local                   # Variables de entorno (no commiteado)
├── .gitignore
├── package.json
└── README.md
```

## 🗄️ Modelo de Datos

### Entidades Principales

- **Usuario**: Gestión de usuarios con roles (AUTOR, REVISOR, COMITE, ADMIN)
- **Convocatoria**: Llamados a papers con fechas y requisitos
- **Ponencia**: Submissions de trabajos académicos
- **Asignacion**: Relación revisor-ponencia
- **Evaluacion**: Dictámenes y retroalimentación
- **Notificacion**: Sistema de emails y alertas

### Roles del Sistema

- **AUTOR**: Envía y actualiza trabajos
- **REVISOR**: Evalúa trabajos asignados
- **COMITE**: Asigna revisores y valida trabajos
- **ADMIN**: Administración completa del sistema

## 🛠️ Instalación y Configuración

### Prerrequisitos
```bash
# Verificar versiones
node --version    # v20.x o superior
npm --version     # v10.x o superior
psql --version    # PostgreSQL 15 o 16
```

### Instalación

1. **Clonar el repositorio**
```bash
git clone [URL_DEL_REPOSITORIO]
cd sigca-sistema
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar base de datos PostgreSQL**
```sql
-- Conectarse a PostgreSQL
psql -U postgres

-- Crear base de datos
CREATE DATABASE sigca_db;

-- Crear usuario
CREATE USER sigca_user WITH PASSWORD 'tu_password_seguro';

-- Otorgar privilegios
GRANT ALL PRIVILEGES ON DATABASE sigca_db TO sigca_user;
```

4. **Configurar variables de entorno**

Crear archivo `.env.local`:
```env
# Base de datos
DATABASE_URL="postgresql://sigca_user:tu_password_seguro@localhost:5432/sigca_db"

# NextAuth
NEXTAUTH_SECRET="[generar con: openssl rand -base64 32]"
NEXTAUTH_URL="http://localhost:3000"

# Email (Gmail SMTP)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="tu-email@gmail.com"
EMAIL_SERVER_PASSWORD="tu-app-password"
EMAIL_FROM="noreply@sigca.edu.mx"

# Configuración
NODE_ENV="development"
MAX_FILE_SIZE="10485760"  # 10MB
```

5. **Inicializar base de datos**
```bash
# Generar cliente Prisma
npx prisma generate

# Crear migraciones
npx prisma migrate dev --name init

# (Opcional) Abrir Prisma Studio
npx prisma studio
```

6. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🐳 Docker

### Desarrollo con Docker Compose
```bash
# Iniciar contenedores
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener contenedores
docker-compose down

# Reconstruir
docker-compose up -d --build
```

## 📝 Scripts Disponibles
```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo

# Producción
npm run build           # Construir para producción
npm start               # Iniciar servidor de producción

# Base de datos
npx prisma generate     # Generar cliente Prisma
npx prisma migrate dev  # Crear migración
npx prisma migrate deploy # Aplicar migraciones en producción
npx prisma studio       # Interfaz visual de BD
npx prisma db push      # Sincronizar schema sin migración

# Utilidades
npm run lint            # Verificar código con ESLint
```

## 🔑 Funcionalidades Principales

### 1. Gestión de Convocatorias
- Publicación de calls for papers
- Configuración de fechas límite
- Especificación de áreas temáticas
- Requisitos y formatos

### 2. Envío de Trabajos
- Carga de PDFs
- Control de versiones
- Edición hasta fecha límite
- Visualización integrada

### 3. Sistema de Revisión
- Asignación automática por áreas
- Evaluación con rúbricas
- Retroalimentación anónima
- Sistema de comentarios

### 4. Notificaciones
- Emails automáticos
- Plantillas HTML profesionales
- Soporte para múltiples destinatarios
- Confirmación de acciones

### 5. Panel Administrativo
- Métricas y estadísticas
- Gestión de usuarios y roles
- Control de workflow
- Exportación de datos

## 🔒 Seguridad

- Hashing de contraseñas con bcrypt
- Autenticación basada en sesiones (NextAuth)
- Control de acceso basado en roles (RBAC)
- Validación de entrada con Zod
- Protección CSRF
- Variables de entorno para credenciales

## 📧 Sistema de Emails

### Configuración Gmail SMTP

1. Activar verificación en 2 pasos en tu cuenta Gmail
2. Generar contraseña de aplicación en: https://myaccount.google.com/apppasswords
3. Usar la contraseña generada en `EMAIL_SERVER_PASSWORD`

### Plantillas Disponibles

- Confirmación de registro
- Notificación de nueva convocatoria
- Confirmación de envío de trabajo
- Asignación de revisor
- Invitación a revisar
- Retroalimentación disponible
- Validación final

## 🧪 Testing
```bash
# Pruebas unitarias (por implementar)
npm test

# Pruebas de integración (por implementar)
npm run test:integration
```

## 📚 Documentación Adicional

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

## 🤝 Contribución

Este es un proyecto académico desarrollado como parte de la residencia profesional. Para contribuciones o sugerencias, contactar al asesor externo.

## 📄 Licencia

Este proyecto es desarrollado para el Instituto Tecnológico de Toluca bajo supervisión académica.

## 👨‍💻 Autor

**José Javier Palma Aguilar**  
Ingeniería en Sistemas Computacionales  
Instituto Tecnológico de Toluca  
No. Control: 20280807

## 📞 Contacto

Para consultas sobre el proyecto:
- **Asesor Externo**: Dra. Eréndira Rendon Lara
- **Institución**: Instituto Tecnológico de Toluca
- **Ubicación**: Metepec, Estado de México

---

**Nota**: Este README se actualiza conforme avanza el desarrollo del proyecto durante el periodo de residencia profesional (septiembre 2025 - enero 2026).

## Prisma important!!
```bash
# 0. Instalar
npm install @prisma/client
npm install prisma --save-dev

# 1. Inicializar Prisma en proyecto nuevo
npx prisma init

# 2. Editar prisma/schema.prisma

# 3. Generar migraciones
npx prisma migrate dev --name "descripcion_cambio"
npx prisma db push
# 4. Generas el cliente actualizado (este paso se puede omitir al ejecutar paso 3)
npx prisma generate

# 5. Ejecutar tu app
npm run dev

#6. ver ui 
npx prisma studio
```
## Docker important!!
```bash
# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Detener servicios
docker-compose down

# Reiniciar solo Next.js
docker-compose restart app

# Acceder a PostgreSQL directamente
docker-compose exec db psql -U postgres -d sigca

# Ejecutar comandos npm
docker-compose exec app npm install <paquete>

# Resetear base de datos (¡cuidado!)
docker-compose exec app npx prisma migrate reset
```
```bash
#entrar a cmd contenedor 
docker exec -it nextjs_app sh

#ejecutar schema o actualizaciones 
npx prisma migrate dev --name "init"

#salir
exit

```
