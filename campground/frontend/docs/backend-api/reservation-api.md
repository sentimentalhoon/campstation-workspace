# 예약 API

## 기본 정보

- Base Path: `/api/v1/reservations`
- 인증: 회원 예약은 `@Authenticated`, 비회원 예약은 Public
- 예약 상태: PENDING → CONFIRMED → COMPLETED / CANCELLED

---

## 엔드포인트 목록

### POST /v1/reservations

회원 예약 생성

**인증**: ✅ @Authenticated (로그인 필수)

**Request Body:**

```json
{
  "campgroundId": 1,
  "siteId": 2,
  "checkInDate": "2025-12-20",
  "checkOutDate": "2025-12-22",
  "numberOfGuests": 4,
  "specialRequests": "늦은 체크인 가능한가요?",
  "paymentMethod": "CARD",
  "depositorName": null
}
```

**Validation:**

- `campgroundId`: Required, 존재하는 캠핑장 ID
- `siteId`: Required, 존재하는 사이트 ID
- `checkInDate`: Required, 오늘 이후 날짜
- `checkOutDate`: Required, checkInDate 이후 날짜
- `numberOfGuests`: Required, 1-20명
- `specialRequests`: Optional, 최대 1000자
- `paymentMethod`: Required, "CARD" | "BANK_TRANSFER" | "KAKAO_PAY"
- `depositorName`: paymentMethod가 "BANK_TRANSFER"인 경우만 필수

**Response (201 Created):**

```json
{
  "success": true,
  "message": "예약 생성 성공",
  "data": {
    "id": 123,
    "userId": 5,
    "userName": "홍길동",
    "campgroundId": 1,
    "campgroundName": "캠핑앤글램핑 망원한강공원",
    "siteId": 2,
    "siteNumber": "SITE-2",
    "checkInDate": "2025-12-20",
    "checkOutDate": "2025-12-22",
    "numberOfGuests": 4,
    "numberOfNights": 2,
    "totalAmount": 240000.0,
    "status": "PENDING",
    "specialRequests": "늦은 체크인 가능한가요?",
    "payment": {
      "id": 456,
      "method": "CARD",
      "amount": 240000.0,
      "status": "PENDING"
    },
    "createdAt": "2025-11-09T12:00:00",
    "updatedAt": "2025-11-09T12:00:00"
  }
}
```

**TypeScript 타입:**

```typescript
type CreateReservationRequest = {
  campgroundId: number;
  siteId: number;
  checkInDate: string; // "YYYY-MM-DD" 형식
  checkOutDate: string;
  numberOfGuests: number; // 1-20
  specialRequests?: string; // 최대 1000자
  paymentMethod: PaymentMethod;
  depositorName?: string; // BANK_TRANSFER 시 필수
};

type PaymentMethod = "CARD" | "BANK_TRANSFER" | "KAKAO_PAY";

type ReservationResponse = ApiResponse<{
  id: number;
  userId: number;
  userName: string;
  campgroundId: number;
  campgroundName: string;
  siteId: number;
  siteNumber: string;
  checkInDate: string; // "2025-12-20"
  checkOutDate: string;
  numberOfGuests: number;
  numberOfNights: number; // 자동 계산 (checkOut - checkIn)
  totalAmount: number; // basePrice * numberOfNights
  status: ReservationStatus;
  specialRequests: string | null;
  payment: {
    id: number;
    method: PaymentMethod;
    amount: number;
    status: PaymentStatus;
  };
  createdAt: string;
  updatedAt: string;
}>;

type ReservationStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
```

---

### GET /v1/reservations/{reservationId}

예약 상세 조회

**인증**: ✅ @Authenticated (본인 예약만 조회 가능)

**Path Parameters:**

- `reservationId`: 예약 ID (Long)

**Response:**

