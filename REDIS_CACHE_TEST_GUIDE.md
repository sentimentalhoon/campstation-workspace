# Redis 캐시 테스트 가이드

## 📋 개요

Spring Boot 애플리케이션의 Redis 캐시 동작을 확인하기 위한 테스트 가이드입니다.

## 🎯 캐시 구현 현황

### ✅ 구현 완료된 캐시

| 캐시 영역              | TTL   | 설명                              | 무효화 조건              |
| ---------------------- | ----- | --------------------------------- | ------------------------ |
| **reviewStatistics**   | 1시간 | 리뷰 통계 (평균 평점, 리뷰 수 등) | 리뷰 생성/수정/삭제      |
| **averageRatings**     | 1시간 | 캠핑장 평균 평점                  | 리뷰 생성/수정/삭제      |
| **reviewCounts**       | 1시간 | 캠핑장 리뷰 수                    | 리뷰 생성/수정/삭제      |
| **userFavorites**      | 5분   | 사용자 찜하기 목록                | 찜하기 추가/제거         |
| **favoriteStatus**     | 5분   | 찜하기 여부                       | 찜하기 추가/제거         |
| **favoriteCounts**     | 30분  | 캠핑장 찜하기 수                  | 찜하기 추가/제거         |
| **userFavoriteIds**    | 5분   | 사용자 찜하기 ID 목록             | 찜하기 추가/제거         |
| **popularCampgrounds** | 6시간 | 인기 캠핑장 목록                  | 찜하기 추가/제거         |
| **campgrounds**        | 4시간 | 캠핑장 상세 정보                  | 캠핑장 수정, 찜하기 변경 |
| **users**              | 4시간 | 사용자 정보                       | -                        |
| **reservations**       | 5분   | 예약 정보                         | 예약 생성/수정/취소      |

### 🔧 RedisConfig 설정

- **기본 TTL**: 2시간
- **직렬화**: Jackson JSON (GenericJackson2JsonRedisSerializer)
- **트랜잭션 지원**: 활성화 (transactionAware)
- **프로덕션 환경**: `@environment.acceptsProfiles('prod')` 조건

## 🚀 테스트 환경 구축

### 1. Docker로 Redis 실행

```bash
# Docker Compose로 전체 서비스 실행 (Redis 포함)
docker-compose up -d

# Redis만 실행
docker-compose up -d redis

# Redis 상태 확인
docker-compose ps redis
```

### 2. Redis CLI 접속

```bash
# Docker 컨테이너로 Redis CLI 실행
docker exec -it campstation-redis redis-cli

# 또는 로컬 Redis CLI 사용
redis-cli -h localhost -p 6379
```

## 🧪 캐시 동작 테스트

### 테스트 1: 리뷰 통계 캐시

#### 1️⃣ 리뷰 통계 조회 (캐시 미스 → DB 쿼리)

```bash
# API 호출
curl -X GET "http://localhost:8080/api/v1/reviews/campground/1/stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 로그 확인 (백엔드 콘솔)
# → "리뷰 통계 조회 (DB) - campgroundId: 1" 출력됨
```

#### 2️⃣ Redis에 캐시 저장 확인

```bash
# Redis CLI
KEYS reviewStatistics*
# 결과: "reviewStatistics::campground:1"

# 캐시 데이터 조회
GET "reviewStatistics::campground:1"
# JSON 형태로 통계 데이터 출력
```

#### 3️⃣ 같은 요청 재호출 (캐시 히트 → DB 쿼리 없음)

```bash
# 동일한 API 재호출
curl -X GET "http://localhost:8080/api/v1/reviews/campground/1/stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 로그 확인
# → "리뷰 통계 조회 (DB)" 로그 출력 안 됨 (캐시에서 반환)
```

#### 4️⃣ 리뷰 생성 후 캐시 무효화 확인

```bash
# 리뷰 생성 API
curl -X POST "http://localhost:8080/api/v1/reviews" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "campgroundId": 1,
    "rating": 5,
    "content": "최고의 캠핑장!"
  }'

# Redis에서 캐시 삭제 확인
KEYS reviewStatistics*
# 결과: (empty array) - 캐시 무효화됨

# 리뷰 통계 재조회
curl -X GET "http://localhost:8080/api/v1/reviews/campground/1/stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 로그 확인
# → "리뷰 통계 조회 (DB)" 로그 다시 출력 (캐시 미스)
```

