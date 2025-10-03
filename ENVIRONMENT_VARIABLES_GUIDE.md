# 🔐 환경변수 설정 가이드

## 📋 **개요**

이 프로젝트에서 사용되는 환경변수들과 설정 방법을 설명합니다.
보안상 중요한 값들은 반드시 환경변수로 설정해야 합니다.

## 🚨 **필수 환경변수 (운영 환경)**

### Backend (Spring Boot)

```bash
# JWT 시크릿 키 (필수)
JWT_SECRET=your-super-secure-jwt-secret-key-here-must-be-at-least-64-bytes-long

# 데이터베이스 설정 (필수)
DB_URL=jdbc:postgresql://your-db-host:5432/campstation
DB_USERNAME=your-db-username
DB_PASSWORD=your-secure-db-password

# CORS 설정 (필수)
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Redis 설정 (선택사항)
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

### Frontend (Next.js)

```bash
# API 엔드포인트 (필수)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api

# 카카오 맵 API 키 (필수)
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your-kakao-map-api-key

# 백엔드 프록시 URL (필수)
BACKEND_URL=https://api.yourdomain.com
```

## 🛠️ **개발 환경 설정**

### 1. Frontend 개발 환경

`.env.local` 파일을 생성하세요:

```bash
# Frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your-kakao-map-api-key
BACKEND_URL=http://localhost:8080
```

### 2. Backend 개발 환경

Docker Compose를 사용하면 자동으로 개발용 설정이 적용됩니다.
수동으로 실행할 경우 다음 환경변수들을 설정하세요:

```bash
# Backend 개발 환경
SPRING_PROFILES_ACTIVE=dev
JWT_SECRET=campstation-dev-secret-key-this-is-only-for-development
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## 🐳 **Docker 환경변수 설정**

### 개발 환경 (docker-compose.dev.yml)

이미 설정되어 있으므로 추가 설정이 필요하지 않습니다.
카카오 API 키만 환경변수로 설정하면 됩니다:

```bash
export KAKAO_MAP_API_KEY=your-kakao-map-api-key
# 또는
set KAKAO_MAP_API_KEY=your-kakao-map-api-key  # Windows
```

### 운영 환경

`.env.prod` 파일을 생성하거나 시스템 환경변수로 설정:

```bash
# .env.prod
JWT_SECRET=your-production-jwt-secret
DB_PASSWORD=your-production-db-password
CORS_ALLOWED_ORIGINS=https://yourdomain.com
KAKAO_MAP_API_KEY=your-kakao-map-api-key
```

## 🔧 **환경변수 검증**

### JWT 시크릿 키 요구사항

- **최소 길이**: 64바이트 이상
- **알고리즘**: HS512 호환
- **보안성**: 무작위 생성된 강력한 키

JWT 시크릿 키 생성 예시:

```bash
# OpenSSL 사용
openssl rand -base64 64

# Node.js 사용
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

### 데이터베이스 비밀번호 요구사항

- **최소 길이**: 12자 이상
- **복잡성**: 대소문자, 숫자, 특수문자 포함
- **고유성**: 기본값 사용 금지

## 📝 **환경별 설정 파일 위치**

```
backend/src/main/resources/
├── application.yml           # 공통 설정
├── application-dev.yml       # 개발 환경
└── application-prod.yml      # 운영 환경

frontend/
├── .env.example             # 예시 파일
├── .env.local              # 로컬 개발 (gitignore)
└── .env.production         # 운영 환경 (gitignore)
```

## ⚠️ **보안 주의사항**

### ❌ 하지 말아야 할 것

- JWT 시크릿을 코드에 하드코딩
- 실제 API 키를 예시 파일에 포함
- 데이터베이스 비밀번호를 평문으로 저장
- 환경변수 파일을 Git에 커밋

### ✅ 해야 할 것

- 모든 보안 관련 값을 환경변수로 설정
- `.env.*` 파일을 `.gitignore`에 추가
- 운영 환경에서는 더 강력한 값 사용
- 정기적으로 시크릿 키 로테이션

## 🚀 **배포 시 체크리스트**

- [ ] JWT_SECRET 설정 확인
- [ ] DB_PASSWORD 설정 확인
- [ ] CORS_ALLOWED_ORIGINS 설정 확인
- [ ] KAKAO_MAP_API_KEY 설정 확인
- [ ] 모든 하드코딩된 값 제거 확인
- [ ] 환경변수 파일 보안 설정 확인

## 🔍 **문제 해결**

### "JWT secret key not configured" 오류

JWT_SECRET 환경변수가 설정되지 않았습니다:

```bash
export JWT_SECRET=your-jwt-secret-key
```

### "Database connection failed" 오류

데이터베이스 관련 환경변수를 확인하세요:

```bash
export DB_PASSWORD=your-database-password
export DB_URL=jdbc:postgresql://localhost:5432/campstation
```

### CORS 오류

허용된 도메인을 확인하세요:

```bash
export CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

## 📞 **지원**

환경변수 설정에 문제가 있다면:

1. 이 문서의 예시를 따라 설정
2. 환경변수가 올바르게 로드되는지 확인
3. 로그에서 구체적인 오류 메시지 확인
