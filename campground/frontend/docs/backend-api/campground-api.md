# 캠핑장 API

## 기본 정보

- Base Path: `/api/v1/campgrounds`
- 인증: 대부분 Public, 생성/수정/삭제는 `@OwnerOrAdmin` 필요

---

## 엔드포인트 목록

### GET /v1/campgrounds

캠핑장 목록 조회 (페이지네이션)

**인증**: ❌ Public

**Query Parameters:**

```typescript
{
  page?: number;    // 기본값: 0
  size?: number;    // 기본값: 20
  sort?: string;    // 예: "rating,desc"
}
```

**Response:**

```json
{
  "success": true,
  "message": "캠핑장 목록 조회 성공",
  "data": {
    "content": [
      {
        "id": 1,
        "name": "캠핑앤글램핑 망원한강공원",
        "description": "한강변에 위치한 도심 속 캠핑장",
        "address": "서울 마포구 마포나루길 467",
        "phone": "02-3780-0631",
        "email": "mangwon@campstation.com",
        "imageUrl": "https://localhost/storage/campgrounds/thumbnail/xxx.jpg",
        "thumbnailUrls": ["url1", "url2", "url3", "url4"],
        "rating": 5.0,
        "reviewCount": 1,
        "favoriteCount": 2
      }
    ],
    "pageNumber": 0,
    "pageSize": 20,
    "totalElements": 50,
    "totalPages": 3,
    "isLast": false
  }
}
```

---

### GET /v1/campgrounds/{id}

캠핑장 상세 조회

**인증**: ❌ Public

**Path Parameters:**

- `id`: 캠핑장 ID (Long)

**Response:**

```json
{
  "success": true,
  "message": "캠핑장 조회 성공",
  "data": {
    "id": 1,
    "name": "캠핑앤글램핑 망원한강공원",
    "description": "한강변에 위치한 도심 속 캠핑장. 서울 시내에서 쉽게 접근 가능하며 한강 야경을 즐길 수 있습니다.",
    "address": "서울 마포구 마포나루길 467",
    "phone": "02-3780-0631",
    "email": "mangwon@campstation.com",
    "website": "https://hangang.seoul.go.kr",
    "imageUrl": "https://localhost/storage/campgrounds/thumbnail/41095fda-eb85-447a-b9cd-d699921e3ca7.jpg",
    "thumbnailUrls": [
      "https://localhost/storage/campgrounds/thumbnail/41095fda-eb85-447a-b9cd-d699921e3ca7.jpg",
      "https://localhost/storage/campgrounds/thumbnail/84252eba-bc35-4986-8bb8-6ed375c229d3.jpg",
      "https://localhost/storage/campgrounds/thumbnail/cc1618de-4da8-42a7-ba28-21890e022f68.jpg",
      "https://localhost/storage/campgrounds/thumbnail/865c0bc7-90ad-415d-a2e2-efae2e0b3b45.jpg"
    ],
    "originalImageUrls": [
      "https://localhost/storage/campgrounds/original/e2968967-f747-4002-b8a2-089f27d61fe9.jpg",
      "https://localhost/storage/campgrounds/original/d2f861d3-8b8f-4c2e-95e6-56695a2443ee.jpg",
      "https://localhost/storage/campgrounds/original/a6a2fd89-3000-4339-8686-972ce0a5f672.jpg",
      "https://localhost/storage/campgrounds/original/5d086ccc-f2e2-4357-af74-0a630458890f.jpg"
    ],
    "latitude": 37.552344,
    "longitude": 126.899886,
    "status": "ACTIVE",
    "rating": 5.0,
    "reviewCount": 1,
    "favoriteCount": 2,
    "checkInTime": "14:00",
    "checkOutTime": "11:00",
    "businessOwnerName": null,
    "businessName": "캠핑앤글램핑 망원한강공원",
    "businessAddress": "서울 마포구 마포나루길 467",
    "businessEmail": "mangwon@campstation.com",
    "businessRegistrationNumber": "3333-1333-123412",
    "tourismBusinessNumber": "제3333-33333호",
    "owner": {
      "id": 2,
      "email": "owner1@example.com",
      "name": "오너1번",
      "phone": "010-1111-1111",
      "role": "OWNER",
      "status": "ACTIVE",
      "createdAt": "2025-10-30T21:08:37.372376",
      "updatedAt": "2025-11-09T03:00:46.312059",
      "profileImage": "profiles/099a199d-2939-4747-8737-c0647c199688.jpg"
    },
    "createdAt": "2025-10-30T21:08:37.435561",
    "updatedAt": "2025-11-03T04:59:05.293296"
  },
  "timestamp": "2025-11-09T03:03:29.6966706"
}
```

**TypeScript 타입:**

