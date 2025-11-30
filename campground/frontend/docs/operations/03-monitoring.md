# 모니터링 & 로깅 가이드

> 애플리케이션 모니터링 및 로그 관리

## 📋 목차

1. [로그 확인 방법](#로그-확인-방법)
2. [에러 로그 분석](#에러-로그-분석)
3. [성능 모니터링](#성능-모니터링)
4. [헬스 체크](#헬스-체크)
5. [알림 설정](#알림-설정-향후)

---

## 📝 로그 확인 방법

### Docker Compose 로그

#### 모든 서비스 로그

```bash
# 실시간 로그 확인 (tail -f)
docker-compose logs -f

# 마지막 100줄만 보기
docker-compose logs --tail=100

# 특정 시간 이후 로그
docker-compose logs --since 2024-01-01T00:00:00

# 특정 시간까지 로그
docker-compose logs --until 2024-01-01T23:59:59
```

#### 특정 서비스 로그

```bash
# Frontend 로그
docker-compose logs -f frontend

# Backend 로그
docker-compose logs -f backend

# Database 로그
docker-compose logs -f postgres

# MinIO 로그
docker-compose logs -f minio
```

#### 로그 필터링

```bash
# 에러만 필터링
docker-compose logs frontend | grep -i error

# 특정 키워드 검색
docker-compose logs backend | grep -i "jwt"

# 여러 패턴 검색
docker-compose logs | grep -E "error|warning|exception"
```

---

### 개별 컨테이너 로그

```bash
# 실행 중인 컨테이너 확인
docker ps

# 컨테이너 이름으로 로그 확인
docker logs -f campstation-frontend
docker logs -f campstation-backend

# 마지막 N줄 보기
docker logs --tail=50 campstation-frontend

# 타임스탬프 포함
docker logs -t campstation-backend
```

---

### 로그 파일 저장

```bash
# 로그를 파일로 저장
docker-compose logs > logs_$(date +%Y%m%d_%H%M%S).txt

# 특정 서비스 로그만 저장
docker-compose logs frontend > frontend_logs.txt

# 에러 로그만 저장
docker-compose logs 2>&1 | grep -i error > error_logs.txt
```

---

---

## 📊 성능 메트릭 (Sprint 4 기준)

### 빌드 성능

```
빌드 시간: 7.9s
라우트 개수: 19개 (Static: 17, Dynamic: 2)
First Load JS: 409.49KB
```

### 페이지별 JS 크기

| 페이지            | First Load JS | 비고                  |
| ----------------- | ------------- | --------------------- |
| /                 | 216.42 kB     | 홈페이지              |
| /login            | 218.32 kB     | 로그인                |
| /dashboard/user   | 220.14 kB     | 대시보드              |
| /campgrounds/[id] | 216.42 kB     | 캠핑장 상세 (Dynamic) |
| /reservations     | 218.32 kB     | 예약 목록             |

### 목표 메트릭

```
✅ 빌드 시간: < 10초 (현재: 7.9s)
✅ First Load JS: < 450KB (현재: 409.49KB)
⏳ Lighthouse Performance: > 90 (측정 예정)
⏳ Test Coverage: > 80% (현재: ~65%)
```

---

## 🔍 에러 로그 분석

### Frontend 일반적인 에러

#### 1. API 연결 실패

**로그 예시**:

```
Error: Network request failed
  at fetch (http://localhost:3000/_next/static/chunks/app/page.js)
```

**원인**:

- Backend 서버가 실행되지 않음
- `NEXT_PUBLIC_API_URL` 설정 오류
- CORS 에러

**해결**:

```bash
# Backend 상태 확인
docker-compose ps backend

# Backend 로그 확인
docker-compose logs backend

# 환경 변수 확인
docker exec campstation-frontend env | grep NEXT_PUBLIC_API_URL
```

#### 2. 빌드 에러

**로그 예시**:

```
Error: Cannot find module '@/components/ui/Button'
```

**원인**:

- 파일 경로 오류
- 의존성 누락

**해결**:

```bash
# node_modules 재설치
docker-compose down
docker-compose build --no-cache frontend
docker-compose up frontend
```

#### 3. Hydration 에러

**로그 예시**:

```
Warning: Text content did not match. Server: "..." Client: "..."
```

**원인**:

- Server/Client 렌더링 불일치
- Date, Random 값 사용

**해결**:

- `useEffect`에서 클라이언트 전용 로직 처리
- `suppressHydrationWarning` 속성 사용 (최후 수단)

---

### Backend 일반적인 에러

#### 1. Database 연결 실패

**로그 예시**:

```
Caused by: org.postgresql.util.PSQLException: Connection refused
```

**원인**:

- PostgreSQL 서버 미실행
- DB 연결 정보 오류

**해결**:

```bash
# PostgreSQL 상태 확인
docker-compose ps postgres

# DB 연결 테스트
docker exec campstation-backend psql -h postgres -U campstation -d campstation

# 환경 변수 확인
docker exec campstation-backend env | grep DB_
```

#### 2. JWT 토큰 에러

**로그 예시**:

```
JWT signature does not match locally computed signature
```

**원인**:

- `JWT_SECRET` 불일치
- 만료된 토큰

**해결**:

```bash
# JWT_SECRET 확인
docker exec campstation-backend env | grep JWT_SECRET

# 로그아웃 후 재로그인 시도
```

#### 3. 파일 업로드 실패

**로그 예시**:

```
MinioException: Access Denied
```

**원인**:

- MinIO 인증 실패
- 버킷이 존재하지 않음

**해결**:

```bash
# MinIO 상태 확인
docker-compose ps minio

# MinIO 콘솔 접속
# http://localhost:9001 (admin/minioadmin)
```

---

## 📊 성능 모니터링

### 리소스 사용량 모니터링

#### Docker Stats

```bash
# 실시간 리소스 사용량
docker stats

# 특정 컨테이너만
docker stats campstation-frontend campstation-backend

# 포맷 지정
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

**출력 예시**:

```
NAME                    CPU %     MEM USAGE / LIMIT
campstation-frontend    2.5%      150MB / 2GB
campstation-backend     5.0%      512MB / 2GB
postgres                1.2%      200MB / 1GB
```

#### 디스크 사용량

```bash
# Docker 전체 디스크 사용량
docker system df

# 상세 정보
docker system df -v

# 특정 컨테이너 디스크 사용량
docker exec campstation-backend du -sh /app
```

---

### 애플리케이션 성능 지표

#### Frontend 성능 측정

**브라우저 DevTools**:

1. Chrome DevTools → Performance 탭
2. Lighthouse 실행
3. Network 탭에서 API 응답 시간 확인

**Core Web Vitals**:

- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

#### Backend API 응답 시간

```bash
# curl로 응답 시간 측정
time curl http://localhost:8080/api/v1/campgrounds

# 상세 시간 정보
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8080/api/v1/campgrounds

# curl-format.txt 파일 생성
cat > curl-format.txt << EOF
    time_namelookup:  %{time_namelookup}\n
       time_connect:  %{time_connect}\n
    time_appconnect:  %{time_appconnect}\n
   time_pretransfer:  %{time_pretransfer}\n
      time_redirect:  %{time_redirect}\n
 time_starttransfer:  %{time_starttransfer}\n
                    ----------\n
         time_total:  %{time_total}\n
EOF
```

---

### 데이터베이스 성능

#### 슬로우 쿼리 확인

```bash
# PostgreSQL 컨테이너 접속
docker exec -it campstation-postgres psql -U campstation -d campstation

# 슬로우 쿼리 로그 활성화
ALTER SYSTEM SET log_min_duration_statement = 1000; -- 1초 이상 쿼리 로깅

# 쿼리 통계 확인
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;

# 현재 실행 중인 쿼리
SELECT pid, query, state, query_start
FROM pg_stat_activity
WHERE state = 'active';
```

---

## 🏥 헬스 체크

### 서비스 상태 확인

#### Docker Compose 상태

```bash
# 모든 서비스 상태
docker-compose ps

# 종료된 컨테이너 포함
docker-compose ps -a

# 서비스 헬스 상태
docker inspect --format='{{.State.Health.Status}}' campstation-frontend
```

#### HTTP 헬스 체크

**Frontend**:

```bash
# 기본 헬스 체크
curl http://localhost:3000

# API 헬스 체크 (백엔드)
curl http://localhost:8080/api/v1/health

# DDNS 도메인 확인
curl http://mycamp.duckdns.org
```

**응답 예시**:

```json
{
  "status": "UP",
  "timestamp": "2024-01-01T12:00:00Z",
  "components": {
    "database": "UP",
    "storage": "UP"
  }
}
```

#### Database 헬스 체크

```bash
# PostgreSQL 접속 테스트
docker exec campstation-postgres pg_isready -U campstation

# 연결 수 확인
docker exec campstation-postgres psql -U campstation -c \
  "SELECT count(*) FROM pg_stat_activity;"

# 데이터베이스 크기
docker exec campstation-postgres psql -U campstation -c \
  "SELECT pg_size_pretty(pg_database_size('campstation'));"
```

---

### 자동 헬스 체크 스크립트

**healthcheck.sh**:

```bash
#!/bin/bash

# 색상 코드
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "=== CampStation Health Check ==="

# Frontend 체크
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✓${NC} Frontend: UP"
else
    echo -e "${RED}✗${NC} Frontend: DOWN"
fi

# Backend 체크
if curl -s http://localhost:8080/api/v1/health > /dev/null; then
    echo -e "${GREEN}✓${NC} Backend: UP"
else
    echo -e "${RED}✗${NC} Backend: DOWN"
fi

# Database 체크
if docker exec campstation-postgres pg_isready -U campstation > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Database: UP"
else
    echo -e "${RED}✗${NC} Database: DOWN"
fi

# MinIO 체크
if curl -s http://localhost:9000/minio/health/live > /dev/null; then
    echo -e "${GREEN}✓${NC} MinIO: UP"
else
    echo -e "${RED}✗${NC} MinIO: DOWN"
fi
```

**실행**:

```bash
chmod +x healthcheck.sh
./healthcheck.sh
```

---

## 🔔 알림 설정 (향후)

### 1. Docker 헬스 체크 설정

**docker-compose.yml**:

```yaml
services:
  frontend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
```

### 2. 로그 모니터링 도구 (향후 도입)

#### Sentry (에러 트래킹)

```bash
# 설치
npm install @sentry/nextjs

# sentry.client.config.js
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

#### Grafana + Prometheus (메트릭 모니터링)

```yaml
# docker-compose에 추가
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
```

### 3. 알림 채널

- **Slack**: 에러 발생 시 즉시 알림
- **Email**: 일일 리포트
- **SMS**: 크리티컬 에러 (서비스 다운)

---

## 📈 로그 보관 정책

### 로그 로테이션

**docker-compose.yml 로깅 설정**:

```yaml
services:
  frontend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m" # 파일 최대 크기
        max-file: "3" # 보관할 파일 개수
```

### 로그 아카이빙

```bash
# 주간 로그 백업 (cron 작업)
0 0 * * 0 docker-compose logs > /backup/logs/campstation_$(date +\%Y\%m\%d).log

# 30일 이상 로그 삭제
find /backup/logs -name "*.log" -mtime +30 -delete
```

---

## 🔧 디버깅 도구

### 1. 컨테이너 내부 접속

```bash
# Shell 접속
docker exec -it campstation-frontend sh
docker exec -it campstation-backend bash

# 특정 명령 실행
docker exec campstation-frontend npm --version
docker exec campstation-backend java -version
```

### 2. 네트워크 디버깅

```bash
# 컨테이너 간 네트워크 확인
docker network ls
docker network inspect campstation_default

# 특정 컨테이너 IP 확인
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' campstation-backend

# 컨테이너 간 연결 테스트
docker exec campstation-frontend ping campstation-backend
```

### 3. 파일 시스템 확인

```bash
# 컨테이너 파일 확인
docker exec campstation-frontend ls -la /app

# 파일 복사 (컨테이너 → 호스트)
docker cp campstation-frontend:/app/.next/static ./static

# 파일 복사 (호스트 → 컨테이너)
docker cp ./config.json campstation-backend:/app/config.json
```

---

## 📌 모니터링 체크리스트

### 일일 체크

- [ ] 모든 컨테이너 정상 실행 확인 (`docker-compose ps`)
- [ ] 에러 로그 확인 (`docker-compose logs | grep -i error`)
- [ ] 디스크 사용량 확인 (`docker system df`)
- [ ] API 응답 시간 확인

### 주간 체크

- [ ] 로그 백업
- [ ] 성능 지표 리뷰
- [ ] 데이터베이스 크기 확인
- [ ] 슬로우 쿼리 분석

### 월간 체크

- [ ] 로그 파일 정리
- [ ] 사용하지 않는 Docker 이미지 삭제
- [ ] 보안 업데이트 확인
- [ ] 성능 최적화 검토

---

## 📌 다음 단계

- [배포 가이드](./01-deployment.md) - 배포 후 모니터링 설정
- [문제 해결 가이드](./04-troubleshooting.md) - 로그 기반 문제 해결
- [보안 체크리스트](./05-security.md) - 보안 로그 검토