```json
{
  "success": true,
  "message": "예약 조회 성공",
  "data": {
    "id": 123,
    "userId": 5,
    "userName": "홍길동",
    "campgroundId": 1,
    "campgroundName": "캠핑앤글램핑 망원한강공원",
    "siteId": 2,
    "siteNumber": "SITE-2",
    "checkInDate": "2025-12-20",
    "checkOutDate": "2025-12-22",
    "numberOfGuests": 4,
    "numberOfNights": 2,
    "totalAmount": 240000.0,
    "status": "CONFIRMED",
    "specialRequests": "늦은 체크인 가능한가요?",
    "payment": {
      "id": 456,
      "method": "CARD",
      "amount": 240000.0,
      "status": "COMPLETED"
    },
    "createdAt": "2025-11-09T12:00:00",
    "updatedAt": "2025-11-09T13:00:00"
  }
}
```

**에러 응답 (403 Forbidden):**

```json
{
  "success": false,
  "message": "본인의 예약만 조회할 수 있습니다.",
  "data": null
}
```

---

### GET /v1/reservations/my

내 예약 목록 조회 (페이지네이션)

**인증**: ✅ @Authenticated

**Query Parameters:**

```typescript
{
  page?: number;    // 기본값: 0
  size?: number;    // 기본값: 10
  sort?: string;    // 예: "checkInDate,desc"
}
```

**Response:**

```json
{
  "success": true,
  "message": "예약 목록 조회가 완료되었습니다.",
  "data": {
    "content": [
      {
        "id": 123,
        "campgroundId": 1,
        "campgroundName": "캠핑앤글램핑 망원한강공원",
        "siteNumber": "SITE-2",
        "checkInDate": "2025-12-20",
        "checkOutDate": "2025-12-22",
        "numberOfGuests": 4,
        "totalAmount": 240000.0,
        "status": "CONFIRMED"
      },
      {
        "id": 120,
        "campgroundId": 3,
        "campgroundName": "여의도 한강공원 캠핑장",
        "siteNumber": "SITE-5",
        "checkInDate": "2025-11-15",
        "checkOutDate": "2025-11-16",
        "numberOfGuests": 2,
        "totalAmount": 80000.0,
        "status": "COMPLETED"
      }
    ],
    "pageNumber": 0,
    "pageSize": 10,
    "totalElements": 15,
    "totalPages": 2,
    "isLast": false
  }
}
```

---

### PUT /v1/reservations/{reservationId}

예약 수정

**인증**: ✅ @Authenticated (본인 예약만 수정 가능)

**Path Parameters:**

- `reservationId`: 예약 ID

**Request Body:**

```json
{
  "checkInDate": "2025-12-21",
  "checkOutDate": "2025-12-23",
  "numberOfGuests": 5,
  "specialRequests": "수정된 요청사항"
}
```

**주의사항:**

- 체크인 3일 전까지만 수정 가능
- status가 "PENDING" 또는 "CONFIRMED"인 경우만 수정 가능
- siteId, campgroundId 변경 불가

---

### DELETE /v1/reservations/{reservationId}

예약 취소

**인증**: ✅ @Authenticated (본인 예약만 취소 가능)

**Path Parameters:**

- `reservationId`: 예약 ID

**Response (204 No Content):**

```
(Empty body)
```

**취소 정책:**

- 체크인 7일 전: 100% 환불
- 체크인 3일 전: 50% 환불
- 체크인 3일 이내: 환불 불가

---

### DELETE /v1/reservations/{reservationId}/soft-delete

예약 삭제 (내역 숨김)

**인증**: ✅ @Authenticated

**설명**: 예약을 DB에서 삭제하지 않고 사용자에게 보이지 않도록 숨김 처리

**Response (204 No Content):**

```
(Empty body)
```

---

### POST /v1/reservations/guest

비회원 예약 생성

**인증**: ❌ Public

**Request Body:**

