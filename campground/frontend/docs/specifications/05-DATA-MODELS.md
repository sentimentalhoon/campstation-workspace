# 데이터 모델 및 타입

> Frontend TypeScript 타입 정의

## 📦 타입 구조

```
types/
├── domain/           - 도메인 엔티티
├── api/             - API 요청/응답
├── common/          - 공통 타입
└── enums/           - 열거형
```

---

## 🎯 Domain Types (도메인 엔티티)

### User (사용자)

```typescript
export type User = {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  profileImage?: string;
  createdAt: string;
  updatedAt?: string;
};

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  OWNER = "OWNER", // 캠핑장 운영자
}
```

---

### Campground (캠핑장)

```typescript
export type Campground = {
  id: number;
  name: string;
  description: string;
  images: string[];
  thumbnail: string;
  address: string;
  region: string;
  coordinates: Coordinates;
  contact: Contact;
  checkIn: string; // "14:00"
  checkOut: string; // "11:00"
  facilities: string[];
  theme: CampgroundTheme;
  basePrice: number;
  rating: number;
  reviewCount: number;
  sites: CampSite[];
  createdAt: string;
  updatedAt?: string;
};

export type CampSite = {
  id: number;
  name: string; // "A-01"
  type: SiteType;
  price: number;
  maxCapacity: number;
  description?: string;
  available: boolean;
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type Contact = {
  phone: string;
  email?: string;
};

export enum CampgroundTheme {
  AUTO_CAMPING = "오토캠핑",
  GLAMPING = "글램핑",
  CARAVAN = "카라반",
  PENSION = "펜션",
}

export enum SiteType {
  NORMAL = "일반",
  PREMIUM = "프리미엄",
  GLAMPING = "글램핑",
}
```

---

### Reservation (예약)

```typescript
export type Reservation = {
  id: number;
  reservationNumber: string; // "RSV-20251109-123"
  status: ReservationStatus;
  qrCode?: string; // Base64 or URL
  campground: {
    id: number;
    name: string;
    address: string;
    phone: string;
    thumbnail: string;
  };
  site: {
    id: number;
    name: string;
    type: SiteType;
  };
  checkIn: string; // "2025-12-01"
  checkOut: string; // "2025-12-03"
  nights: number;
  guests: Guests;
  specialRequests?: string;
  payment?: Payment;
  createdAt: string;
  updatedAt?: string;
  cancelledAt?: string;
};

export type Guests = {
  adults: number;
  children: number;
};

export enum ReservationStatus {
  PENDING = "PENDING", // 결제 대기
  CONFIRMED = "CONFIRMED", // 예약 확정
  COMPLETED = "COMPLETED", // 이용 완료
  CANCELLED = "CANCELLED", // 취소됨
}
```

---

### Payment (결제)

```typescript
export type Payment = {
  id: number;
  paymentKey: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  provider: PaymentProvider;
  paidAt: string;
  cancelledAt?: string;
  refundAmount?: number;
};

export enum PaymentMethod {
  CARD = "카드",
  TRANSFER = "계좌이체",
  VIRTUAL_ACCOUNT = "가상계좌",
  EASY_PAY = "간편결제",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  DONE = "DONE",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED",
}

export enum PaymentProvider {
  TOSS = "TOSS",
  KAKAO = "KAKAO",
  NAVER = "NAVER",
}
```

---

### Review (리뷰)

```typescript
export type Review = {
  id: number;
  user: {
    id: number;
    name: string;
    profileImage?: string;
  };
  campground: {
    id: number;
    name: string;
  };
  reservation?: {
    id: number;
    reservationNumber: string;
  };
  rating: number; // 1-5
  content: string;
  images: string[];
  createdAt: string;
  updatedAt?: string;
};
```

---

## 📡 API Types (API 요청/응답)

### Auth API

```typescript
// 로그인
export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
};

// 회원가입
export type RegisterRequest = {
  email: string;
  password: string;
  passwordConfirm: string;
  name?: string;
  phone?: string;
};

export type RegisterResponse = {
  user: User;
};

// 현재 사용자
export type MeResponse = User;

// 토큰 갱신
export type RefreshRequest = {
  refreshToken: string;
};

export type RefreshResponse = {
  accessToken: string;
  expiresIn: number;
};

// 소셜 로그인
export type SocialLoginRequest = {
  provider: "kakao" | "naver" | "google" | "facebook";
  code: string;
  redirectUri: string;
};

export type SocialLoginResponse = LoginResponse;
```

---

### Campground API

```typescript
// 캠핑장 목록 조회
export type CampgroundListRequest = {
  search?: string;
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  facilities?: string[];
  theme?: CampgroundTheme;
  sort?: "popular" | "price_asc" | "price_desc" | "rating";
  page?: number;
  size?: number;
};

export type CampgroundListResponse = PageResponse<Campground>;

// 캠핑장 상세
export type CampgroundDetailResponse = Campground;

// 사이트 예약 가능 여부
export type SiteAvailabilityRequest = {
  campgroundId: number;
  checkIn: string;
  checkOut: string;
};

export type SiteAvailabilityResponse = CampSite[];
```

