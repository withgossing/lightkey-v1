# Base image: Node.js v24 (LTS/Stable)
FROM node:24-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /usr/src/app

# 네스트 기본 모노레포 혹은 싱글 프로젝트의 패키지를 복사
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
# NestJS v11 빌드 수행
RUN npm run build

# Development image, copy all the files and run next
FROM base AS development
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

# 실행 포트는 커스텀 포트 환경변수 또는 18003
EXPOSE 18003
CMD ["npm", "run", "start:dev"]

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /usr/src/app
ENV NODE_ENV production

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 18003
CMD ["node", "dist/main"]
