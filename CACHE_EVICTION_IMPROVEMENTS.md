# Redis 캐시 자동 업데이트 개선

## 문제점

Campgrounds 테이블의 정보를 Redis에 캐시하고 있었지만, 데이터 수정 시 캐시가 자동으로 갱신되지 않는 문제가 있었습니다.

## 수정 내용

### 1. CampgroundService.java

**위치**: `backend/src/main/java/com/campstation/camp/campground/service/CampgroundService.java`

#### 수정된 메서드:

1. **updateCampground()** - 캠핑장 정보 수정

   - **이전**: `@CacheEvict` 어노테이션 없음
   - **수정**: `@CacheEvict(value = {"campgrounds", "popularCampgrounds"}, allEntries = true)`
   - 캠핑장 정보가 수정되면 관련된 모든 캐시를 삭제

2. **deleteCampground()** - 캠핑장 삭제
   - **이전**: `@CacheEvict(value = "campgrounds", key = "'id:' + #id")`
   - **수정**: `@CacheEvict(value = {"campgrounds", "popularCampgrounds"}, allEntries = true)`
   - 특정 ID만 삭제하는 것이 아니라 전체 캐시 삭제 (페이지네이션 캐시 때문)

### 2. CampgroundAdminFacade.java

**위치**: `backend/src/main/java/com/campstation/camp/campground/service/CampgroundAdminFacade.java`

#### 추가된 import:

```java
import org.springframework.cache.annotation.CacheEvict;
```

#### 수정된 메서드:

1. **create()** - 관리자 캠핑장 생성

   - **추가**: `@CacheEvict(value = {"campgrounds", "popularCampgrounds"}, allEntries = true)`

2. **update()** - 관리자 캠핑장 수정

   - **추가**: `@CacheEvict(value = {"campgrounds", "popularCampgrounds"}, allEntries = true)`

3. **updateStatus()** - 캠핑장 상태 변경

   - **추가**: `@CacheEvict(value = {"campgrounds", "popularCampgrounds"}, allEntries = true)`

4. **delete()** - 관리자 캠핑장 삭제
   - **추가**: `@CacheEvict(value = {"campgrounds", "popularCampgrounds"}, allEntries = true)`

### 3. SiteService.java

**위치**: `backend/src/main/java/com/campstation/camp/campground/service/SiteService.java`

Site는 Campground의 하위 엔티티이므로, Site 변경 시에도 campgrounds 캐시를 삭제해야 합니다.

#### 수정된 메서드:

1. **createSite()** - 사이트 생성

   - **이전**: `@CacheEvict(value = "sites", allEntries = true)`
   - **수정**: `@CacheEvict(value = {"sites", "campgrounds", "popularCampgrounds"}, allEntries = true)`

2. **updateSite()** - 사이트 수정

   - **이전**: `@CacheEvict` 어노테이션 없음
   - **추가**: `@CacheEvict(value = {"sites", "campgrounds", "popularCampgrounds"}, allEntries = true)`

3. **deleteSite()** - 사이트 삭제
   - **이전**: `@CacheEvict` 어노테이션 없음
   - **추가**: `@CacheEvict(value = {"sites", "campgrounds", "popularCampgrounds"}, allEntries = true)`

## 캐시 전략

### 캐시 삭제 대상

모든 수정 작업에서 다음 캐시들을 삭제합니다:

- `campgrounds`: 캠핑장 목록 캐시
- `popularCampgrounds`: 인기 캠핑장 캐시
- `sites`: 사이트 정보 캐시 (Site 관련 작업만)

### allEntries = true를 사용하는 이유

1. **페이지네이션 캐시**: `'all:' + pageNumber + ':' + pageSize` 형태의 다양한 캐시 키 존재
2. **복잡한 의존성**: 한 캠핑장의 변경이 여러 페이지와 정렬 결과에 영향
3. **일관성 보장**: 특정 키만 삭제하면 다른 캐시와 불일치 가능

### 로컬 환경 제외

```java
condition = "!@environment.acceptsProfiles('local')"
```

- 개발 환경에서는 캐시를 사용하지 않아 성능 오버헤드 방지

## 동작 확인 방법

### 1. 캠핑장 생성

```bash
POST /api/campgrounds
```

→ `campgrounds`, `popularCampgrounds` 캐시 삭제

### 2. 캠핑장 수정

```bash
PUT /api/campgrounds/{id}
```

→ `campgrounds`, `popularCampgrounds` 캐시 삭제

### 3. 캠핑장 삭제

```bash
DELETE /api/campgrounds/{id}
```

→ `campgrounds`, `popularCampgrounds` 캐시 삭제

### 4. 사이트 생성/수정/삭제

```bash
POST /api/sites
PUT /api/sites/{id}
DELETE /api/sites/{id}
```

→ `sites`, `campgrounds`, `popularCampgrounds` 캐시 삭제

## 기대 효과

1. **데이터 일관성**: 수정된 데이터가 즉시 반영
2. **자동화**: 개발자가 수동으로 캐시를 관리할 필요 없음
3. **성능**: 변경 시에만 캐시 삭제, 조회 시 캐시 활용
4. **안정성**: 로컬 환경에서는 캐시 미사용으로 디버깅 용이

## 추가 고려사항

### 현재 캐시 구조

- `@Cacheable`: 조회 시 캐시 저장

  - `findAll()`: 페이지네이션 결과 캐시
  - `findPopular()`: 인기 캠핑장 캐시

- `@CacheEvict`: 수정 시 캐시 삭제
  - 모든 CREATE, UPDATE, DELETE 작업

### 향후 개선 가능 사항

1. **TTL 설정**: 캐시 만료 시간 설정으로 장기 불일치 방지
2. **선택적 캐시**: 자주 변경되지 않는 데이터만 캐시
3. **캐시 워밍**: 애플리케이션 시작 시 주요 데이터 미리 캐시
4. **분산 캐시**: Redis Cluster로 확장 시 캐시 동기화 전략

## 관련 파일

- `CampgroundService.java`
- `CampgroundAdminFacade.java`
- `SiteService.java`
- `FavoriteService.java` (이미 캐시 eviction 적용됨)
- `ReviewService.java` (이미 캐시 eviction 적용됨)
- `UserService.java` (이미 캐시 eviction 적용됨)

## 날짜

2025-10-27
