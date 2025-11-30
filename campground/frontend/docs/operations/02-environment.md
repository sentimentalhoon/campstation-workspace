# 환경 변수 가이드

> 환경 변수 설정 및 관리 가이드

## 📋 목차

1. [환경 변수 개요](#환경-변수-개요)
2. [프론트엔드 환경 변수](#프론트엔드-환경-변수)
3. [백엔드 환경 변수](#백엔드-환경-변수)
4. [환경별 설정](#환경별-설정)
5. [API 키 관리](#api-키-관리)
6. [보안 주의사항](#보안-주의사항)

---

## 🌍 환경 변수 개요

### 환경 변수 파일 구조

```
frontend/
├── .env.example          # 템플릿 (Git 추적)
├── .env.local            # 로컬 개발용 (Git 무시)
├── .env.production       # 프로덕션용 (Git 무시)
└── .env.keys             # API 키 참조 문서 (Git 무시)

workspace/
├── .env.example          # 백엔드 템플릿 (Git 추적)
└── .env.prod             # 프로덕션용 (Git 무시)
```

### 환경 구분

| 환경            | 파일                            | 용도                    |
| --------------- | ------------------------------- | ----------------------- |
| **로컬 개발**   | `.env.local`                    | 로컬에서 npm run dev    |
| **Docker 개발** | `.env` (루트)                   | docker-compose.dev.yml  |
| **프로덕션**    | `.env.production` + `.env.prod` | docker-compose.prod.yml |

---

## 🎨 프론트엔드 환경 변수

### 필수 환경 변수

#### 1. API Endpoint

```bash
# 로컬 개발
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Docker 개발
NEXT_PUBLIC_API_URL=http://backend:8080/api

# 프로덕션 (DDNS)
NEXT_PUBLIC_API_URL=http://mycamp.duckdns.org/api
```

#### 2. Application Info

```bash
NEXT_PUBLIC_APP_NAME=CampStation
NEXT_PUBLIC_APP_VERSION=1.0.0
```

#### 3. Naver Map API

```bash
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=jq20atlff0
```

**사용처**:

- 캠핑장 위치 지도 표시
- 검색 결과 지도 뷰

**발급 방법**:

1. [Naver Cloud Platform](https://console.ncloud.com/) 로그인
2. Application 등록
3. Maps > Web Dynamic Map v3 선택
4. Client ID 발급

---

### 선택적 환경 변수

#### 4. OAuth2 소셜 로그인 (MVP 이후)

```bash
# Kakao Login
NEXT_PUBLIC_KAKAO_REST_API_KEY=bbefec8e2bb060a63249bf25a3c737f1
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=14274277b7b930e3289085afa313c81c
NEXT_PUBLIC_KAKAO_ADMIN_KEY=bbefec8e2bb060a63249bf25a3c737f1

# Naver Login
NEXT_PUBLIC_NAVER_CLIENT_ID=NvwJHLtK_ttnE3wDTFZj
NEXT_PUBLIC_NAVER_CLIENT_SECRET=S_QEyzOOGg

# Google Login (향후 추가)
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Facebook Login (향후 추가)
# NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id
```

**Redirect URI 설정**:

- Kakao: `http://mycamp.duckdns.org/api/v1/auth/kakao/callback`
- Naver: `http://mycamp.duckdns.org/api/v1/auth/naver/callback`

#### 5. Toss Payments

```bash
# 테스트 환경
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_Ba5PzR0ArnWxBomvJB1z8vmYnNeD

# 프로덕션 환경 (실제 결제 시)
# NEXT_PUBLIC_TOSS_CLIENT_KEY=live_ck_your_actual_key
```

**사용처**:

- 예약 결제 화면
- 결제 위젯 초기화

#### 6. Backend URL (SSR용)

```bash
# Docker 내부 통신 (프로덕션)
BACKEND_URL=http://campstation-backend:8080

# 로컬 개발 (SSR이 localhost에서 backend 접근)
BACKEND_URL=http://localhost:8080
```

**용도**: Server Component에서 API 호출 시 사용

---

## ⚙️ 백엔드 환경 변수

### 필수 환경 변수

#### 1. Database

```bash
# PostgreSQL 연결
DB_URL=jdbc:postgresql://postgres:5432/campstation
DB_USERNAME=campstation_user
DB_PASSWORD=your_secure_password

# Connection Pool
DB_POOL_SIZE=10
DB_MAX_LIFETIME=1800000
```

#### 2. JWT

```bash
# JWT Secret (최소 32자 이상 랜덤 문자열)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters

# JWT 만료 시간 (밀리초)
JWT_ACCESS_TOKEN_EXPIRATION=3600000    # 1시간
JWT_REFRESH_TOKEN_EXPIRATION=604800000 # 7일
```

**JWT Secret 생성 방법**:

```bash
# OpenSSL 사용
openssl rand -base64 32

# Node.js 사용
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### 3. CORS

```bash
# 허용할 Origin
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://mycamp.duckdns.org

# 개발 환경에서는 모든 Origin 허용 (주의!)
# CORS_ALLOWED_ORIGINS=*
```

---

### 선택적 환경 변수

#### 4. OAuth2 Server Secret Keys

```bash
# Kakao
KAKAO_CLIENT_SECRET=your_kakao_secret_key

# Naver
NAVER_CLIENT_SECRET=S_QEyzOOGg

# Google (향후)
# GOOGLE_CLIENT_SECRET=your_google_secret
```

#### 5. Toss Payments Server Key

```bash
# 테스트 환경
TOSS_SECRET_KEY=test_sk_ALnQvDd2VJ6GD4DevYvaVMj7X41m

# 프로덕션 환경
# TOSS_SECRET_KEY=live_sk_your_actual_secret_key
```

#### 6. File Upload

```bash
# MinIO (S3 호환 스토리지)
MINIO_ENDPOINT=http://minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=campstation

# AWS S3 (향후 마이그레이션 시)
# AWS_S3_BUCKET=your-bucket-name
# AWS_ACCESS_KEY_ID=your_access_key
# AWS_SECRET_ACCESS_KEY=your_secret_key
# AWS_REGION=ap-northeast-2
```

#### 7. Logging & Monitoring

```bash
# 로그 레벨
LOG_LEVEL=INFO

# Sentry (에러 트래킹, 향후 추가)
# SENTRY_DSN=your_sentry_dsn
```

---

## 🔧 환경별 설정

### 로컬 개발 환경

**frontend/.env.local**:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_APP_NAME=CampStation (Dev)
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=jq20atlff0
BACKEND_URL=http://localhost:8080
```

**실행**:

```bash
cd frontend
npm run dev
```

---

### Docker 개발 환경

**workspace/.env**:

```bash
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=jq20atlff0

# Backend
DB_URL=jdbc:postgresql://postgres:5432/campstation
DB_USERNAME=campstation
DB_PASSWORD=dev_password
JWT_SECRET=dev_jwt_secret_key_for_testing_only
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

**실행**:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

---

### 프로덕션 환경

**frontend/.env.production**:

```bash
# API (DDNS 도메인)
NEXT_PUBLIC_API_URL=http://mycamp.duckdns.org/api
BACKEND_URL=http://campstation-backend:8080

# Application
NEXT_PUBLIC_APP_NAME=CampStation
NEXT_PUBLIC_APP_VERSION=1.0.0

# Map API
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=jq20atlff0

# OAuth2 (실제 키 사용)
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=14274277b7b930e3289085afa313c81c
NEXT_PUBLIC_NAVER_CLIENT_ID=NvwJHLtK_ttnE3wDTFZj

# Payments (실제 키로 변경 필요)
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_Ba5PzR0ArnWxBomvJB1z8vmYnNeD
```

**workspace/.env.prod**:

```bash
# Database
DB_URL=jdbc:postgresql://postgres:5432/campstation
DB_USERNAME=campstation_prod
DB_PASSWORD=STRONG_SECURE_PASSWORD_HERE

# JWT (강력한 시크릿 키 사용)
JWT_SECRET=PRODUCTION_SECRET_KEY_MINIMUM_32_CHARACTERS
JWT_ACCESS_TOKEN_EXPIRATION=3600000
JWT_REFRESH_TOKEN_EXPIRATION=604800000

# CORS
CORS_ALLOWED_ORIGINS=http://mycamp.duckdns.org,https://mycamp.duckdns.org

# OAuth2 Server Keys
KAKAO_CLIENT_SECRET=your_actual_kakao_secret
NAVER_CLIENT_SECRET=S_QEyzOOGg

# Payments
TOSS_SECRET_KEY=test_sk_ALnQvDd2VJ6GD4DevYvaVMj7X41m

# MinIO
MINIO_ENDPOINT=http://minio:9000
MINIO_ACCESS_KEY=prod_access_key
MINIO_SECRET_KEY=prod_secret_key
```

**실행**:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 🔑 API 키 관리

### .env.keys 파일

**목적**: API 키 관리 및 참조 문서 (Git에 커밋하지 않음)

**frontend/.env.keys 예시**:

```bash
# ================================
# CampStation API Keys Reference
# ================================
# 이 파일은 Git에 커밋되지 않습니다.
# 팀원들과 안전한 방법으로 공유하세요 (예: 1Password, Vault)

# ================================
# Naver Map API
# ================================
Client ID: jq20atlff0
등록 URL: https://console.ncloud.com/
사용처: 캠핑장 위치 지도

# ================================
# Kakao Login
# ================================
REST API Key: bbefec8e2bb060a63249bf25a3c737f1
JavaScript Key: 14274277b7b930e3289085afa313c81c
Admin Key: bbefec8e2bb060a63249bf25a3c737f1
등록 URL: https://developers.kakao.com/
Redirect URI: http://mycamp.duckdns.org/api/v1/auth/kakao/callback

# ================================
# Naver Login
# ================================
Client ID: NvwJHLtK_ttnE3wDTFZj
Client Secret: S_QEyzOOGg
등록 URL: https://developers.naver.com/
Redirect URI: http://mycamp.duckdns.org/api/v1/auth/naver/callback

# ================================
# Toss Payments
# ================================
Test Client Key: test_ck_Ba5PzR0ArnWxBomvJB1z8vmYnNeD
Test Secret Key: test_sk_ALnQvDd2VJ6GD4DevYvaVMj7X41m
등록 URL: https://developers.tosspayments.com/
사용처: 예약 결제

# Live 키는 실제 결제 서비스 시작 시 발급
```

### API 키 보안 수칙

1. ✅ **절대 Git에 커밋하지 않기**
   - `.env.local`, `.env.production`, `.env.keys` → `.gitignore`
   - `.env.example`만 커밋 (실제 키 없이 템플릿만)

2. ✅ **환경별로 다른 키 사용**
   - 개발: 테스트 키
   - 프로덕션: 실제 키

3. ✅ **키 순환 정책**
   - 주기적으로 키 교체 (6개월마다)
   - 유출 의심 시 즉시 재발급

4. ✅ **키 공유 방법**
   - 팀원 공유: 1Password, Vault 등 비밀번호 관리 도구
   - Slack, 이메일에 키 전송 금지

---

## 🔒 보안 주의사항

### 1. NEXT*PUBLIC* 접두사 주의

```bash
# ❌ 위험: 클라이언트에 노출됨
NEXT_PUBLIC_JWT_SECRET=secret123

# ✅ 안전: 서버에서만 접근 가능
JWT_SECRET=secret123
```

**규칙**:

- `NEXT_PUBLIC_`으로 시작 → 브라우저에 노출됨
- 접두사 없음 → 서버 사이드에서만 접근 가능

### 2. Git에 커밋하지 말아야 할 파일

```gitignore
# .gitignore에 추가 확인
.env.local
.env.production
.env.prod
.env.keys
*.env

# 예외: 템플릿은 커밋 가능
!.env.example
```

### 3. 강력한 시크릿 키 사용

```bash
# ❌ 약한 키
JWT_SECRET=secret123
DB_PASSWORD=password

# ✅ 강력한 키
JWT_SECRET=8xK9mP2qL5vN7jH4fT6wR3sY1uZ0aB8cD
DB_PASSWORD=Xk9#mP2qL5vN$jH4fT
```

### 4. 프로덕션 키 검증

배포 전 체크리스트:

- [ ] JWT_SECRET이 32자 이상인가?
- [ ] DB_PASSWORD가 강력한가?
- [ ] Toss Payments 실제 키로 변경했는가?
- [ ] CORS_ALLOWED_ORIGINS에 실제 도메인만 포함되어 있는가?

---

## 🛠️ 환경 변수 디버깅

### 1. 환경 변수 확인

```bash
# Next.js 환경에서 확인 (브라우저 콘솔)
console.log(process.env.NEXT_PUBLIC_API_URL)

# Docker 컨테이너 내부 확인
docker exec campstation-frontend env | grep NEXT_PUBLIC

# 백엔드 환경 변수 확인
docker exec campstation-backend env | grep JWT_SECRET
```

### 2. 빌드 시 환경 변수 확인

```bash
# Next.js 빌드 시 환경 변수 포함 여부 확인
npm run build

# 빌드 로그에서 확인
# ✓ NEXT_PUBLIC_API_URL: http://mycamp.duckdns.org/api
```

### 3. 일반적인 문제

| 문제           | 원인                                   | 해결                                     |
| -------------- | -------------------------------------- | ---------------------------------------- |
| API 호출 실패  | `NEXT_PUBLIC_API_URL` 누락             | `.env.local` 또는 `.env.production` 확인 |
| 지도 로드 실패 | `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` 누락 | Naver Map API 키 확인                    |
| JWT 인증 실패  | `JWT_SECRET` 불일치                    | 프론트/백엔드 키 동일한지 확인           |
| CORS 에러      | `CORS_ALLOWED_ORIGINS` 설정 오류       | 백엔드 CORS 설정 확인                    |

---

## 📌 다음 단계

- [배포 가이드](./01-deployment.md) - 환경 변수 적용하여 배포
- [보안 체크리스트](./05-security.md) - 환경 변수 보안 점검
- [문제 해결 가이드](./04-troubleshooting.md) - 환경 변수 관련 문제 해결
