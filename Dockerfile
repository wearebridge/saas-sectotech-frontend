# ---------- Instala dependências ----------
# MUDANÇA AQUI: Usando o mirror oficial da AWS para o Node
FROM public.ecr.aws/docker/library/node:20-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
RUN npm ci


# ---------- Build da aplicação ----------
# MUDANÇA AQUI TAMBÉM
FROM public.ecr.aws/docker/library/node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production

ARG NEXT_PUBLIC_KEYCLOAK_CLIENT_ID
ARG NEXT_PUBLIC_KEYCLOAK_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_KEYCLOAK_REALM

ENV NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=$NEXT_PUBLIC_KEYCLOAK_CLIENT_ID
ENV NEXT_PUBLIC_KEYCLOAK_URL=$NEXT_PUBLIC_KEYCLOAK_URL
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_KEYCLOAK_REALM=$NEXT_PUBLIC_KEYCLOAK_REALM

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build


# ---------- Imagem final (container que sobe no ECS) ----------
# E MUDANÇA AQUI TAMBÉM
FROM public.ecr.aws/docker/library/node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=80
ENV HOSTNAME=0.0.0.0

# Segurança: usuário não-root
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copia só o necessário para rodar (modo standalone)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Cria diretório de cache e ajusta permissões
RUN mkdir -p .next/cache && \
    chown -R nextjs:nodejs .next

USER nextjs

EXPOSE 80

CMD ["node", "server.js"]
