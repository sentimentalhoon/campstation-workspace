# 아키텍처 원칙

> CampStation 프론트엔드 아키텍처 설계 원칙

## 핵심 기술 스택

### 프레임워크
- **Next.js 16**: App Router, React Server Components
- **React 19**: useOptimistic, useTransition, React Compiler
- **TypeScript 5+**: Strict mode 활성화

### 스타일링
- **Tailwind CSS 4**: 유틸리티 퍼스트 CSS
- **CSS Variables**: 테마 시스템

### 상태 관리
- **React Query (TanStack Query)**: 서버 상태 관리
- **React Context**: 전역 클라이언트 상태 (인증, 테마)
- **URL State**: 필터, 페이지네이션 등

### 데이터 통신
- **Fetch API**: Native fetch with TypeScript
- **Server Actions**: Form 처리
- **React Query**: 캐싱, 재검증, 낙관적 업데이트

## 아키텍처 패턴

### 1. Server-First Architecture

#### 원칙
- **기본은 Server Component**: 모든 컴포넌트는 기본적으로 Server Component
- **필요한 경우만 Client**: 인터랙션, 상태, 브라우저 API 필요시에만 `"use client"`
- **데이터는 서버에서**: 가능한 모든 데이터 fetching은 서버에서

#### Server Component 사용 기준
```typescript
// ✅ Server Component 사용
- SEO가 중요한 페이지
- 데이터베이스 직접 조회
- 민감한 정보 처리 (API keys, secrets)
- 큰 의존성 라이브러리 사용
- 정적 콘텐츠

// ❌ Client Component로 전환 필요
- useState, useEffect 등 React 훅 사용
- 브라우저 API (localStorage, window)
- 이벤트 리스너 (onClick, onChange)
- 애니메이션, 인터랙션
- Context 사용 (useContext)
```

#### 컴포넌트 분리 패턴
```typescript
// app/campgrounds/page.tsx - Server Component
export default async function CampgroundsPage() {
  const campgrounds = await campgroundApi.getAll();

  return <CampgroundsClient initialData={campgrounds} />;
}

// components/features/campground/CampgroundsClient.tsx - Client Component
"use client";

export function CampgroundsClient({ initialData }: Props) {
  const [filters, setFilters] = useState({});

  return (
    <div>
      <Filters onChange={setFilters} />
      <CampgroundList data={initialData} filters={filters} />
    </div>
  );
}
```

### 2. API Layer 아키텍처

#### 3-Tier 구조
```
Page (Server Component)
    ↓
API Client (lib/api/)
    ↓
Backend API (Spring Boot)
```

#### API Client 패턴
```typescript
// lib/api/client.ts - Base client
export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorResponse(response));
  }

  return response.json();
}

// lib/api/campgrounds.ts - Feature-specific API
export const campgroundApi = {
  getAll: (params?: CampgroundSearchParams) =>
    apiClient<Campground[]>('/v1/campgrounds', { params }),

  getById: (id: number) =>
    apiClient<Campground>(`/v1/campgrounds/${id}`),

  create: (data: CreateCampgroundDto) =>
    apiClient<Campground>('/v1/campgrounds', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
```

### 3. 상태 관리 전략

#### 상태 분류
```typescript
// 1. Server State (React Query)
// - API에서 가져온 데이터
// - 캐싱, 재검증 필요
const { data, isLoading } = useQuery({
  queryKey: ['campgrounds', filters],
  queryFn: () => campgroundApi.getAll(filters),
});

// 2. Client State (Context)
// - 사용자 인증 정보
// - 테마 설정
// - 전역 UI 상태
const { user, isAuthenticated } = useAuth();

// 3. URL State (Search Params)
// - 필터, 검색어
// - 페이지네이션
// - 정렬 옵션
const searchParams = useSearchParams();
const page = searchParams.get('page') || '1';

// 4. Local State (useState)
// - 컴포넌트 내부 UI 상태
// - 폼 입력값
// - 모달 open/close
const [isOpen, setIsOpen] = useState(false);
```

