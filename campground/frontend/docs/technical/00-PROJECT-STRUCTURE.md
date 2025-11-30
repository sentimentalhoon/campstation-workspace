# 프로젝트 구조

> CampStation Frontend - Next.js 16 + React 19 + TypeScript + Tailwind 4

## 디렉토리 구조

```
src/
├── app/                          # Next.js 16 App Router
│   ├── (auth)/                   # 인증 관련 Route Group
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (main)/                   # 메인 Route Group
│   │   ├── page.tsx              # 홈페이지
│   │   ├── campgrounds/          # 캠핑장
│   │   │   ├── page.tsx          # 목록
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # 상세
│   │   │       └── sites/        # 사이트 관리
│   │   ├── reservations/         # 예약
│   │   │   ├── page.tsx          # 내 예약 목록
│   │   │   ├── [id]/
│   │   │   └── guest/            # 비회원 조회
│   │   ├── map/                  # 지도
│   │   └── layout.tsx
│   ├── dashboard/                # 대시보드
│   │   ├── user/
│   │   ├── owner/
│   │   └── admin/
│   ├── api/                      # API Routes
│   │   └── weather/
│   ├── layout.tsx                # Root Layout
│   └── globals.css               # Global Styles
│
├── components/                   # 컴포넌트
│   ├── ui/                       # 기본 UI 컴포넌트 (재사용)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorMessage.tsx
│   ├── layout/                   # 레이아웃 컴포넌트
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   ├── MobileNav.tsx
│   │   └── AppContainer.tsx
│   └── features/                 # 기능별 컴포넌트
│       ├── auth/
│       │   ├── LoginForm.tsx
│       │   ├── RegisterForm.tsx
│       │   └── ProtectedRoute.tsx
│       ├── campground/
│       │   ├── CampgroundCard.tsx
│       │   ├── CampgroundList.tsx
│       │   ├── CampgroundDetail.tsx
│       │   ├── CampgroundFilters.tsx
│       │   └── SiteSelector.tsx
│       ├── reservation/
│       │   ├── ReservationCard.tsx
│       │   ├── ReservationList.tsx
│       │   ├── ReservationForm.tsx
│       │   └── ReservationModal.tsx
│       ├── review/
│       │   ├── ReviewCard.tsx
│       │   ├── ReviewList.tsx
│       │   └── ReviewForm.tsx
│       └── payment/
│           ├── PaymentForm.tsx
│           └── PaymentResult.tsx
│
├── hooks/                        # Custom Hooks
│   ├── auth/
│   │   ├── useAuth.ts
│   │   └── useSession.ts
│   ├── api/
│   │   ├── useQuery.ts           # React Query wrapper
│   │   ├── useMutation.ts
│   │   └── usePagination.ts
│   ├── ui/
│   │   ├── useModal.ts
│   │   ├── useToast.ts
│   │   └── useMediaQuery.ts
│   └── features/
│       ├── useCampgrounds.ts
│       ├── useReservations.ts
│       └── useReviews.ts
│
├── lib/                          # 라이브러리 & 유틸리티
│   ├── api/                      # API 클라이언트
│   │   ├── client.ts             # Base API client
│   │   ├── config.ts             # API 설정
│   │   ├── errors.ts             # 에러 클래스
│   │   ├── auth.ts               # 인증 API
│   │   ├── campgrounds.ts        # 캠핑장 API
│   │   ├── reservations.ts       # 예약 API
│   │   ├── reviews.ts            # 리뷰 API
│   │   └── index.ts              # Export all
│   ├── server/                   # 서버 전용 코드
│   │   ├── auth.ts               # 서버 인증
│   │   └── cookies.ts            # 쿠키 처리
│   ├── utils/                    # 유틸리티 함수
│   │   ├── format.ts             # 포맷 함수
│   │   ├── validation.ts         # 검증 함수
│   │   ├── date.ts               # 날짜 유틸
│   │   ├── storage.ts            # 로컬/세션 스토리지
│   │   └── cn.ts                 # className 유틸
│   └── constants/                # 상수
│       ├── routes.ts             # 라우트 상수
│       ├── api-endpoints.ts      # API 엔드포인트
│       └── config.ts             # 앱 설정
│
├── types/                        # TypeScript 타입
│   ├── index.ts                  # 중앙 export
│   ├── domain/                   # 도메인 모델
│   │   ├── user.ts
│   │   ├── campground.ts
│   │   ├── reservation.ts
│   │   ├── review.ts
│   │   └── payment.ts
│   ├── api/                      # API 타입
│   │   ├── request.ts
│   │   ├── response.ts
│   │   └── common.ts
│   └── ui/                       # UI 컴포넌트 Props
│       ├── button.ts
│       ├── form.ts
│       └── modal.ts
│
├── contexts/                     # React Context
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── ToastContext.tsx
│
└── styles/                       # 스타일
    └── globals.css

public/
├── images/
├── icons/
└── fonts/
```

