# API 통합 가이드

> Frontend와 Backend API 통합 및 사용 가이드

## 📋 목차

1. [API 구조](#api-구조)
2. [인증 시스템](#인증-시스템)
3. [API 클라이언트](#api-클라이언트)
4. [React Query 통합](#react-query-통합)
5. [에러 처리](#에러-처리)
6. [캐싱 전략](#캐싱-전략)
7. [베스트 프랙티스](#베스트-프랙티스)

---

## 🏗️ API 구조

### Base URL

```typescript
// 환경별 API URL
const API_URLS = {
  development: "http://localhost:8080",
  production: "https://api.campstation.com",
  docker: "http://backend:8080",
};

// 현재 환경의 API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || API_URLS.development;
```

### API 버전 관리

모든 API는 `/v1` 접두사를 사용합니다:

```
https://api.campstation.com/v1/campgrounds
https://api.campstation.com/v1/reservations
https://api.campstation.com/v1/reviews
```

---

## 🔐 인증 시스템

### JWT 토큰 기반 인증

```typescript
// lib/api/client.ts
import axios from "axios";

const client = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터: 토큰 자동 추가
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 응답 인터셉터: 401 처리
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 재발급 또는 로그아웃
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);
```

### 인증 API

```typescript
// lib/api/auth.ts
export const authApi = {
  // 로그인
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const { data } = await client.post("/v1/auth/login", credentials);

    // 토큰 저장
    localStorage.setItem("accessToken", data.data.accessToken);

    return data;
  },

  // 회원가입
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const { data } = await client.post("/v1/auth/register", userData);
    return data;
  },

  // 로그아웃
  logout: async (): Promise<void> => {
    await client.post("/v1/auth/logout");
    localStorage.removeItem("accessToken");
  },

  // 현재 사용자 정보
  me: async (): Promise<UserResponse> => {
    const { data } = await client.get("/v1/auth/me");
    return data;
  },
};
```

---

## 🔌 API 클라이언트

### 모든 API 모듈

```typescript
// lib/api/index.ts
export { authApi } from "./auth";
export { campgroundApi } from "./campgrounds";
export { reservationApi } from "./reservations";
export { reviewApi } from "./reviews";
export { favoriteApi } from "./favorites";
export { imageApi } from "./images";
export { paymentApi } from "./payment";
```

### 캠핑장 API 예시

```typescript
// lib/api/campgrounds.ts
export const campgroundApi = {
  // 목록 조회 (페이지네이션)
  getList: async (params: CampgroundSearchParams): Promise<CampgroundListResponse> => {
    const { data } = await client.get('/v1/campgrounds', { params });
    return data;
  },

  // 상세 조회
  getById: async (id: number): Promise<CampgroundDetailResponse> => {
    const { data } = await client.get(\`/v1/campgrounds/\${id}\`);
    return data;
  },

  // 검색
  search: async (query: string, filters: CampgroundFilters): Promise<CampgroundListResponse> => {
    const { data } = await client.get('/v1/campgrounds/search', {
      params: { query, ...filters }
    });
    return data;
  },

  // 좌표 기반 검색
  searchByLocation: async (lat: number, lng: number, radius: number): Promise<CampgroundListResponse> => {
    const { data } = await client.get('/v1/campgrounds', {
      params: { lat, lng, radius }
    });
    return data;
  },
};
```

---

## ⚛️ React Query 통합

### Custom Hook 패턴

```typescript
// hooks/useCampgrounds.ts
import { useQuery } from "@tanstack/react-query";
import { campgroundApi } from "@/lib/api";

export const useCampgrounds = (params: CampgroundSearchParams) => {
  return useQuery({
    queryKey: ["campgrounds", params],
    queryFn: () => campgroundApi.getList(params),
    // 캐싱 전략
    staleTime: 10 * 60 * 1000, // 10분
    gcTime: 15 * 60 * 1000, // 15분
    refetchOnWindowFocus: false,
  });
};

export const useCampground = (id: number) => {
  return useQuery({
    queryKey: ["campgrounds", id],
    queryFn: () => campgroundApi.getById(id),
    enabled: !!id, // id가 있을 때만 실행
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
```

### Mutation Hook 패턴

```typescript
// hooks/useReservations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reservationApi } from "@/lib/api";

export const useCreateReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reservationApi.create,
    onSuccess: (data) => {
      // 예약 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["reservations"] });

      // 성공 메시지
      toast.success("예약이 완료되었습니다");
    },
    onError: (error) => {
      // 에러 처리
      if (error instanceof ApiError) {
        toast.error(error.message);
      }
    },
  });
};
```

### 낙관적 업데이트 (Optimistic Update)

```typescript
// hooks/useFavorites.ts
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: favoriteApi.toggle,
    // 낙관적 업데이트
    onMutate: async (campgroundId) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: ["favorites"] });

      // 이전 데이터 백업
      const previousFavorites = queryClient.getQueryData(["favorites"]);

      // UI 즉시 업데이트
      queryClient.setQueryData(["favorites"], (old) => {
        // 찜 상태 토글 로직
        return optimisticToggle(old, campgroundId);
      });

      // 롤백용 컨텍스트 반환
      return { previousFavorites };
    },
    // 에러 시 롤백
    onError: (err, variables, context) => {
      queryClient.setQueryData(["favorites"], context.previousFavorites);
      toast.error("찜하기 실패");
    },
    // 성공 시 최신 데이터로 갱신
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
};
```

---

## ⚠️ 에러 처리

### API 에러 클래스

```typescript
// lib/api/errors.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }

  static fromResponse(error: AxiosError): ApiError {
    const status = error.response?.status || 500;
    const data = error.response?.data as ErrorResponse;

    return new ApiError(
      status,
      data?.code || "UNKNOWN_ERROR",
      data?.message || "알 수 없는 오류가 발생했습니다",
      data?.details
    );
  }

  // 사용자에게 표시할 메시지
  get userMessage(): string {
    const messages: Record<string, string> = {
      UNAUTHORIZED: "로그인이 필요합니다",
      FORBIDDEN: "권한이 없습니다",
      NOT_FOUND: "요청한 정보를 찾을 수 없습니다",
      VALIDATION_ERROR: "입력 정보를 확인해주세요",
      CONFLICT: "이미 존재하는 정보입니다",
      INTERNAL_SERVER_ERROR: "서버 오류가 발생했습니다",
    };

    return messages[this.code] || this.message;
  }
}
```

### 컴포넌트에서 에러 처리

```typescript
// 예시: CampgroundList.tsx
export default function CampgroundList() {
  const { data, error, isLoading } = useCampgrounds({ page: 0, size: 20 });

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    if (error instanceof ApiError) {
      return <ErrorMessage title="데이터 로딩 실패" message={error.userMessage} />;
    }
    return <ErrorMessage title="오류" message="문제가 발생했습니다" />;
  }

  return (
    <div>
      {data?.data.content.map((campground) => (
        <CampgroundCard key={campground.id} campground={campground} />
      ))}
    </div>
  );
}
```

---

## 📦 캐싱 전략

### 데이터별 캐싱 정책

| 데이터 유형 | staleTime | gcTime | refetchOnWindowFocus |
| ----------- | --------- | ------ | -------------------- |
| 캠핑장 목록 | 10분      | 15분   | false                |
| 캠핑장 상세 | 5분       | 10분   | false                |
| 리뷰 목록   | 5분       | 10분   | false                |
| 찜 목록     | 2분       | 5분    | true                 |
| 예약 목록   | 1분       | 5분    | true                 |
| 사용자 정보 | 30분      | 1시간  | false                |

### 캐시 무효화 시점

```typescript
// 예약 생성 후 → 예약 목록 갱신
queryClient.invalidateQueries({ queryKey: ["reservations"] });

// 리뷰 작성 후 → 리뷰 목록 + 캠핑장 상세 갱신
queryClient.invalidateQueries({ queryKey: ["reviews"] });
queryClient.invalidateQueries({ queryKey: ["campgrounds", campgroundId] });

// 찜하기 토글 후 → 찜 목록 + 찜 상태 갱신
queryClient.invalidateQueries({ queryKey: ["favorites"] });
queryClient.invalidateQueries({ queryKey: ["favoriteStatus", campgroundId] });
```

자세한 내용은 [캐싱 전략 문서](../technical/caching-strategy.md)를 참조하세요.

---

## ✅ 베스트 프랙티스

### 1. API 함수는 한 곳에서 관리

```typescript
// ❌ 컴포넌트에서 직접 호출
const data = await axios.get("/v1/campgrounds");

// ✅ API 모듈 사용
const data = await campgroundApi.getList();
```

### 2. React Query Hook 사용

```typescript
// ❌ useEffect + fetch
useEffect(() => {
  fetch("/api/campgrounds")
    .then((res) => res.json())
    .then(setData);
}, []);

// ✅ React Query Hook
const { data } = useCampgrounds();
```

### 3. 타입 안전성 보장

```typescript
// API 응답 타입 정의
export interface CampgroundDetailResponse extends ApiResponse {
  data: {
    id: number;
    name: string;
    address: string;
    // ... 전체 필드
  };
}

// Hook에서 타입 명시
export const useCampground = (
  id: number
): UseQueryResult<CampgroundDetailResponse> => {
  return useQuery({
    queryKey: ["campgrounds", id],
    queryFn: () => campgroundApi.getById(id),
  });
};
```

### 4. 로딩/에러 상태 통합 처리

```typescript
// ✅ QueryStateHandler 사용
<QueryStateHandler
  isLoading={isLoading}
  error={error}
  isEmpty={data?.data.content.length === 0}
  emptyMessage="검색 결과가 없습니다"
>
  {/* 데이터 렌더링 */}
</QueryStateHandler>
```

### 5. 낙관적 업데이트 활용

사용자 경험이 중요한 기능 (찜하기, 좋아요 등)에서는 낙관적 업데이트를 사용하여 즉각적인 피드백을 제공합니다.

### 6. 에러 핸들링 계층화

```typescript
// 1. API Client 레벨: 공통 에러 (401, 500 등)
client.interceptors.response.use(...);

// 2. React Query 레벨: 쿼리별 에러
onError: (error) => { ... }

// 3. 컴포넌트 레벨: UI 에러 표시
{error && <ErrorMessage />}
```

---

## 📚 참고 문서

- [API 명세](../specifications/04-API-SPEC.md)
- [상태 관리](../specifications/05-STATE-MANAGEMENT.md)
- [캐싱 전략](../technical/caching-strategy.md)
- [트러블슈팅](../operations/04-troubleshooting.md)
- [TanStack Query Docs](https://tanstack.com/query/latest)

---

## 🔗 관련 파일

```
lib/
├── api/
│   ├── client.ts           # Axios 클라이언트 설정
│   ├── errors.ts           # 에러 클래스
│   ├── auth.ts            # 인증 API
│   ├── campgrounds.ts     # 캠핑장 API
│   ├── reservations.ts    # 예약 API
│   ├── reviews.ts         # 리뷰 API
│   ├── favorites.ts       # 찜하기 API
│   ├── images.ts          # 이미지 API
│   └── payment.ts         # 결제 API
├── constants/
│   └── config.ts          # API URL, 타임아웃 등
└── utils/
    └── queryClient.ts     # React Query 설정

hooks/
├── useAuth.ts             # 인증 훅
├── useCampgrounds.ts      # 캠핑장 훅
├── useReservations.ts     # 예약 훅
├── useReviews.ts          # 리뷰 훅
├── useFavorites.ts        # 찜하기 훅
└── useImages.ts           # 이미지 훅
```
