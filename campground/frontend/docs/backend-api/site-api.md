# 사이트 API

## 기본 정보

- Base Path: `/api/v1/sites`
- 인증: 조회는 Public, 생성/수정/삭제는 `@OwnerOrAdmin` 필요

---

## 엔드포인트 목록

### GET /v1/sites/by-campground/{campgroundId}

특정 캠핑장의 사이트 목록 조회

**인증**: ❌ Public

**Path Parameters:**

- `campgroundId`: 캠핑장 ID (Long)

**Query Parameters:**

```typescript
{
  page?: number;    // 기본값: 0
  size?: number;    // 기본값: 50
  siteType?: string; // "CARAVAN" | "GLAMP" | "CABIN"
}
```

**Response (실제 응답):**

```json
{
  "success": true,
  "message": "사이트 목록 조회 성공",
  "data": {
    "content": [
      {
        "id": 1,
        "siteNumber": "SITE-1",
        "siteType": "CARAVAN",
        "capacity": 4,
        "description": "한강뷰 카라반 사이트",
        "amenities": [
          "ELECTRICITY",
          "WATER",
          "WIFI",
          "TOILET",
          "SHOWER",
          "PARKING",
          "SECURITY",
          "FIRST_AID",
          "PLAYGROUND"
        ],
        "basePrice": 50000.0,
        "latitude": 37.5523,
        "longitude": 126.8998,
        "status": "AVAILABLE",
        "campgroundId": 1
      },
      {
        "id": 2,
        "siteNumber": "SITE-2",
        "siteType": "GLAMP",
        "capacity": 4,
        "description": "글램핑 텐트",
        "amenities": [
          "ELECTRICITY",
          "WATER",
          "WIFI",
          "TOILET",
          "SHOWER",
          "PARKING",
          "HEATING",
          "AIR_CONDITIONING",
          "KITCHEN",
          "BBQ",
          "FIRE_PIT",
          "PET_FRIENDLY",
          "SECURITY",
          "FIRST_AID",
          "PLAYGROUND"
        ],
        "basePrice": 120000.0,
        "latitude": 37.5524,
        "longitude": 126.8999,
        "status": "AVAILABLE",
        "campgroundId": 1
      }
    ],
    "pageNumber": 0,
    "pageSize": 50,
    "totalElements": 4,
    "totalPages": 1,
    "isLast": true
  },
  "timestamp": "2025-11-09T03:30:00"
}
```

**TypeScript 타입:**

```typescript
type SiteListResponse = ApiResponse<
  PageResponse<{
    id: number;
    siteNumber: string; // "SITE-1"
    siteType: SiteType; // "CARAVAN" | "GLAMP" | "CABIN"
    capacity: number; // 수용 인원
    description: string;
    amenities: Amenity[]; // 편의시설 배열 (중요!)
    basePrice: number; // 기본 가격 (원)
    latitude: number;
    longitude: number;
    status: SiteStatus; // "AVAILABLE" | "UNAVAILABLE" | "MAINTENANCE"
    campgroundId: number;
  }>
>;

type Amenity =
  | "ELECTRICITY" // 전기
  | "WATER" // 수도
  | "WIFI" // 와이파이
  | "TOILET" // 화장실
  | "SHOWER" // 샤워실
  | "PARKING" // 주차장
  | "HEATING" // 난방
  | "AIR_CONDITIONING" // 에어컨
  | "KITCHEN" // 취사시설
  | "BBQ" // 바비큐
  | "FIRE_PIT" // 화덕
  | "PET_FRIENDLY" // 반려동물 동반
  | "SECURITY" // 보안/안전시설
  | "FIRST_AID" // 구급시설
  | "PLAYGROUND"; // 놀이터

type SiteType = "CARAVAN" | "GLAMP" | "CABIN";
type SiteStatus = "AVAILABLE" | "UNAVAILABLE" | "MAINTENANCE";
```

---

### GET /v1/sites/{id}

사이트 상세 조회

**인증**: ❌ Public

**Path Parameters:**

- `id`: 사이트 ID (Long)

**Response:**

```json
{
  "success": true,
  "message": "사이트 조회 성공",
  "data": {
    "id": 1,
    "siteNumber": "SITE-1",
    "siteType": "CARAVAN",
    "capacity": 4,
    "description": "한강뷰 카라반 사이트. 한강의 아름다운 야경을 감상할 수 있습니다.",
    "amenities": [
      "ELECTRICITY",
      "WATER",
      "WIFI",
      "TOILET",
      "SHOWER",
      "PARKING"
    ],
    "basePrice": 50000.0,
    "latitude": 37.5523,
    "longitude": 126.8998,
    "status": "AVAILABLE",
    "campgroundId": 1,
    "createdAt": "2025-10-30T21:08:37.435561",
    "updatedAt": "2025-11-03T04:59:05.293296"
  }
}
```

---

### POST /v1/sites

사이트 생성

**인증**: ✅ @OwnerOrAdmin (캠핑장 소유자 또는 관리자만)

**Request Body:**

```json
{
  "campgroundId": 1,
  "siteNumber": "SITE-10",
  "siteType": "CARAVAN",
  "capacity": 4,
  "description": "사이트 설명 (최소 10자)",
  "amenities": ["ELECTRICITY", "WATER", "WIFI", "PARKING"],
  "basePrice": 60000.0,
  "latitude": 37.5525,
  "longitude": 126.9
}
```

