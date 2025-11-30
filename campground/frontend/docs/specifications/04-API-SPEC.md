# Backend API 명세

> CampStation Backend API 스펙 (프론트엔드 연동용)

## 🔗 Base URL

```
개발: http://localhost:8080/api
프로덕션: http://mycamp.duckdns.org/api
```

## 🔐 인증 (Authentication)

모든 인증이 필요한 API는 Header에 토큰 포함:

```
Authorization: Bearer {accessToken}
```

---

## 📡 API 엔드포인트

### 1. 인증 (Auth)

#### 1.1 회원가입

```http
POST /v1/auth/register
```

**Request Body**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "passwordConfirm": "password123",
  "name": "홍길동",
  "phone": "01012345678"
}
```

**Response** (201 Created)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "홍길동",
      "phone": "01012345678",
      "role": "USER",
      "createdAt": "2025-11-09T10:00:00Z"
    }
  }
}
```

---

#### 1.2 로그인

```http
POST /v1/auth/login
```

**Request Body**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (200 OK)

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "홍길동",
      "role": "USER"
    }
  }
}
```

---

#### 1.3 로그아웃

```http
POST /v1/auth/logout
Authorization: Bearer {token}
```

**Response** (200 OK)

```json
{
  "success": true,
  "message": "로그아웃되었습니다"
}
```

---

#### 1.4 토큰 갱신

```http
POST /v1/auth/refresh
```

**Request Body**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK)

```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token",
    "expiresIn": 3600
  }
}
```

---

#### 1.5 현재 사용자 정보

```http
GET /v1/auth/me
Authorization: Bearer {token}
```

**Response** (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "홍길동",
    "phone": "01012345678",
    "role": "USER",
    "createdAt": "2025-11-09T10:00:00Z"
  }
}
```

---

#### 1.6 소셜 로그인 (계획)

```http
POST /v1/auth/social/{provider}
```

Provider: `kakao` | `naver` | `google` | `facebook`

**Request Body**

```json
{
  "code": "authorization_code",
  "redirectUri": "http://mycamp.duckdns.org/auth/callback/kakao"
}
```

---

### 2. 캠핑장 (Campgrounds)

#### 2.1 캠핑장 목록 조회

```http
GET /v1/campgrounds
```

**Query Parameters**

```
search?: string          // 검색 키워드
region?: string         // 지역 필터
minPrice?: number       // 최소 가격
maxPrice?: number       // 최대 가격
facilities?: string[]   // 편의시설 필터 (comma-separated)
theme?: string          // 테마 (오토캠핑, 글램핑 등)
sort?: string           // 정렬 (popular, price_asc, price_desc, rating)
page?: number           // 페이지 번호 (기본: 1)
size?: number           // 페이지 크기 (기본: 10)
```

**Response** (200 OK)

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "name": "제주 오름 캠핑장",
        "address": "제주특별자치도 제주시 ...",
        "region": "제주",
        "thumbnail": "https://image.url/thumbnail.jpg",
        "basePrice": 50000,
        "rating": 4.5,
        "reviewCount": 128,
        "facilities": ["화장실", "샤워실", "전기"],
        "theme": "오토캠핑"
      }
    ],
    "page": 1,
    "size": 10,
    "totalElements": 45,
    "totalPages": 5,
    "first": true,
    "last": false
  }
}
```

---

#### 2.2 캠핑장 상세 조회

```http
GET /v1/campgrounds/{id}
```

**Response** (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "제주 오름 캠핑장",
    "description": "제주의 아름다운 자연 속에서...",
    "images": ["https://image.url/1.jpg", "https://image.url/2.jpg"],
    "address": "제주특별자치도 제주시 한림읍 ...",
    "region": "제주",
    "coordinates": {
      "latitude": 33.3846,
      "longitude": 126.5535
    },
    "contact": {
      "phone": "064-123-4567",
      "email": "jeju@campstation.com"
    },
    "checkIn": "14:00",
    "checkOut": "11:00",
    "facilities": ["화장실", "샤워실", "전기", "와이파이"],
    "theme": "오토캠핑",
    "basePrice": 50000,
    "rating": 4.5,
    "reviewCount": 128,
    "sites": [
      {
        "id": 1,
        "name": "A-01",
        "type": "일반",
        "price": 50000,
        "maxCapacity": 4,
        "available": true
      }
    ]
  }
}
```