---

### Reservation API

```typescript
// 예약 생성
export type CreateReservationRequest = {
  campgroundId: number;
  siteId: number;
  checkIn: string; // "YYYY-MM-DD"
  checkOut: string; // "YYYY-MM-DD"
  guests: Guests;
  specialRequests?: string;
};

export type CreateReservationResponse = Reservation;

// 예약 목록
export type ReservationListRequest = {
  status?: ReservationStatus;
  page?: number;
  size?: number;
};

export type ReservationListResponse = PageResponse<Reservation>;

// 예약 상세
export type ReservationDetailResponse = Reservation;

// 예약 취소
export type CancelReservationRequest = {
  reason: string;
};

export type CancelReservationResponse = {
  id: number;
  status: ReservationStatus;
  refundAmount: number;
  cancelledAt: string;
};

// 비회원 예약 조회
export type GuestReservationRequest = {
  reservationNumber: string;
  email: string;
};

export type GuestReservationResponse = Reservation;
```

---

### Payment API

```typescript
// 결제 처리
export type ProcessPaymentRequest = {
  reservationId: number;
  paymentKey: string;
  amount: number;
  orderId: string;
};

export type ProcessPaymentResponse = Payment;

// 결제 검증
export type VerifyPaymentRequest = {
  paymentId: number;
};

export type VerifyPaymentResponse = {
  verified: boolean;
  paymentStatus: PaymentStatus;
};
```

---

### Review API

```typescript
// 리뷰 목록
export type ReviewListRequest = {
  campgroundId: number;
  sort?: "recent" | "rating_high" | "rating_low";
  page?: number;
  size?: number;
};

export type ReviewListResponse = {
  content: Review[];
  averageRating: number;
  totalCount: number;
  page: number;
  totalPages: number;
};

// 리뷰 작성
export type CreateReviewRequest = {
  campgroundId: number;
  reservationId: number;
  rating: number;
  content: string;
  images?: string[]; // Base64 or URLs
};

export type CreateReviewResponse = Review;

// 리뷰 수정
export type UpdateReviewRequest = {
  rating?: number;
  content?: string;
  images?: string[];
};

export type UpdateReviewResponse = Review;
```

---

## 🌐 Common Types (공통 타입)

### API Response Wrapper

```typescript
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: ApiErrorData;
};

export type ApiErrorData = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};
```

---

### Pagination

```typescript
export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type PageRequest = {
  page?: number;
  size?: number;
};
```

---

### Form Types

```typescript
export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  email: string;
  password: string;
  passwordConfirm: string;
  name?: string;
  phone?: string;
};

export type ReservationForm = {
  campgroundId: number;
  siteId: number;
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children: number;
  specialRequests?: string;
};

export type ReviewForm = {
  rating: number;
  content: string;
  images: File[];
};
```

---

### Component Props

```typescript
// Button 컴포넌트
export type ButtonProps = {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
};

// Input 컴포넌트
export type InputProps = {
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

// Card 컴포넌트
export type CardProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
};
```

---

## 🔧 Utility Types

### Date & Time

```typescript
export type DateRange = {
  start: Date;
  end: Date;
};

export type TimeSlot = {
  hour: number;
  minute: number;
};
```

---

### Filter & Sort

```typescript
export type Filter = {
  field: string;
  value: unknown;
  operator?: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in";
};

export type Sort = {
  field: string;
  direction: "asc" | "desc";
};
```

---

### Location

```typescript
export type Location = {
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  coordinates: Coordinates;
};
```

---

## 📊 State Types

### Auth Context

```typescript
export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

export type AuthContextValue = AuthState & {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
};
```

---

### Search State

```typescript
export type SearchState = {
  query: string;
  filters: {
    region?: string;
    priceRange?: [number, number];
    facilities?: string[];
    theme?: CampgroundTheme;
  };
  sort: "popular" | "price_asc" | "price_desc" | "rating";
};
```

---

### Reservation State

```typescript
export type ReservationState = {
  campgroundId?: number;
  siteId?: number;
  dateRange?: DateRange;
  guests?: Guests;
  step: 1 | 2 | 3 | 4; // 날짜 → 사이트 → 정보 → 결제
};
```

---

## 🎨 Theme Types

```typescript
export type Theme = {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    muted: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
};
```

---

## 🔒 Type Guards

```typescript
// User type guard
export function isUser(obj: unknown): obj is User {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "email" in obj &&
    "role" in obj
  );
}

// ApiError type guard
export function isApiError(error: unknown): error is ApiErrorData {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error
  );
}
```

---

## 📋 Type Aliases (별칭)

```typescript
// ID types
export type UserId = number;
export type CampgroundId = number;
export type ReservationId = number;
export type ReviewId = number;
export type PaymentId = number;

// Date string types
export type DateString = string; // "YYYY-MM-DD"
export type DateTimeString = string; // ISO 8601
export type TimeString = string; // "HH:mm"

// Currency
export type KRW = number; // 한화 (원)
```

---

**마지막 업데이트**: 2025-11-09  
**TypeScript Version**: 5+
