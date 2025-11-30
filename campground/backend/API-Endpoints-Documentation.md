# CampStation Backend API 엔드포인트 문서

**작성일**: 2025-11-16
**API 버전**: v1
**Base URL**: `http://localhost:8080/api/v1`

---

## 📑 목차

1. [인증 (Authentication)](#1-인증-authentication)
2. [사용자 (User)](#2-사용자-user)
3. [캠핑장 (Campground)](#3-캠핑장-campground)
4. [예약 (Reservation)](#4-예약-reservation)
5. [결제 (Payment)](#5-결제-payment)
6. [리뷰 (Review)](#6-리뷰-review)
7. [가격 책정 (Pricing)](#7-가격-책정-pricing)
8. [배너 (Banner)](#8-배너-banner)
9. [파일 업로드 (File)](#9-파일-업로드-file)
10. [관리자 (Admin)](#10-관리자-admin)
11. [소유자 (Owner)](#11-소유자-owner)

---

## 1. 인증 (Authentication)

**Base Path**: `/api/v1/auth`

### 1.1 로그인
- **Endpoint**: `POST /api/v1/auth/login`
- **설명**: 이메일과 비밀번호로 로그인
- **권한**: Public
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**: JWT Access Token + Refresh Token (HttpOnly 쿠키)

### 1.2 회원가입
- **Endpoint**: `POST /api/v1/auth/signup`
- **설명**: 새로운 사용자 등록
- **권한**: Public
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "email": "user@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "name": "John Doe",
    "phone": "010-1234-5678"
  }
  ```
- **Response**: 사용자 정보 + JWT Token

### 1.3 로그아웃
- **Endpoint**: `POST /api/v1/auth/logout`
- **설명**: JWT 토큰 삭제 및 블랙리스트 등록
- **권한**: Authenticated
- **Headers**: `Authorization: Bearer {token}`
- **Response**: 성공 메시지

### 1.4 토큰 새로고침
- **Endpoint**: `POST /api/v1/auth/refresh`
- **설명**: Refresh Token으로 새로운 Access Token 발급
- **권한**: Public (Refresh Token 쿠키 필요)
- **Response**: 새로운 Access Token

### 1.5 토큰 검증
- **Endpoint**: `GET /api/v1/auth/validate`
- **설명**: JWT 토큰 유효성 검증 (Redis 확인 포함)
- **권한**: Authenticated
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ "valid": true/false }`

### 1.6 내 정보 조회
- **Endpoint**: `GET /api/v1/auth/me`
- **설명**: 현재 로그인한 사용자 정보 조회
- **권한**: Authenticated
- **Response**: 사용자 정보 (프로필 이미지 포함)

---

## 2. 사용자 (User)

**Base Path**: `/api/v1/users`, `/api/v1/favorites`

### 2.1 프로필 관리

#### 2.1.1 프로필 조회
- **Endpoint**: `GET /api/v1/users/profile`
- **설명**: 현재 사용자의 프로필 정보 조회
- **권한**: Authenticated

#### 2.1.2 프로필 수정
- **Endpoint**: `PUT /api/v1/users/profile`
- **설명**: 이름, 전화번호, 프로필 이미지 수정
- **권한**: Authenticated
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "phone": "010-1234-5678",
    "thumbnailUrl": "s3://path/to/thumbnail.jpg",
    "originalUrl": "s3://path/to/original.jpg"
  }
  ```

#### 2.1.3 비밀번호 변경
- **Endpoint**: `PUT /api/v1/users/password`
- **설명**: 사용자 비밀번호 변경
- **권한**: Authenticated
- **Request Body**:
  ```json
  {
    "currentPassword": "old_password",
    "newPassword": "new_password"
  }
  ```

#### 2.1.4 환불 계좌 정보 업데이트
- **Endpoint**: `PUT /api/v1/users/refund-account`
- **설명**: 계좌이체 환불용 계좌 정보 업데이트
- **권한**: Authenticated
- **Request Body**:
  ```json
  {
    "refundBankName": "국민은행",
    "refundAccountNumber": "123-456-789012",
    "refundAccountHolder": "홍길동"
  }
  ```

### 2.2 찜하기 (Favorites)

#### 2.2.1 찜하기 토글
- **Endpoint**: `POST /api/v1/favorites/toggle`
- **설명**: 캠핑장 찜하기 추가/제거
- **권한**: Authenticated
- **Request Body**:
  ```json
  {
    "campgroundId": 1
  }
  ```

#### 2.2.2 찜하기 추가
- **Endpoint**: `POST /api/v1/favorites/campgrounds/{campgroundId}`
- **설명**: 특정 캠핑장을 찜 목록에 추가
- **권한**: Authenticated

#### 2.2.3 찜하기 제거
- **Endpoint**: `DELETE /api/v1/favorites/campgrounds/{campgroundId}`
- **설명**: 찜 목록에서 제거
- **권한**: Authenticated

#### 2.2.4 찜하기 목록 조회 (페이징)
- **Endpoint**: `GET /api/v1/favorites`
- **설명**: 사용자의 찜하기 목록 조회 (페이징 지원)
- **권한**: Authenticated
- **Query Params**: `page`, `size`

#### 2.2.5 찜하기 전체 목록 조회
- **Endpoint**: `GET /api/v1/favorites/all`
- **설명**: 사용자의 모든 찜하기 목록 조회
- **권한**: Authenticated

#### 2.2.6 찜하기 상태 확인
- **Endpoint**: `GET /api/v1/favorites/campgrounds/{campgroundId}/status`
- **설명**: 특정 캠핑장의 찜하기 여부 확인
- **권한**: Authenticated
- **Response**: `{ "data": true/false }`

#### 2.2.7 찜하기 수 조회
- **Endpoint**: `GET /api/v1/favorites/campgrounds/{campgroundId}/count`
- **설명**: 캠핑장의 총 찜하기 수 조회
- **권한**: Public

---

## 3. 캠핑장 (Campground)

**Base Path**: `/api/v1/campgrounds`, `/api/v1/sites`

### 3.1 캠핑장 관리

#### 3.1.1 캠핑장 생성
- **Endpoint**: `POST /api/v1/campgrounds`
- **설명**: 새로운 캠핑장 생성
- **권한**: OWNER or ADMIN
- **Request Body**:
  ```json
  {
    "name": "캠핑장 이름",
    "description": "캠핑장 설명 (최소 10자)",
    "address": "주소",
    "phone": "010-1234-5678",
    "email": "camp@example.com",
    "website": "https://example.com",
    "latitude": 37.5665,
    "longitude": 126.9780,
    "imageUrls": ["url1", "url2"],
    "checkInTime": "14:00",
    "checkOutTime": "11:00",
    "businessOwnerName": "대표자명",
    "businessName": "사업자명",
    "businessAddress": "사업장 주소",
    "businessEmail": "business@example.com",
    "businessRegistrationNumber": "123-45-67890",
    "tourismBusinessNumber": "제1234호"
  }
  ```

#### 3.1.2 캠핑장 조회 (ID)
- **Endpoint**: `GET /api/v1/campgrounds/{id}`
- **설명**: 특정 캠핑장 상세 정보 조회
- **권한**: Public

#### 3.1.3 모든 캠핑장 조회
- **Endpoint**: `GET /api/v1/campgrounds`
- **설명**: 캠핑장 목록 조회 (페이징)
- **권한**: Public
- **Query Params**: `page`, `size`

#### 3.1.4 캠핑장 검색
- **Endpoint**: `GET /api/v1/campgrounds/search`
- **설명**: 키워드, 가격, 편의시설로 캠핑장 검색
- **권한**: Public
- **Query Params**:
  - `keyword`: 검색 키워드
  - `minPrice`: 최소 가격
  - `maxPrice`: 최대 가격
  - `amenities`: 편의시설 목록
  - `page`, `size`

#### 3.1.5 인기 캠핑장 조회
- **Endpoint**: `GET /api/v1/campgrounds/popular`
- **설명**: 찜하기 수 기준 인기 캠핑장 조회
- **권한**: Public
- **Query Params**: `limit` (기본값: 10)

#### 3.1.6 지도 영역 내 캠핑장 조회
- **Endpoint**: `GET /api/v1/campgrounds/map`
- **설명**: 지도 경계 박스 내의 캠핑장 조회
- **권한**: Public
- **Query Params**: `swLat`, `swLng`, `neLat`, `neLng`

#### 3.1.7 캠핑장 수정
- **Endpoint**: `PUT /api/v1/campgrounds/{id}`
- **설명**: 캠핑장 정보 수정
- **권한**: OWNER (본인) or ADMIN
- **Request Body**: 생성과 동일 + `imagesToDelete` 배열

#### 3.1.8 캠핑장 삭제
- **Endpoint**: `DELETE /api/v1/campgrounds/{id}`
- **설명**: 캠핑장 삭제
- **권한**: OWNER (본인) or ADMIN

#### 3.1.9 메인 이미지 설정
- **Endpoint**: `PATCH /api/v1/campgrounds/{id}/images/main`
- **설명**: 캠핑장의 메인 이미지 설정
- **권한**: OWNER or ADMIN
- **Query Params**: `imageUrl`

#### 3.1.10 캠핑장의 사이트 목록 조회
- **Endpoint**: `GET /api/v1/campgrounds/{id}/sites`
- **설명**: 특정 캠핑장의 사이트 목록 조회
- **권한**: Public
- **Query Params**: `page`, `size` (기본값: 50)

### 3.2 사이트 관리

#### 3.2.1 사이트 생성
- **Endpoint**: `POST /api/v1/sites` (multipart/form-data)
- **설명**: 새로운 사이트 생성 (이미지 포함 가능)
- **권한**: OWNER or ADMIN
- **Form Data**:
  - `campgroundId`: Long
  - `siteNumber`: String
  - `siteType`: String (TENT, RV, CABIN 등)
  - `capacity`: Integer
  - `description`: String
  - `latitude`, `longitude`: BigDecimal
  - `imageFiles`: MultipartFile[]

#### 3.2.2 사이트 조회
- **Endpoint**: `GET /api/v1/sites/{siteId}`
- **설명**: 사이트 상세 정보 조회
- **권한**: Public

#### 3.2.3 캠핑장별 사이트 목록 조회
- **Endpoint**: `GET /api/v1/sites/by-campground/{campgroundId}`
- **설명**: 특정 캠핑장의 사이트 목록 조회
- **권한**: Public
- **Query Params**: `page`, `size`

#### 3.2.4 사이트 수정
- **Endpoint**: `PUT /api/v1/sites/{siteId}` (multipart/form-data)
- **설명**: 사이트 정보 수정 (이미지 추가/삭제 가능)
- **권한**: OWNER or ADMIN
- **Form Data**: 생성과 동일 + `deleteImageIds`

#### 3.2.5 사이트 삭제
- **Endpoint**: `DELETE /api/v1/sites/{siteId}`
- **설명**: 사이트 삭제
- **권한**: OWNER or ADMIN

---

## 4. 예약 (Reservation)

**Base Path**: `/api/v1/reservations`

### 4.1 회원 예약

#### 4.1.1 예약 생성
- **Endpoint**: `POST /api/v1/reservations`
- **설명**: 새로운 예약 생성
- **권한**: Authenticated
- **Request Body**:
  ```json
  {
    "campgroundId": 1,
    "siteId": 1,
    "checkInDate": "2025-12-25",
    "checkOutDate": "2025-12-26",
    "numberOfGuests": 4,
    "specialRequests": "특별 요청사항"
  }
  ```

#### 4.1.2 예약 조회
- **Endpoint**: `GET /api/v1/reservations/{reservationId}`
- **설명**: 예약 상세 정보 조회
- **권한**: Authenticated (본인만)

#### 4.1.3 내 예약 목록 조회
- **Endpoint**: `GET /api/v1/reservations/my`
- **설명**: 현재 사용자의 모든 예약 목록 조회
- **권한**: Authenticated
- **Query Params**: `page`, `size` (기본값: 10)

#### 4.1.4 예약 수정
- **Endpoint**: `PUT /api/v1/reservations/{reservationId}`
- **설명**: 기존 예약 수정
- **권한**: Authenticated (본인만)
- **Request Body**: 생성과 동일

#### 4.1.5 예약 취소
- **Endpoint**: `DELETE /api/v1/reservations/{reservationId}`
- **설명**: 예약 취소
- **권한**: Authenticated (본인만)

#### 4.1.6 예약 삭제 (Soft Delete)
- **Endpoint**: `DELETE /api/v1/reservations/{reservationId}/soft-delete`
- **설명**: 예약을 목록에서 숨김 처리
- **권한**: Authenticated (본인만)

### 4.2 비회원 예약

#### 4.2.1 비회원 예약 생성
- **Endpoint**: `POST /api/v1/reservations/guest`
- **설명**: 비회원 사용자의 예약 생성
- **권한**: Public
- **Request Body**:
  ```json
  {
    "campgroundId": 1,
    "siteId": 1,
    "checkInDate": "2025-12-25",
    "checkOutDate": "2025-12-26",
    "numberOfGuests": 4,
    "guestName": "홍길동",
    "guestPhone": "010-1234-5678",
    "guestEmail": "guest@example.com",
    "guestPassword": "password123",
    "specialRequests": "특별 요청사항"
  }
  ```

#### 4.2.2 비회원 예약 조회
- **Endpoint**: `POST /api/v1/reservations/guest/lookup`
- **설명**: 연락처, 이메일, 비밀번호로 예약 조회
- **권한**: Public
- **Request Body**:
  ```json
  {
    "guestPhone": "010-1234-5678",
    "guestEmail": "guest@example.com",
    "guestPassword": "password123"
  }
  ```

### 4.3 예약 날짜 조회

#### 4.3.1 사이트 예약 날짜 조회
- **Endpoint**: `GET /api/v1/reservations/sites/{siteId}/reserved-dates`
- **설명**: 특정 사이트의 예약된 날짜 범위 조회
- **권한**: Public
- **Response**:
  ```json
  [
    { "checkInDate": "2025-12-25", "checkOutDate": "2025-12-26" },
    { "checkInDate": "2025-12-28", "checkOutDate": "2025-12-30" }
  ]
  ```

#### 4.3.2 캠핑장 사이트 예약 날짜 일괄 조회
- **Endpoint**: `GET /api/v1/reservations/campgrounds/{campgroundId}/reserved-dates`
- **설명**: 캠핑장의 모든 사이트 예약 날짜를 한 번에 조회
- **권한**: Public
- **Response**: `{ "siteId": [{ ... }], ... }`

---

## 5. 결제 (Payment)

**Base Path**: `/api/v1/payments`

### 5.1 결제 처리
- **Endpoint**: `POST /api/v1/payments/process`
- **설명**: 예약 결제 처리
- **권한**: Authenticated
- **Request Body**:
  ```json
  {
    "reservationId": 1,
    "paymentMethod": "CARD",
    "cardNumber": "1234-5678-9012-3456",
    "cardHolderName": "홍길동"
  }
  ```

### 5.2 결제 내역 조회
- **Endpoint**: `GET /api/v1/payments/history`
- **설명**: 사용자의 결제 내역 조회
- **권한**: Authenticated
- **Query Params**: `page`, `size` (기본값: 10)

### 5.3 결제 상세 조회
- **Endpoint**: `GET /api/v1/payments/{id}`
- **설명**: 특정 결제의 상세 정보 조회
- **권한**: Authenticated

### 5.4 결제 환불
- **Endpoint**: `POST /api/v1/payments/refund`
- **설명**: 완료된 결제 환불
- **권한**: Authenticated
- **Request Body**:
  ```json
  {
    "paymentId": 1,
    "refundAmount": 50000,
    "refundReason": "고객 요청"
  }
  ```

### 5.5 입금 확인 요청
- **Endpoint**: `POST /api/v1/payments/{paymentId}/request-confirmation`
- **설명**: 계좌이체 입금 완료 후 확인 요청
- **권한**: Authenticated

### 5.6 입금 확인 (오너)
- **Endpoint**: `POST /api/v1/payments/{paymentId}/confirm-deposit`
- **설명**: 계좌이체 입금 확인 및 완료 처리
- **권한**: OWNER or ADMIN

### 5.7 결제 승인 (토스페이먼츠)
- **Endpoint**: `POST /api/v1/payments/{paymentId}/confirm`
- **설명**: 토스페이먼츠 결제 승인 및 완료
- **권한**: Authenticated
- **Query Params**: `paymentKey`, `orderId`, `amount`

### 5.8 수동 환불 완료 확인
- **Endpoint**: `POST /api/v1/payments/refunds/{refundId}/confirm`
- **설명**: 계좌이체 환불 수동 처리 후 완료 확인
- **권한**: OWNER or ADMIN

---

## 6. 리뷰 (Review)

**Base Path**: `/api/v1/reviews`

### 6.1 리뷰 CRUD

#### 6.1.1 리뷰 생성
- **Endpoint**: `POST /api/v1/reviews`
- **설명**: 새로운 리뷰 작성
- **권한**: Authenticated
- **Request Body**:
  ```json
  {
    "campgroundId": 1,
    "rating": 5,
    "comment": "훌륭한 캠핑장이었습니다!",
    "images": ["url1", "url2"]
  }
  ```

#### 6.1.2 리뷰 수정
- **Endpoint**: `PUT /api/v1/reviews/{reviewId}`
- **설명**: 기존 리뷰 수정
- **권한**: Authenticated (본인만)
- **Request Body**: 생성과 동일

#### 6.1.3 리뷰 삭제
- **Endpoint**: `DELETE /api/v1/reviews/{reviewId}`
- **설명**: 리뷰 삭제
- **권한**: Authenticated (본인만)

#### 6.1.4 리뷰 조회
- **Endpoint**: `GET /api/v1/reviews/{reviewId}`
- **설명**: 특정 리뷰 조회
- **권한**: Public

### 6.2 리뷰 목록 조회

#### 6.2.1 캠핑장 리뷰 목록
- **Endpoint**: `GET /api/v1/reviews/campground/{campgroundId}`
- **설명**: 특정 캠핑장의 리뷰 목록 조회 (페이징)
- **권한**: Public
- **Query Params**: `page`, `size` (기본값: 10)

#### 6.2.2 최근 리뷰 목록
- **Endpoint**: `GET /api/v1/reviews/recent`
- **설명**: 최근 작성된 리뷰 목록 조회
- **권한**: Public
- **Query Params**: `limit` (기본값: 10, 최대: 50)

#### 6.2.3 캠핑장 전체 리뷰 목록
- **Endpoint**: `GET /api/v1/reviews/campground/{campgroundId}/all`
- **설명**: 캠핑장의 모든 리뷰 조회 (페이징 없음)
- **권한**: Public

#### 6.2.4 내 리뷰 목록
- **Endpoint**: `GET /api/v1/reviews/my`
- **설명**: 현재 사용자의 리뷰 목록 조회
- **권한**: Authenticated
- **Query Params**: `page`, `size`

#### 6.2.5 내 캠핑장 리뷰 조회
- **Endpoint**: `GET /api/v1/reviews/campground/{campgroundId}/my`
- **설명**: 특정 캠핑장에 대한 내 리뷰 조회
- **권한**: Authenticated

### 6.3 리뷰 통계

#### 6.3.1 캠핑장 리뷰 통계
- **Endpoint**: `GET /api/v1/reviews/campground/{campgroundId}/stats`
- **설명**: 캠핑장의 리뷰 통계 정보 조회
- **권한**: Public

### 6.4 리뷰 좋아요

#### 6.4.1 리뷰 좋아요
- **Endpoint**: `POST /api/v1/reviews/{reviewId}/like`
- **설명**: 리뷰에 좋아요 추가
- **권한**: Authenticated

#### 6.4.2 리뷰 좋아요 취소
- **Endpoint**: `DELETE /api/v1/reviews/{reviewId}/like`
- **설명**: 리뷰 좋아요 취소
- **권한**: Authenticated

### 6.5 Owner 전용

#### 6.5.1 내 캠핑장 리뷰 조회 (Owner)
- **Endpoint**: `GET /api/v1/reviews/owner/reviews`
- **설명**: Owner의 모든 캠핑장 리뷰 조회
- **권한**: OWNER or ADMIN
- **Query Params**: `page`, `size` (기본값: 100)

### 6.6 리뷰 답글

#### 6.6.1 답글 작성
- **Endpoint**: `POST /api/v1/reviews/{reviewId}/reply`
- **설명**: 리뷰에 운영자 답글 작성
- **권한**: OWNER or ADMIN
- **Request Body**:
  ```json
  {
    "content": "답글 내용"
  }
  ```

#### 6.6.2 답글 수정
- **Endpoint**: `PUT /api/v1/reviews/{reviewId}/reply/{replyId}`
- **설명**: 리뷰 답글 수정
- **권한**: OWNER or ADMIN

#### 6.6.3 답글 삭제
- **Endpoint**: `DELETE /api/v1/reviews/{reviewId}/reply/{replyId}`
- **설명**: 리뷰 답글 삭제
- **권한**: OWNER or ADMIN

---

## 7. 가격 책정 (Pricing)

**Base Path**: `/api/v1/owner`, `/api/v1/pricing`

### 7.1 Owner 전용 (요금제 관리)

#### 7.1.1 요금제 생성
- **Endpoint**: `POST /api/v1/owner/sites/{siteId}/pricing`
- **설명**: 사이트 요금제 생성
- **권한**: OWNER or ADMIN
- **Request Body**:
  ```json
  {
    "ruleName": "주말 요금",
    "basePrice": 50000,
    "startMonth": 1,
    "endMonth": 12,
    "startDay": 1,
    "endDay": 31,
    "seasonType": "PEAK",
    "weekdayPrice": 50000,
    "weekendPrice": 70000,
    "discountRate": 10,
    "priority": 1
  }
  ```

#### 7.1.2 사이트 요금제 조회
- **Endpoint**: `GET /api/v1/owner/sites/{siteId}/pricing`
- **설명**: 특정 사이트의 요금제 목록 조회
- **권한**: OWNER or ADMIN

#### 7.1.3 요금제 수정
- **Endpoint**: `PUT /api/v1/owner/sites/{siteId}/pricing/{pricingId}`
- **설명**: 요금제 수정
- **권한**: OWNER or ADMIN

#### 7.1.4 요금제 삭제
- **Endpoint**: `DELETE /api/v1/owner/sites/{siteId}/pricing/{pricingId}`
- **설명**: 요금제 삭제
- **권한**: OWNER or ADMIN

#### 7.1.5 전체 요금제 조회
- **Endpoint**: `GET /api/v1/owner/pricing`
- **설명**: Owner의 모든 캠핑장 요금제 조회
- **권한**: OWNER or ADMIN

### 7.2 Public (요금 계산)

#### 7.2.1 요금 미리 계산
- **Endpoint**: `GET /api/v1/pricing/calculate`
- **설명**: 예약 전 요금 실시간 계산
- **권한**: Public
- **Query Params**:
  - `siteId`: Long
  - `checkInDate`: LocalDate (yyyy-MM-dd)
  - `checkOutDate`: LocalDate (yyyy-MM-dd)
  - `numberOfGuests`: Integer
- **Response**:
  ```json
  {
    "totalPrice": 140000,
    "dailyPrices": [
      { "date": "2025-12-25", "basePrice": 50000, "finalPrice": 70000 },
      { "date": "2025-12-26", "basePrice": 50000, "finalPrice": 70000 }
    ],
    "appliedDiscounts": [
      { "discountName": "조기 예약 할인", "discountAmount": 10000 }
    ]
  }
  ```

---

## 8. 배너 (Banner)

**Base Path**: `/api/v1/banners`

### 8.1 Public

#### 8.1.1 활성 배너 목록 조회
- **Endpoint**: `GET /api/v1/banners`
- **설명**: 현재 활성화된 배너 목록 조회
- **권한**: Public
- **Query Params**:
  - `type`: BannerType (PROMOTION, EVENT, ANNOUNCEMENT, NOTICE)
  - `size`: Integer (기본값: 10)

#### 8.1.2 배너 조회수 증가
- **Endpoint**: `POST /api/v1/banners/{bannerId}/view`
- **설명**: 배너 조회수 증가
- **권한**: Public

#### 8.1.3 배너 클릭수 증가
- **Endpoint**: `POST /api/v1/banners/{bannerId}/click`
- **설명**: 배너 클릭수 증가
- **권한**: Public

### 8.2 Admin (관리자 전용)

관리자 전용 배너 관리는 [10.7 배너 관리](#107-배너-관리) 참고

---

## 9. 파일 업로드 (File)

**Base Path**: `/api/v1/files`

### 9.1 이미지 업로드
- **Endpoint**: `POST /api/v1/files/upload` (multipart/form-data)
- **설명**: 이미지 업로드 (썸네일 자동 생성)
- **권한**: Authenticated
- **Form Data**:
  - `file`: MultipartFile
  - `type`: String (campground, site, review, profile, banner)
- **Response**:
  ```json
  {
    "thumbnailPath": "s3://path/to/thumbnail.jpg",
    "thumbnailUrl": "https://...",
    "originalPath": "s3://path/to/original.jpg",
    "originalUrl": "https://..."
  }
  ```

### 9.2 여러 이미지 업로드
- **Endpoint**: `POST /api/v1/files/upload/multiple` (multipart/form-data)
- **설명**: 여러 이미지 일괄 업로드 (썸네일 자동 생성)
- **권한**: Authenticated
- **Form Data**:
  - `files`: MultipartFile[]
  - `type`: String
- **제한**:
  - review: 최대 5개
  - campground: 최대 10개
  - site: 최대 10개

### 9.3 파일 삭제
- **Endpoint**: `DELETE /api/v1/files`
- **설명**: 지정된 경로의 파일들 삭제
- **권한**: Authenticated
- **Request Body**:
  ```json
  {
    "filePaths": [
      "s3://path/to/file1.jpg",
      "s3://path/to/file2.jpg"
    ]
  }
  ```

---

## 10. 관리자 (Admin)

**Base Path**: `/api/v1/admin`

**권한**: 모든 엔드포인트에 `ROLE_ADMIN` 필요

### 10.1 사용자 관리

#### 10.1.1 사용자 목록 조회
- **Endpoint**: `GET /api/v1/admin/users`
- **Query Params**: `page`, `size` (기본값: 20)

#### 10.1.2 이메일로 사용자 조회
- **Endpoint**: `GET /api/v1/admin/users/email/{email}`

#### 10.1.3 사용자 ID로 조회
- **Endpoint**: `GET /api/v1/admin/users/{userId}`

#### 10.1.4 사용자 정보 수정
- **Endpoint**: `PUT /api/v1/admin/users/{userId}`
- **Request Body**:
  ```json
  {
    "role": "OWNER",
    "status": "ACTIVE",
    "name": "홍길동",
    "phone": "010-1234-5678"
  }
  ```

#### 10.1.5 사용자 삭제
- **Endpoint**: `DELETE /api/v1/admin/users/{userId}`

#### 10.1.6 사용자 역할 변경
- **Endpoint**: `PUT /api/v1/admin/users/{userId}/role`
- **Request Body**:
  ```json
  {
    "role": "OWNER"
  }
  ```

#### 10.1.7 사용자 상태 변경
- **Endpoint**: `PUT /api/v1/admin/users/{userId}/status`
- **설명**: 사용자 활성/비활성 상태 토글

#### 10.1.8 사용자 상태 토글
- **Endpoint**: `PUT /api/v1/admin/users/{userId}/toggle-status`

### 10.2 캠핑장 관리

#### 10.2.1 캠핑장 목록 조회
- **Endpoint**: `GET /api/v1/admin/campgrounds`
- **Query Params**: `page`, `size`

#### 10.2.2 캠핑장 생성
- **Endpoint**: `POST /api/v1/admin/campgrounds`
- **Request Body**: 캠핑장 생성과 동일

#### 10.2.3 캠핑장 수정
- **Endpoint**: `PUT /api/v1/admin/campgrounds/{campgroundId}`

#### 10.2.4 캠핑장 삭제
- **Endpoint**: `DELETE /api/v1/admin/campgrounds/{campgroundId}`

#### 10.2.5 캠핑장 상태 변경
- **Endpoint**: `PUT /api/v1/admin/campgrounds/{campgroundId}/status`
- **Query Params**: `status` (ACTIVE, INACTIVE, CLOSED)

#### 10.2.6 캠핑장 승인
- **Endpoint**: `POST /api/v1/admin/campgrounds/{campgroundId}/approve`

#### 10.2.7 캠핑장 거부
- **Endpoint**: `POST /api/v1/admin/campgrounds/{campgroundId}/reject`
- **Request Body**:
  ```json
  {
    "reason": "거부 사유"
  }
  ```

### 10.3 리뷰 관리

#### 10.3.1 리뷰 목록 조회
- **Endpoint**: `GET /api/v1/admin/reviews`
- **Query Params**: `page`, `size`

#### 10.3.2 리뷰 삭제
- **Endpoint**: `DELETE /api/v1/admin/reviews/{reviewId}`

### 10.4 결제 로그 조회

#### 10.4.1 결제/환불 로그 조회
- **Endpoint**: `GET /api/v1/admin/payments`
- **Query Params**:
  - `type`: String (payment, refund)
  - `from`: String (yyyy-MM-dd)
  - `to`: String (yyyy-MM-dd)
  - `page`, `size`

### 10.5 대시보드

#### 10.5.1 대시보드 통계 조회
- **Endpoint**: `GET /api/v1/admin/dashboard/stats`
- **설명**: 전체 통계 데이터 (사용자, 캠핑장, 예약, 결제 등)

#### 10.5.2 최근 활동 내역 조회
- **Endpoint**: `GET /api/v1/admin/dashboard/recent-activities`
- **Query Params**: `limit` (기본값: 10)

### 10.6 예약 관리

> AdminReservationController에 대한 정보는 파일을 읽지 못했으나, 일반적으로 다음과 같은 기능 포함:
> - 전체 예약 목록 조회
> - 예약 상태 변경
> - 예약 강제 취소

### 10.7 배너 관리

#### 10.7.1 배너 목록 조회
- **Endpoint**: `GET /api/v1/admin/banners`
- **Query Params**:
  - `title`: String
  - `type`: BannerType
  - `status`: BannerStatus (ACTIVE, INACTIVE, SCHEDULED)
  - `sort`: String
  - `direction`: String
  - `page`, `size`

#### 10.7.2 배너 단건 조회
- **Endpoint**: `GET /api/v1/admin/banners/{bannerId}`

#### 10.7.3 배너 생성
- **Endpoint**: `POST /api/v1/admin/banners`
- **Request Body**:
  ```json
  {
    "title": "배너 제목",
    "type": "PROMOTION",
    "content": "배너 내용",
    "imageUrl": "https://...",
    "linkUrl": "https://...",
    "startDate": "2025-12-01",
    "endDate": "2025-12-31",
    "displayOrder": 1,
    "status": "ACTIVE"
  }
  ```

#### 10.7.4 배너 수정
- **Endpoint**: `PUT /api/v1/admin/banners/{bannerId}`

#### 10.7.5 배너 삭제
- **Endpoint**: `DELETE /api/v1/admin/banners/{bannerId}`

#### 10.7.6 배너 순서 변경
- **Endpoint**: `PUT /api/v1/admin/banners/{bannerId}/order`
- **Request Body**:
  ```json
  {
    "displayOrder": 5
  }
  ```

#### 10.7.7 배너 상태 변경
- **Endpoint**: `PUT /api/v1/admin/banners/{bannerId}/status`
- **Request Body**:
  ```json
  {
    "status": "ACTIVE"
  }
  ```

#### 10.7.8 배너 통계 조회
- **Endpoint**: `GET /api/v1/admin/banners/stats`
- **Response**: 총 배너 수, 활성 배너 수, 총 조회수, 총 클릭수 등

### 10.8 캐시 모니터링

> CacheMonitoringController는 Redis 캐시 모니터링 기능 제공 (파일 상세 내용 미확인)

---

## 11. 소유자 (Owner)

**Base Path**: `/api/v1/owner`

**권한**: 모든 엔드포인트에 `ROLE_OWNER` or `ROLE_ADMIN` 필요

### 11.1 캠핑장 관리

#### 11.1.1 내 캠핑장 목록 조회
- **Endpoint**: `GET /api/v1/owner/campgrounds`
- **설명**: Owner의 모든 캠핑장 조회
- **Query Params**: `page`, `size` (기본값: 20)

### 11.2 대시보드

#### 11.2.1 대시보드 통계 조회
- **Endpoint**: `GET /api/v1/owner/dashboard/stats`
- **설명**: Owner의 캠핑장 통계 (캐싱 지원)
- **Response**: 총 캠핑장, 예약, 매출, 리뷰 수 등

### 11.3 예약 관리

#### 11.3.1 내 캠핑장 예약 목록 조회
- **Endpoint**: `GET /api/v1/owner/reservations`
- **설명**: Owner의 모든 캠핑장 예약 조회
- **Query Params**: `page`, `size` (기본값: 100)

#### 11.3.2 예약 상세 조회
- **Endpoint**: `GET /api/v1/owner/reservations/{reservationId}`
- **설명**: 예약 상세 정보 조회

#### 11.3.3 예약 상태 변경
- **Endpoint**: `PATCH /api/v1/owner/reservations/{reservationId}/status`
- **Request Body**:
  ```json
  {
    "status": "CONFIRMED"
  }
  ```

### 11.4 환불 처리

#### 11.4.1 Owner 환불 처리
- **Endpoint**: `POST /api/v1/owner/payments/{paymentId}/refund`
- **설명**: 당일 환불 및 전액 환불 가능 (제한 없음)
- **Request Body**:
  ```json
  {
    "refundAmount": 50000,
    "refundReason": "사유"
  }
  ```

### 11.5 리뷰 관리

#### 11.5.1 내 캠핑장 리뷰 조회
- **Endpoint**: `GET /api/v1/owner/reviews`
- **설명**: Owner의 모든 캠핑장 리뷰 조회
- **Query Params**: `page`, `size` (기본값: 100)

---

## 📌 공통 사항

### 인증 방식
- **JWT Bearer Token**: `Authorization: Bearer {access_token}`
- **Refresh Token**: HttpOnly 쿠키

### 응답 형식
```json
{
  "success": true,
  "message": "메시지",
  "data": { ... },
  "timestamp": "2025-11-16T10:00:00"
}
```

### 에러 응답
```json
{
  "success": false,
  "message": "에러 메시지",
  "data": null,
  "timestamp": "2025-11-16T10:00:00"
}
```

### HTTP 상태 코드
- `200 OK`: 성공
- `201 Created`: 생성 성공
- `204 No Content`: 삭제/업데이트 성공
- `400 Bad Request`: 잘못된 요청
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스 없음
- `409 Conflict`: 중복/충돌
- `500 Internal Server Error`: 서버 오류

### 페이징 파라미터
- `page`: 페이지 번호 (0부터 시작)
- `size`: 페이지 크기
- `sort`: 정렬 필드
- `direction`: 정렬 방향 (ASC, DESC)

---

## 📊 API 통계

- **총 Controller 수**: 17개
- **총 엔드포인트 수**: 100+ 개
- **인증 필요 엔드포인트**: 70+ 개
- **Public 엔드포인트**: 30+ 개
- **OWNER 전용**: 15+ 개
- **ADMIN 전용**: 25+ 개

---

**문서 버전**: 1.0
**최종 업데이트**: 2025-11-16
**작성자**: Claude AI Assistant
