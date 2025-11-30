# 리뷰 API

## 기본 정보

- Base Path: `/api/v1/reviews`
- 인증: 조회는 Public, 생성/수정/삭제는 `@Authenticated`
- 평점: 1-5점 (소수점 가능)

---

## 엔드포인트 목록

### POST /v1/reviews

리뷰 생성

**인증**: ✅ @Authenticated (예약 완료한 사용자만)

**Request Body:**

```json
{
  "campgroundId": 1,
  "reservationId": 123,
  "rating": 5,
  "comment": "정말 좋았습니다! 한강뷰가 환상적이에요.",
  "imageUrls": ["reviews/image1.jpg", "reviews/image2.jpg"]
}
```

**Validation:**

- `campgroundId`: Required
- `reservationId`: Required, 본인의 완료된 예약만 가능
- `rating`: Required, 1-5
- `comment`: Required, 10-1000자
- `imageUrls`: Optional, 최대 5개

**Response (201 Created):**

```json
{
  "success": true,
  "message": "리뷰 작성 성공",
  "data": {
    "id": 456,
    "campgroundId": 1,
    "campgroundName": "캠핑앤글램핑 망원한강공원",
    "userId": 5,
    "userName": "홍길동",
    "rating": 5,
    "comment": "정말 좋았습니다! 한강뷰가 환상적이에요.",
    "imageUrls": ["reviews/image1.jpg", "reviews/image2.jpg"],
    "likeCount": 0,
    "createdAt": "2025-11-09T12:00:00",
    "updatedAt": "2025-11-09T12:00:00"
  }
}
```

**TypeScript 타입:**

```typescript
type CreateReviewRequest = {
  campgroundId: number;
  reservationId: number;
  rating: number; // 1-5
  comment: string; // 10-1000자
  imageUrls?: string[]; // 최대 5개
};

type ReviewResponse = ApiResponse<{
  id: number;
  campgroundId: number;
  campgroundName: string;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  imageUrls: string[];
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}>;
```

---

### GET /v1/reviews/{reviewId}

리뷰 상세 조회

**인증**: ❌ Public

**Response:**

```json
{
  "success": true,
  "message": "리뷰 조회 성공",
  "data": {
    "id": 456,
    "campgroundId": 1,
    "campgroundName": "캠핑앤글램핑 망원한강공원",
    "userId": 5,
    "userName": "홍길동",
    "rating": 5,
    "comment": "정말 좋았습니다!",
    "imageUrls": ["reviews/image1.jpg"],
    "likeCount": 12,
    "createdAt": "2025-11-09T12:00:00",
    "updatedAt": "2025-11-09T12:00:00"
  }
}
```

---

### GET /v1/reviews/campground/{campgroundId}

캠핑장 리뷰 목록 조회 (페이지네이션)

**인증**: ❌ Public

**Query Parameters:**

```typescript
{
  page?: number;        // 기본값: 0
  size?: number;        // 기본값: 20
  sort?: string;        // 예: "createdAt,desc" | "rating,desc" | "likeCount,desc"
  minRating?: number;   // 최소 평점 필터 (1-5)
}
```

**Response:**

```json
{
  "success": true,
  "message": "캠핑장 리뷰 목록 조회 성공",
  "data": {
    "content": [
      {
        "id": 456,
        "userId": 5,
        "userName": "홍길동",
        "rating": 5,
        "comment": "정말 좋았습니다!",
        "imageUrls": ["reviews/image1.jpg"],
        "likeCount": 12,
        "createdAt": "2025-11-09T12:00:00"
      },
      {
        "id": 455,
        "userId": 3,
        "userName": "김철수",
        "rating": 4,
        "comment": "괜찮았어요",
        "imageUrls": [],
        "likeCount": 5,
        "createdAt": "2025-11-08T10:00:00"
      }
    ],
    "pageNumber": 0,
    "pageSize": 20,
    "totalElements": 150,
    "totalPages": 8,
    "isLast": false
  }
}
```

---

### GET /v1/reviews/my

내 리뷰 목록 조회

**인증**: ✅ @Authenticated

**Query Parameters:**

- `page`, `size`, `sort` (위와 동일)

**Response:**

```json
{
  "success": true,
  "message": "내 리뷰 목록 조회 성공",
  "data": {
    "content": [
      {
        "id": 456,
        "campgroundId": 1,
        "campgroundName": "캠핑앤글램핑 망원한강공원",
        "rating": 5,
        "comment": "정말 좋았습니다!",
        "imageUrls": ["reviews/image1.jpg"],
        "likeCount": 12,
        "createdAt": "2025-11-09T12:00:00"
      }
    ],
    "pageNumber": 0,
    "pageSize": 10,
    "totalElements": 5,
    "totalPages": 1,
    "isLast": true
  }
}
```

---

### GET /v1/reviews/campground/{campgroundId}/stats

캠핑장 리뷰 통계

**인증**: ❌ Public

**Response:**