---

#### 2.3 캠핑 사이트 예약 가능 여부

```http
GET /v1/campgrounds/{id}/sites
```

**Query Parameters**

```
checkIn: string     // YYYY-MM-DD
checkOut: string    // YYYY-MM-DD
```

**Response** (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "A-01",
      "type": "일반",
      "price": 50000,
      "maxCapacity": 4,
      "available": true
    },
    {
      "id": 2,
      "name": "A-02",
      "type": "일반",
      "price": 50000,
      "maxCapacity": 4,
      "available": false
    }
  ]
}
```

---

### 3. 예약 (Reservations)

#### 3.1 예약 생성

```http
POST /v1/reservations
Authorization: Bearer {token}
```

**Request Body**

```json
{
  "campgroundId": 1,
  "siteId": 1,
  "checkIn": "2025-12-01",
  "checkOut": "2025-12-03",
  "guests": {
    "adults": 2,
    "children": 1
  },
  "specialRequests": "조용한 곳으로 부탁드립니다"
}
```

**Response** (201 Created)

```json
{
  "success": true,
  "data": {
    "id": 123,
    "reservationNumber": "RSV-20251109-123",
    "status": "PENDING",
    "campground": {
      "id": 1,
      "name": "제주 오름 캠핑장"
    },
    "site": {
      "id": 1,
      "name": "A-01"
    },
    "checkIn": "2025-12-01",
    "checkOut": "2025-12-03",
    "nights": 2,
    "guests": {
      "adults": 2,
      "children": 1
    },
    "totalAmount": 100000,
    "createdAt": "2025-11-09T10:00:00Z"
  }
}
```

---

#### 3.2 예약 목록 조회

```http
GET /v1/reservations
Authorization: Bearer {token}
```

**Query Parameters**

```
status?: string  // PENDING, CONFIRMED, COMPLETED, CANCELLED
page?: number
size?: number
```

**Response** (200 OK)

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 123,
        "reservationNumber": "RSV-20251109-123",
        "status": "CONFIRMED",
        "campground": {
          "id": 1,
          "name": "제주 오름 캠핑장",
          "thumbnail": "https://image.url/thumbnail.jpg"
        },
        "checkIn": "2025-12-01",
        "checkOut": "2025-12-03",
        "totalAmount": 100000
      }
    ],
    "page": 1,
    "totalPages": 3
  }
}
```

---

#### 3.3 예약 상세 조회

```http
GET /v1/reservations/{id}
Authorization: Bearer {token}
```

**Response** (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 123,
    "reservationNumber": "RSV-20251109-123",
    "status": "CONFIRMED",
    "qrCode": "data:image/png;base64,iVBORw0KGg...",
    "campground": {
      "id": 1,
      "name": "제주 오름 캠핑장",
      "address": "제주특별자치도 ...",
      "phone": "064-123-4567",
      "thumbnail": "https://image.url/thumbnail.jpg"
    },
    "site": {
      "id": 1,
      "name": "A-01",
      "type": "일반"
    },
    "checkIn": "2025-12-01",
    "checkOut": "2025-12-03",
    "nights": 2,
    "guests": {
      "adults": 2,
      "children": 1
    },
    "specialRequests": "조용한 곳으로 부탁드립니다",
    "payment": {
      "id": 456,
      "amount": 100000,
      "method": "카드",
      "paidAt": "2025-11-09T10:05:00Z"
    },
    "createdAt": "2025-11-09T10:00:00Z"
  }
}
```

---

#### 3.4 예약 취소

```http
POST /v1/reservations/{id}/cancel
Authorization: Bearer {token}
```

**Request Body**

```json
{
  "reason": "일정 변경"
}
```

**Response** (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 123,
    "status": "CANCELLED",
    "refundAmount": 80000,
    "cancelledAt": "2025-11-09T11:00:00Z"
  }
}
```