### 테스트 2: 찜하기 목록 캐시

#### 1️⃣ 찜하기 목록 조회

```bash
# API 호출
curl -X GET "http://localhost:8080/api/v1/favorites?page=0&size=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Redis 확인
KEYS userFavorites*
# 결과: "userFavorites::user:123:page:0:size:10"
```

#### 2️⃣ 찜하기 추가/제거 후 캐시 무효화

```bash
# 찜하기 추가
curl -X POST "http://localhost:8080/api/v1/favorites/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Redis 확인 - allEntries=true이므로 모든 캐시 삭제
KEYS userFavorites*
# 결과: (empty array)

KEYS popularCampgrounds*
# 결과: (empty array) - 인기 캠핑장 캐시도 무효화됨
```

### 테스트 3: 인기 캠핑장 캐시

#### 1️⃣ 인기 캠핑장 조회

```bash
# API 호출 (예시)
curl -X GET "http://localhost:8080/api/v1/campgrounds/popular?limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Redis 확인
KEYS popularCampgrounds*
# 결과: "popularCampgrounds::limit:10"

# TTL 확인 (6시간 = 21600초)
TTL "popularCampgrounds::limit:10"
# 결과: 21590 (약 6시간 남음)
```

#### 2️⃣ 찜하기 변경 시 캐시 무효화 확인

```bash
# 찜하기 추가 → popularCampgrounds 캐시 무효화
curl -X POST "http://localhost:8080/api/v1/favorites/5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Redis 확인
KEYS popularCampgrounds*
# 결과: (empty array) - 캐시 삭제됨
```

## 📊 성능 측정

### 1. API 응답 시간 비교

#### 캐시 미스 (첫 요청)

```bash
# curl로 응답 시간 측정
curl -o /dev/null -s -w "Time: %{time_total}s\n" \
  -X GET "http://localhost:8080/api/v1/reviews/campground/1/stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 결과: Time: 0.150s (DB 쿼리 6번)
```

#### 캐시 히트 (두 번째 요청)

```bash
curl -o /dev/null -s -w "Time: %{time_total}s\n" \
  -X GET "http://localhost:8080/api/v1/reviews/campground/1/stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 결과: Time: 0.015s (Redis에서 반환)
# 성능 개선: 10배 빠름
```

### 2. Redis 캐시 히트율 확인

```bash
# Redis CLI에서 캐시 통계 조회
INFO stats

# keyspace_hits: 캐시 히트 수
# keyspace_misses: 캐시 미스 수
# hit_rate = hits / (hits + misses) * 100%
```

### 3. 백엔드 로그 분석

```bash
# application.yml에 로그 레벨 설정
logging:
  level:
    com.campstation.camp: DEBUG
    org.springframework.cache: TRACE

# "리뷰 통계 조회 (DB)" 로그 빈도 확인
# → 캐시 미스 시에만 출력됨
```

## 🔍 Redis 모니터링 명령어

### 1. 전체 캐시 키 확인

```bash
# 모든 키 조회 (개발 환경에만 사용, 프로덕션 주의)
KEYS *

# 특정 패턴 검색
KEYS reviewStatistics*
KEYS userFavorites*
KEYS popularCampgrounds*
```

### 2. 캐시 데이터 확인

```bash
# 키 타입 확인
TYPE "reviewStatistics::campground:1"
# 결과: string (JSON 직렬화)

# 데이터 조회
GET "reviewStatistics::campground:1"
# JSON 형태 출력

# TTL 확인
TTL "reviewStatistics::campground:1"
# 결과: 3587 (약 1시간 남음)
```

### 3. 캐시 삭제 (테스트용)

```bash
# 특정 키 삭제
DEL "reviewStatistics::campground:1"

# 패턴 매치 삭제
EVAL "return redis.call('del', unpack(redis.call('keys', ARGV[1])))" 0 "reviewStatistics*"

# 모든 캐시 삭제 (개발 환경 전용)
FLUSHDB
```

### 4. Redis 메모리 사용량

