# 상태 관리 전략

> CampStation 상태 관리 설계 및 패턴 가이드

## 상태 분류

### 1. Server State (React Query)

**특징**:

- API에서 가져온 데이터
- 서버와 동기화 필요
- 캐싱, 재검증, 낙관적 업데이트
- 비동기 처리

**사용 시기**:

- 캠핑장 목록, 상세 정보
- 예약 목록, 예약 상세
- 리뷰 목록
- 사용자 프로필

**예시**:

```typescript
// hooks/features/useCampgrounds.ts
import { useQuery } from "@tanstack/react-query";
import { campgroundApi } from "@/lib/api/campgrounds";

export function useCampgrounds() {
  return useQuery({
    queryKey: ["campgrounds"],
    queryFn: campgroundApi.getAll,
    staleTime: 60 * 1000, // 1분
  });
}

// Usage in Component
function CampgroundList() {
  const { data, isLoading, error } = useCampgrounds();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <List items={data.content} />;
}
```

### 2. Client State (React Context)

**특징**:

- 전역 클라이언트 상태
- 여러 컴포넌트에서 공유
- 자주 변경되지 않음
- 동기 처리

**사용 시기**:

- 사용자 인증 정보
- 테마 설정 (다크/라이트 모드)
- 언어 설정
- 전역 UI 상태 (토스트, 모달)

**예시**:

```typescript
// contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { User } from "@/types/domain/user";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children, initialUser }: Props) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

// Usage
function Header() {
  const { user, logout } = useAuth();

  return (
    <header>
      {user ? (
        <button onClick={logout}>로그아웃</button>
      ) : (
        <Link href="/login">로그인</Link>
      )}
    </header>
  );
}
```

### 3. URL State (Search Params)

**특징**:

- URL에 저장되는 상태
- 공유 가능, 북마크 가능
- 브라우저 히스토리 관리
- SEO 친화적

**사용 시기**:

- 필터 (위치, 편의시설)
- 검색어
- 페이지네이션 (page, size)
- 정렬 옵션 (sortBy, order)

**예시**:

```typescript
// app/campgrounds/page.tsx
import { CampgroundsClient } from "./CampgroundsClient";

export default function CampgroundsPage({
  searchParams,
}: {
  searchParams: { page?: string; location?: string };
}) {
  const page = parseInt(searchParams.page || "1");
  const location = searchParams.location || "";

  return <CampgroundsClient initialPage={page} initialLocation={location} />;
}

// components/features/campground/CampgroundFilters.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function CampgroundFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLocationChange = (location: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("location", location);
    params.set("page", "1"); // Reset to first page

    router.push(`/campgrounds?${params.toString()}`);
  };

  return (
    <select onChange={(e) => handleLocationChange(e.target.value)}>
      <option value="">전체</option>
      <option value="서울">서울</option>
      <option value="경기">경기</option>
    </select>
  );
}
```

### 4. Local State (useState)

**특징**:

- 컴포넌트 내부 상태
- 다른 컴포넌트와 공유 불필요
- 가장 간단한 상태 관리

**사용 시기**:

- 폼 입력값
- 모달 open/close
- 탭 선택
- 토글 상태
- 임시 UI 상태

**예시**:

```typescript
"use client";

import { useState } from "react";

export function LoginForm() {
  // Local state - 이 컴포넌트에서만 사용
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="button" onClick={() => setShowPassword(!showPassword)}>
        {showPassword ? "숨기기" : "보기"}
      </button>
      <button type="submit">로그인</button>
    </form>
  );
}
```

## React Query 패턴

### Query - 데이터 조회

```typescript
// hooks/features/useCampground.ts
import { useQuery } from "@tanstack/react-query";
import { campgroundApi } from "@/lib/api/campgrounds";

export function useCampground(id: number) {
  return useQuery({
    queryKey: ["campground", id],
    queryFn: () => campgroundApi.getById(id),
    enabled: !!id, // id가 있을 때만 실행
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}

// Usage
function CampgroundDetail({ id }: Props) {
  const { data, isLoading, error, refetch } = useCampground(id);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <h1>{data.name}</h1>
      <button onClick={() => refetch()}>새로고침</button>
    </div>
  );
}
```

### Mutation - 데이터 수정

