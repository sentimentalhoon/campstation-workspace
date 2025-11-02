# 캠핑장 이미지 캐싱 가이드

## 📋 개요

`campground_images` 테이블을 JSONB로 통합하지 않고, **Caffeine 로컬 캐시**를 활용하여 성능을 최적화했습니다.

## 🤔 왜 별도 테이블을 유지했나?

### reviews.images vs campground_images 비교

| 특성            | reviews.images (JSONB) | campground_images (테이블)        |
| --------------- | ---------------------- | --------------------------------- |
| **개수**        | 0~3개 (적음)           | 1~20개 (많음)                     |
| **변경 빈도**   | 거의 없음              | 자주 수정 (순서, 메인 이미지)     |
| **개별 관리**   | 불필요                 | **필요** (display_order, is_main) |
| **검색 필요성** | 없음                   | **있음** (메인 이미지 조회)       |
| **확장성**      | 제한적                 | 높음 (메타데이터 추가 가능)       |

### 별도 테이블의 장점

1. **개별 관리**: 이미지별 메타데이터 (업로드 시간, 순서, 메인 여부)
2. **인덱싱**: 메인 이미지, 순서별 조회 최적화
3. **데이터 무결성**: FK 제약 조건, CASCADE DELETE
4. **확장성**: 향후 이미지 분석, SEO 정보 추가 가능
5. **운영 편의성**: 통계 집계, 파티셔닝 가능

## ✅ 캐싱 전략

### 1. Caffeine 로컬 캐시

```java
// 캠핑장 이미지 캐시 (30분)
campgroundImages:
- 초기 용량: 100
- 최대 크기: 1,000
- TTL: 30분
- 통계 수집: 활성화
```

**왜 30분?**

- 이미지는 자주 변경되지 않음
- 메인 이미지는 더욱 드물게 변경
- 긴 TTL로 캐시 히트율 극대화

### 2. 캐시 키 전략

```java
// 1. 전체 이미지 목록
key: "campground:{campgroundId}"
예: "campground:123"

// 2. 메인 이미지
key: "mainImage:{campgroundId}"
예: "mainImage:123"
```

### 3. 캐시 무효화 (Eviction)

#### 캠핑장 수정 시

```java
@Caching(evict = {
    @CacheEvict(value = "campgroundImages", key = "'campground:' + #id"),
    @CacheEvict(value = "campgroundImages", key = "'mainImage:' + #id")
})
```

#### 메인 이미지 변경 시

```java
@CacheEvict(value = "campgroundImages", key = "'mainImage:' + #campgroundId")
```

## 🚀 N+1 쿼리 방지

### 1. EntityGraph 사용

```java
@EntityGraph(attributePaths = {"images"})
@Query("SELECT c FROM Campground c WHERE c.deletedAt IS NULL AND c.id = :id")
Optional<Campground> findByIdWithImages(@Param("id") Long id);
```

**효과**:

- 캠핑장 + 이미지를 **1번의 쿼리**로 조회
- LEFT JOIN FETCH로 한 번에 가져옴

### 2. 배치 조회 (기존 유지)

```java
// 여러 캠핑장의 통계를 한 번에 조회
findStatsByCampgroundIds(List<Long> campgroundIds)
```

## 📊 성능 개선 효과

### Before (캐싱 전)

```
캠핑장 상세 조회:
1. SELECT campground (1 query)
2. SELECT images WHERE campground_id = ? (1 query)
3. 반복 시 매번 DB 조회

총: 매 요청마다 2 queries
```

### After (캐싱 후)

```
캠핑장 상세 조회:
1. SELECT campground + images (1 query with EntityGraph)
2. 캐시에 30분 저장
3. 이후 요청은 캐시에서 조회 (0 queries)

총: 첫 요청 1 query, 이후 0 queries (30분간)
```

### 예상 성능 향상

```
시나리오: 인기 캠핑장 100회 조회

Before:
- DB 쿼리: 200회 (100 * 2)
- 응답 시간: ~200ms * 100 = 20초

After:
- DB 쿼리: 1회 (첫 요청만)
- 응답 시간: ~200ms + (~5ms * 99) = ~700ms
- 개선율: 96.5% ⬆️
```

## 🎯 캐시 활용 예시

### 1. 이미지 목록 조회

```java
@Cacheable(value = "campgroundImages",
           key = "'campground:' + #campgroundId",
           unless = "#result == null || #result.isEmpty()")
List<CampgroundImage> findByCampgroundIdOrderByDisplayOrderAscIdAsc(Long campgroundId);
```

**동작**:

1. 첫 요청: DB 조회 후 캐시 저장
2. 이후 요청: 캐시에서 반환 (30분간)
3. 수정 시: 자동 evict

