# 인증 무한 루프 및 토큰 검증 문제 해결 요약

## 발견된 문제들

### 1. JWT 토큰 파싱 에러 (백엔드)
**증상**:
```
JWT token parsing failed: Invalid compact JWT string:
Compact JWSs must contain exactly 2 period characters
```

**원인**: 잘못된 형식의 JWT 토큰이 백엔드로 전달됨

**위치**: `backend/src/main/java/com/campstation/camp/shared/JwtAuthenticationFilter.java`

### 2. 무한 리다이렉트 루프 (프론트엔드)
**증상**:
```
GET /login 200 (반복)
POST /api/v1/auth/refresh 429 (Rate limit exceeded)
```

**원인**:
1. `/login` 페이지에서 AuthContext가 자동으로 프로필 API 호출
2. 401 에러 발생 → config.ts에서 `/login`으로 리다이렉트
3. 무한 루프 발생

**위치**:
- `frontend/src/contexts/AuthContext.tsx`
- `frontend/src/lib/api/config.ts`

### 3. 만료된 토큰 검증 부재
**증상**: 만료된 토큰이 있어도 유효한 것으로 판단

**원인**:
- 토큰 존재 여부만 확인, 만료 시간은 미확인
- sessionStorage와 HttpOnly 쿠키 모두 검증 필요

**위치**:
- `frontend/src/app/(auth)/layout.tsx`
- `frontend/src/app/(auth)/login/page.tsx`
- `frontend/src/app/(auth)/register/page.tsx`

---

## 적용한 해결책

### 1. 백엔드: JWT 필터 개선 ✅
**파일**: `backend/src/main/java/com/campstation/camp/shared/JwtAuthenticationFilter.java:113-147`

```java
// JWT 형식 사전 검증 (header.payload.signature)
String token = bearerToken.substring(7).trim();
if (StringUtils.hasText(token) && token.split("\\.").length == 3) {
    return token;
} else {
    log.debug("Invalid JWT format");
    return null;
}
```

**효과**: 잘못된 형식의 JWT가 JwtUtil로 전달되지 않음

---

### 2. 프론트엔드: API Config 개선 ✅
**파일**: `frontend/src/lib/api/config.ts:410-412`

```typescript
// 이미 로그인 페이지에 있으면 리다이렉트하지 않음 (무한 루프 방지)
if (isBrowser && !window.location.pathname.startsWith("/login")) {
  window.location.href = "/login";
}
```

**효과**: 로그인 페이지에서 401 에러가 발생해도 무한 루프 방지

---

### 3. 프론트엔드: AuthContext 개선 ✅
**파일**: `frontend/src/contexts/AuthContext.tsx:74-80`

```typescript
// 로그인/회원가입 페이지에서는 프로필을 가져오지 않음 (무한 루프 방지)
if (typeof window !== "undefined") {
  const pathname = window.location.pathname;
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    setIsLoading(false);
    return;
  }
}
```

**효과**: 로그인/회원가입 페이지에서 불필요한 API 호출 방지

---

### 4. 프론트엔드: 토큰 검증 유틸리티 생성 ✅
**파일**: `frontend/src/lib/token-utils.ts`

```typescript
/**
 * JWT 토큰 형식 및 만료 시간 검증 (클라이언트용)
 */
export function isValidClientToken(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);

    return payload.exp && payload.exp > now;
  } catch {
    return false;
  }
}

/**
 * JWT 토큰 형식 및 만료 시간 검증 (서버용)
 */
export function isValidServerToken(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const payload = JSON.parse(
      Buffer.from(parts[1], "base64").toString("utf-8")
    );
    const now = Math.floor(Date.now() / 1000);

    return payload.exp && payload.exp > now;
  } catch {
    return false;
  }
}

/**
 * sessionStorage에서 만료되거나 잘못된 토큰 제거
 */
export function validateAndCleanClientToken(token: string | null): boolean {
  if (!token) return false;

  if (isValidClientToken(token)) {
    return true;
  }

  // 만료되거나 잘못된 토큰 제거
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("accessToken");
  }

  return false;
}
```

