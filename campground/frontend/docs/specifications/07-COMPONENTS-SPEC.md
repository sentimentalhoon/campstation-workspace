# 컴포넌트 명세

> 재사용 가능한 UI 컴포넌트 상세 스펙

## 📦 컴포넌트 분류

```
components/
├── ui/              - 기본 UI 컴포넌트
├── layout/          - 레이아웃 컴포넌트
├── features/        - 기능별 컴포넌트
└── providers/       - Context Providers
```

---

## 🎨 UI Components (`components/ui/`)

### Button

**상태**: ✅ 완료

```typescript
type ButtonProps = {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
};
```

**Variants**:

- `primary`: 녹색 배경, 흰색 텍스트
- `secondary`: 회색 배경, 검정 텍스트
- `outline`: 테두리만, 배경 투명
- `ghost`: 배경/테두리 없음

**Sizes**:

- `sm`: h-9 (36px), px-3, text-sm
- `md`: h-11 (44px), px-4, text-base **(권장)**
- `lg`: h-12 (48px), px-6, text-lg

**States**:

- Disabled: 투명도 50%, 클릭 불가
- Loading: 스피너 표시, 클릭 불가
- Active: scale-95 (터치 피드백)

---

### Input

**상태**: ✅ 완료

```typescript
type InputProps = {
  label?: string;
  type?: "text" | "email" | "password" | "tel" | "number";
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};
```

**Features**:

- Label 위에 표시
- Error 시 빨간 테두리 + 에러 메시지
- Helper text (작은 회색 텍스트)
- Required 표시 (\*)

**Height**: 44px (권장)

---

### Textarea

**상태**: ✅ 완료

```typescript
type TextareaProps = {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  rows?: number;
  maxLength?: number;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};
```

**Features**:

- Auto-resize (선택사항)
- Character counter
- Min height: 100px

---

### Select

**상태**: ✅ 완료

```typescript
type SelectProps = {
  label?: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};
```

**Height**: 44px

---

### Card

**상태**: ✅ 완료

```typescript
type CardProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
};

type CardHeaderProps = {
  children: React.ReactNode;
  className?: string;
};

type CardContentProps = {
  children: React.ReactNode;
  className?: string;
};

type CardFooterProps = {
  children: React.ReactNode;
  className?: string;
};
```

**Features**:

- 기본 패딩: p-4 (16px)
- 둥근 모서리: rounded-lg (8px)
- 그림자: shadow-sm
- Hoverable: active:bg-muted
- 서브 컴포넌트: CardHeader, CardContent, CardFooter

---

### Modal

**상태**: ✅ 완료

```typescript
type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "full";
  className?: string;
};
```

**Sizes**:

- `sm`: max-w-sm (384px)
- `md`: max-w-md (448px)
- `lg`: max-w-lg (512px)
- `full`: w-full h-full (전체 화면)

**Features**:

- Backdrop 클릭 시 닫기
- ESC 키로 닫기
- Body scroll lock
- 모바일: 하단 시트 스타일 권장

---

### Badge

**상태**: ✅ 완료

```typescript
type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "success" | "error" | "warning" | "info";
  size?: "sm" | "md";
  className?: string;
};
```

**Variants**:

- `default`: 회색
- `success`: 녹색
- `error`: 빨간색
- `warning`: 주황색
- `info`: 파란색

**Usage**: 상태 표시, 태그, 라벨

---

### LoadingSpinner

**상태**: ✅ 완료

```typescript
type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};
```

**Sizes**:

- `sm`: w-4 h-4 (16px)
- `md`: w-6 h-6 (24px)
- `lg`: w-8 h-8 (32px)

**Animation**: rotate 애니메이션

---

### ErrorMessage

**상태**: ✅ 완료

```typescript
type ErrorMessageProps = {
  message: string;
  retry?: () => void;
  className?: string;
};
```

**Features**:

- 빨간 배경 (bg-error/10)
- 빨간 텍스트
- 재시도 버튼 (선택)

---

## 📐 Layout Components (`components/layout/`)

### Header

**상태**: ✅ 완료

```typescript
type HeaderProps = {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
};
```

**Layout**:

```
┌─────────────────────────────────┐
│ [←] Title            [Action]  │ 56px
└─────────────────────────────────┘
```

**Features**:

- Sticky top
- 뒤로가기 버튼
- 타이틀 중앙 또는 좌측
- 우측 액션 슬롯

---

### Footer

**상태**: ✅ 완료

```typescript
type FooterProps = {
  className?: string;
};
```

**Content**:

- About 섹션
- 링크 그리드
- 연락처
- 저작권

**Height**: 동적 (약 300px)

---

### AppContainer

**상태**: ✅ 완료

```typescript
type AppContainerProps = {
  children: React.ReactNode;
  padding?: boolean;
  className?: string;
};
```

**Features**:

- 최대 너비: 640px
- 중앙 정렬: mx-auto
- 기본 패딩: px-4 py-6

---

### BottomTabNav

**상태**: ⏳ 대기 (P0)

```typescript
type BottomTabNavProps = {
  activeTab?: "home" | "map" | "reservations" | "my";
};

type TabItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
};
```

**Layout**:

```
┌─────┬─────┬─────┬─────┐
│ 🏠  │ 🗺️  │ 📅  │ 👤  │
│ 홈  │ 지도│ 예약│ MY  │
└─────┴─────┴─────┴─────┘
```

**Features**:

- Fixed bottom
- 4개 탭
- Active 상태 하이라이트
- 아이콘 + 라벨

---