```json
{
  "success": true,
  "message": "리뷰 통계 조회 성공",
  "data": {
    "averageRating": 4.6,
    "totalReviews": 150,
    "ratingDistribution": {
      "5": 80,
      "4": 50,
      "3": 15,
      "2": 4,
      "1": 1
    }
  }
}
```

**TypeScript 타입:**

```typescript
type ReviewStatsResponse = ApiResponse<{
  averageRating: number; // 평균 평점 (소수점 1자리)
  totalReviews: number; // 총 리뷰 수
  ratingDistribution: {
    // 평점별 리뷰 수
    "5": number;
    "4": number;
    "3": number;
    "2": number;
    "1": number;
  };
}>;
```

---

### PUT /v1/reviews/{reviewId}

리뷰 수정

**인증**: ✅ @Authenticated (본인 리뷰만 수정 가능)

**Request Body:**

```json
{
  "rating": 4,
  "comment": "수정된 리뷰입니다.",
  "imageUrls": ["reviews/new-image.jpg"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "리뷰 수정 성공",
  "data": {
    "id": 456,
    "rating": 4,
    "comment": "수정된 리뷰입니다.",
    "updatedAt": "2025-11-10T15:00:00"
    // ... 기타 필드
  }
}
```

---

### DELETE /v1/reviews/{reviewId}

리뷰 삭제

**인증**: ✅ @Authenticated (본인 리뷰만 삭제 가능)

**Response (204 No Content):**

```
(Empty body)
```

---

## 프론트엔드 사용 예시

```typescript
// hooks/useReview.ts
export function useCampgroundReviews(campgroundId: number) {
  return useInfiniteQuery({
    queryKey: ["reviews", "campground", campgroundId],
    queryFn: ({ pageParam = 0 }) =>
      reviewApi.getByCampground(campgroundId, { page: pageParam, size: 20 }),
    getNextPageParam: (lastPage) =>
      lastPage.data.isLast ? undefined : lastPage.data.pageNumber + 1,
  });
}

export function useReviewStats(campgroundId: number) {
  return useQuery({
    queryKey: ["reviews", "stats", campgroundId],
    queryFn: () => reviewApi.getStats(campgroundId),
  });
}

// lib/api/reviews.ts
export const reviewApi = {
  create: (data: CreateReviewRequest) =>
    post<ReviewResponse>("/v1/reviews", data),

  getById: (id: number) => get<ReviewResponse>(`/v1/reviews/${id}`),

  getByCampground: (
    campgroundId: number,
    params?: { page?: number; size?: number; sort?: string }
  ) =>
    get<ReviewListResponse>(`/v1/reviews/campground/${campgroundId}`, {
      params,
    }),

  getMy: (params?: { page?: number; size?: number }) =>
    get<ReviewListResponse>("/v1/reviews/my", { params }),

  getStats: (campgroundId: number) =>
    get<ReviewStatsResponse>(`/v1/reviews/campground/${campgroundId}/stats`),

  update: (id: number, data: UpdateReviewRequest) =>
    put<ReviewResponse>(`/v1/reviews/${id}`, data),

  delete: (id: number) => del(`/v1/reviews/${id}`),
};
```

### 리뷰 통계 표시

```tsx
// components/reviews/ReviewStats.tsx
export function ReviewStats({ campgroundId }: { campgroundId: number }) {
  const { data } = useReviewStats(campgroundId);
  const stats = data?.data;

  if (!stats) return null;

  return (
    <div className="review-stats">
      <div className="average">
        <span className="rating">{stats.averageRating.toFixed(1)}</span>
        <span className="total">({stats.totalReviews}개의 리뷰)</span>
      </div>

      <div className="distribution">
        {[5, 4, 3, 2, 1].map((rating) => (
          <div key={rating} className="bar">
            <span>{rating}점</span>
            <div className="progress">
              <div
                style={{
                  width: `${(stats.ratingDistribution[rating] / stats.totalReviews) * 100}%`,
                }}
              />
            </div>
            <span>{stats.ratingDistribution[rating]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 주의사항

❗ **리뷰 작성 조건**

- 예약 완료(COMPLETED) 상태여야 함
- 체크아웃 날짜 이후에만 작성 가능
- 한 예약당 하나의 리뷰만 작성 가능

❗ **리뷰 수정/삭제 권한**

- 본인이 작성한 리뷰만 수정/삭제 가능
- 관리자는 모든 리뷰 삭제 가능

❗ **평점 계산**

- averageRating은 모든 리뷰의 평균 (소수점 1자리)
- Campground의 rating 필드에 반영됨

❗ **이미지 업로드**

- 이미지는 별도 File API로 업로드 후 URL 받아서 사용
- 최대 5개 이미지 첨부 가능
- 권장 크기: 1200x800px

❗ **리뷰 정렬 옵션**

- `createdAt,desc`: 최신순 (기본값)
- `rating,desc`: 평점 높은순
- `likeCount,desc`: 좋아요 많은순