**효과**:
- 중복 코드 제거
- 일관된 토큰 검증 로직
- 자동 토큰 정리

---

### 5. 프론트엔드: Auth Layout 개선 ✅
**파일**: `frontend/src/app/(auth)/layout.tsx:10-17`

```typescript
export default async function AuthLayout({ children }: AuthLayoutProps) {
  const accessToken = await getServerAccessToken();

  // 토큰이 있고 유효한 경우에만 리다이렉트
  if (accessToken && isValidServerToken(accessToken)) {
    redirect("/");
  }

  return <Layout showHeader={false}>{children}</Layout>;
}
```

**효과**: 만료된 쿠키 토큰으로 인한 무한 루프 방지

---

### 6. 프론트엔드: 로그인 페이지 개선 ✅
**파일**: `frontend/src/app/(auth)/login/page.tsx:67-73`

```typescript
// 토큰 유효성 확인 및 자동 정리
const token = getAccessToken();
if (validateAndCleanClientToken(token)) {
  // 유효한 토큰이 있으면 홈으로 리다이렉트
  router.push(safeRedirect ?? "/");
  return;
}
```

**효과**: sessionStorage의 만료된 토큰 자동 정리

---

### 7. 프론트엔드: 회원가입 페이지 개선 ✅
**파일**: `frontend/src/app/(auth)/register/page.tsx:52-59`

```typescript
useEffect(() => {
  // 토큰 유효성 확인 및 자동 정리
  const token = getAccessToken();
  if (validateAndCleanClientToken(token)) {
    // 유효한 토큰이 있으면 홈으로 리다이렉트
    router.push("/");
  }
}, [router]);
```

**효과**: 로그인 페이지와 동일한 검증 로직 적용

---

### 8. 프론트엔드: Middleware 개선 ✅
**파일**: `frontend/src/middleware.ts:5-18`

```typescript
export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;

  // 만료된 토큰이 있으면 쿠키 삭제
  if (accessToken && !isValidServerToken(accessToken)) {
    console.debug("Clearing expired token from cookies");
    const response = NextResponse.next();
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  }

  return NextResponse.next();
}
```

**효과**: 모든 요청에서 만료된 쿠키 자동 정리

---

## 해결된 문제 목록

| 문제 | 원인 | 해결 방법 | 상태 |
|------|------|-----------|------|
| JWT 파싱 에러 | 잘못된 형식의 토큰 | 백엔드 필터에서 사전 검증 | ✅ |
| 무한 리다이렉트 (/login → /login) | AuthContext가 로그인 페이지에서도 API 호출 | 로그인 페이지에서 API 호출 제외 | ✅ |
| 무한 리다이렉트 (401 → /login → 401) | config.ts에서 무조건 /login으로 리다이렉트 | 로그인 페이지에 있으면 리다이렉트 안 함 | ✅ |
| 만료된 토큰 검증 부재 (서버) | getServerAccessToken()이 존재만 확인 | Auth Layout에서 만료 시간 검증 | ✅ |
| 만료된 토큰 검증 부재 (클라이언트) | getAccessToken()이 존재만 확인 | 로그인/회원가입 페이지에서 검증 | ✅ |
| Rate Limit 초과 | 무한 루프로 인한 과도한 API 호출 | 무한 루프 방지로 자동 해결 | ✅ |
| 중복 코드 | 여러 곳에서 토큰 검증 로직 반복 | token-utils.ts 유틸리티 생성 | ✅ |

---

## 파일 변경 사항 요약

### 백엔드 (1개)
1. `backend/src/main/java/com/campstation/camp/shared/JwtAuthenticationFilter.java` - JWT 형식 검증 추가