```json
{
  "campgroundId": 1,
  "siteId": 2,
  "checkInDate": "2025-12-20",
  "checkOutDate": "2025-12-22",
  "numberOfGuests": 4,
  "specialRequests": "늦은 체크인 가능한가요?",
  "guestName": "김철수",
  "guestPhone": "010-1234-5678",
  "guestEmail": "guest@example.com",
  "guestPassword": "guest1234",
  "paymentMethod": "CARD"
}
```

**Validation:**

- 회원 예약과 동일한 필드 + 비회원 정보 추가
- `guestName`: Required, 1-50자
- `guestPhone`: Required, "010-1234-5678" 형식
- `guestEmail`: Required, 유효한 이메일
- `guestPassword`: Required, 예약 조회 시 사용 (4자 이상)

**Response (201 Created):**

```json
{
  "success": true,
  "message": "비회원 예약이 성공적으로 생성되었습니다.",
  "data": {
    "id": 124,
    "userId": null,
    "userName": "김철수",
    "campgroundId": 1,
    "campgroundName": "캠핑앤글램핑 망원한강공원",
    "siteId": 2,
    "siteNumber": "SITE-2",
    "checkInDate": "2025-12-20",
    "checkOutDate": "2025-12-22",
    "numberOfGuests": 4,
    "numberOfNights": 2,
    "totalAmount": 240000.0,
    "status": "PENDING",
    "payment": {
      "id": 457,
      "method": "CARD",
      "amount": 240000.0,
      "status": "PENDING"
    },
    "createdAt": "2025-11-09T12:00:00"
  }
}
```

---

### POST /v1/reservations/guest/lookup

비회원 예약 조회

**인증**: ❌ Public

**Request Body:**

```json
{
  "guestPhone": "010-1234-5678",
  "guestEmail": "guest@example.com",
  "guestPassword": "guest1234"
}
```

**Response:**

```json
{
  "success": true,
  "message": "비회원 예약 조회가 완료되었습니다.",
  "data": [
    {
      "id": 124,
      "userName": "김철수",
      "campgroundName": "캠핑앤글램핑 망원한강공원",
      "siteNumber": "SITE-2",
      "checkInDate": "2025-12-20",
      "checkOutDate": "2025-12-22",
      "numberOfGuests": 4,
      "totalAmount": 240000.0,
      "status": "CONFIRMED"
    }
  ]
}
```

**에러 응답 (404 Not Found):**

```json
{
  "success": false,
  "message": "일치하는 예약을 찾을 수 없습니다.",
  "data": null
}
```

---

### GET /v1/reservations/sites/{siteId}/reserved-dates

사이트 예약 날짜 조회

**인증**: ❌ Public

**Path Parameters:**

- `siteId`: 사이트 ID

**Response:**

```json
{
  "success": true,
  "message": "예약된 날짜 조회가 완료되었습니다.",
  "data": [
    {
      "startDate": "2025-11-15",
      "endDate": "2025-11-17"
    },
    {
      "startDate": "2025-11-20",
      "endDate": "2025-11-22"
    },
    {
      "startDate": "2025-12-24",
      "endDate": "2025-12-26"
    }
  ]
}
```

**TypeScript 타입:**

```typescript
type ReservedDateRange = {
  startDate: string; // "YYYY-MM-DD" (checkInDate)
  endDate: string; // "YYYY-MM-DD" (checkOutDate)
};

type ReservedDatesResponse = ApiResponse<ReservedDateRange[]>;
```

---

### GET /v1/reservations/campgrounds/{campgroundId}/reserved-dates

캠핑장 전체 사이트 예약 날짜 일괄 조회

**인증**: ❌ Public

**Path Parameters:**

- `campgroundId`: 캠핑장 ID

**Response:**

```json
{
  "success": true,
  "message": "캠핑장 예약 날짜 조회가 완료되었습니다.",
  "data": {
    "1": [{ "startDate": "2025-11-15", "endDate": "2025-11-17" }],
    "2": [
      { "startDate": "2025-12-20", "endDate": "2025-12-22" },
      { "startDate": "2025-12-25", "endDate": "2025-12-27" }
    ],
    "3": [{ "startDate": "2025-11-10", "endDate": "2025-11-12" }]
  }
}
```

