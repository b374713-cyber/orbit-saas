# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

# ============================================
# Stage 2: Builder
# ============================================
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ============================================
# Stage 3: Runner
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy package files
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./

# Copy Prisma
# Copy Prisma
COPY --from=builder /app/prisma7.config.ts ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated ./src/generated
# Copy built app
COPY --from=builder /app/dist ./dist

# Change ownership
RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 4000

CMD ["node", "dist/main"]