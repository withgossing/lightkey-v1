# Base image: Node.js v24 (LTS/Stable)
FROM node:24-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /usr/src/app

# Next.js v16 & TailwindCSS v4 패키지 설치
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

# Next.js telemetry disable (옵션)
ENV NEXT_TELEMETRY_DISABLED 1

# Next.js 빌드 수행
RUN npm run build

# Development image
FROM base AS development
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

# 포트는 커스텀 포트 환경변수 또는 18004
EXPOSE 18004
ENV PORT 18004
CMD ["npm", "run", "dev"]

# Production image
FROM base AS runner
WORKDIR /usr/src/app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json

EXPOSE 18004
ENV PORT 18004

CMD ["node", "node_modules/next/dist/bin/next", "start"]
