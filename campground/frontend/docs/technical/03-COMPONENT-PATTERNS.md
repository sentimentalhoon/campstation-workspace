# 컴포넌트 패턴

> CampStation 컴포넌트 설계 및 작성 가이드

## 컴포넌트 분류

### 1. UI Components (`components/ui/`)

**특징**:

- 순수 UI 컴포넌트
- 비즈니스 로직 없음
- Props로만 제어
- 재사용 가능
- Storybook 문서화 가능

**예시**:

```typescript
// components/ui/Button.tsx
type ButtonProps = {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
};

export function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  children,
  onClick,
}: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-full font-semibold transition",
        variantStyles[variant],
        sizeStyles[size],
        disabled && "opacity-50 cursor-not-allowed",
        loading && "cursor-wait"
      )}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}

const variantStyles = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary: "bg-secondary text-foreground hover:bg-secondary-hover",
  danger: "bg-error text-white hover:bg-error-hover",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};
```

### 2. Layout Components (`components/layout/`)

**특징**:

- 페이지 구조 정의
- 네비게이션, 헤더, 푸터
- Client Component (인터랙션 필요)

**예시**:

```typescript
// components/layout/Header.tsx
"use client";

import { useAuth } from "@/hooks/auth/useAuth";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[640px] items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          CampStation
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/campgrounds">캠핑장</Link>
          <Link href="/map">지도</Link>

          {user ? (
            <>
              <Link href="/reservations">예약</Link>
              <Button variant="secondary" size="sm" onClick={logout}>
                로그아웃
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="primary" size="sm">
                로그인
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
```

### 3. Feature Components (`components/features/`)

**특징**:

- 특정 기능에 종속
- 비즈니스 로직 포함
- 훅 사용 가능
- Client Component 가능

**예시**:

```typescript
// components/features/campground/CampgroundCard.tsx
"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Campground } from "@/types/domain/campground";
import Image from "next/image";
import Link from "next/link";

type CampgroundCardProps = {
  campground: Campground;
  onFavorite?: (id: number) => void;
};

export function CampgroundCard({ campground, onFavorite }: CampgroundCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    onFavorite?.(campground.id);
  };

  return (
    <Link href={`/campgrounds/${campground.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition">
        <div className="relative h-48">
          <Image
            src={campground.imageUrl}
            alt={campground.name}
            fill
            className="object-cover group-hover:scale-105 transition"
          />
          {onFavorite && (
            <button
              onClick={handleFavoriteClick}
              className="absolute top-2 right-2 rounded-full bg-white/80 p-2"
            >
              ❤️
            </button>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-lg font-bold">{campground.name}</h3>
          <p className="text-sm text-foreground-secondary">{campground.location}</p>

          <div className="mt-2 flex flex-wrap gap-1">
            {campground.amenities.slice(0, 3).map((amenity) => (
              <Badge key={amenity} variant="secondary" size="sm">
                {amenity}
              </Badge>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xl font-bold text-primary">
              ₩{campground.price.toLocaleString()}
            </span>
            <span className="text-sm text-foreground-secondary">/ 1박</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
```

## Server vs Client Component

### Server Component (기본)

**사용 시기**:

- 데이터 fetching
- SEO 중요
- 상태 관리 불필요
- 인터랙션 없음

```typescript
// app/campgrounds/page.tsx
import { campgroundApi } from "@/lib/api/campgrounds";
import { CampgroundList } from "@/components/features/campground/CampgroundList";

export default async function CampgroundsPage() {
  // Server에서 데이터 fetch
  const campgrounds = await campgroundApi.getAll();

  return (
    <div>
      <h1>캠핑장 목록</h1>
      <CampgroundList campgrounds={campgrounds} />
    </div>
  );
}
```

### Client Component

**사용 시기**:

- useState, useEffect 등 React 훅
- 이벤트 리스너 (onClick, onChange)
- 브라우저 API (localStorage, window)
- Context 사용

```typescript
// components/features/campground/CampgroundFilters.tsx
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";

type FiltersProps = {
  onFilterChange: (filters: Filters) => void;
};

export function CampgroundFilters({ onFilterChange }: FiltersProps) {
  const [filters, setFilters] = useState<Filters>({});
  const [isPending, startTransition] = useTransition();

  const handleApply = () => {
    startTransition(() => {
      onFilterChange(filters);
    });
  };

  return (
    <div>
      {/* Filter UI */}
      <Button onClick={handleApply} loading={isPending}>
        적용
      </Button>
    </div>
  );
}
```

### Hybrid Pattern (권장)

Server Component로 데이터 fetch → Client Component로 전달

```typescript
// app/campgrounds/page.tsx - Server Component
import { campgroundApi } from "@/lib/api/campgrounds";
import { CampgroundsClient } from "@/components/features/campground/CampgroundsClient";

export default async function CampgroundsPage() {
  const initialData = await campgroundApi.getAll();

  return <CampgroundsClient initialData={initialData} />;
}

// components/features/campground/CampgroundsClient.tsx - Client Component
"use client";

import { useState } from "react";
import { CampgroundList } from "./CampgroundList";
import { CampgroundFilters } from "./CampgroundFilters";
import type { Campground } from "@/types/domain/campground";

type Props = {
  initialData: Campground[];
};

export function CampgroundsClient({ initialData }: Props) {
  const [filters, setFilters] = useState({});
  const [data, setData] = useState(initialData);

  return (
    <div>
      <CampgroundFilters onFilterChange={setFilters} />
      <CampgroundList campgrounds={data} />
    </div>
  );
}
```

## React 19 패턴

### 1. useOptimistic - 낙관적 업데이트

```typescript
"use client";

import { useOptimistic } from "react";
import { reservationApi } from "@/lib/api/reservations";
import type { Reservation } from "@/types/domain/reservation";

type Props = {
  reservation: Reservation;
};

export function ReservationCard({ reservation }: Props) {
  const [optimisticReservation, updateOptimisticReservation] = useOptimistic(
    reservation,
    (state, update: Partial<Reservation>) => ({ ...state, ...update })
  );

  async function handleCancel() {
    // 즉시 UI 업데이트 (낙관적)
    updateOptimisticReservation({ status: "CANCELLED" });

    try {
      await reservationApi.cancel(reservation.id);
    } catch (error) {
      // 실패 시 자동 롤백
      console.error("Failed to cancel:", error);
    }
  }

  return (
    <div>
      <h3>{optimisticReservation.campgroundName}</h3>
      <Badge>{optimisticReservation.status}</Badge>
      <Button onClick={handleCancel}>예약 취소</Button>
    </div>
  );
}
```

### 2. useTransition - 비블로킹 업데이트

```typescript
"use client";

import { useState, useTransition } from "react";

export function CampgroundSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);

    // 비블로킹 업데이트 (UI가 멈추지 않음)
    startTransition(async () => {
      const data = await searchCampgrounds(newQuery);
      setResults(data);
    });
  };

  return (
    <div>
      <Input
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="캠핑장 검색..."
      />

      {isPending && <LoadingIndicator />}
      <ResultList results={results} />
    </div>
  );
}
```

### 3. React 19 Compiler - 자동 메모이제이션 ⚡

**우리 프로젝트는 React 19 Compiler를 사용합니다!**

React Compiler가 자동으로 최적화하므로 `useMemo`, `useCallback`, `React.memo`를 수동으로 사용하지 마세요.

```typescript
// ❌ React 18 스타일 - 수동 메모이제이션 (사용하지 마세요!)
import { useMemo, useCallback } from "react";

function CampgroundList({ campgrounds, filters }: Props) {
  const filteredData = useMemo(() => {
    return campgrounds.filter(c => c.location === filters.location);
  }, [campgrounds, filters.location]);

  const handleClick = useCallback((id: number) => {
    console.log(id);
  }, []);

  return <List data={filteredData} onClick={handleClick} />;
}

// ✅ React 19 스타일 - Compiler가 자동 최적화 (권장!)
function CampgroundList({ campgrounds, filters }: Props) {
  // React Compiler가 필요시 자동으로 메모이제이션
  const filteredData = campgrounds.filter(c => c.location === filters.location);

  const handleClick = (id: number) => {
    console.log(id);
  };

  return <List data={filteredData} onClick={handleClick} />;
}

// ✅ 컴포넌트 메모이제이션도 자동
function CampgroundCard({ campground }: Props) {
  return <div>{campground.name}</div>;
}
// React Compiler가 자동으로 React.memo 적용
```

**예외 (극히 드문 경우)**:

```typescript
// useEffect 의존성 배열에 함수가 필요한 경우만
function Component() {
  const stableFunction = useCallback(() => {
    // ...
  }, []);

  useEffect(() => {
    stableFunction();
  }, [stableFunction]);
}

// ⚠️ 예외: useEffect 의존성에 함수가 있는 경우에는 useCallback 여전히 필요
function Component() {
  const fetchData = useCallback(async () => {
    // ...
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]); // 의존성 배열에 함수
}
```

## 컴포넌트 컴포지션 패턴

### Compound Components

```typescript
// components/ui/Card.tsx
export function Card({ children, className }: CardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-6", className)}>
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children }: Props) {
  return <div className="mb-4 border-b pb-4">{children}</div>;
};

Card.Body = function CardBody({ children }: Props) {
  return <div className="mb-4">{children}</div>;
};

Card.Footer = function CardFooter({ children }: Props) {
  return <div className="mt-4 border-t pt-4">{children}</div>;
};

// Usage
<Card>
  <Card.Header>
    <h2>Title</h2>
  </Card.Header>
  <Card.Body>
    <p>Content</p>
  </Card.Body>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>
```

### Render Props Pattern

```typescript
type DataLoaderProps<T> = {
  queryKey: string[];
  queryFn: () => Promise<T>;
  children: (data: T, isLoading: boolean, error: Error | null) => ReactNode;
};

export function DataLoader<T>({ queryKey, queryFn, children }: DataLoaderProps<T>) {
  const { data, isLoading, error } = useQuery({ queryKey, queryFn });

  return children(data as T, isLoading, error);
}

// Usage
<DataLoader
  queryKey={["campgrounds"]}
  queryFn={campgroundApi.getAll}
>
  {(data, isLoading, error) => {
    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorMessage error={error} />;
    return <CampgroundList campgrounds={data} />;
  }}
</DataLoader>
```

### Higher-Order Component (HOC) - 사용 자제

```typescript
// ❌ 권장하지 않음 (Hook으로 대체)
function withAuth(Component: React.ComponentType) {
  return function AuthComponent(props: any) {
    const { user } = useAuth();
    if (!user) return <LoginPrompt />;
    return <Component {...props} />;
  };
}

// ✅ Hook 또는 Client Component로 대체
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!user) return <LoginPrompt />;

  return <>{children}</>;
}