### 2. 메인 이미지 조회

```java
@Cacheable(value = "campgroundImages",
           key = "'mainImage:' + #campgroundId",
           unless = "#result == null")
CampgroundImage findMainImageByCampgroundId(@Param("campgroundId") Long campgroundId);
```

**장점**:

- 메인 이미지는 별도 캐시
- 목록 조회와 독립적으로 관리
- 메인 이미지만 변경 시 효율적

## 🔍 모니터링

### Cache 통계 확인

```bash
# 캐시 통계 조회
GET /api/v1/admin/cache/stats

Response:
{
  "campgroundImages": {
    "size": 234,
    "hitRate": 0.95,
    "missRate": 0.05,
    "evictionCount": 12
  }
}
```

### 주요 지표

- **Hit Rate**: 캐시에서 찾은 비율 (높을수록 좋음)
- **Miss Rate**: DB 조회한 비율 (낮을수록 좋음)
- **Eviction Count**: 캐시 제거 횟수

## 🛠️ 트러블슈팅

### 1. 캐시 일관성 문제

**증상**: 이미지 수정 후 이전 이미지가 보임

**해결**:

```java
// 수동 캐시 무효화
@CacheEvict(value = "campgroundImages", allEntries = true)
```

### 2. 메모리 사용량 증가

**증상**: 캐시 크기가 계속 증가

**해결**:

```java
// 최대 크기 조정
.maximumSize(1000) // 기본값
→ .maximumSize(500) // 줄이기
```

### 3. 캐시 히트율 낮음

**증상**: hitRate < 0.7

**원인**:

- TTL이 너무 짧음
- 캐시 크기가 작음
- 조회 패턴이 분산됨

**해결**:

```java
// TTL 증가
.expireAfterWrite(30, TimeUnit.MINUTES)
→ .expireAfterWrite(60, TimeUnit.MINUTES)

// 캐시 크기 증가
.maximumSize(1000)
→ .maximumSize(2000)
```

## 📝 변경 사항 요약

### 1. CacheConfig.java

```java
✅ campgroundImages 캐시 추가 (30분 TTL)
✅ users 캐시 추가 (10분 TTL)
✅ userFavorites 캐시 추가 (5분 TTL)
```

### 2. CampgroundImageRepository.java

```java
✅ @Cacheable 추가 (이미지 목록)
✅ @Cacheable 추가 (메인 이미지)
```

### 3. CampgroundService.java

```java
✅ @Caching 추가 (updateCampground)
✅ @CacheEvict 추가 (setMainImage)
```

### 4. CampgroundRepository.java

```java
✅ findByIdWithImages() 추가 (EntityGraph)
```

## 🎓 학습 포인트

### JSONB vs 테이블 선택 기준

| 상황             | 권장   | 이유                    |
| ---------------- | ------ | ----------------------- |
| 데이터 1~3개     | JSONB  | 조회 간단, 관리 불필요  |
| 데이터 5개 이상  | 테이블 | 인덱싱, 검색, 정렬 필요 |
| 거의 변경 없음   | JSONB  | 단순 저장               |
| 자주 수정        | 테이블 | 무결성, 트랜잭션        |
| 개별 관리 불필요 | JSONB  | 구조 간단               |
| 개별 관리 필요   | 테이블 | 메타데이터, 제약조건    |

### 캐싱 전략

1. **로컬 캐시 (Caffeine)**:

   - 빠른 조회 (메모리)
   - 서버별 독립적
   - 단순한 데이터

2. **분산 캐시 (Redis)**:

   - 서버 간 공유
   - 세션, Rate Limiting
   - 큰 데이터

3. **하이브리드** (현재 사용):
   - L1: Caffeine (로컬)
   - L2: Redis (분산)
   - 최적의 성능

## 🚦 다음 단계

### 1. 모니터링 대시보드

```
- 캐시 히트율 시각화
- 메모리 사용량 추적
- 응답 시간 비교
```

### 2. 캐시 워밍

```java
// 애플리케이션 시작 시 인기 캠핑장 캐시 미리 로드
@EventListener(ApplicationReadyEvent.class)
public void warmupCache() {
    popularCampgrounds.forEach(this::loadToCache);
}
```

### 3. TTL 최적화

```
- A/B 테스트로 최적 TTL 찾기
- 캐시별 맞춤 설정
```

## 📚 참고 자료

- [Caffeine Cache GitHub](https://github.com/ben-manes/caffeine)
- [Spring Cache Abstraction](https://docs.spring.io/spring-framework/docs/current/reference/html/integration.html#cache)
- [JPA EntityGraph](https://www.baeldung.com/jpa-entity-graph)
