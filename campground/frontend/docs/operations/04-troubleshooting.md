# 문제 해결 가이드 (Troubleshooting)

> 자주 발생하는 문제 및 해결 방법

## 📋 목차

1. [빌드 및 실행 문제](#빌드-및-실행-문제)
2. [API 연결 문제](#api-연결-문제)
3. [Docker 관련 문제](#docker-관련-문제)
4. [환경 변수 문제](#환경-변수-문제)
5. [데이터베이스 문제](#데이터베이스-문제)
6. [성능 문제](#성능-문제)
7. [인증/인가 문제](#인증인가-문제)

---

## 🔨 빌드 및 실행 문제

### 1. npm install 실패

**증상**:

```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**원인**:

- Node.js 버전 불일치
- package-lock.json 충돌

**해결**:

```bash
# 1. Node.js 버전 확인 (20+ 필요)
node --version

# 2. 캐시 정리
npm cache clean --force

# 3. node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install

# 4. 여전히 실패 시 레거시 peer deps 사용
npm install --legacy-peer-deps
```

---

### 2. Next.js 빌드 실패

**증상**:

```
Error: Cannot find module '@/components/ui/Button'
Type error: Property 'xxx' does not exist on type 'yyy'
```

**원인**:

- TypeScript 타입 에러
- 잘못된 import 경로

**해결**:

```bash
# 1. TypeScript 타입 체크
npm run type-check

# 2. .next 폴더 삭제 후 재빌드
rm -rf .next
npm run build

# 3. 캐시 삭제
rm -rf .next out node_modules/.cache
npm run build
```

---

### 3. 개발 서버 실행 실패

**증상**:

```
Error: Port 3000 is already in use
```

**해결**:

```bash
# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Linux/Mac
lsof -ti:3000 | xargs kill -9

# 또는 다른 포트 사용
PORT=3001 npm run dev
```

---

### 4. QueryStateHandler 관련 문제 (Sprint 4 추가)

**증상**:

```typescript
// 로딩 상태가 무한 반복
// 에러 메시지가 표시되지 않음
```

**원인**:

- React Query hook의 상태가 올바르게 전달되지 않음
- isEmpty 조건이 잘못 설정됨

**해결**:

```typescript
// ❌ 잘못된 사용
<QueryStateHandler
  isLoading={isLoading}
  error={error}
  isEmpty={data === undefined}  // 잘못된 조건
>

// ✅ 올바른 사용
<QueryStateHandler
  isLoading={isLoading}
  error={error}
  isEmpty={data?.data.content.length === 0}  // 올바른 조건
PORT=3001 npm run dev
```

---

## 🌐 API 연결 문제

### 1. CORS 에러

**증상** (브라우저 콘솔):

```
Access to fetch at 'http://localhost:8080/api/v1/campgrounds'
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**원인**:

- Backend CORS 설정 누락
- `CORS_ALLOWED_ORIGINS`에 Frontend URL 없음

**해결**:

**백엔드 `.env` 확인**:

```bash
# 개발 환경
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# 프로덕션
CORS_ALLOWED_ORIGINS=http://mycamp.duckdns.org
```

**Backend CORS 설정 확인** (`SecurityConfig.java`):

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList(
        corsAllowedOrigins.split(",")
    ));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH"));
    configuration.setAllowCredentials(true);
    return source;
}
```

---

### 2. API 404 Not Found

**증상**:

```
GET http://localhost:8080/api/v1/campgrounds 404 (Not Found)
```

**원인**:

- Backend 서버 미실행
- API 경로 오타
- API 버전 불일치

**해결**:

```bash
# 1. Backend 실행 확인
docker-compose ps backend
curl http://localhost:8080/api/v1/health

# 2. API 경로 확인 (백엔드 로그)
docker-compose logs backend | grep "Mapped"

# 3. 프론트엔드 API URL 확인
docker exec campstation-frontend env | grep NEXT_PUBLIC_API_URL
```

---

### 3. API Timeout

**증상**:

```
Error: timeout of 10000ms exceeded
```

**원인**:

- Backend 응답 지연
- Database 슬로우 쿼리
- 네트워크 문제

**해결**:

```bash
# 1. Backend 로그 확인
docker-compose logs backend | grep -i "slow\|timeout"

# 2. Database 쿼리 성능 확인
docker exec campstation-postgres psql -U campstation -c \
  "SELECT query, calls, total_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 5;"

# 3. 네트워크 확인
docker exec campstation-frontend ping campstation-backend
```

---

## 🐳 Docker 관련 문제

### 1. 컨테이너 실행 실패

**증상**:

```
ERROR: for campstation-frontend  Cannot start service frontend:
driver failed programming external connectivity
```

**원인**:

- 포트가 이미 사용 중
- Docker 네트워크 충돌

**해결**:

```bash
# 1. 포트 사용 확인
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Linux/Mac

# 2. 기존 컨테이너 정리
docker-compose down
docker system prune -f

# 3. 네트워크 재생성
docker network prune
docker-compose up
```

---

### 2. 볼륨 권한 문제

**증상**:

```
Permission denied: '/app/uploads'
```

**원인**:

- 볼륨 마운트 권한 문제

**해결**:

```bash
# 1. 볼륨 권한 변경
docker-compose exec backend chmod -R 777 /app/uploads

# 2. 볼륨 재생성
docker-compose down -v
docker-compose up
```

---

### 3. 이미지 빌드 실패

**증상**:

```
ERROR [internal] load metadata for docker.io/library/node:20-alpine
```

**원인**:

- Docker Hub 연결 실패
- Dockerfile 오류

**해결**:

```bash
# 1. 네트워크 확인
ping docker.io

# 2. 캐시 없이 빌드
docker-compose build --no-cache

# 3. BuildKit 비활성화 (Windows)
$env:DOCKER_BUILDKIT=0
docker-compose build
```

---

### 4. 컨테이너 간 통신 실패

**증상**:

```
getaddrinfo ENOTFOUND backend
```

**원인**:

- Docker 네트워크 문제
- 서비스 이름 오타

**해결**:

```bash
# 1. 네트워크 확인
docker network ls
docker network inspect campstation_default

# 2. DNS 확인
docker exec campstation-frontend nslookup backend
docker exec campstation-frontend ping backend

# 3. 네트워크 재생성
docker-compose down
docker network prune
docker-compose up
```

---

## 🔑 환경 변수 문제

### 1. 환경 변수 누락

**증상**:

```
Error: NEXT_PUBLIC_API_URL is not defined
```

**원인**:

- `.env` 파일 없음
- 환경 변수 이름 오타

**해결**:

```bash
# 1. .env 파일 확인
ls -la .env.local .env.production

# 2. .env.example에서 복사
cp .env.example .env.local

# 3. 환경 변수 확인
docker exec campstation-frontend env | grep NEXT_PUBLIC

# 4. 컨테이너 재시작 (환경 변수 반영)
docker-compose restart frontend
```

---

### 2. NEXT*PUBLIC* 변수가 undefined

**증상** (브라우저 콘솔):

```javascript
console.log(process.env.NEXT_PUBLIC_API_URL); // undefined
```

**원인**:

- 빌드 시점에 환경 변수 없음
- `.env` 파일 미적용

**해결**:

```bash
# 1. 빌드 시 환경 변수 포함 확인
cat .env.production

# 2. Docker 빌드 시 ARG로 전달
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# 3. Next.js 재빌드
rm -rf .next
npm run build
```

---

### 3. Docker Compose 환경 변수 우선순위

**문제**: `.env` 파일이 있는데 적용 안 됨

**원인**: Docker Compose는 다음 순서로 환경 변수 적용

1. Shell 환경 변수
2. `docker-compose.yml`의 `environment`
3. `.env` 파일

**해결**:

```bash
# 1. .env 파일 위치 확인 (docker-compose.yml과 같은 디렉토리)
ls -la .env

# 2. docker-compose.yml에서 env_file 명시
services:
  frontend:
    env_file:
      - .env.production

# 3. 특정 .env 파일 지정
docker-compose --env-file .env.production up
```

---

## 💾 데이터베이스 문제

### 1. Database 연결 실패

**증상**:

```
org.postgresql.util.PSQLException: Connection to postgres:5432 refused
```

**원인**:

- PostgreSQL 컨테이너 미실행
- DB 연결 정보 오류

**해결**:

```bash
# 1. PostgreSQL 실행 확인
docker-compose ps postgres

# 2. PostgreSQL 로그 확인
docker-compose logs postgres

# 3. PostgreSQL 재시작
docker-compose restart postgres

# 4. 연결 테스트
docker exec campstation-backend pg_isready -h postgres -U campstation
```

---

### 2. 마이그레이션 실패

**증상**:

```
Flyway migration failed: Validate failed
```

**원인**:

- 마이그레이션 파일 체크섬 불일치
- 수동으로 DB 스키마 변경

**해결**:

```bash
# 1. Flyway 히스토리 확인
docker exec campstation-postgres psql -U campstation -c \
  "SELECT * FROM flyway_schema_history;"

# 2. 마이그레이션 재실행 (개발 환경만!)
docker-compose down
docker volume rm campstation_postgres-data
docker-compose up

# 3. 프로덕션: 문제 마이그레이션 파일 수정 후 재배포
```

---

### 3. 느린 쿼리

**증상**: API 응답이 느림 (5초 이상)

**해결**:

```bash
# 1. 슬로우 쿼리 로그 활성화
docker exec campstation-postgres psql -U campstation -c \
  "ALTER SYSTEM SET log_min_duration_statement = 1000;"

# 2. PostgreSQL 재시작
docker-compose restart postgres

# 3. 로그 확인
docker-compose logs postgres | grep "duration:"

# 4. 인덱스 추가 (예시)
CREATE INDEX idx_campgrounds_region ON campgrounds(region);
```

---

## ⚡ 성능 문제

### 1. 페이지 로딩 느림

**증상**: 페이지 로딩 3초 이상

**원인**:

- 이미지 최적화 안 됨
- 불필요한 API 호출
- JavaScript 번들 크기 큼

**해결**:

**이미지 최적화**:

```tsx
// ❌ 나쁜 예
<img src="/image.jpg" />;

// ✅ 좋은 예
import Image from "next/image";
<Image src="/image.jpg" width={800} height={600} alt="..." />;
```

**번들 크기 분석**:

```bash
# 번들 분석
npm run build
npx @next/bundle-analyzer

# 큰 의존성 찾기
du -sh node_modules/* | sort -h
```

**API 호출 최적화**:

```tsx
// React Query로 중복 요청 방지
const { data } = useQuery({
  queryKey: ["campgrounds"],
  queryFn: getCampgrounds,
  staleTime: 5 * 60 * 1000, // 5분 캐싱
});
```

---

### 2. 메모리 부족

**증상**:

```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**해결**:

```bash
# 1. Node.js 메모리 증가
NODE_OPTIONS=--max-old-space-size=4096 npm run build

# 2. Docker 메모리 증가 (docker-compose.yml)
services:
  frontend:
    deploy:
      resources:
        limits:
          memory: 2G

# 3. 불필요한 의존성 제거
npm prune --production
```

---

### 3. CPU 사용률 높음

**증상**: Docker Stats에서 CPU 90% 이상

**해결**:

```bash
# 1. CPU 사용률 확인
docker stats

# 2. 프로파일링
docker exec campstation-backend jstack <PID>

# 3. 무한 루프 또는 비효율 로직 찾기
# Backend 로그에서 반복 실행되는 작업 확인
```

---

## 🔐 인증/인가 문제

### 1. 로그인 실패

**증상**:

```
401 Unauthorized
```

**원인**:

- 잘못된 이메일/비밀번호
- JWT 토큰 만료

**해결**:

```bash
# 1. 백엔드 로그 확인
docker-compose logs backend | grep "authentication failed"

# 2. 토큰 확인 (브라우저 DevTools → Application → Cookies)
# accessToken, refreshToken 존재 확인

# 3. 토큰 만료 시 재로그인
```

---

### 2. JWT 토큰 검증 실패

**증상**:

```
JWT signature does not match locally computed signature
```

**원인**:

- Frontend/Backend `JWT_SECRET` 불일치
- 잘못된 토큰 형식

**해결**:

```bash
# 1. JWT_SECRET 동일한지 확인
docker exec campstation-frontend env | grep JWT_SECRET
docker exec campstation-backend env | grep JWT_SECRET

# 2. 쿠키 삭제 후 재로그인
# 브라우저 DevTools → Application → Cookies → Clear

# 3. 로컬 스토리지 확인
localStorage.clear()
```

---

### 3. Refresh Token 실패

**증상**: 자동 로그인 안 됨

**원인**:

- Refresh Token 만료
- HttpOnly Cookie 설정 오류

**해결**:

```bash
# 1. Refresh Token 확인
# 브라우저 DevTools → Network → Response Headers
# Set-Cookie: refreshToken=xxx; HttpOnly; Secure

# 2. Backend 설정 확인 (TokenService.java)
cookie.setHttpOnly(true);
cookie.setSecure(false); // 개발 환경: false, 프로덕션: true
cookie.setPath("/");

# 3. CORS Credentials 확인
credentials: 'include' // fetch 옵션
```

---

## 🆘 긴급 상황 대응

### 서비스 전체 다운

```bash
# 1. 모든 컨테이너 상태 확인
docker-compose ps

# 2. 에러 로그 확인
docker-compose logs --tail=100 | grep -i error

# 3. 서비스 재시작
docker-compose restart

# 4. 여전히 실패 시 재배포
docker-compose down
docker-compose up -d
```

---

### 데이터 손실 위험

```bash
# 1. 즉시 백업
docker exec campstation-postgres pg_dump -U campstation campstation > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. 볼륨 백업
docker run --rm -v campstation_postgres-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres-data-backup.tar.gz /data
```

---

## 📞 도움 요청하기

### 1. 이슈 리포트 작성

```markdown
## 문제 설명

페이지 로딩 시 500 Internal Server Error 발생

## 재현 방법

1. 로그인
2. /campgrounds 페이지 접속
3. 에러 발생

## 환경

- OS: Windows 11
- Docker: 24.0.0
- Node.js: 20.10.0

## 로그

[로그 첨부]
```

### 2. 로그 수집

```bash
# 전체 로그 저장
docker-compose logs > logs.txt

# 에러만 필터링
docker-compose logs 2>&1 | grep -i error > errors.txt

# 시스템 정보
docker version > system_info.txt
docker-compose version >> system_info.txt
node --version >> system_info.txt
```

---

## 📌 다음 단계

- [모니터링 가이드](./03-monitoring.md) - 사전 문제 감지
- [배포 가이드](./01-deployment.md) - 올바른 배포 방법
- [환경 변수 가이드](./02-environment.md) - 환경 변수 설정