// Usage
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

## 폼 패턴

### Controlled Components

```typescript
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = "이메일을 입력하세요";
    if (!password) newErrors.password = "비밀번호를 입력하세요";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit
    try {
      await login({ email, password });
    } catch (error) {
      setErrors({ form: "로그인에 실패했습니다" });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        placeholder="이메일"
      />
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        placeholder="비밀번호"
      />
      {errors.form && <ErrorMessage>{errors.form}</ErrorMessage>}
      <Button type="submit">로그인</Button>
    </form>
  );
}
```

### React Hook Form (권장)

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("올바른 이메일을 입력하세요"),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    await login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        {...register("email")}
        type="email"
        error={errors.email?.message}
        placeholder="이메일"
      />
      <Input
        {...register("password")}
        type="password"
        error={errors.password?.message}
        placeholder="비밀번호"
      />
      <Button type="submit" loading={isSubmitting}>
        로그인
      </Button>
    </form>
  );
}
```

## 에러 처리 패턴

### Error Boundary

```typescript
// app/error.tsx (Next.js Route Error Boundary)
"use client";

import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="mb-4 text-2xl font-bold">오류가 발생했습니다</h2>
      <p className="mb-4 text-foreground-secondary">{error.message}</p>
      <Button onClick={reset}>다시 시도</Button>
    </div>
  );
}
```

### Component-level Error Handling

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export function CampgroundList() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["campgrounds"],
    queryFn: campgroundApi.getAll,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data || data.length === 0) return <EmptyState />;

  return (
    <div>
      {data.map((campground) => (
        <CampgroundCard key={campground.id} campground={campground} />
      ))}
    </div>
  );
}
```

## 베스트 프랙티스

1. **Single Responsibility**: 컴포넌트는 하나의 역할만
2. **Props 최소화**: 필요한 Props만 전달
3. **Early Return**: 로딩/에러 상태 먼저 처리
4. **컴포넌트 분리**: 200줄 이상이면 분리 고려
5. **타입 안전성**: 모든 Props 명시적 타입
6. **Server First**: 기본은 Server Component
7. **Composition**: 작은 컴포넌트 조합
8. **React 19 활용**: useOptimistic, useTransition 적극 활용