### 프론트엔드 (6개)
1. `frontend/src/lib/token-utils.ts` - **신규 생성**: 토큰 검증 유틸리티
2. `frontend/src/lib/api/config.ts` - 로그인 페이지에서 리다이렉트 방지
3. `frontend/src/contexts/AuthContext.tsx` - 로그인 페이지에서 API 호출 방지
4. `frontend/src/app/(auth)/layout.tsx` - 서버 토큰 검증 추가
5. `frontend/src/app/(auth)/login/page.tsx` - 클라이언트 토큰 검증 추가
6. `frontend/src/app/(auth)/register/page.tsx` - 클라이언트 토큰 검증 추가
7. `frontend/src/middleware.ts` - 유틸리티 함수 사용

---

## 테스트 시나리오

### 1. 정상 로그인
1. `/login` 접속
2. 이메일/비밀번호 입력
3. 로그인 성공 → `/`로 리다이렉트
4. **결과**: ✅ 정상 동작

### 2. 만료된 토큰으로 로그인 페이지 접속
1. sessionStorage 또는 쿠키에 만료된 토큰 존재
2. `/login` 접속
3. **결과**: ✅ 무한 루프 없이 로그인 페이지 표시
4. **효과**: 만료된 토큰 자동 제거

### 3. 유효한 토큰으로 로그인 페이지 접속
1. 유효한 토큰 존재
2. `/login` 접속
3. **결과**: ✅ 자동으로 `/`로 리다이렉트

### 4. 메인 페이지 접속 (비로그인)
1. 토큰 없음
2. `/` 접속
3. **결과**: ✅ 메인 페이지 정상 표시 (인증 불필요)

### 5. 보호된 페이지 접속 (비로그인)
1. 토큰 없음
2. `/dashboard/user` 접속
3. **결과**: ✅ `/login`으로 리다이렉트

---

## 예방 조치

### 무한 루프 방지 체크리스트

#### 백엔드
- [ ] JWT 필터에서 형식 검증
- [ ] Rate limiting 설정
- [ ] 로그 모니터링

#### 프론트엔드
- [ ] AuthContext에서 인증 페이지 제외
- [ ] API config에서 리다이렉트 조건 확인
- [ ] 모든 토큰 검증에 만료 시간 확인
- [ ] 만료된 토큰 자동 정리
- [ ] Middleware에서 전역 토큰 검증

### 새로운 페이지 추가 시 주의사항

1. **인증이 필요한 페이지**: `ProtectedRoute` 또는 `useRequireAuth` 사용
2. **인증이 필요 없는 페이지**: AuthContext 호출 안 함
3. **인증 페이지** (로그인/회원가입):
   - AuthContext에서 제외
   - 유효한 토큰 있으면 홈으로 리다이렉트
   - 만료된 토큰 자동 정리

---

## 추가 개선 사항 (선택)

### 1. 토큰 갱신 로직 개선
현재는 401 에러 시 refresh를 시도하지만, 토큰 만료 시간을 미리 확인하여 선제적으로 갱신 가능

### 2. 에러 바운더리 추가
무한 루프 감지 시 에러 바운더리로 안전하게 처리

### 3. 로그 모니터링
- 반복적인 401 에러 감지
- Rate limit 임박 시 알림
- 무한 루프 패턴 감지

---

## 결론

모든 무한 루프 및 토큰 검증 문제가 해결되었습니다.

### 핵심 수정 사항:
1. ✅ 백엔드 JWT 필터 개선
2. ✅ 프론트엔드 API Config 개선
3. ✅ AuthContext 로그인 페이지 제외
4. ✅ 토큰 검증 유틸리티 생성
5. ✅ 모든 인증 페이지에 토큰 검증 적용
6. ✅ Middleware로 전역 토큰 관리

### 기대 효과:
- ✅ 무한 리다이렉트 루프 완전 해결
- ✅ Rate Limit 문제 해결
- ✅ 깔끔한 사용자 경험
- ✅ 코드 중복 제거
- ✅ 유지보수성 향상