**TypeScript 타입:**

```typescript
type CampgroundReservedDatesResponse = ApiResponse<{
  [siteId: string]: ReservedDateRange[];
}>;
```

---

## 프론트엔드 사용 예시

### 예약 생성 (회원)

```typescript
// hooks/useReservation.ts
export function useCreateReservation() {
  return useMutation({
    mutationFn: reservationApi.create,
    onSuccess: (data) => {
      toast.success("예약이 완료되었습니다!");
      router.push(`/reservations/${data.data.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

// lib/api/reservations.ts
export const reservationApi = {
  create: (data: CreateReservationRequest) =>
    post<ReservationResponse>("/v1/reservations", data),

  getById: (id: number) => get<ReservationResponse>(`/v1/reservations/${id}`),

  getMyReservations: (params?: { page?: number; size?: number }) =>
    get<ReservationListResponse>("/v1/reservations/my", { params }),

  update: (id: number, data: UpdateReservationRequest) =>
    put<ReservationResponse>(`/v1/reservations/${id}`, data),

  cancel: (id: number) => del(`/v1/reservations/${id}`),

  // 비회원
  createGuest: (data: GuestReservationRequest) =>
    post<ReservationResponse>("/v1/reservations/guest", data),

  lookupGuest: (data: GuestReservationLookupRequest) =>
    post<GuestReservationListResponse>("/v1/reservations/guest/lookup", data),

  // 캘린더용
  getReservedDates: (siteId: number) =>
    get<ReservedDatesResponse>(
      `/v1/reservations/sites/${siteId}/reserved-dates`
    ),

  getReservedDatesByCampground: (campgroundId: number) =>
    get<CampgroundReservedDatesResponse>(
      `/v1/reservations/campgrounds/${campgroundId}/reserved-dates`
    ),
};
```

### 예약 가능 날짜 체크

```tsx
// components/reservation/Calendar.tsx
export function ReservationCalendar({ siteId }: { siteId: number }) {
  const { data: reservedDates } = useQuery({
    queryKey: ["reserved-dates", siteId],
    queryFn: () => reservationApi.getReservedDates(siteId),
  });

  const isDateReserved = (date: Date) => {
    if (!reservedDates?.data) return false;

    return reservedDates.data.some((range) => {
      const start = new Date(range.startDate);
      const end = new Date(range.endDate);
      return date >= start && date <= end;
    });
  };

  return (
    <Calendar
      disabled={(date) => isDateReserved(date) || isPast(date)}
      // ...
    />
  );
}
```

---

## 주의사항

❗ **회원 vs 비회원 예약**

- 회원: `/v1/reservations` (인증 필요)
- 비회원: `/v1/reservations/guest` (Public)
- 비회원 예약 조회는 전화번호+이메일+비밀번호 필요

❗ **예약 수정 제한**

- 체크인 3일 전까지만 수정 가능
- status가 "PENDING" 또는 "CONFIRMED"만 수정 가능
- siteId, campgroundId 변경 불가

❗ **예약 취소 환불 정책**

- 체크인 7일 전: 100% 환불
- 체크인 3일 전: 50% 환불
- 체크인 3일 이내: 환불 불가

❗ **예약 날짜 형식**

- `checkInDate`, `checkOutDate`: "YYYY-MM-DD" 형식 (LocalDate)
- `createdAt`, `updatedAt`: ISO 8601 형식 (LocalDateTime)

❗ **numberOfNights 자동 계산**

- `numberOfNights = checkOutDate - checkInDate`
- `totalAmount = site.basePrice * numberOfNights`

❗ **결제 방법**

- `CARD`: 카드 결제 (토스페이먼츠 연동)
- `KAKAO_PAY`: 카카오페이 (토스페이먼츠 연동)
- `BANK_TRANSFER`: 계좌이체 (depositorName 필수)
