# 배너 관리 시스템 API 명세

## 개요

메인 페이지 프로모션 배너를 등록, 수정, 삭제, 순서 변경할 수 있는 관리 시스템 API 명세입니다.

### 기술 스택

- **프론트엔드**: Next.js 16, React 19+, TanStack Query v5
- **백엔드**: Spring Boot (Kotlin), JPA
- **인증**: HttpOnly Cookie 기반 JWT
- **권한**: ADMIN 전용

---

## 엔드포인트 목록

### 사용자용 API (공개)

| Method | Endpoint                  | Description         | Auth |
| ------ | ------------------------- | ------------------- | ---- |
| GET    | `/api/banners`            | 활성 배너 목록 조회 | ❌   |
| POST   | `/api/banners/{id}/view`  | 배너 조회수 증가    | ❌   |
| POST   | `/api/banners/{id}/click` | 배너 클릭수 증가    | ❌   |

### 관리자용 API (ADMIN)

| Method | Endpoint                   | Description         | Auth     |
| ------ | -------------------------- | ------------------- | -------- |
| GET    | `/api/admin/banners`       | 모든 배너 목록 조회 | ✅ ADMIN |
| GET    | `/api/admin/banners/{id}`  | 배너 상세 조회      | ✅ ADMIN |
| POST   | `/api/admin/banners`       | 배너 생성           | ✅ ADMIN |
| PUT    | `/api/admin/banners/{id}`  | 배너 수정           | ✅ ADMIN |
| DELETE | `/api/admin/banners/{id}`  | 배너 삭제           | ✅ ADMIN |
| PATCH  | `/api/admin/banners/order` | 배너 순서 변경      | ✅ ADMIN |
| GET    | `/api/admin/banners/stats` | 배너 통계 조회      | ✅ ADMIN |

---

## API 상세 명세

### 1. 활성 배너 목록 조회 (공개)

**사용자에게 노출할 활성화된 배너 목록을 반환합니다.**

```http
GET /api/banners
```

#### Query Parameters

| Parameter | Type         | Required | Default | Description    |
| --------- | ------------ | -------- | ------- | -------------- |
| `type`    | `BannerType` | ❌       | -       | 배너 타입 필터 |
| `size`    | `number`     | ❌       | 10      | 조회 개수      |

#### Response

```typescript
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "여름 캠핑 특별 할인",
      "description": "7월 한정 최대 30% 할인",
      "type": "PROMOTION",
      "image": {
        "thumbnailUrl": "https://cdn.campstation.com/banners/thumb_1.jpg",
        "originalUrl": "https://cdn.campstation.com/banners/orig_1.jpg"
      },
      "linkUrl": "/events/summer-2024",
      "linkTarget": "_self",
      "displayOrder": 1,
      "status": "ACTIVE",
      "startDate": "2025-07-01T00:00:00Z",
      "endDate": "2025-07-31T23:59:59Z",
      "viewCount": 1523,
      "clickCount": 234,
      "createdBy": 1,
      "createdAt": "2025-06-15T10:00:00Z",
      "updatedAt": "2025-07-01T08:30:00Z"
    }
  ]
}
```

#### Business Logic

1. `status === "ACTIVE"` 인 배너만 조회
2. 노출 기간 체크:
   - `startDate`가 없거나 현재 시간 >= `startDate`
   - `endDate`가 없거나 현재 시간 <= `endDate`
3. `displayOrder` 오름차순 정렬
4. 조회수는 별도 엔드포인트로 기록

---

### 2. 배너 조회수 증가

**배너가 화면에 노출될 때 호출됩니다.**

```http
POST /api/banners/{id}/view
```

#### Path Parameters

| Parameter | Type     | Required | Description |
| --------- | -------- | -------- | ----------- |
| `id`      | `number` | ✅       | 배너 ID     |

#### Response

```typescript
{
  "success": true,
  "data": {
    "viewCount": 1524
  }
}
```

---

### 3. 배너 클릭수 증가

**사용자가 배너를 클릭할 때 호출됩니다.**

```http
POST /api/banners/{id}/click
```

#### Path Parameters

| Parameter | Type     | Required | Description |
| --------- | -------- | -------- | ----------- |
| `id`      | `number` | ✅       | 배너 ID     |

#### Response

```typescript
{
  "success": true,
  "data": {
    "clickCount": 235
  }
}
```

