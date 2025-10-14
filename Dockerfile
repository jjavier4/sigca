# Etapa base
FROM node:18-alpine AS base

# Crea el directorio de la app
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copiar schema de Prisma
COPY prisma ./prisma/

# Generar Prisma Client durante el build
RUN npx prisma generate

# Copia el resto del código fuente
COPY . .

# Expone el puerto por defecto de Next.js
EXPOSE 3000