```typescript
// hooks/features/useCreateReservation.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reservationApi } from "@/lib/api/reservations";
import { useRouter } from "next/navigation";

export function useCreateReservation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: reservationApi.create,
    onSuccess: (data) => {
      // 1. 예약 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["reservations"] });

      // 2. 새 예약 상세 페이지로 이동
      router.push(`/reservations/${data.id}`);
    },
    onError: (error) => {
      console.error("Failed to create reservation:", error);
    },
  });
}

// Usage
function ReservationForm() {
  const createReservation = useCreateReservation();

  const handleSubmit = async (data: CreateReservationDto) => {
    await createReservation.mutateAsync(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={createReservation.isPending}>
        {createReservation.isPending ? "예약 중..." : "예약하기"}
      </button>
    </form>
  );
}
```

### Optimistic Updates - React 19

```typescript
// hooks/features/useReservations.ts
"use client";

import { useOptimistic } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reservationApi } from "@/lib/api/reservations";
import type { Reservation } from "@/types/domain/reservation";

export function useReservations() {
  const queryClient = useQueryClient();

  // Query
  const { data, isLoading, error } = useQuery({
    queryKey: ["reservations"],
    queryFn: reservationApi.getUserReservations,
  });

  // Optimistic state
  const [optimisticReservations, updateOptimistic] = useOptimistic<
    Reservation[],
    number
  >(data?.content || [], (state, cancelledId) => {
    return state.map((r) =>
      r.id === cancelledId ? { ...r, status: "CANCELLED" } : r
    );
  });

  // Mutation
  const cancelMutation = useMutation({
    mutationFn: reservationApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
  });

  // Cancel with optimistic update
  const cancelReservation = async (id: number) => {
    // 즉시 UI 업데이트
    updateOptimistic(id);

    try {
      await cancelMutation.mutateAsync(id);
    } catch (error) {
      // 실패 시 자동 롤백
      console.error("Failed to cancel:", error);
    }
  };

  return {
    reservations: optimisticReservations,
    isLoading,
    error,
    cancelReservation,
    isCancelling: cancelMutation.isPending,
  };
}
```

### Pagination

```typescript
// hooks/features/useCampgroundsPagination.ts
import { useQuery } from "@tanstack/react-query";
import { campgroundApi } from "@/lib/api/campgrounds";
import { useSearchParams, useRouter } from "next/navigation";

export function useCampgroundsPagination() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const size = parseInt(searchParams.get("size") || "10");

  const { data, isLoading, error } = useQuery({
    queryKey: ["campgrounds", { page, size }],
    queryFn: () => campgroundApi.getAll({ page, size }),
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  });

  const setPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`/campgrounds?${params.toString()}`);
  };

  return {
    data: data?.content || [],
    totalPages: data?.totalPages || 0,
    currentPage: page,
    isLoading,
    error,
    setPage,
  };
}

// Usage
function CampgroundList() {
  const { data, currentPage, totalPages, setPage, isLoading } =
    useCampgroundsPagination();

  return (
    <div>
      <List items={data} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
```

### Infinite Scroll

```typescript
// hooks/features/useCampgroundsInfinite.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import { campgroundApi } from "@/lib/api/campgrounds";

export function useCampgroundsInfinite() {
  return useInfiniteQuery({
    queryKey: ["campgrounds", "infinite"],
    queryFn: ({ pageParam = 1 }) =>
      campgroundApi.getAll({ page: pageParam, size: 10 }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined; // No more pages
    },
    initialPageParam: 1,
  });
}

// Usage
function InfiniteCampgroundList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useCampgroundsInfinite();

  const campgrounds = data?.pages.flatMap((page) => page.content) || [];

  return (
    <div>
      <List items={campgrounds} />
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? "로딩 중..." : "더 보기"}
        </button>
      )}
    </div>
  );
}
```

## Context 패턴

### Toast Context

```typescript
// contexts/ToastContext.tsx
"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type Toast = {
  id: string;
  message: string;
  type: "success" | "error" | "info";
};

type ToastContextValue = {
  toasts: Toast[];
  showToast: (message: string, type: Toast["type"]) => void;
  hideToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // React Compiler가 자동으로 메모이제이션하므로 useCallback 불필요
  const showToast = (message: string, type: Toast["type"]) => {
    const id = Math.random().toString(36);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto hide after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const hideToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

// Usage
function SaveButton() {
  const { showToast } = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      showToast("저장되었습니다", "success");
    } catch (error) {
      showToast("저장에 실패했습니다", "error");
    }
  };

  return <button onClick={handleSave}>저장</button>;
}
```