**Response:**

```json
{
  "success": true,
  "message": "사이트 생성 성공",
  "data": {
    "id": 10,
    "siteNumber": "SITE-10"
    // ... 생성된 사이트 정보
  }
}
```

---

### PUT /v1/sites/{id}

사이트 수정

**인증**: ✅ @OwnerOrAdmin (본인 캠핑장 사이트 또는 관리자만)

**Path Parameters:**

- `id`: 사이트 ID

**Request Body:**

```json
{
  "siteNumber": "SITE-10-UPDATED",
  "siteType": "GLAMP",
  "capacity": 6,
  "description": "업데이트된 설명",
  "amenities": ["ELECTRICITY", "WATER", "WIFI", "HEATING", "AIR_CONDITIONING"],
  "basePrice": 80000.0
}
```

---

### DELETE /v1/sites/{id}

사이트 삭제

**인증**: ✅ @OwnerOrAdmin (본인 캠핑장 사이트 또는 관리자만)

**Path Parameters:**

- `id`: 사이트 ID

**Response:**

```json
{
  "success": true,
  "message": "사이트 삭제 성공",
  "data": null
}
```

---

## Campground vs Site 차이점

| 필드           | Campground     | Site           |
| -------------- | -------------- | -------------- |
| **amenities**  | ❌ 없음        | ✅ 있음        |
| **가격**       | ❌ 없음        | ✅ basePrice   |
| **수용인원**   | ❌ 없음        | ✅ capacity    |
| **사이트타입** | ❌ 없음        | ✅ siteType    |
| **위치정보**   | ✅ 캠핑장 전체 | ✅ 개별 사이트 |

**중요:**

- **Campground**: 캠핑장의 메타 정보 (이름, 주소, 사업자 정보, 이미지, 평점 등)
- **Site**: 예약 가능한 실제 구역 (편의시설, 가격, 수용인원 포함)

---

## 프론트엔드 사용 예시

### 캠핑장 상세 페이지에서 사이트 정보 가져오기

```typescript
// hooks/useSites.ts
export function useSitesByCampground(campgroundId: number) {
  return useQuery({
    queryKey: ["sites", "by-campground", campgroundId],
    queryFn: () => siteApi.getByCampground(campgroundId),
    enabled: !!campgroundId,
  });
}

// lib/api/sites.ts
export const siteApi = {
  getByCampground: (
    campgroundId: number,
    params?: { page?: number; size?: number }
  ) =>
    get<SiteListResponse>(`/v1/sites/by-campground/${campgroundId}`, {
      params,
    }),

  getById: (id: number) => get<SiteResponse>(`/v1/sites/${id}`),
};
```

### 캠핑장 상세 페이지에서 amenities 표시

```tsx
// app/campgrounds/[id]/page.tsx
export default function CampgroundDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const campgroundId = parseInt(params.id);
  const { data: campgroundData } = useCampgroundDetail(campgroundId);
  const { data: sitesData } = useSitesByCampground(campgroundId);

  // 모든 사이트의 amenities를 통합
  const allAmenities = useMemo(() => {
    if (!sitesData?.data?.content) return [];

    const amenitiesSet = new Set<Amenity>();
    sitesData.data.content.forEach((site) => {
      site.amenities.forEach((amenity) => amenitiesSet.add(amenity));
    });

    return Array.from(amenitiesSet);
  }, [sitesData]);

  // 한글 매핑
  const amenityLabels: Record<Amenity, string> = {
    ELECTRICITY: "전기",
    WATER: "수도",
    WIFI: "와이파이",
    TOILET: "화장실",
    SHOWER: "샤워실",
    PARKING: "주차",
    HEATING: "난방",
    AIR_CONDITIONING: "에어컨",
    KITCHEN: "취사시설",
    BBQ: "바비큐",
    FIRE_PIT: "화덕",
    PET_FRIENDLY: "반려동물",
    SECURITY: "보안",
    FIRST_AID: "구급",
    PLAYGROUND: "놀이터",
  };

  return (
    <div>
      <h1>{campgroundData?.data.name}</h1>

      {/* 편의시설 표시 */}
      <div className="facilities">
        {allAmenities.map((amenity) => (
          <span key={amenity}>{amenityLabels[amenity]}</span>
        ))}
      </div>

      {/* 사이트 목록 */}
      <div className="sites">
        {sitesData?.data.content.map((site) => (
          <SiteCard key={site.id} site={site} />
        ))}
      </div>
    </div>
  );
}
```

---

## 주의사항

❗ **amenities는 Site에만 존재**

- Campground API 응답에는 amenities 필드가 없습니다
- 편의시설 정보가 필요하면 반드시 Sites API를 호출해야 합니다

❗ **사이트 타입별 amenities 차이**

- `CARAVAN`: 기본 편의시설 (전기, 수도, 주차 등)
- `GLAMP`: 고급 편의시설 (난방, 에어컨, 취사시설 등 추가)
- `CABIN`: 완비된 편의시설 (모든 amenities 포함 가능)

❗ **가격은 basePrice**

- 기본 요금만 제공됩니다
- 주말/성수기/비수기 가격은 별도 로직 필요

❗ **권한 체크**

- 생성/수정/삭제는 `@OwnerOrAdmin` 필요
- 본인 캠핑장의 사이트 또는 관리자만 수정 가능