```typescript
type CampgroundDetailResponse = ApiResponse<{
  id: number;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  imageUrl: string;
  thumbnailUrls: string[];
  originalImageUrls: string[];
  latitude: number;
  longitude: number;
  status: string; // "ACTIVE"
  rating: number;
  reviewCount: number;
  favoriteCount: number;
  checkInTime: string; // "HH:mm" 형식
  checkOutTime: string;
  businessOwnerName: string | null;
  businessName: string;
  businessAddress: string;
  businessEmail: string;
  businessRegistrationNumber: string;
  tourismBusinessNumber: string;
  owner: {
    id: number;
    email: string;
    name: string;
    phone: string;
    role: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    profileImage: string | null;
  };
  createdAt: string;
  updatedAt: string;
}>;
```

---

### GET /v1/campgrounds/search

캠핑장 검색

**인증**: ❌ Public

**Query Parameters:**

```typescript
{
  keyword?: string;        // 검색 키워드
  minPrice?: number;       // 최소 가격
  maxPrice?: number;       // 최대 가격
  amenities?: string[];    // 편의시설 (쉼표로 구분)
  page?: number;
  size?: number;
}
```

---

### GET /v1/campgrounds/popular

인기 캠핑장 조회

**인증**: ❌ Public

**Query Parameters:**

- `limit`: 조회할 개수 (기본값: 10)

**Response:**

```json
{
  "success": true,
  "message": "인기 캠핑장 조회 성공",
  "data": [
    {
      "id": 1,
      "name": "캠핑앤글램핑 망원한강공원",
      "rating": 5.0,
      "favoriteCount": 100
      // ... 기타 필드
    }
  ]
}
```

---

### GET /v1/campgrounds/map

지도 영역 내 캠핑장 조회

**인증**: ❌ Public

**Query Parameters:**

```typescript
{
  swLat: number; // 남서쪽 위도
  swLng: number; // 남서쪽 경도
  neLat: number; // 북동쪽 위도
  neLng: number; // 북동쪽 경도
}
```

**Response:**

```json
{
  "success": true,
  "message": "지도 영역 내 캠핑장 조회 성공",
  "data": [
    {
      "id": 1,
      "name": "캠핑앤글램핑 망원한강공원",
      "latitude": 37.552344,
      "longitude": 126.899886,
      "rating": 5.0
      // ... 기타 필드
    }
  ]
}
```

---

### POST /v1/campgrounds

캠핑장 생성

**인증**: ✅ @OwnerOrAdmin

**Request Body:**

```json
{
  "name": "새로운 캠핑장",
  "description": "캠핑장 설명 (최소 10자)",
  "address": "서울 강남구...",
  "phone": "02-1234-5678",
  "email": "contact@campground.com",
  "website": "https://campground.com",
  "imageUrls": ["url1", "url2"],
  "latitude": 37.123456,
  "longitude": 126.123456,
  "checkInTime": "14:00",
  "checkOutTime": "11:00",
  "businessOwnerName": "홍길동",
  "businessName": "캠핑장 사업자명",
  "businessAddress": "사업자 주소",
  "businessEmail": "business@example.com",
  "businessRegistrationNumber": "123-45-67890",
  "tourismBusinessNumber": "제1234-5678호"
}
```

---

### PUT /v1/campgrounds/{id}

캠핑장 수정

**인증**: ✅ @OwnerOrAdmin (본인 또는 관리자만)

---

### DELETE /v1/campgrounds/{id}

캠핑장 삭제

**인증**: ✅ @OwnerOrAdmin (본인 또는 관리자만)

---

### PATCH /v1/campgrounds/{id}/images/main

메인 이미지 설정

**인증**: ✅ @OwnerOrAdmin

**Query Parameters:**

- `imageUrl`: 메인으로 설정할 이미지 URL

---

## 프론트엔드 사용 예시

```typescript
// hooks/useCampgroundDetail.ts
export function useCampgroundDetail(id: number) {
  return useQuery<CampgroundDetailResponse>({
    queryKey: ["campground", id],
    queryFn: () => campgroundApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// lib/api/campgrounds.ts
export const campgroundApi = {
  getById: (id: number) =>
    get<CampgroundDetailResponse>(`/v1/campgrounds/${id}`),

  getAll: (params?: { page?: number; size?: number }) =>
    get<CampgroundListResponse>("/v1/campgrounds", { params }),
};
```

---

## 주의사항

❗ **amenities 필드 없음**

- Campground 응답에는 amenities가 없습니다
- 편의시설 정보가 필요하면 `/v1/sites/by-campground/{id}` API를 호출하여 사이트별 amenities를 통합해야 합니다

❗ **이미지 URL 3가지**

- `imageUrl`: 메인 대표 이미지 (단일)
- `thumbnailUrls[]`: 썸네일 이미지 배열 (갤러리용)
- `originalImageUrls[]`: 원본 이미지 배열 (고해상도)

❗ **시간 형식**

- `checkInTime`, `checkOutTime`: "HH:mm" 형식 (예: "14:00")
- `createdAt`, `updatedAt`: ISO 8601 형식
