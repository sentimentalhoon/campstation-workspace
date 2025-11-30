# ================================
# CampStation Frontend - Multi-Stage Dockerfile
# ================================
# 최적화된 Next.js 애플리케이션 컨테이너화
# - Multi-stage build로 이미지 크기 최적화
# - Standalone output 모드 사용
# - Non-root 사용자 실행

# ================================
# Dependencies Stage
# ================================
FROM node:22-alpine AS dependencies

LABEL maintainer="CampStation Team" \
      description="CampStation Frontend - Dependencies Stage" \
      version="1.0.0"

# npm 업데이트 (최신 버전으로)
RUN npm install -g npm@latest

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 파일 복사
COPY package.json package-lock.json ./

# 의존성 설치 (production만)
RUN npm ci --only=production --omit=dev

# ================================
# Builder Stage
# ================================
FROM node:22-alpine AS builder

# npm 업데이트 (최신 버전으로)
RUN npm install -g npm@latest

WORKDIR /app

# 빌드 타임 ARG 선언 (docker-compose에서 전달)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_APP_VERSION
ARG NEXT_PUBLIC_NAVER_MAP_CLIENT_ID
ARG NEXT_PUBLIC_TOSS_CLIENT_KEY

# 의존성 파일 복사
COPY package.json package-lock.json ./

# 모든 의존성 설치 (dev dependencies 포함)
RUN npm ci

# 소스 코드 복사
COPY . .

# 빌드 시 필요한 환경 변수
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME} \
    NEXT_PUBLIC_APP_VERSION=${NEXT_PUBLIC_APP_VERSION} \
    NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=${NEXT_PUBLIC_NAVER_MAP_CLIENT_ID} \
    NEXT_PUBLIC_TOSS_CLIENT_KEY=${NEXT_PUBLIC_TOSS_CLIENT_KEY}

# Next.js 빌드
RUN npm run build

# ================================
# Production Stage
# ================================
FROM node:22-alpine AS production

LABEL maintainer="CampStation Team" \
      description="CampStation Frontend Production Runtime" \
      version="1.0.0"

WORKDIR /app

# 보안: root가 아닌 사용자 생성
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# 필요한 파일만 복사
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 사용자 전환
USER nextjs

# 포트 노출
EXPOSE 3000

# 환경 변수
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 실행
CMD ["node", "server.js"]