## 상태 선택 기준

### 결정 트리

```
데이터가 API에서 오는가?
  ├─ YES → React Query (Server State)
  └─ NO → 여러 컴포넌트에서 사용하는가?
          ├─ YES → URL로 공유 가능한가?
          │       ├─ YES → Search Params (URL State)
          │       └─ NO → Context (Client State)
          └─ NO → useState (Local State)
```

### 예시

```typescript
// ✅ React Query - API 데이터
const { data } = useQuery({
  queryKey: ["campgrounds"],
  queryFn: campgroundApi.getAll,
});

// ✅ Context - 전역 클라이언트 상태
const { user } = useAuth();

// ✅ URL State - 공유 가능한 필터/페이지
const searchParams = useSearchParams();
const page = searchParams.get("page");

// ✅ Local State - 컴포넌트 내부 UI
const [isOpen, setIsOpen] = useState(false);
```

## 베스트 프랙티스

### 1. 상태 최소화

```typescript
// ❌ Bad - 파생 상태를 별도로 관리
const [users, setUsers] = useState([]);
const [activeUsers, setActiveUsers] = useState([]);

useEffect(() => {
  setActiveUsers(users.filter((u) => u.isActive));
}, [users]);

// ✅ Good - 파생 상태는 계산으로
const [users, setUsers] = useState([]);
const activeUsers = users.filter((u) => u.isActive);
```

### 2. 상태 끌어올리기 (Lifting State Up)

```typescript
// ❌ Bad - 각 컴포넌트가 독립적으로 관리
function FilterA() {
  const [filter, setFilter] = useState("");
  // ...
}

function FilterB() {
  const [filter, setFilter] = useState("");
  // ...
}

// ✅ Good - 부모에서 관리
function FiltersContainer() {
  const [filters, setFilters] = useState({});

  return (
    <>
      <FilterA filter={filters.a} onChange={(v) => setFilters({ ...filters, a: v })} />
      <FilterB filter={filters.b} onChange={(v) => setFilters({ ...filters, b: v })} />
    </>
  );
}
```

### 3. React Query 캐시 활용

```typescript
// ✅ Good - queryKey로 캐시 공유
// Component A
const { data } = useQuery({
  queryKey: ["campground", id],
  queryFn: () => campgroundApi.getById(id),
});

// Component B (same queryKey → cache hit)
const { data } = useQuery({
  queryKey: ["campground", id],
  queryFn: () => campgroundApi.getById(id),
});
```

### 4. Context 오버헤드 주의

```typescript
// ❌ Bad - 자주 변경되는 상태를 Context에
const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
// 모든 하위 컴포넌트 re-render

// ✅ Good - 자주 변경되는 상태는 로컬에
function Component() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  // 이 컴포넌트만 re-render
}
```

### 5. useOptimistic으로 UX 개선

```typescript
// ✅ Good - 즉시 UI 반영
const [optimisticItems, updateOptimistic] = useOptimistic(
  items,
  (state, newItem) => [...state, newItem]
);

async function handleAdd(item) {
  updateOptimistic(item); // 즉시 UI 업데이트
  await api.add(item); // 서버 요청
}
```

## 요약

| 상태 종류    | 도구          | 사용 시기            | 예시                   |
| ------------ | ------------- | -------------------- | ---------------------- |
| Server State | React Query   | API 데이터           | 캠핑장 목록, 예약 내역 |
| Client State | Context       | 전역 클라이언트 상태 | 사용자 정보, 테마      |
| URL State    | Search Params | 공유 가능한 상태     | 필터, 페이지네이션     |
| Local State  | useState      | 컴포넌트 내부        | 모달, 폼 입력          |

**핵심 원칙**:

1. API 데이터는 React Query
2. 전역 상태는 Context (최소화)
3. URL 공유 가능하면 Search Params
4. 나머지는 useState (Local State)
5. useOptimistic으로 UX 개선
