# Prompt para Claude: Rediseño de gestión de archivos PDF en Next.js 15.5.5

## 1. Contexto del proyecto

- **Framework**: Next.js 15.5.5 con App Router.
- **Base de datos**: PostgreSQL. Actualmente guardo la URL del PDF (ej. `https://dominio.com/documents/pdf1`).
- **Estructura actual (incorrecta)**: Los PDFs se guardan en `public/documents/` y se sirven directamente como archivos estáticos.
- **Despliegue**: El proyecto vive dentro de un **contenedor Docker**. El acceso es mediante un **proxy inverso** que redirige `https://dominio.com/proyecto/*` al contenedor Next.js. Por lo tanto, la app **no está en la raíz del dominio**, sino bajo la subruta `/proyecto`.
- **Configuración prevista**: Ya tengo considerado usar `basePath: '/proyecto'` en `next.config.js` y `output: 'standalone'` para Docker.

## 2. El problema

Estuve desarrollando asumiendo incorrectamente que el directorio `public` de Next.js permite **lectura y escritura en tiempo de ejecución**. Mi idea original era que los usuarios subieran PDFs y estos se guardaran directamente en `public/documents/`.

Ahora sé que:

- `public` es **de solo lectura después del build**.
- Los archivos en `public` deben existir **antes de compilar**.
- Cualquier archivo en `public` es **completamente público** (sin control de acceso), lo cual es un riesgo de seguridad si los PDFs son de usuarios.

Por lo tanto, necesito **migrar a un enfoque donde los archivos subidos por usuarios se guarden fuera de `public`**, y se sirvan mediante endpoints controlados.

## 3. Instrucciones para la solución

Quiero que me des una solución completa, con código concreto y listo para producción, que incluya lo siguiente:

### a) Nueva carpeta de almacenamiento

- Crear una carpeta llamada `uploads` (o el nombre que consideres más apropiado) **en la raíz del proyecto**, al mismo nivel que `public`, `app`, etc.
- Esta carpeta debe quedar **fuera del build de Next.js** para que no sea servida como estática.
- Indicar cómo asegurar su persistencia en Docker (volumen o bind mount).
- Añadir `.gitignore` para no subir los archivos al repositorio.

### b) Endpoint para subir PDFs (escritura)

- Crear un **Route Handler** en `app/api/documents/upload/route.ts` (o la ruta que consideres más limpia).
- Debe recibir un `FormData` con el archivo PDF.
- Validar:
  - Que el archivo sea realmente un PDF (tipo MIME y/o firma del archivo).
  - Tamaño máximo razonable (ej. 10 MB, configurable).
  - Nombre seguro (evitar path traversal).
- Generar un nombre único para el archivo (ej. UUID + extensión) para evitar colisiones y enumeración.
- Escribir los bytes del PDF en la carpeta `uploads/` usando `fs/promises`.
- Guardar en PostgreSQL un registro con: `id`, `originalName`, `storedFilename`, `mimeType`, `size`, `userId` (si aplica), `createdAt`.
- Devolver al frontend el `id` del registro (no la ruta física del archivo).
- Si es posible, mostrar cómo se integraría con un formulario en el frontend (con `fetch` a `/proyecto/api/documents/upload`).

### c) Endpoint para recuperar y mostrar el PDF (lectura)

- Crear un **Route Handler** en `app/api/documents/[id]/route.ts`.
- Recibe el `id` del documento.
- Consulta PostgreSQL para obtener el `storedFilename` y verificar permisos (si aplica).
- Lee el archivo desde `uploads/` con `fs/promises`.
- Devuelve el PDF con los headers correctos:
  - `Content-Type: application/pdf`
  - `Content-Disposition: inline; filename="nombre-original.pdf"` (para previsualización en el navegador).
- Manejar errores: archivo no encontrado (404), sin permisos (403), error de servidor (500).

### d) Consideraciones sobre `basePath` y Docker

- Aclarar cómo afecta `basePath: '/proyecto'` a las rutas de estos endpoints (recordar que las URLs finales serán `/proyecto/api/documents/...`).
- Explicar cómo debe configurarse el proxy inverso para que estas rutas funcionen.
- Explicar cómo configurar el volumen de Docker para que la carpeta `uploads` persista entre reinicios y reconstrucciones del contenedor.

### e) Actualización del frontend

- Mostrar cómo el frontend debe dejar de usar URLs directas tipo `/documents/pdf1` y pasar a usar `/api/documents/{id}`.
- Cómo previsualizar el PDF en un `<iframe>` o `<embed>` apuntando al nuevo endpoint.
- Cómo manejar la subida desde un formulario.

### f) Actualización de la base de datos

- Proponer el esquema de tabla para los documentos (campos recomendados).
- Cómo migrar los registros existentes que apuntan a `public/documents/...` al nuevo esquema.

## 4. Restricciones y preferencias

- Usa **Javascript**.
- Usa **App Router** (no Pages Router).
- Usa `fs/promises` para operaciones de archivos.
- Evita dependencias innecesarias; si necesitas una librería (ej. para validar PDFs o generar UUIDs), justifícala.
- El código debe ser **listo para producción**: manejo de errores, validaciones, seguridad básica (evitar path traversal, validar tipo MIME, limitar tamaño).
- Explica brevemente cada decisión importante para que pueda entender el porqué.

Dame la solución completa, organizada por secciones, con bloques de código claros y comentarios donde sea útil.