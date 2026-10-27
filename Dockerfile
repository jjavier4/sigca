FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
ENV PUPPETEER_SKIP_DOWNLOAD=true
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    UPLOAD_DIR=/app/uploads \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN apt-get update \
    && apt-get install -y --no-install-recommends chromium fonts-liberation fonts-dejavu-core openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/templates ./templates
RUN mkdir -p /app/uploads && chown node:node /app/uploads

USER node
EXPOSE 3000
CMD ["node", "server.js"]