## 파일 명명 규칙

### 컴포넌트
- **React Component**: `PascalCase.tsx`
  - 예: `CampgroundCard.tsx`, `LoginForm.tsx`
- **Server Component**: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`

### 훅
- **Custom Hook**: `camelCase.ts` with `use` prefix
  - 예: `useAuth.ts`, `useCampgrounds.ts`

### 유틸리티
- **Utility Function**: `camelCase.ts`
  - 예: `format.ts`, `validation.ts`

### 타입
- **Type Definition**: `camelCase.ts` or `PascalCase.ts`
  - 예: `user.ts`, `campground.ts`

### API
- **API Module**: `camelCase.ts`
  - 예: `auth.ts`, `campgrounds.ts`

## Route Groups 사용 규칙

### (auth) - 인증 페이지
- 공통 레이아웃 공유
- 로그인/회원가입 페이지
- 인증 확인 불필요

### (main) - 메인 페이지
- 기본 레이아웃 (Header + Footer)
- 대부분의 공개 페이지

### dashboard - 대시보드
- 별도 레이아웃
- 인증 필수
- 역할별 분리 (user/owner/admin)

## 컴포넌트 분류 기준

### ui/
- **순수 UI 컴포넌트**
- Props로만 제어
- 비즈니스 로직 없음
- 재사용 가능
- 예: Button, Input, Modal, Card

### layout/
- **레이아웃 컴포넌트**
- 페이지 구조 정의
- 네비게이션, 헤더, 푸터
- 예: Header, Footer, Sidebar

### features/
- **기능별 컴포넌트**
- 비즈니스 로직 포함
- 특정 기능에 종속
- 훅 사용 가능
- 예: CampgroundCard, ReservationForm

## Import 순서

```typescript
// 1. React & Next.js
import { useState } from "react";
import Link from "next/link";

// 2. 외부 라이브러리
import { format } from "date-fns";
import { z } from "zod";

// 3. @/ 절대 경로 imports
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/auth/useAuth";
import { campgroundApi } from "@/lib/api/campgrounds";
import type { Campground } from "@/types/domain/campground";

// 4. 상대 경로 imports
import { CampgroundCard } from "./CampgroundCard";
import { styles } from "./styles";

// 5. Type-only imports (선택적)
import type { ReactNode } from "react";
```

## 절대 경로 alias

```typescript
@/          → src/
@/components → src/components
@/hooks     → src/hooks
@/lib       → src/lib
@/types     → src/types
@/contexts  → src/contexts
@/styles    → src/styles
```

## 페이지별 파일 구성

### 작은 페이지 (파일 1개)
```
campgrounds/
└── page.tsx          # 모든 로직 포함
```

### 중간 페이지 (파일 2-3개)
```
campgrounds/
├── page.tsx          # Server Component
└── CampgroundsClient.tsx  # Client Component
```

### 큰 페이지 (폴더로 분리)
```
campgrounds/
├── page.tsx
├── _components/      # 페이지 전용 컴포넌트
│   ├── Filters.tsx
│   ├── List.tsx
│   └── Map.tsx
└── _hooks/           # 페이지 전용 훅 (선택적)
    └── useCampgroundFilters.ts
```

## 주요 원칙

1. **Server Component 우선**: 기본적으로 Server Component 사용
2. **Client Component는 명시**: `"use client"` 명시적 선언
3. **폴더 기반 분리**: 기능별로 명확하게 분리
4. **절대 경로 사용**: `@/`를 사용한 절대 경로 권장
5. **타입 중앙 관리**: `types/` 폴더에서 통합 관리
6. **API 레이어 분리**: `lib/api/`에서 모든 API 호출 관리

## 예외 사항

### _ prefix 폴더/파일
- 빌드에 포함되지 않음
- 페이지 전용 컴포넌트/유틸
- 예: `_components/`, `_hooks/`, `_utils/`

### Route Handlers
- `app/api/` 아래에만 위치
- `route.ts` 파일명 사용
- 예: `app/api/weather/route.ts`
