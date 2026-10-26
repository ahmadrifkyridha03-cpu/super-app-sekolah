# ==============================================================================
# DOCKERFILE - SUPER APP SEKOLAH TERPADU (KURIKULUM MERDEKA & CBT)
# Multi-stage build for minimal image size and fast start times
# ==============================================================================

FROM node:20-alpine AS base

# Install openssl for Prisma SQLite engine on Alpine Linux
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# ------------------------------------------------------------------------------
# Stage 1: Dependencies
# ------------------------------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm install

# ------------------------------------------------------------------------------
# Stage 2: Build Application
# ------------------------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npx prisma generate
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 3: Runner
# ------------------------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000

# Security: non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/templates ./templates

# Create volume mount point for persistent SQLite DB
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["npm", "run", "start"]