---

#### 3.5 비회원 예약 조회

```http
POST /v1/reservations/guest
```

**Request Body**

```json
{
  "reservationNumber": "RSV-20251109-123",
  "email": "user@example.com"
}
```

---

### 4. 결제 (Payments)

#### 4.1 결제 처리

```http
POST /v1/payments
Authorization: Bearer {token}
```

**Request Body**

```json
{
  "reservationId": 123,
  "paymentKey": "toss_payment_key",
  "amount": 100000,
  "orderId": "order_123"
}
```

**Response** (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 456,
    "paymentKey": "toss_payment_key",
    "orderId": "order_123",
    "amount": 100000,
    "method": "카드",
    "status": "DONE",
    "paidAt": "2025-11-09T10:05:00Z"
  }
}
```

---

#### 4.2 결제 검증

```http
POST /v1/payments/{id}/verify
Authorization: Bearer {token}
```

**Response** (200 OK)

```json
{
  "success": true,
  "data": {
    "verified": true,
    "paymentStatus": "DONE"
  }
}
```

---

### 5. 리뷰 (Reviews)

#### 5.1 리뷰 목록 조회

```http
GET /v1/campgrounds/{campgroundId}/reviews
```

**Query Parameters**

```
sort?: string  // recent, rating_high, rating_low
page?: number
size?: number
```

**Response** (200 OK)

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "user": {
          "id": 1,
          "name": "홍길동"
        },
        "rating": 5,
        "content": "정말 좋은 캠핑장이에요!",
        "images": ["https://image.url/review1.jpg"],
        "createdAt": "2025-11-08T10:00:00Z"
      }
    ],
    "averageRating": 4.5,
    "totalCount": 128
  }
}
```

---

#### 5.2 리뷰 작성

```http
POST /v1/campgrounds/{campgroundId}/reviews
Authorization: Bearer {token}
```

**Request Body**

```json
{
  "reservationId": 123,
  "rating": 5,
  "content": "정말 좋은 캠핑장이에요!",
  "images": ["base64_encoded_image"]
}
```

---

#### 5.3 리뷰 수정

```http
PUT /v1/reviews/{id}
Authorization: Bearer {token}
```

---

#### 5.4 리뷰 삭제

```http
DELETE /v1/reviews/{id}
Authorization: Bearer {token}
```

---

## 🚨 에러 응답

모든 에러는 다음 형식을 따릅니다:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지",
    "details": {} // 선택적
  }
}
```

### 주요 에러 코드

| HTTP Status | Error Code     | 설명                      |
| ----------- | -------------- | ------------------------- |
| 400         | INVALID_INPUT  | 잘못된 입력 값            |
| 401         | UNAUTHORIZED   | 인증 필요                 |
| 403         | FORBIDDEN      | 권한 없음                 |
| 404         | NOT_FOUND      | 리소스 없음               |
| 409         | CONFLICT       | 중복된 리소스 (이메일 등) |
| 500         | INTERNAL_ERROR | 서버 오류                 |

### 예시

```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "이메일 형식이 올바르지 않습니다",
    "details": {
      "field": "email",
      "value": "invalid-email"
    }
  }
}
```

---

## 📝 참고사항

### 페이지네이션

- 기본 page: 1
- 기본 size: 10
- 최대 size: 100

### 날짜 형식

- ISO 8601: `YYYY-MM-DDTHH:mm:ssZ`
- 날짜만: `YYYY-MM-DD`

### 이미지 업로드

- Base64 인코딩 또는 Multipart Form Data
- 최대 크기: 5MB per file
- 지원 형식: JPG, PNG, WebP

---

**마지막 업데이트**: 2025-11-09  
**API Version**: v1
