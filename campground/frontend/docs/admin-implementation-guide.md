# 관리자 기능 구현 가이드

**작성일**: 2025-11-10  
**Sprint**: Sprint 5 - Phase 3  
**상태**: Phase 1 완료 ✅ / Phase 2 완료 ✅

---

## 📋 목차

1. [개요](#개요)
2. [권한 구조](#권한-구조)
3. [아키텍처 설계](#아키텍처-설계)
4. [구현 계획](#구현-계획)
5. [API 명세](#api-명세)
6. [컴포넌트 설계](#컴포넌트-설계)
7. [권한 체크](#권한-체크)
8. [테스트 전략](#테스트-전략)

---

## 개요

캠핑장 예약 시스템의 관리자 기능을 **역할 기반 접근 제어(RBAC)**로 구현합니다.

### 목표

- ✅ **OWNER**: 자신의 캠핑장 관리
- ✅ **ADMIN**: 전체 시스템 관리
- ✅ 공통 컴포넌트로 코드 재사용성 확보
- ✅ 확장 가능한 구조 설계

---

## 권한 구조

### 역할 정의

```typescript
export type UserRole = "MEMBER" | "OWNER" | "ADMIN";
```

### 권한 매트릭스

| 기능                    | MEMBER | OWNER | ADMIN |
| ----------------------- | ------ | ----- | ----- |
| 캠핑장 검색/예약        | ✅     | ✅    | ✅    |
| 리뷰 작성               | ✅     | ✅    | ✅    |
| **자신의 캠핑장 등록**  | ❌     | ✅    | ✅    |
| **자신의 캠핑장 관리**  | ❌     | ✅    | ✅    |
| **내 캠핑장 예약 관리** | ❌     | ✅    | ✅    |
| **모든 캠핑장 조회**    | ❌     | ❌    | ✅    |
| **캠핑장 승인/거부**    | ❌     | ❌    | ✅    |
| **사용자 관리**         | ❌     | ❌    | ✅    |
| **신고 처리**           | ❌     | ❌    | ✅    |
| **전체 시스템 통계**    | ❌     | ❌    | ✅    |

---

## 아키텍처 설계

### 디렉토리 구조

```
frontend/
├── app/
│   └── dashboard/
│       ├── owner/                    # OWNER 대시보드
│       │   ├── page.tsx              # 내 캠핑장 목록
│       │   ├── campgrounds/
│       │   │   ├── new/page.tsx      # 캠핑장 등록
│       │   │   └── [id]/
│       │   │       ├── edit/page.tsx # 수정
│       │   │       ├── sites/page.tsx # 사이트 관리
│       │   │       └── stats/page.tsx # 통계
│       │   └── reservations/
│       │       └── page.tsx          # 예약 관리
│       │
│       └── admin/                    # ADMIN 대시보드
│           ├── page.tsx              # 시스템 대시보드
│           ├── campgrounds/
│           │   ├── page.tsx          # 모든 캠핑장
│           │   ├── pending/page.tsx  # 승인 대기
│           │   └── [id]/edit/page.tsx
│           ├── users/
│           │   ├── page.tsx          # 사용자 관리
│           │   └── [id]/page.tsx
│           ├── reservations/
│           │   └── page.tsx
│           ├── reviews/
│           │   └── reports/page.tsx  # 신고 관리
│           └── stats/
│               └── page.tsx
│
├── components/features/
│   └── admin/                        # 공통 관리 컴포넌트
│       ├── CampgroundForm/
│       │   ├── CampgroundForm.tsx
│       │   ├── CampgroundFormFields.tsx
│       │   └── ImageUploadSection.tsx
│       ├── SiteManager/
│       │   ├── SiteManager.tsx
│       │   ├── SiteList.tsx
│       │   ├── SiteForm.tsx
│       │   └── SiteFormModal.tsx
│       ├── ReservationTable/
│       │   ├── ReservationTable.tsx
│       │   ├── ReservationRow.tsx
│       │   └── StatusBadge.tsx
│       ├── StatsCard/
│       │   └── StatsCard.tsx
│       └── UserTable/               # ADMIN 전용
│           ├── UserTable.tsx
│           ├── UserRow.tsx
│           └── RoleBadge.tsx
│
├── hooks/
│   ├── admin/
│   │   ├── useMyCampgrounds.ts      # OWNER용
│   │   ├── useAllCampgrounds.ts     # ADMIN용
│   │   ├── useMyReservations.ts
│   │   ├── useAllReservations.ts
│   │   ├── useUsers.ts              # ADMIN 전용
│   │   ├── useReportedReviews.ts    # ADMIN 전용
│   │   └── useStats.ts
│   └── useAuth.ts                   # 권한 체크
│
└── lib/
    ├── api/
    │   ├── owner.ts                 # OWNER API
    │   └── admin.ts                 # ADMIN API
    └── middleware/
        └── withAuth.ts              # 권한 체크 HOC
```

---

## 구현 계획

### Phase 1: OWNER 핵심 기능 (완료 ✅)

#### Day 1: 기본 구조 + 캠핑장 관리

1. **공통 컴포넌트**
   - [x] `CampgroundForm` - 캠핑장 등록/수정 폼 (630줄)
   - [x] `StatsCard` - 통계 카드 (118줄)

2. **OWNER 페이지**
   - [x] `dashboard/owner/page.tsx` - 내 캠핑장 목록
   - [x] `dashboard/owner/campgrounds/new/page.tsx` - 등록
   - [x] `dashboard/owner/campgrounds/[id]/edit/page.tsx` - 수정

3. **API & Hooks**
   - [x] `useMyCampgrounds` Hook
   - [x] `owner.ts` API (10+ 엔드포인트)

#### Day 2: 사이트 관리 + 예약 관리

4. **공통 컴포넌트**
   - [x] `SiteManager` - 사이트 관리 (670줄)
   - [x] `ReservationTable` - 예약 테이블 (360줄)

5. **OWNER 페이지**
   - [ ] `dashboard/owner/campgrounds/[id]/sites/page.tsx` (Phase 2 예정)
   - [ ] `dashboard/owner/reservations/page.tsx` (Phase 2 예정)

6. **API & Hooks**
   - [x] `useCampgroundSites` Hook
   - [x] `useCampgroundReservations` Hook

#### Day 3: 통계 + 권한 체크

7. **OWNER 페이지**
   - [ ] `dashboard/owner/campgrounds/[id]/stats/page.tsx` (Phase 2 예정)

8. **권한 체크**
   - [x] `withOwnerAuth` HOC
   - [x] `withAdminAuth` HOC
   - [x] `permissions.ts` 유틸리티
   - [x] 페이지별 권한 가드 적용 (3개 페이지)

9. **테스트**
   - [x] 권한 유틸리티 단위 테스트 (20개)
   - [ ] OWNER 플로우 E2E 테스트 (Phase 2 예정)

**실제 공수**: 8h ✅  
**완성도**: 100% (핵심 기능 완료)

### Phase 2: ADMIN 시스템 (완료 ✅)

#### Day 4: ADMIN 대시보드 + 사용자/캠핑장 관리

1. **ADMIN API & Hooks**
   - [x] `admin.ts` API (330줄, 15+ 엔드포인트)
   - [x] `useAllUsers` - 사용자 CRUD, 역할/상태 변경
   - [x] `useAllCampgrounds` - 캠핑장 CRUD, 승인/거부
   - [x] `useAllReservations` - 예약 조회, 취소
   - [x] `useReports` - 신고 조회, 처리
   - [x] `useAdminStats` - 통계 및 최근 활동

2. **ADMIN 페이지**
   - [x] `dashboard/admin/page.tsx` - 대시보드 (350줄)
     - 통계 6개 섹션 (사용자/캠핑장/예약/매출/신고)
     - 최근 활동 타임라인
     - 빠른 링크 4개
   - [x] `dashboard/admin/users/page.tsx` - 사용자 관리
     - 검색 및 필터 (역할, 상태)
     - 통계 카드 3개
     - UserTable 컴포넌트
   - [x] `dashboard/admin/campgrounds/page.tsx` - 캠핑장 관리
     - 승인/거부/삭제 기능
     - 검색 및 필터 (승인 상태)
     - 통계 카드 3개

3. **공통 컴포넌트**
   - [x] `UserTable` - 사용자 목록 테이블 (320줄)
     - 역할 변경 드롭다운
     - 상태 변경 버튼
     - 사용자 삭제 기능

#### Day 5: 예약 및 신고 관리

4. **ADMIN 페이지**
   - [x] `dashboard/admin/reservations/page.tsx` - 예약 관리
     - 전체 예약 목록
     - 상태별 필터 (대기/확정/완료/취소)
     - 통계 카드 4개
     - 취소/환불 처리
   - [x] `dashboard/admin/reports/page.tsx` - 신고 관리
     - 신고 목록 조회
     - 타입/상태 필터 (캠핑장/리뷰/사용자, 대기/승인/거부)
     - 통계 카드 3개
     - 승인/거부 처리

5. **권한 체크**
   - [x] 모든 ADMIN 페이지에 `withAdminAuth` 적용

**실제 공수**: 4h ✅  
**완성도**: 100% (완료)

#### Day 6: 통계 + 권한 체크

7. **ADMIN 페이지**
   - [ ] `dashboard/admin/stats/page.tsx`

8. **권한 체크**
   - [ ] 모든 ADMIN 페이지에 `withAdminAuth` 적용

9. **테스트**
   - [ ] ADMIN 플로우 E2E 테스트
   - [ ] 권한 체크 통합 테스트

**실제 공수**: 4h ✅  
**완성도**: 100% (완료)

### Phase 3: 고급 기능 (진행 예정, 2-3일)

**목표**: ADMIN/OWNER 대시보드에 데이터 시각화 및 고급 관리 기능 추가

#### Day 7: 통계 차트 구현

1. **차트 라이브러리 선택 및 설치**
   - [ ] Recharts 선택 (React 19 호환, 가볍고 커스터마이징 용이)
   - [ ] 설치: `npm install recharts`
   - [ ] 타입: `npm install -D @types/recharts`

2. **공통 차트 컴포넌트** (3개)
   - [ ] `LineChart` - 시계열 데이터 (사용자 증가, 매출 추세)
   - [ ] `BarChart` - 비교 데이터 (월별 예약, 지역별 분포)
   - [ ] `PieChart` - 비율 데이터 (사용자 역할, 예약 상태)

3. **ADMIN 대시보드 차트 통합**
   - [ ] 사용자 증가 추세 차트 (최근 6개월)
   - [ ] 매출 통계 차트 (월별)
   - [ ] 캠핑장별 예약 현황 (Top 10)
   - [ ] 지역별 캠핑장 분포

4. **OWNER 대시보드 차트 통합**
   - [ ] 내 캠핑장 예약 추세
   - [ ] 월별 매출 차트
   - [ ] 구역별 예약률

**예상 공수**: 4h

#### Day 8: 엑셀 다운로드 기능

5. **엑셀 라이브러리 설치**
   - [ ] xlsx (SheetJS) 선택
   - [ ] 설치: `npm install xlsx`
   - [ ] 타입: `npm install -D @types/xlsx`

6. **엑셀 유틸리티 함수**
   - [ ] `lib/utils/excel.ts` - 엑셀 생성 헬퍼
   - [ ] 날짜 포맷팅
   - [ ] 데이터 변환 로직

7. **다운로드 기능 구현**
   - [ ] ADMIN: 예약 내역 다운로드
   - [ ] ADMIN: 매출 리포트 다운로드
   - [ ] ADMIN: 사용자 목록 다운로드
   - [ ] OWNER: 내 캠핑장 예약 내역
   - [ ] OWNER: 매출 리포트

**예상 공수**: 3h

#### Day 9: 알림 시스템 (선택)

8. **알림 타입 정의**
   - [ ] 타입: 신고, 예약, 승인, 리뷰, 결제
   - [ ] 우선순위: HIGH, MEDIUM, LOW
   - [ ] 상태: UNREAD, READ

9. **알림 Context**
   - [ ] `contexts/NotificationContext.tsx`
   - [ ] 실시간 알림 목록 관리
   - [ ] 읽음 처리

10. **알림 UI**
    - [ ] 알림 아이콘 + 배지 (헤더)
    - [ ] 알림 드롭다운
    - [ ] 알림 페이지 (`dashboard/admin/notifications`)

11. **알림 API**
    - [ ] `getNotifications` - 알림 목록
    - [ ] `markAsRead` - 읽음 처리
    - [ ] `deleteNotification` - 삭제

**예상 공수**: 4h (선택)

**전체 예상 공수**: 7-11h  
**우선순위**: 통계 차트 > 엑셀 다운로드 > 알림 시스템

---

## API 명세

### OWNER API

#### 캠핑장 관리

```typescript
// 내 캠핑장 목록
GET /v1/campgrounds/my-owned
Response: {
  data: {
    content: Campground[];
    totalElements: number;
    totalPages: number;
  }
}

// 캠핑장 등록
POST /v1/campgrounds
Request: CreateCampgroundDto
Response: { data: Campground }

// 캠핑장 수정
PUT /v1/campgrounds/{id}
Request: UpdateCampgroundDto
Response: { data: Campground }

// 캠핑장 삭제
DELETE /v1/campgrounds/{id}
Response: { success: true }
```

#### 사이트 관리

```typescript
// 사이트 목록
GET /v1/sites/campground/{campgroundId}
Response: { data: Site[] }

// 사이트 등록
POST /v1/sites
Request: {
  campgroundId: number;
  siteNumber: string;
  siteType: SiteType;
  capacity: number;
  basePrice: number;
  amenities: Amenity[];
}
Response: { data: Site }

// 사이트 수정
PUT /v1/sites/{id}
Request: UpdateSiteDto
Response: { data: Site }

// 사이트 삭제
DELETE /v1/sites/{id}
Response: { success: true }
```

#### 예약 관리

```typescript
// 내 캠핑장 예약 목록
GET /v1/reservations/my-campgrounds
Query: {
  page?: number;
  size?: number;
  status?: ReservationStatus;
  startDate?: string;
  endDate?: string;
}
Response: {
  data: {
    content: Reservation[];
    totalElements: number;
  }
}

// 예약 상태 변경
PUT /v1/reservations/{id}/status
Request: { status: "CONFIRMED" | "CANCELLED" }
Response: { data: Reservation }
```

#### 통계

```typescript
// 내 캠핑장 통계
GET /v1/stats/my-campgrounds
Query: {
  campgroundId?: number;
  startDate?: string;
  endDate?: string;
}
Response: {
  data: {
    totalReservations: number;
    totalRevenue: number;
    averageRating: number;
    totalReviews: number;
    monthlyStats: {
      month: string;
      reservations: number;
      revenue: number;
    }[];
  }
}
```

### ADMIN API

#### 캠핑장 관리

```typescript
// 모든 캠핑장 조회
GET /v1/admin/campgrounds
Query: {
  page?: number;
  size?: number;
  status?: "PENDING" | "APPROVED" | "REJECTED";
}
Response: { data: { content: Campground[] } }

// 승인 대기 캠핑장
GET /v1/admin/campgrounds/pending
Response: { data: Campground[] }

// 캠핑장 승인/거부
PUT /v1/admin/campgrounds/{id}/approve
Request: {
  status: "APPROVED" | "REJECTED";
  reason?: string;
}
Response: { data: Campground }

// 캠핑장 강제 삭제
DELETE /v1/admin/campgrounds/{id}
Response: { success: true }
```

#### 사용자 관리

```typescript
// 사용자 목록
GET /v1/admin/users
Query: {
  page?: number;
  size?: number;
  role?: UserRole;
  status?: "ACTIVE" | "INACTIVE";
}
Response: { data: { content: User[] } }

// 사용자 상세
GET /v1/admin/users/{id}
Response: { data: User }

// 사용자 상태 변경
PUT /v1/admin/users/{id}/status
Request: { status: "ACTIVE" | "INACTIVE" }
Response: { data: User }

// 사용자 역할 변경
PUT /v1/admin/users/{id}/role
Request: { role: UserRole }
Response: { data: User }
```

#### 예약 관리

```typescript
// 모든 예약 조회
GET /v1/admin/reservations
Query: {
  page?: number;
  size?: number;
  status?: ReservationStatus;
}
Response: { data: { content: Reservation[] } }

// 예약 강제 취소
DELETE /v1/admin/reservations/{id}
Request: { reason: string }
Response: { success: true }
```

#### 신고 관리

```typescript
// 신고된 리뷰 목록
GET /v1/admin/reviews/reports
Query: {
  page?: number;
  size?: number;
  status?: "PENDING" | "APPROVED" | "REJECTED";
}
Response: {
  data: {
    content: {
      id: number;
      review: Review;
      reportReason: string;
      reportedAt: string;
      status: string;
    }[];
  }
}

// 신고 처리
PUT /v1/admin/reviews/{reviewId}/report/handle
Request: {
  action: "DELETE_REVIEW" | "REJECT_REPORT";
  reason?: string;
}
Response: { success: true }

// 리뷰 강제 삭제
DELETE /v1/admin/reviews/{id}
Response: { success: true }
```

#### 통계

```typescript
// 전체 시스템 통계
GET /v1/admin/stats
Response: {
  data: {
    totalUsers: number;
    totalCampgrounds: number;
    totalReservations: number;
    totalRevenue: number;
    pendingApprovals: number;
    reportedReviews: number;
    activeUsers: number;
    monthlyGrowth: {
      users: number;
      campgrounds: number;
      reservations: number;
    };
  }
}

// 추이 데이터
GET /v1/admin/stats/trends
Query: {
  metric: "users" | "reservations" | "revenue";
  period: "week" | "month" | "year";
}
Response: {
  data: {
    labels: string[];
    values: number[];
  }
}
```

---

## 컴포넌트 설계

### CampgroundForm

```tsx
type CampgroundFormProps = {
  campground?: Campground;
  onSubmit: (data: CampgroundFormData) => void;
  mode: "create" | "edit";
  userRole: "OWNER" | "ADMIN";
};

export function CampgroundForm({
  campground,
  onSubmit,
  mode,
  userRole,
}: CampgroundFormProps) {
  // 폼 상태 관리
  // 이미지 업로드
  // 위치 선택 (지도)
  // ADMIN 전용 필드 (승인 상태)
}
```

**주요 필드**:

- 기본 정보: 이름, 설명, 주소, 전화번호, 이메일
- 위치: 위도, 경도 (지도 선택)
- 운영 정보: 체크인/체크아웃 시간
- 사업자 정보: 사업자명, 등록번호, 관광사업등록번호
- 이미지: 썸네일 + 추가 이미지 (최대 10개)
- ADMIN 전용: 승인 상태 (PENDING/APPROVED/REJECTED)

### SiteManager

```tsx
type SiteManagerProps = {
  campgroundId: number;
  canEdit: boolean; // OWNER만 수정 가능
};

export function SiteManager({ campgroundId, canEdit }: SiteManagerProps) {
  // 사이트 목록 조회
  // 사이트 추가/수정/삭제
  // 사이트 타입, 가격, 편의시설 설정
}
```

### ReservationTable

```tsx
type ReservationTableProps = {
  reservations: Reservation[];
  onStatusChange: (id: number, status: ReservationStatus) => void;
  canEdit: boolean;
};

export function ReservationTable({
  reservations,
  onStatusChange,
  canEdit,
}: ReservationTableProps) {
  // 예약 목록 테이블
  // 필터 (날짜, 상태)
  // 상태 변경 버튼
}
```

### StatsCard

```tsx
type StatsCardProps = {
  title: string;
  value: number | string;
  change?: number; // 전월 대비 증감률
  icon?: React.ComponentType;
  onClick?: () => void;
};

export function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  onClick,
}: StatsCardProps) {
  // 통계 카드
  // 숫자 포맷팅
  // 증감률 표시 (↑↓)
}
```

### UserTable (ADMIN 전용)

```tsx
type UserTableProps = {
  users: User[];
  onStatusChange: (id: number, status: "ACTIVE" | "INACTIVE") => void;
  onRoleChange: (id: number, role: UserRole) => void;
};

export function UserTable({
  users,
  onStatusChange,
  onRoleChange,
}: UserTableProps) {
  // 사용자 목록 테이블
  // 역할별 필터
  // 상태 변경
  // 역할 변경
}
```

---

## 권한 체크

### HOC (Higher-Order Component)

```tsx
// lib/middleware/withAuth.ts
export function withOwnerAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WithOwnerAuth(props: P) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (
        !isLoading &&
        (!user || (user.role !== "OWNER" && user.role !== "ADMIN"))
      ) {
        router.push("/");
      }
    }, [user, isLoading, router]);

    if (isLoading) return <LoadingSpinner />;
    if (!user || (user.role !== "OWNER" && user.role !== "ADMIN")) return null;

    return <Component {...props} />;
  };
}

export function withAdminAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WithAdminAuth(props: P) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && (!user || user.role !== "ADMIN")) {
        router.push("/");
      }
    }, [user, isLoading, router]);

    if (isLoading) return <LoadingSpinner />;
    if (!user || user.role !== "ADMIN") return null;

    return <Component {...props} />;
  };
}
```

### 사용 예시

```tsx
// app/dashboard/owner/page.tsx
"use client";

import { withOwnerAuth } from "@/lib/middleware/withAuth";

function OwnerDashboard() {
  return <div>Owner Dashboard</div>;
}

export default withOwnerAuth(OwnerDashboard);
```

### 서버 컴포넌트 권한 체크

```tsx
// app/dashboard/owner/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

export default async function OwnerDashboard() {
  const session = await getServerSession();

  if (
    !session ||
    (session.user.role !== "OWNER" && session.user.role !== "ADMIN")
  ) {
    redirect("/");
  }

  return <div>Owner Dashboard</div>;
}
```

---

## 테스트 전략

### Unit Tests

```typescript
describe("CampgroundForm", () => {
  it("should render all fields for OWNER", () => {});
  it("should render approval status for ADMIN", () => {});
  it("should validate required fields", () => {});
  it("should call onSubmit with form data", () => {});
});

describe("SiteManager", () => {
  it("should display site list", () => {});
  it("should allow adding site when canEdit is true", () => {});
  it("should disable editing when canEdit is false", () => {});
});

describe("withOwnerAuth", () => {
  it("should redirect if user is not OWNER or ADMIN", () => {});
  it("should render component for OWNER", () => {});
  it("should render component for ADMIN", () => {});
});
```

### E2E Tests

```typescript
test.describe("OWNER Dashboard", () => {
  test("should register new campground", async ({ page }) => {
    // 로그인 (OWNER)
    // 캠핑장 등록 페이지 이동
    // 폼 작성
    // 제출
    // 목록에서 확인
  });

  test("should manage sites", async ({ page }) => {
    // 로그인
    // 사이트 관리 페이지 이동
    // 사이트 추가
    // 사이트 수정
    // 사이트 삭제
  });
});

test.describe("ADMIN Dashboard", () => {
  test("should approve pending campground", async ({ page }) => {
    // 로그인 (ADMIN)
    // 승인 대기 페이지 이동
    // 캠핑장 승인
    // 상태 확인
  });

  test("should manage users", async ({ page }) => {
    // 사용자 관리 페이지 이동
    // 사용자 상태 변경
    // 사용자 역할 변경
  });
});
```

---

## 체크리스트

### Phase 1: OWNER

- [ ] 캠핑장 목록 조회
- [ ] 캠핑장 등록
- [ ] 캠핑장 수정
- [ ] 캠핑장 삭제
- [ ] 사이트 관리
- [ ] 예약 관리
- [ ] 통계 조회
- [ ] 권한 체크
- [ ] E2E 테스트

### Phase 2: ADMIN

- [ ] 시스템 대시보드
- [ ] 모든 캠핑장 조회
- [ ] 캠핑장 승인/거부
- [ ] 사용자 관리
- [ ] 예약 관리
- [ ] 신고 리뷰 처리
- [ ] 전체 통계
- [ ] 권한 체크
- [ ] E2E 테스트

### Phase 3: 고급

- [ ] 통계 그래프
- [ ] 알림 시스템
- [ ] 감사 로그

---

## 참고 자료

- [Next.js App Router 인증](https://nextjs.org/docs/app/building-your-application/authentication)
- [React Query 권한 관리](https://tanstack.com/query/latest/docs/react/guides/window-focus-refetching)
- [RBAC 패턴](https://auth0.com/docs/manage-users/access-control/rbac)