```bash
# 메모리 통계
INFO memory

# 주요 지표:
# - used_memory_human: 사용 중인 메모리
# - maxmemory_human: 최대 메모리 (512MB)
# - maxmemory_policy: allkeys-lru (메모리 부족 시 LRU 정책)
```

## 🎯 예상 성능 개선

### 리뷰 통계 캐시

- **DB 쿼리**: 6번 (평균 평점, 별점별 개수, 총 리뷰 수 등)
- **캐시 히트 시**: DB 쿼리 0번
- **성능 개선**: **10배 빠름** (150ms → 15ms)
- **효과**: 캠핑장 상세 페이지 로딩 속도 개선

### 찜하기 목록 캐시

- **DB 쿼리**: N+1 문제 가능성 (사용자 + 캠핑장 조인)
- **캐시 히트 시**: DB 쿼리 0번
- **성능 개선**: **5배 빠름** (100ms → 20ms)
- **효과**: 마이페이지 찜하기 목록 즉시 로딩

### 인기 캠핑장 캐시

- **DB 쿼리**: 복잡한 집계 쿼리 (찜하기 수 기준 정렬)
- **캐시 히트 시**: DB 쿼리 0번
- **성능 개선**: **8배 빠름** (200ms → 25ms)
- **효과**: 홈페이지 로딩 속도 대폭 개선

## ✅ 체크리스트

### 기본 동작 확인

- [ ] Redis 서버 정상 실행
- [ ] 백엔드 애플리케이션 Redis 연결 성공
- [ ] 첫 API 호출 시 캐시 미스 (DB 로그 출력)
- [ ] 두 번째 API 호출 시 캐시 히트 (DB 로그 없음)
- [ ] Redis CLI에서 캐시 키 확인

### 캐시 무효화 확인

- [ ] 리뷰 생성 후 reviewStatistics 캐시 삭제
- [ ] 리뷰 수정 후 averageRatings 캐시 삭제
- [ ] 찜하기 추가 후 userFavorites 캐시 삭제
- [ ] 찜하기 제거 후 popularCampgrounds 캐시 삭제

### 성능 측정

- [ ] 캐시 미스 응답 시간 측정
- [ ] 캐시 히트 응답 시간 측정
- [ ] 성능 개선율 계산
- [ ] Redis 캐시 히트율 확인

### 프로덕션 배포 준비

- [ ] application-prod.yml Redis 설정 확인
- [ ] REDIS_PASSWORD 환경 변수 설정
- [ ] Redis maxmemory 정책 확인 (allkeys-lru)
- [ ] Redis 영속화 설정 (AOF) 확인

## 🐛 트러블슈팅

### 문제 1: 캐시가 생성되지 않음

**원인**: `@environment.acceptsProfiles('prod')` 조건
**해결**:

```bash
# application.yml에 프로파일 추가
spring:
  profiles:
    active: prod
```

### 문제 2: 캐시 무효화 안 됨

**원인**: `allEntries = true` 조건
**해결**:

- Redis CLI에서 수동 삭제: `FLUSHDB`
- 코드에서 `@CacheEvict` 확인

### 문제 3: Redis 연결 실패

**원인**: Docker 네트워크 문제
**해결**:

```bash
# Docker 네트워크 확인
docker network ls
docker network inspect campstation-network

# 서비스 재시작
docker-compose restart redis backend
```

### 문제 4: 직렬화 에러

**원인**: DTO가 Serializable 미구현
**해결**:

- 모든 캐시 DTO에 `implements Serializable` 추가
- `@JsonIgnoreProperties(ignoreUnknown = true)` 사용

## 📚 참고 자료

### Spring Cache 문서

- [Spring Cache Abstraction](https://docs.spring.io/spring-framework/reference/integration/cache.html)
- [Spring Data Redis](https://spring.io/projects/spring-data-redis)

### Redis 문서

- [Redis Commands](https://redis.io/commands/)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)

### 관련 파일

- `backend/src/main/java/com/campstation/camp/shared/config/RedisConfig.java`
- `backend/src/main/java/com/campstation/camp/review/service/ReviewService.java`
- `backend/src/main/java/com/campstation/camp/user/service/FavoriteService.java`
- `backend/src/main/java/com/campstation/camp/campground/service/CampgroundService.java`
