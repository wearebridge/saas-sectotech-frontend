# ---------- Instala dependências ----------
FROM node:20-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
RUN npm ci


# ---------- Build da aplicação ----------
FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build


# ---------- Imagem final (container que sobe) ----------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Segurança: usuário não-root
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copia só o necessário para rodar
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Cria diretório de cache e ajusta permissões
RUN mkdir -p .next/cache && \
	chown -R nextjs:nodejs .next

USER nextjs

EXPOSE 80

CMD ["node", "server.js"]
