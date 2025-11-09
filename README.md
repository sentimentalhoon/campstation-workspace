# CampStation

> 🏕️ 모바일 우선 캠핑장 예약 플랫폼

Spring Boot + Next.js 기반의 풀스택 캠핑장 예약 관리 시스템입니다.

## 📚 프로젝트 문서

### 📖 명세 문서 (What to Build)

프로젝트 요구사항과 스펙을 정의하는 문서입니다.

- [01-FEATURES.md](./frontend/docs/specifications/01-FEATURES.md) - 기능 명세 (P0-P3 우선순위)
- [02-USER-FLOWS.md](./frontend/docs/specifications/02-USER-FLOWS.md) - 사용자 플로우
- [03-PAGES.md](./frontend/docs/specifications/03-PAGES.md) - 페이지 구조
- [04-API-SPEC.md](./frontend/docs/specifications/04-API-SPEC.md) - API 명세
- [05-DATABASE-SCHEMA.md](./frontend/docs/specifications/05-DATABASE-SCHEMA.md) - 데이터베이스 스키마
- [06-SCREEN-LAYOUTS.md](./frontend/docs/specifications/06-SCREEN-LAYOUTS.md) - 화면 레이아웃
- [07-COMPONENTS-SPEC.md](./frontend/docs/specifications/07-COMPONENTS-SPEC.md) - 컴포넌트 명세
- [08-ROADMAP.md](./frontend/docs/specifications/08-ROADMAP.md) - 개발 로드맵 (4 Sprints)
- [09-MOBILE-DESIGN.md](./frontend/docs/specifications/09-MOBILE-DESIGN.md) - 모바일 디자인 가이드

### 🛠️ 기술 문서 (How to Code)

개발 시 참고할 코딩 가이드와 패턴입니다.

- [00-PROJECT-STRUCTURE.md](./frontend/docs/technical/00-PROJECT-STRUCTURE.md) - 프로젝트 구조
- [01-ARCHITECTURE.md](./frontend/docs/technical/01-ARCHITECTURE.md) - 아키텍처 설계
- [02-CODING-CONVENTIONS.md](./frontend/docs/technical/02-CODING-CONVENTIONS.md) - 코딩 컨벤션
- [03-COMPONENT-PATTERNS.md](./frontend/docs/technical/03-COMPONENT-PATTERNS.md) - 컴포넌트 패턴
- [04-API-GUIDE.md](./frontend/docs/technical/04-API-GUIDE.md) - API 연동 가이드
- [05-STATE-MANAGEMENT.md](./frontend/docs/technical/05-STATE-MANAGEMENT.md) - 상태 관리
- [design-system.md](./frontend/docs/technical/design-system.md) - 디자인 시스템
- [CHANGELOG-REFACTOR.md](./frontend/docs/technical/CHANGELOG-REFACTOR.md) - 리팩토링 기록

### 🚀 운영 문서 (How to Deploy)

배포, 모니터링, 보안 관련 운영 가이드입니다.

- [01-deployment.md](./frontend/docs/operations/01-deployment.md) - 배포 가이드 (DDNS 포함)
- [02-environment.md](./frontend/docs/operations/02-environment.md) - 환경 변수 설정
- [03-monitoring.md](./frontend/docs/operations/03-monitoring.md) - 모니터링 & 로깅
- [04-troubleshooting.md](./frontend/docs/operations/04-troubleshooting.md) - 문제 해결 가이드
- [05-security.md](./frontend/docs/operations/05-security.md) - 보안 체크리스트

### ✅ 테스트 문서 (How to Test)

자동화 테스트와 QA 절차입니다.

- [01-test-strategy.md](./frontend/docs/testing/01-test-strategy.md) - 테스트 전략
- [02-e2e-scenarios.md](./frontend/docs/testing/02-e2e-scenarios.md) - E2E 시나리오
- [03-test-data.md](./frontend/docs/testing/03-test-data.md) - 테스트 데이터 관리
- [04-qa-checklist.md](./frontend/docs/testing/04-qa-checklist.md) - QA 체크리스트

---

## 🏗️ 기술 스택

- **Backend**: Spring Boot 3.5.6, Java 21, PostgreSQL
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Authentication**: JWT with refresh tokens (HttpOnly Cookie)
- **Payment**: Toss Payments
- **Maps**: Naver Maps API
- **Storage**: MinIO (S3-compatible)
- **Deployment**: Docker, Docker Compose, DuckDNS

## Features

### Backend

- RESTful API with Spring Boot
- JWT authentication with refresh token flow
- Campground and site management
- Reservation system
- User management and reviews
- PostgreSQL database with H2 for testing
- Comprehensive unit and integration tests

### Frontend

- Modern React with Next.js App Router
- TypeScript for type safety
- Responsive design with Tailwind CSS
- JWT authentication with automatic token refresh
- Protected routes and user dashboard
- API integration with error handling

## Quick Start

### Prerequisites

- Java 21
- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (for production)

### Development Setup

1. **Clone the repositories**:

```bash
git clone https://github.com/your-username/campstation-backend.git backend
git clone https://github.com/your-username/campstation-frontend.git frontend
```

2. **Start the backend**:

````bash

## 🚀 빠른 시작

### 개발 환경 설정

