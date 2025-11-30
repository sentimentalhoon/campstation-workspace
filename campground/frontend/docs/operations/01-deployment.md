# 배포 가이드

> Docker 기반 배포 및 DDNS 설정 가이드

## 📋 목차

1. [로컬 개발 환경](#로컬-개발-환경)
2. [Docker 개발 환경](#docker-개발-환경)
3. [프로덕션 배포](#프로덕션-배포)
4. [DDNS 설정](#ddns-설정)
5. [배포 체크리스트](#배포-체크리스트)
6. [롤백 전략](#롤백-전략)

---

## 🏠 로컬 개발 환경

### 1. 사전 요구사항

```bash
# Node.js 20+ 설치 확인
node --version  # v20.x.x 이상

# npm 10+ 설치 확인
npm --version   # 10.x.x 이상
```

### 2. 의존성 설치

```bash
cd frontend
npm install
```

### 3. 환경 변수 설정

```bash
# .env.example을 복사하여 .env.local 생성
cp .env.example .env.local

# 필수 환경 변수 설정
# - NEXT_PUBLIC_API_URL
# - NEXT_PUBLIC_NAVER_MAP_CLIENT_ID
# 자세한 내용은 02-environment.md 참조
```

### 4. 개발 서버 실행

```bash
npm run dev
```

접속: [http://localhost:3000](http://localhost:3000)

---

## 🐳 Docker 개발 환경

### 1. 사전 요구사항

```bash
# Docker 설치 확인
docker --version        # 20.x.x 이상
docker-compose --version # 2.x.x 이상
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일 생성:

```bash
# .env.example 참조하여 필요한 변수 설정
cp .env.example .env
```

### 3. Docker Compose로 전체 스택 실행

```bash
# 프로젝트 루트 디렉토리에서
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# 백그라운드 실행
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# 특정 서비스만 실행 (예: 프론트엔드만)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up frontend
```

### 4. 로그 확인

```bash
# 모든 서비스 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f frontend
docker-compose logs -f backend
```

### 5. 중지 및 정리

```bash
# 중지
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

# 볼륨까지 삭제
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v

# 이미지까지 삭제
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down --rmi all
```

---

## 🚀 프로덕션 배포

### 1. 프로덕션 환경 변수 설정

**프론트엔드 `.env.production` 생성**:

```bash
cd frontend

# .env.production 파일 생성
cat > .env.production << EOF
# API Endpoint (DDNS 도메인)
NEXT_PUBLIC_API_URL=http://mycamp.duckdns.org/api

# Application Info
NEXT_PUBLIC_APP_NAME=CampStation
NEXT_PUBLIC_APP_VERSION=1.0.0

# Naver Map API
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=jq20atlff0

# OAuth2 (실제 키는 .env.keys 참조)
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=your_kakao_js_key
NEXT_PUBLIC_NAVER_CLIENT_ID=your_naver_client_id

# Toss Payments
NEXT_PUBLIC_TOSS_CLIENT_KEY=your_toss_client_key

# Backend URL (Docker 내부 통신)
BACKEND_URL=http://campstation-backend:8080
EOF
```

**프로젝트 루트 `.env.prod` 생성**:

```bash
# 백엔드 환경 변수
DB_URL=jdbc:postgresql://postgres:5432/campstation
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

JWT_SECRET=your_jwt_secret_key_here

# OAuth2 Secret Keys (서버 사이드)
KAKAO_CLIENT_SECRET=your_kakao_secret
NAVER_CLIENT_SECRET=your_naver_secret

# Toss Payments Secret Key
TOSS_SECRET_KEY=your_toss_secret_key
```

⚠️ **보안 주의**: `.env.production`, `.env.prod` 파일은 Git에 커밋하지 마세요!

### 2. 프로덕션 빌드 및 배포

```bash
# 프로젝트 루트에서 실행
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 빌드부터 다시 시작
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# 로그 확인
docker-compose logs -f
```

### 3. 배포 확인

```bash
# 컨테이너 상태 확인
docker-compose ps

# 헬스 체크 (예시)
curl http://localhost:3000/api/health        # Frontend
curl http://localhost:8080/api/v1/health    # Backend
```

### 4. 프로덕션 접속

- **로컬**: [http://localhost:3000](http://localhost:3000)
- **DDNS**: [http://mycamp.duckdns.org](http://mycamp.duckdns.org)

---

## 🌐 DDNS 설정

### 현재 설정

- **DDNS 도메인**: `mycamp.duckdns.org`
- **서비스**: DuckDNS
- **사용처**: 프로덕션 API 엔드포인트

### DDNS 동작 확인

```bash
# 도메인 IP 확인
nslookup mycamp.duckdns.org

# 또는
ping mycamp.duckdns.org
```

### DDNS 업데이트 (필요 시)

DuckDNS 설정이 필요한 경우:

1. [DuckDNS](https://www.duckdns.org/) 로그인
2. 도메인 확인: `mycamp`
3. IP 주소 자동 업데이트 확인
4. 필요 시 토큰으로 수동 업데이트:

```bash
curl "https://www.duckdns.org/update?domains=mycamp&token=YOUR_TOKEN&ip="
```

### 포트 포워딩 설정

원격 서버에서 외부 접속을 위한 포트 포워딩:

- **HTTP**: 80 → 3000 (Frontend)
- **API**: 80 → 8080 (Backend via Nginx)

---

## ✅ 배포 체크리스트

### 배포 전

- [ ] `.env.production` 파일 설정 완료
- [ ] `.env.prod` 파일 설정 완료 (백엔드)
- [ ] API 키 확인 (.env.keys 참조)
- [ ] Git 최신 코드 Pull 완료
- [ ] 로컬에서 빌드 테스트 완료
- [ ] 데이터베이스 마이그레이션 준비 (필요 시)

### 배포 중

- [ ] Docker 이미지 빌드 성공
- [ ] 모든 컨테이너 정상 실행 확인
- [ ] 로그에 에러 없음 확인
- [ ] 네트워크 연결 확인

### 배포 후

- [ ] Frontend 접속 가능 (http://mycamp.duckdns.org)
- [ ] API 엔드포인트 응답 확인
- [ ] 데이터베이스 연결 확인
- [ ] 로그인 기능 테스트
- [ ] 주요 기능 스모크 테스트
- [ ] 모니터링 설정 확인

---

## 🔄 롤백 전략

### 1. 빠른 롤백 (컨테이너 재시작)

```bash
# 이전 버전으로 롤백
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 2. Git 기반 롤백

```bash
# 1. 이전 커밋으로 되돌리기
git log --oneline  # 커밋 해시 확인
git checkout <commit-hash>

# 2. 재배포
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# 3. 확인 후 브랜치 되돌리기 (필요 시)
git checkout main
git reset --hard <commit-hash>
```

### 3. 이미지 태그 기반 롤백

```bash
# 특정 버전 이미지 사용
docker-compose -f docker-compose.yml -f docker-compose.prod.yml pull
docker tag campstation-frontend:v1.0.0 campstation-frontend:latest
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 4. 데이터베이스 롤백

```bash
# 백업에서 복원 (사전 백업 필수)
docker-compose exec postgres psql -U campstation -d campstation < backup.sql
```

---

## 🔍 배포 후 모니터링

### 로그 실시간 확인

```bash
# 모든 서비스
docker-compose logs -f

# 마지막 100줄
docker-compose logs --tail=100

# 특정 시간 이후
docker-compose logs --since 2024-01-01T00:00:00
```

### 리소스 사용량 확인

```bash
# CPU, 메모리 사용량
docker stats

# 디스크 사용량
docker system df
```

### 컨테이너 상태 확인

```bash
# 실행 중인 컨테이너
docker ps

# 모든 컨테이너 (중지된 것 포함)
docker ps -a

# 특정 컨테이너 상세 정보
docker inspect campstation-frontend
```

---

## 📝 트러블슈팅

일반적인 배포 문제는 [04-troubleshooting.md](./04-troubleshooting.md)를 참조하세요.

**주요 문제**:

- 빌드 실패 → 환경 변수 확인
- API 연결 실패 → CORS 설정 확인
- 컨테이너 실행 실패 → 로그 확인
- DDNS 접속 실패 → 포트 포워딩 확인

---

## 📌 다음 단계

- [환경 변수 가이드](./02-environment.md) - 상세 환경 변수 설명
- [모니터링 가이드](./03-monitoring.md) - 로그 및 성능 모니터링
- [보안 체크리스트](./05-security.md) - 프로덕션 보안 점검