#### React Query 기본 설정
```typescript
// lib/query/client.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,        // 1분
      gcTime: 5 * 60 * 1000,       // 5분 (cacheTime → gcTime in v5)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

### 4. 에러 처리 전략

#### 계층별 에러 처리
```typescript
// 1. API Layer - 에러 감지 및 변환
async function apiClient<T>(endpoint: string) {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new ApiError(response.status, await parseError(response));
    }
    return response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new NetworkError('네트워크 오류가 발생했습니다.');
  }
}

// 2. Hook Layer - 에러 상태 관리
function useCampgrounds() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['campgrounds'],
    queryFn: campgroundApi.getAll,
    throwOnError: false, // 에러를 throw하지 않고 error 상태로 관리
  });

  return { data, error, isLoading };
}

// 3. Component Layer - UI 에러 표시
function CampgroundsPage() {
  const { data, error } = useCampgrounds();

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return <CampgroundList data={data} />;
}

// 4. Error Boundary - 예상치 못한 에러
// app/error.tsx
export default function Error({ error, reset }: ErrorProps) {
  return (
    <div>
      <h2>오류가 발생했습니다</h2>
      <button onClick={reset}>다시 시도</button>
    </div>
  );
}
```

### 5. 타입 안전성

#### 엔드투엔드 타입 안전성
```typescript
// types/domain/campground.ts - 도메인 모델
export type Campground = {
  id: number;
  name: string;
  location: Location;
  amenities: Amenity[];
  createdAt: string;
};

// types/api/response.ts - API 응답 타입
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

// lib/api/campgrounds.ts - API 함수 (타입 추론)
export const campgroundApi = {
  getAll: () => apiClient<Campground[]>('/v1/campgrounds'),
  //                       ^^^^^^^^^^^^^ 타입 명시
};

// hooks/features/useCampgrounds.ts - 훅 (타입 자동 추론)
export function useCampgrounds() {
  return useQuery({
    queryKey: ['campgrounds'],
    queryFn: campgroundApi.getAll,
    // data는 자동으로 Campground[] 타입
  });
}

// components/features/campground/CampgroundList.tsx - 컴포넌트
export function CampgroundList({ data }: { data: Campground[] }) {
  //                                              ^^^^^^^^^^^^^ 타입 안전
  return data.map((campground) => (
    <CampgroundCard key={campground.id} campground={campground} />
  ));
}
```

### 6. 성능 최적화 전략

#### React 19 최적화 기능
```typescript
// 1. React Compiler - 자동 메모이제이션
// useMemo, useCallback 불필요 (대부분의 경우)
function CampgroundList({ data, filters }: Props) {
  // React Compiler가 자동으로 최적화
  const filteredData = data.filter(item => item.location === filters.location);

  return <List data={filteredData} />;
}

// 2. useOptimistic - 낙관적 업데이트
function ReservationCard({ reservation }: Props) {
  const [optimisticReservation, setOptimisticReservation] = useOptimistic(
    reservation,
    (state, action) => ({ ...state, status: action.status })
  );

  async function handleCancel() {
    setOptimisticReservation({ status: 'CANCELLED' });
    await reservationApi.cancel(reservation.id);
  }

  return <Card reservation={optimisticReservation} onCancel={handleCancel} />;
}

// 3. useTransition - 비블로킹 업데이트
function CampgroundFilters() {
  const [isPending, startTransition] = useTransition();

  function handleFilterChange(filters: Filters) {
    startTransition(() => {
      setFilters(filters); // 이 업데이트는 비블로킹
    });
  }

  return <Filters onChange={handleFilterChange} isPending={isPending} />;
}
```

#### Next.js 성능 최적화
```typescript
// 1. Streaming & Suspense
export default function CampgroundPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CampgroundDetail />
    </Suspense>
  );
}