## 🏕️ Feature Components (`components/features/`)

### CampgroundCard

**상태**: ✅ 완료

```typescript
type CampgroundCardProps = {
  campground: Campground;
  onClick?: () => void;
  className?: string;
};
```

**Layout**:

```
┌─────────────────────────────────┐
│ [Image (aspect-4/3)]           │
├─────────────────────────────────┤
│ 제주 오름 캠핑장                 │
│ 📍 제주시                        │
│ ₩50,000 / 박        ★ 4.5      │
└─────────────────────────────────┘
```

**Height**: ~280px

---

### ReservationCard

**상태**: ⏳ 대기 (P0)

```typescript
type ReservationCardProps = {
  reservation: Reservation;
  onClick?: () => void;
  className?: string;
};
```

**Layout**:

```
┌─────────────────────────────────┐
│ [Thumbnail]                     │
│ 제주 오름 캠핑장                 │
│ 12/1 - 12/3 (2박)               │
│ [예약 확정]  RSV-123            │
└─────────────────────────────────┘
```

**Height**: ~140px

---

### ReviewCard

**상태**: ⏳ 대기 (P1)

```typescript
type ReviewCardProps = {
  review: Review;
  className?: string;
};
```

**Layout**:

```
┌─────────────────────────────────┐
│ 홍길동  ★★★★★  2025.11.09     │
│ 정말 좋은 캠핑장이에요!          │
│ [사진1] [사진2]                 │
└─────────────────────────────────┘
```

---

### Calendar

**상태**: ⏳ 대기 (P0)

```typescript
type CalendarProps = {
  selectedRange?: { start: Date; end: Date };
  onSelectRange: (range: { start: Date; end: Date }) => void;
  disabledDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
  className?: string;
};
```

**Features**:

- 월 단위 표시
- 범위 선택 (체크인/체크아웃)
- 예약 불가 날짜 표시
- 최소/최대 날짜 제한

**Height**: ~400px

---

### SiteSelector

**상태**: ⏳ 대기 (P0)

```typescript
type SiteSelectorProps = {
  sites: CampSite[];
  selected?: number;
  onSelect: (siteId: number) => void;
  className?: string;
};
```

**Layout**: 라디오 버튼 카드 리스트

---

### GuestCounter

**상태**: ⏳ 대기 (P0)

```typescript
type GuestCounterProps = {
  adults: number;
  children: number;
  onChangeAdults: (count: number) => void;
  onChangeChildren: (count: number) => void;
  maxGuests?: number;
  className?: string;
};
```

**Layout**:

```
성인
[-]  2  [+]

아동 (만 12세 이하)
[-]  1  [+]
```

---

### ImageGallery

**상태**: ⏳ 대기 (P0)

```typescript
type ImageGalleryProps = {
  images: string[];
  aspectRatio?: "4/3" | "16/9" | "square";
  className?: string;
};
```

**Features**:

- 스와이프 가능
- 인디케이터 (1/5)
- 클릭 시 전체화면 (선택)

---

### FacilityGrid

**상태**: ⏳ 대기 (P0)

```typescript
type FacilityGridProps = {
  facilities: string[];
  columns?: 3 | 4 | 5;
  className?: string;
};
```

**Layout**: 아이콘 + 라벨 그리드

---

### PriceBreakdown

**상태**: ⏳ 대기 (P0)

```typescript
type PriceBreakdownProps = {
  basePrice: number;
  nights: number;
  discount?: number;
  total: number;
  className?: string;
};
```

**Layout**:

```
사이트 요금 (2박)    ₩100,000
할인                 -₩10,000
───────────────────────────────
총 결제 금액         ₩90,000
```

---

### QRCode

**상태**: ⏳ 대기 (P2)

```typescript
type QRCodeProps = {
  value: string;
  size?: number;
  className?: string;
};
```

**Usage**: 예약 상세 페이지 체크인용

---

## 🔄 Provider Components

### QueryProvider

**상태**: ✅ 완료

```typescript
type QueryProviderProps = {
  children: React.ReactNode;
};
```

**Config**:

- staleTime: 60초
- refetchOnWindowFocus: false
- retry: 3

---

### AuthProvider

**상태**: ✅ 완료 (AuthContext)

```typescript
type AuthProviderProps = {
  children: React.ReactNode;
};
```

**Provides**:

- user, isAuthenticated, isLoading
- login, register, logout

---

### ThemeProvider

**상태**: ❌ MVP 제외

다크모드 지원 시 구현

---

## 📋 컴포넌트 개발 우선순위

### P0 - MVP 필수

- [x] Button
- [x] Input
- [x] Card
- [x] LoadingSpinner
- [x] ErrorMessage
- [x] Header
- [x] AppContainer
- [x] CampgroundCard
- [ ] Calendar
- [ ] SiteSelector
- [ ] GuestCounter
- [ ] BottomTabNav
- [ ] ReservationCard
- [ ] ImageGallery
- [ ] PriceBreakdown

### P1 - 중요

- [ ] FacilityGrid
- [ ] ReviewCard
- [ ] Map (네이버 맵)
- [ ] Rating (별점 입력)
- [ ] ImageUpload

### P2 - 보통

- [ ] QRCode
- [ ] Skeleton
- [ ] Toast/Notification
- [ ] Tabs
- [ ] Accordion

### P3 - 낮음

- [ ] ThemeProvider
- [ ] Tooltip
- [ ] Dropdown Menu
- [ ] Progress Bar

---

**마지막 업데이트**: 2025-11-09  
**완성도**: 9/38 컴포넌트 (24%)
