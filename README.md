This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

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
