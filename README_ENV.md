# ================================

# CampStation - Environment Configuration Guide

# ================================

## 📋 Overview

이 프로젝트는 3개의 환경으로 구성됩니다:

- **local/dev**: 로컬 개발 환경 (IDE + 로컬 서비스)
- **docker**: Docker 컨테이너 환경 (개발/테스트용)
- **prod**: 운영 환경 (프로덕션용)

## 🏗️ Architecture

```
Frontend (Next.js)     Backend (Spring Boot)     Database (PostgreSQL)
       |                       |                       |
       +-----------+-----------+-----------+-----------+
                   |           |           |
              Cache (Redis)    |      Storage (MinIO)
                               |
                          Mail (SMTP)
```

## 📁 File Structure

```
├── docker-compose.yml          # 기본 구성
├── docker-compose.dev.yml      # 개발 환경 오버라이드
├── docker-compose.prod.yml     # 운영 환경 오버라이드
├── .env.local                  # 로컬 환경 변수
├── .env.dev                    # 개발 환경 변수
├── .env.prod                   # 운영 환경 변수
├── backend/
│   ├── Dockerfile              # 백엔드 컨테이너화
│   └── src/main/resources/
│       ├── application.yml     # 기본 설정
│       ├── application-local.yml   # 로컬 환경
│       ├── application-dev.yml     # 개발 환경
│       └── application-prod.yml    # 운영 환경
└── frontend/
    ├── Dockerfile              # 프론트엔드 컨테이너화
    ├── .env.example            # 환경 변수 템플릿
    └── .env.local              # 로컬 환경 변수
```

## 🚀 Quick Start

### 로컬 개발 환경

```bash
# 1. 환경 변수 설정
cp .env.local.example .env.local
# .env.local 파일을 편집하여 로컬 설정 적용

# 2. 백엔드 실행 (IDE 또는 ./gradlew bootRun)
# 3. 프론트엔드 실행 (npm run dev)
```

### Docker 개발 환경

```bash
# 환경 변수 설정
cp .env.dev.example .env.dev

# 서비스 실행
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### 운영 환경

```bash
# 환경 변수 설정 (보안 유지)
cp .env.prod.example .env.prod

# 프로덕션 배포
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🔧 Environment Variables

### Backend (.env.\*)

```bash
# Database
DB_URL=jdbc:postgresql://db:5432/campstation
DB_USERNAME=campstation
DB_PASSWORD=secure_password

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRATION=3600000

# AWS S3 / MinIO
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=campstation-prod
AWS_S3_ENDPOINT=https://s3.amazonaws.com

# Email
MAIL_HOST=smtp.gmail.com
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

### Frontend (.env.\*)

```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your-kakao-api-key
NEXT_PUBLIC_APP_NAME=CampStation
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 🔒 Security Notes

- `.env.*` 파일들은 Git에 커밋하지 마세요
- 프로덕션에서는 강력한 비밀번호와 JWT 시크릿을 사용하세요
- AWS 자격증명은 IAM 역할을 사용하는 것을 권장합니다

## 📊 Monitoring

- Health Check: `http://localhost:8080/actuator/health`
- Metrics: `http://localhost:8080/actuator/metrics`
- Logs: Docker logs 또는 파일 시스템 로그 확인

## 🐛 Troubleshooting

- 컨테이너 로그 확인: `docker-compose logs [service-name]`
- 데이터베이스 연결 문제: 환경 변수와 네트워크 확인
- Redis 연결 문제: 헬스체크 상태 확인</content>
  <parameter name="filePath">c:\Users\say4u\WorkSpace\README_ENV.md