---

### 4. 모든 배너 목록 조회 (ADMIN)

**관리자가 모든 배너를 조회합니다 (페이지네이션).**

```http
GET /api/admin/banners
```

#### Query Parameters

| Parameter   | Type           | Required | Default        | Description         |
| ----------- | -------------- | -------- | -------------- | ------------------- |
| `status`    | `BannerStatus` | ❌       | -              | 상태 필터           |
| `type`      | `BannerType`   | ❌       | -              | 타입 필터           |
| `page`      | `number`       | ❌       | 0              | 페이지 번호 (0부터) |
| `size`      | `number`       | ❌       | 20             | 페이지 크기         |
| `sort`      | `string`       | ❌       | `displayOrder` | 정렬 기준           |
| `direction` | `asc\|desc`    | ❌       | `asc`          | 정렬 방향           |

#### Response

```typescript
{
  "success": true,
  "data": {
    "content": [Banner[]],
    "totalElements": 25,
    "totalPages": 2,
    "size": 20,
    "number": 0,
    "first": true,
    "last": false,
    "numberOfElements": 20
  }
}
```

---

### 5. 배너 상세 조회 (ADMIN)

```http
GET /api/admin/banners/{id}
```

#### Path Parameters

| Parameter | Type     | Required | Description |
| --------- | -------- | -------- | ----------- |
| `id`      | `number` | ✅       | 배너 ID     |

#### Response

```typescript
{
  "success": true,
  "data": {
    // Banner 객체
  }
}
```

---

### 6. 배너 생성 (ADMIN)

```http
POST /api/admin/banners
Content-Type: application/json
```

#### Request Body

```typescript
{
  "title": "신규 캠핑장 오픈",
  "description": "제주도 신규 글램핑 오픈",
  "type": "ANNOUNCEMENT",
  "image": {
    "thumbnailUrl": "https://cdn.campstation.com/banners/thumb_2.jpg",
    "originalUrl": "https://cdn.campstation.com/banners/orig_2.jpg"
  },
  "linkUrl": "/campgrounds/123",
  "linkTarget": "_self",
  "displayOrder": 2,
  "status": "INACTIVE", // 생성 후 검토 후 활성화
  "startDate": "2025-08-01T00:00:00Z",
  "endDate": "2025-08-31T23:59:59Z"
}
```

#### Validation Rules

| Field          | Rule                                      |
| -------------- | ----------------------------------------- |
| `title`        | 필수, 1~100자                             |
| `description`  | 선택, 최대 500자                          |
| `type`         | 필수, PROMOTION/EVENT/ANNOUNCEMENT/NOTICE |
| `image`        | 필수, ImagePair 형식                      |
| `linkUrl`      | 선택, URL 형식                            |
| `linkTarget`   | 선택, \_self 또는 \_blank                 |
| `displayOrder` | 선택, 양수 (미지정 시 마지막)             |
| `status`       | 선택, 기본값 INACTIVE                     |
| `startDate`    | 선택, ISO 8601                            |
| `endDate`      | 선택, ISO 8601, startDate 이후            |

#### Response

```typescript
{
  "success": true,
  "data": {
    "id": 2,
    // ... created Banner
  }
}
```

---

### 7. 배너 수정 (ADMIN)

```http
PUT /api/admin/banners/{id}
Content-Type: application/json
```

#### Path Parameters

| Parameter | Type     | Required | Description |
| --------- | -------- | -------- | ----------- |
| `id`      | `number` | ✅       | 배너 ID     |

#### Request Body

```typescript
{
  "title": "신규 캠핑장 오픈 (수정)",
  "status": "ACTIVE" // 활성화
  // ... 수정할 필드만 포함
}
```

#### Response

```typescript
{
  "success": true,
  "data": {
    // ... updated Banner
  }
}
```

---

### 8. 배너 삭제 (ADMIN)

```http
DELETE /api/admin/banners/{id}
```

#### Path Parameters

| Parameter | Type     | Required | Description |
| --------- | -------- | -------- | ----------- |
| `id`      | `number` | ✅       | 배너 ID     |

#### Response

```typescript
{
  "success": true,
  "data": null
}
```

#### Business Logic

- 소프트 삭제 권장 (`deletedAt` 필드 추가)
- 또는 하드 삭제 (통계 데이터 보존 고려)

---

### 9. 배너 순서 변경 (ADMIN)