// 2. Parallel Data Fetching
async function CampgroundDetailPage({ params }: Props) {
  // 병렬로 데이터 fetch
  const [campground, reviews] = await Promise.all([
    campgroundApi.getById(params.id),
    reviewApi.getByCampgroundId(params.id),
  ]);

  return (
    <div>
      <CampgroundDetail campground={campground} />
      <ReviewList reviews={reviews} />
    </div>
  );
}

// 3. Image Optimization
import Image from 'next/image';

<Image
  src={campground.imageUrl}
  alt={campground.name}
  width={640}
  height={480}
  placeholder="blur"
  priority // Above the fold images
/>
```

### 7. 보안 원칙

#### 인증 토큰 관리
```typescript
// ✅ 올바른 방법: HttpOnly Cookie (서버에서 관리)
// - XSS 공격으로부터 안전
// - CSRF 보호 (SameSite cookie)

// ❌ 잘못된 방법: localStorage, sessionStorage
// - XSS 공격에 취약
// - 절대 사용 금지
```

#### 민감한 정보 처리
```typescript
// ✅ Server Component에서 처리
async function CampgroundDetailPage({ params }: Props) {
  const apiKey = process.env.NAVER_MAP_SECRET; // 서버에서만 접근
  const data = await fetchWithSecret(apiKey);
  return <CampgroundDetail data={data} />;
}

// ❌ Client Component에서 노출
"use client";
function Map() {
  const apiKey = process.env.NEXT_PUBLIC_API_KEY; // 브라우저에 노출됨!
}
```

## 폴더별 역할

### `/app` - 라우팅 & 페이지
- Next.js App Router
- 페이지 구성만 담당
- 비즈니스 로직 최소화
- Server Component 우선

### `/components` - UI 컴포넌트
- 재사용 가능한 컴포넌트
- ui: 순수 UI, features: 비즈니스 로직 포함
- Props 기반 제어
- 테스트 가능하도록 설계

### `/hooks` - 비즈니스 로직
- 재사용 가능한 로직
- React Query hooks
- 커스텀 훅
- 순수 함수 로직

### `/lib` - 핵심 라이브러리
- API 클라이언트
- 유틸리티 함수
- 서버 전용 코드
- 설정 및 상수

### `/types` - 타입 정의
- TypeScript 타입
- 도메인 모델
- API 타입
- UI Props 타입

## 개발 워크플로우

### 새로운 기능 추가 시
1. **타입 정의** (`types/domain/`)
2. **API 함수** (`lib/api/`)
3. **커스텀 훅** (`hooks/features/`)
4. **UI 컴포넌트** (`components/features/`)
5. **페이지 통합** (`app/`)

### 예시: 리뷰 기능 추가
```typescript
// 1. types/domain/review.ts
export type Review = {
  id: number;
  rating: number;
  comment: string;
};

// 2. lib/api/reviews.ts
export const reviewApi = {
  getAll: (campgroundId: number) =>
    apiClient<Review[]>(`/v1/reviews?campgroundId=${campgroundId}`),
};

// 3. hooks/features/useReviews.ts
export function useReviews(campgroundId: number) {
  return useQuery({
    queryKey: ['reviews', campgroundId],
    queryFn: () => reviewApi.getAll(campgroundId),
  });
}

// 4. components/features/review/ReviewList.tsx
export function ReviewList({ campgroundId }: Props) {
  const { data, isLoading } = useReviews(campgroundId);
  if (isLoading) return <LoadingSpinner />;
  return <List items={data} />;
}

// 5. app/campgrounds/[id]/page.tsx
export default async function CampgroundPage({ params }: Props) {
  return <ReviewList campgroundId={params.id} />;
}
```

## 핵심 원칙 요약

1. **Server-First**: 기본은 Server Component, 필요시에만 Client
2. **타입 안전성**: 엔드투엔드 TypeScript 타입 안전성
3. **계층 분리**: Page → Hook → API → Backend
4. **성능 우선**: React 19 + Next.js 16 최신 기능 활용
5. **보안 강화**: HttpOnly Cookie, Server-side secrets
6. **에러 처리**: 계층별 명확한 에러 처리
7. **테스트 가능**: 순수 함수, Props 기반 설계
