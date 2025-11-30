# 인증 API

## 기본 정보

- Base Path: `/api/v1/auth`
- 인증 방식: JWT (Access Token + HttpOnly Refresh Token)
- Access Token 만료: 24시간
- Refresh Token: HttpOnly Cookie로 자동 관리

---

## 엔드포인트 목록

### POST /v1/auth/login

로그인

**인증**: ❌ Public

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "로그인 성공",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "홍길동",
      "phone": "010-1234-5678",
      "role": "MEMBER",
      "status": "ACTIVE",
      "profileImage": "profiles/user-123.jpg",
      "createdAt": "2025-01-01T00:00:00",
      "updatedAt": "2025-01-01T00:00:00"
    }
  },
  "timestamp": "2025-11-09T12:00:00"
}
```

**Headers (Response):**

```
Set-Cookie: refreshToken=<token>; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000
```

**TypeScript 타입:**

```typescript
type LoginResponse = ApiResponse<{
  accessToken: string;
  user: {
    id: number;
    email: string;
    name: string;
    phone: string;
    role: UserRole; // "MEMBER" | "OWNER" | "ADMIN"
    status: UserStatus; // "ACTIVE" | "INACTIVE" | "SUSPENDED"
    profileImage: string | null;
    createdAt: string;
    updatedAt: string;
  };
}>;

type UserRole = "MEMBER" | "OWNER" | "ADMIN";
type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
```

---

### POST /v1/auth/signup

회원가입

**인증**: ❌ Public

**Request Body:**

```json
{
  "email": "newuser@example.com",
  "password": "Password123!",
  "passwordConfirm": "Password123!",
  "name": "홍길동",
  "phone": "010-1234-5678",
  "role": "MEMBER"
}
```

**Validation:**

- `email`: 유효한 이메일 형식, 중복 불가
- `password`: 최소 8자, 영문/숫자/특수문자 포함
- `passwordConfirm`: password와 일치
- `name`: 2자 이상
- `phone`: "010-1234-5678" 형식
- `role`: "MEMBER" 또는 "OWNER" (ADMIN은 불가)

**Response:**

```json
{
  "success": true,
  "message": "회원가입 성공",
  "data": {
    "id": 123,
    "email": "newuser@example.com",
    "name": "홍길동",
    "phone": "010-1234-5678",
    "role": "MEMBER",
    "status": "ACTIVE",
    "createdAt": "2025-11-09T12:00:00"
  }
}
```

**에러 응답:**

```json
{
  "success": false,
  "message": "이미 존재하는 이메일입니다.",
  "data": null,
  "timestamp": "2025-11-09T12:00:00"
}
```

---

### POST /v1/auth/logout

로그아웃

**인증**: ✅ Required (Authorization: Bearer <token>)

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "success": true,
  "message": "로그아웃 성공",
  "data": null
}
```

**Headers (Response):**

```
Set-Cookie: refreshToken=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0
```

---

### GET /v1/auth/validate

토큰 유효성 검증

**인증**: ✅ Required (Authorization: Bearer <token>)

**Response:**

```json
{
  "success": true,
  "message": "유효한 토큰",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "홍길동",
    "role": "MEMBER",
    "status": "ACTIVE"
  }
}
```

**에러 응답 (401):**

```json
{
  "success": false,
  "message": "유효하지 않은 토큰입니다.",
  "data": null,
  "timestamp": "2025-11-09T12:00:00"
}
```

---

### POST /v1/auth/refresh

Access Token 갱신

**인증**: ✅ Refresh Token (HttpOnly Cookie)

**Request:**

```
Cookie: refreshToken=<refresh_token>
```

**Response:**

```json
{
  "success": true,
  "message": "토큰 갱신 성공",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "홍길동",
      "role": "MEMBER"
    }
  }
}
```

**에러 응답 (401):**

```json
{
  "success": false,
  "message": "Refresh Token이 만료되었습니다.",
  "data": null
}
```

---

## 프론트엔드 사용 예시

### Axios 인터셉터 설정

```typescript
// lib/api/client.ts
import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Refresh Token 쿠키 전송
});

// Request 인터셉터: Access Token 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response 인터셉터: 401 시 토큰 갱신
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh Token으로 새 Access Token 받기
        const { data } = await apiClient.post("/v1/auth/refresh");
        localStorage.setItem("accessToken", data.data.accessToken);

        // 실패했던 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh Token도 만료됨 → 로그아웃
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

### 로그인 훅

```typescript
// hooks/useAuth.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Access Token 저장
      localStorage.setItem("accessToken", data.data.accessToken);

      // 사용자 정보 캐시
      queryClient.setQueryData(["user"], data.data.user);

      // Refresh Token은 HttpOnly Cookie로 자동 저장됨
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      localStorage.removeItem("accessToken");
      queryClient.clear();
      window.location.href = "/login";
    },
  });
}

// lib/api/auth.ts
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    post<LoginResponse>("/v1/auth/login", credentials),

  signup: (data: SignupRequest) =>
    post<SignupResponse>("/v1/auth/signup", data),

  logout: () => post("/v1/auth/logout", {}),

  validate: () => get<ValidateResponse>("/v1/auth/validate"),

  refresh: () => post<RefreshResponse>("/v1/auth/refresh", {}),
};
```

### Protected Route

```tsx
// components/auth/ProtectedRoute.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  if (!token) return null;
  return <>{children}</>;
}

// app/my-page/layout.tsx
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function MyPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
```

---

## 주의사항

❗ **토큰 저장 방식**

- **Access Token**: localStorage (24시간 유효)
- **Refresh Token**: HttpOnly Cookie (30일 유효, 자동 관리)

❗ **CORS 설정 필요**

```typescript
// API 호출 시 withCredentials: true 필수
axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true, // Refresh Token 쿠키 전송
});
```

❗ **401 에러 처리**

1. 401 응답 수신
2. `/v1/auth/refresh` 호출
3. 성공 → 새 Access Token 저장 후 재요청
4. 실패 → 로그아웃 처리

❗ **회원가입 role**

- `MEMBER`: 일반 사용자 (예약 가능)
- `OWNER`: 캠핑장 사업자 (캠핑장 생성/관리 가능)
- `ADMIN`: 관리자 (회원가입 불가, 수동 생성)

❗ **비밀번호 정책**

- 최소 8자 이상
- 영문 대소문자, 숫자, 특수문자 각 1개 이상 포함
- 이메일과 동일 불가

❗ **에러 상태 코드**

- `400`: 유효성 검증 실패
- `401`: 인증 실패 (토큰 만료/없음/유효하지 않음)
- `403`: 권한 없음
- `409`: 이메일 중복
- `500`: 서버 오류