**여러 배너의 순서를 일괄 변경합니다.**

```http
PATCH /api/admin/banners/order
Content-Type: application/json
```

#### Request Body

```typescript
[
  { bannerId: 3, displayOrder: 1 },
  { bannerId: 1, displayOrder: 2 },
  { bannerId: 2, displayOrder: 3 },
];
```

#### Response

```typescript
{
  "success": true,
  "data": {
    "updatedCount": 3
  }
}
```

#### Business Logic

- 트랜잭션 내에서 일괄 업데이트
- `displayOrder` 중복 허용 (같은 순서는 ID 오름차순)

---

### 10. 배너 통계 조회 (ADMIN)

```http
GET /api/admin/banners/stats
```

#### Response

```typescript
{
  "success": true,
  "data": {
    "totalBanners": 25,
    "activeBanners": 5,
    "inactiveBanners": 18,
    "scheduledBanners": 2,
    "totalViews": 45230,
    "totalClicks": 3421,
    "averageCtr": 7.56 // Click-Through Rate (%)
  }
}
```

---

## 에러 응답

### 공통 에러 형식

```typescript
{
  "success": false,
  "error": {
    "code": "BANNER_NOT_FOUND",
    "message": "배너를 찾을 수 없습니다.",
    "details": {
      "bannerId": 999
    }
  }
}
```

### 주요 에러 코드

| Code                      | HTTP Status | Description                    |
| ------------------------- | ----------- | ------------------------------ |
| `BANNER_NOT_FOUND`        | 404         | 배너를 찾을 수 없음            |
| `UNAUTHORIZED`            | 401         | 인증 필요                      |
| `FORBIDDEN`               | 403         | ADMIN 권한 필요                |
| `INVALID_BANNER_DATA`     | 400         | 배너 데이터 유효성 검증 실패   |
| `INVALID_DATE_RANGE`      | 400         | 종료일이 시작일보다 빠름       |
| `DUPLICATE_DISPLAY_ORDER` | 409         | 순서 중복 (허용하지 않는 경우) |

---

## 데이터베이스 스키마 (참고)

### banners 테이블

```sql
CREATE TABLE banners (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    type VARCHAR(20) NOT NULL, -- PROMOTION, EVENT, ANNOUNCEMENT, NOTICE
    thumbnail_url VARCHAR(500) NOT NULL,
    original_url VARCHAR(500) NOT NULL,
    link_url VARCHAR(500),
    link_target VARCHAR(10) DEFAULT '_self',
    display_order INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'INACTIVE', -- ACTIVE, INACTIVE, SCHEDULED
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    view_count BIGINT DEFAULT 0,
    click_count BIGINT DEFAULT 0,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_status_display_order (status, display_order),
    INDEX idx_dates (start_date, end_date)
);
```

---

## 권한 정책

### ADMIN 권한 체크

```kotlin
@PreAuthorize("hasRole('ADMIN')")
fun createBanner(@RequestBody dto: CreateBannerDto): BannerResponse {
    // ...
}
```

### Spring Security 설정

```kotlin
http
    .authorizeHttpRequests { auth ->
        auth
            .requestMatchers("/api/banners/**").permitAll()
            .requestMatchers("/api/admin/banners/**").hasRole("ADMIN")
    }
```

---

## 구현 우선순위

### Phase 1: 기본 CRUD

1. ✅ 타입 정의 (Banner, CreateBannerDto, UpdateBannerDto)
2. ⏳ 백엔드 Entity, Repository, Service, Controller
3. ⏳ 프론트엔드 API 클라이언트
4. ⏳ React Query Hooks

### Phase 2: 관리자 UI

5. ⏳ 배너 목록 페이지
6. ⏳ 배너 생성/수정 폼
7. ⏳ 이미지 업로드 컴포넌트

### Phase 3: 고급 기능

8. ⏳ 순서 변경 (Drag & Drop)
9. ⏳ 통계 대시보드
10. ⏳ 예약 발행 (SCHEDULED)

---

## 참고 문서

- [ImagePair 타입 정의](../../types/domain/image.ts)
- [기존 Admin API 패턴](../../lib/api/admin.ts)
- [TanStack Query 사용 가이드](../technical/react-query.md)

---

**작성일**: 2025-11-16  
**작성자**: GitHub Copilot  
**버전**: 1.0.0