#### 로컬 개발
```bash
# 프론트엔드
cd frontend
npm install
npm run dev  # http://localhost:3000

# 백엔드
cd backend
./gradlew bootRun  # http://localhost:8080
````

#### Docker 개발

```bash
# Docker Compose로 전체 실행
docker-compose -f docker-compose.dev.yml up --build

# 서비스:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:8080
# - PostgreSQL: localhost:5432
# - MinIO: http://localhost:9001
```

자세한 내용은 [배포 가이드](./frontend/docs/operations/01-deployment.md)를 참고하세요.

---

## 📖 주요 기능

### P0 (MVP 필수)

- ✅ 캠핑장 상세 조회
- ✅ 예약 생성 (날짜, 사이트, 인원 선택)
- ✅ 결제 (토스 페이먼츠)
- ✅ 예약 목록 및 취소
- ✅ JWT 인증

### P1 (2주차)

- 🏕️ 캠핑장 검색 & 필터링
- 📧 이메일 회원가입
- 📱 OAuth2 로그인 (카카오, 네이버)
- ⭐ 리뷰 작성

### P2 (3주차)

- 🗺️ 지도 검색 (Naver Maps)
- ❤️ 찜하기
- 🔔 알림

자세한 내용은 [기능 명세](./frontend/docs/specifications/01-FEATURES.md)를 참고하세요.

---

## 🧪 테스트

### 자동화 테스트

```bash
# 프론트엔드
cd frontend
npm test              # Jest + RTL (Unit)
npm run test:e2e      # Playwright (E2E)

# 백엔드
cd backend
./gradlew test        # JUnit + Mockito
```

### QA 체크리스트

배포 전 [QA 체크리스트](./frontend/docs/testing/04-qa-checklist.md)를 확인하세요.

**테스트 커버리지 목표**:

- 전체: 80% (lines/functions)
- P0 기능: 90%+

---

## 🔧 환경 변수

### 프론트엔드 (.env.local)

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Naver Map
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=jq20atlff0

# OAuth2
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=your_kakao_key
NEXT_PUBLIC_NAVER_CLIENT_ID=your_naver_key

# Toss Payments (테스트)
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_...
```

### 백엔드 (.env)

```env
# Database
DB_URL=jdbc:postgresql://postgres:5432/campstation
DB_USERNAME=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_32_character_secret_key

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000

# OAuth2
KAKAO_CLIENT_ID=your_kakao_id
KAKAO_CLIENT_SECRET=your_kakao_secret
NAVER_CLIENT_ID=your_naver_id
NAVER_CLIENT_SECRET=your_naver_secret

# Toss Payments
TOSS_SECRET_KEY=test_sk_...

# MinIO
MINIO_ENDPOINT=http://minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

⚠️ **보안 주의사항**: [환경 변수 가이드](./frontend/docs/operations/02-environment.md)와 [보안 체크리스트](./frontend/docs/operations/05-security.md)를 반드시 확인하세요.

---

## 🚀 프로덕션 배포

### DDNS 설정 (DuckDNS)

```bash
# 1. DuckDNS 도메인 생성: mycamp.duckdns.org
# 2. .env.production 설정
NEXT_PUBLIC_API_URL=http://mycamp.duckdns.org:8080/api

# 3. Docker Compose로 배포
docker-compose -f docker-compose.prod.yml up -d

# 4. 헬스 체크
docker-compose logs -f
```

자세한 내용은 [배포 가이드](./frontend/docs/operations/01-deployment.md)를 참고하세요.

---

## 📊 모니터링

### 로그 확인

```bash
# 전체 서비스 로그
docker-compose logs -f

# 특정 서비스
docker-compose logs -f frontend
docker-compose logs -f backend

# 에러만 필터링
docker-compose logs -f | grep ERROR
```

### 성능 모니터링

```bash
# 리소스 사용량
docker stats

# API 응답 시간
curl -w "@curl-format.txt" http://localhost:8080/api/v1/campgrounds
```

자세한 내용은 [모니터링 가이드](./frontend/docs/operations/03-monitoring.md)를 참고하세요.

---

## 🐛 문제 해결

일반적인 문제와 해결 방법은 [트러블슈팅 가이드](./frontend/docs/operations/04-troubleshooting.md)를 참고하세요.

**빠른 해결**:

- **빌드 실패**: `rm -rf .next && npm run build`
- **포트 충돌**: `lsof -ti:3000 | xargs kill`
- **API 연결 안 됨**: CORS 설정 확인
- **Docker 문제**: `docker system prune -a`

---

## 📈 개발 로드맵

- **Sprint 1** (1주): 캠핑장 상세 + 예약 기본 (P0)
- **Sprint 2** (1주): 결제 + 예약 관리 (P0)
- **Sprint 3** (1주): 검색/필터 + OAuth2 (P1)
- **Sprint 4** (1주): 지도 + 리뷰 + 최종 QA (P1-P2)

자세한 일정은 [로드맵](./frontend/docs/specifications/08-ROADMAP.md)을 참고하세요.

---

## 📞 지원

- 이슈 등록: [GitHub Issues](https://github.com/your-repo/issues)
- 문서: [docs/](./frontend/docs/)
- API 문서: http://localhost:8080/swagger-ui.html

---

## 📄 라이선스

This project is licensed under the MIT License.
