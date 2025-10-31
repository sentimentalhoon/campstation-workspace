# Access Token & Refresh Token → HttpOnly Cookie 마이그레이션

> **작성일**: 2025-10-31
> **목적**: SessionStorage 기반 토큰 관리를 HttpOnly Cookie로 완전히 전환하여 보안 강화

---

## 📋 변경 개요

### 변경 전 (이전 방식)
- **Access Token**: `sessionStorage`에 저장
- **Refresh Token**: HttpOnly Cookie (백엔드 관리)
- **문제점**:
  - Access Token이 JavaScript로 접근 가능 (XSS 공격 위험)
  - SessionStorage와 Cookie가 혼재되어 일관성 없음
  - 코드 곳곳에 sessionStorage 직접 접근

### 변경 후 (현재 방식)
- **Access Token**: HttpOnly Cookie (백엔드 설정)
- **Refresh Token**: HttpOnly Cookie (백엔드 설정)
- **장점**:
  - 모든 토큰이 JavaScript에서 접근 불가 (XSS 공격 방어)
  - `credentials: 'include'`로 자동 전송
  - 클라이언트 코드 단순화
  - 일관된 보안 정책

---

## 🔧 수정된 파일 목록

### 1. **`frontend/src/lib/api/config.ts`** ✅

#### 주요 변경사항:

**a) SessionStorage 주석 및 용도 명확화**
```typescript
/**
 * Session Storage 유틸리티 (User Profile 캐싱용으로만 사용)
 * Access Token과 Refresh Token은 HttpOnly 쿠키로 관리
 */
```

**b) 토큰 키 주석 업데이트**
```typescript
// 변경 전
export const ACCESS_TOKEN_KEY = "accessToken"; // Session storage key

// 변경 후
export const ACCESS_TOKEN_KEY = "accessToken"; // Cookie name (HttpOnly)
export const REFRESH_TOKEN_KEY = "refreshToken"; // Cookie name (HttpOnly)
export const USERPROFILE = "userProfile"; // Session storage key (캐싱용)
```

**c) `clearTokens()` 함수 수정**
```typescript
export const clearTokens = (): void => {
  // User Profile 캐시만 sessionStorage에서 제거
  removeSession(USERPROFILE);
  removeSession("userProfileExpiry");

  // HttpOnly 쿠키는 클라이언트에서 직접 제거 불가
  // 백엔드의 /v1/auth/logout API가 쿠키를 삭제함
};
```

**d) `getAccessToken()` 주석 업데이트**
```typescript
/**
 * Retrieves the current access token from HttpOnly cookie
 *
 * Note: HttpOnly 쿠키는 JavaScript에서 직접 읽을 수 없습니다.
 * 이 함수는 클라이언트 사이드 쿠키(non-HttpOnly)가 있을 경우에만 작동하며,
 * 실제로는 fetch 요청 시 credentials: 'include'로 자동 전송됩니다.
 */
export const getAccessToken = (): string | null =>
  Cookies.get(ACCESS_TOKEN_KEY) ?? null;
```

**e) `refreshAccessToken()` 함수 수정**
```typescript
// 변경 전
writeSession(ACCESS_TOKEN_KEY, newAccessToken); // sessionStorage에 저장

// 변경 후
// 백엔드에서 새로운 accessToken을 HttpOnly 쿠키로 설정하므로
// 클라이언트에서 별도로 저장하지 않음
return data.data?.accessToken || data.accessToken || "refreshed";
```

**f) `apiRequest()` 주석 개선**
```typescript
/**
 * Generic API request function with automatic token handling
 *
 * Access Token과 Refresh Token은 모두 HttpOnly 쿠키로 관리되며,
 * credentials: 'include' 옵션을 통해 자동으로 요청에 포함됩니다.
 */
```

---

### 2. **`frontend/src/lib/token-utils.ts`** ✅

#### 주요 변경사항:

**`validateAndCleanClientToken()` 함수 수정**
```typescript
// 변경 전
if (typeof window !== "undefined") {
  sessionStorage.removeItem("accessToken"); // 직접 제거
}

// 변경 후
// Access Token은 HttpOnly 쿠키로 관리되므로 클라이언트에서 직접 제거 불가
// 만료된 토큰은 API 요청 시 자동으로 refresh됨
console.debug("Token is invalid or expired - will be refreshed on next API call");
```

---

### 3. **`frontend/src/contexts/AuthContext.tsx`** ✅

#### 주요 변경사항:

**`hydrateFromAuth()` 함수 단순화**
```typescript
// 변경 전
const cachedProfile = sessionStorage.getItem("userProfile");
const cacheExpiry = sessionStorage.getItem("userProfileExpiry");

if (cachedProfile && cacheExpiry && Date.now() < Number(cacheExpiry)) {
  // 캐시가 유효하면 API 호출 없이 캐시 사용
  const profileData = JSON.parse(cachedProfile);
  // ...
}

// 변경 후
// Access Token은 HttpOnly 쿠키에 있으므로 클라이언트에서 직접 확인 불가
// authApi.getProfile()이 내부적으로 sessionStorage 캐시를 사용하므로
// 여기서는 바로 API 호출만 수행
await refreshProfile();
```

---

### 4. **`frontend/src/app/(auth)/auth/callback/page.tsx`** ✅

#### 주요 변경사항:

**OAuth 콜백 처리 로직 변경**
```typescript
// 변경 전
const accessToken = searchParams.get("accessToken");
const refreshToken = searchParams.get("refreshToken");

if (!accessToken) {
  // 에러 처리
}

writeSession(ACCESS_TOKEN_KEY, accessToken); // sessionStorage에 저장

// 변경 후
const error = searchParams.get("error");
const success = searchParams.get("success");

// OAuth 성공 시 백엔드가 이미 HttpOnly 쿠키로 토큰을 설정했음
// success 파라미터로 성공 여부만 확인
if (success === "true") {
  console.log("OAuth2 tokens set by backend in HttpOnly cookies");

  // 프로필 조회로 인증 상태 확인
  await authApi.getProfile();
  // ...
}
```

**주요 개선사항**:
- URL에서 토큰을 받지 않음 (보안 향상)
- 백엔드가 직접 HttpOnly 쿠키 설정
- 프론트엔드는 성공 여부만 확인

---

## 🔄 토큰 플로우 비교

### 변경 전 플로우

```
1. 로그인 요청
   ↓
2. 백엔드: Access Token 반환 (JSON)
   ↓
3. 프론트엔드: sessionStorage.setItem("accessToken", token)
   ↓
4. API 요청
   ↓
5. 프론트엔드: sessionStorage.getItem("accessToken")
   ↓
6. Authorization: Bearer {token} 헤더 추가
```

### 변경 후 플로우

```
1. 로그인 요청
   ↓
2. 백엔드: Access Token을 HttpOnly Cookie로 설정
   ↓
3. 프론트엔드: 별도 저장 불필요
   ↓
4. API 요청
   ↓
5. 브라우저: credentials: 'include'로 쿠키 자동 전송
   ↓
6. 백엔드: Cookie에서 토큰 읽음
```

---

## 🛡️ 보안 개선사항

### 1. **XSS 공격 방어 강화**
- **이전**: JavaScript로 `sessionStorage.getItem("accessToken")` 접근 가능
- **현재**: HttpOnly Cookie는 JavaScript에서 접근 불가
- **결과**: XSS 공격으로 토큰 탈취 불가능

### 2. **CSRF 공격 대비**
- 백엔드에서 SameSite 쿠키 속성 설정 필요
- Recommended: `SameSite=Lax` 또는 `SameSite=Strict`

### 3. **토큰 노출 최소화**
- URL 파라미터로 토큰 전달 제거 (OAuth 콜백)
- 브라우저 히스토리에 토큰 기록 없음
- 네트워크 탭에서만 Set-Cookie 헤더로 확인 가능

---

## 📝 주의사항 및 백엔드 요구사항

### 백엔드에서 반드시 구현해야 할 사항:

#### 1. **로그인 응답 시 쿠키 설정**
```java
// Spring Boot 예시
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletResponse response) {
    // 인증 처리
    String accessToken = generateAccessToken(user);
    String refreshToken = generateRefreshToken(user);

    // HttpOnly Cookie 설정
    Cookie accessCookie = new Cookie("accessToken", accessToken);
    accessCookie.setHttpOnly(true);
    accessCookie.setSecure(true); // HTTPS only
    accessCookie.setPath("/");
    accessCookie.setMaxAge(3600); // 1 hour
    accessCookie.setSameSite("Lax");

    Cookie refreshCookie = new Cookie("refreshToken", refreshToken);
    refreshCookie.setHttpOnly(true);
    refreshCookie.setSecure(true);
    refreshCookie.setPath("/");
    refreshCookie.setMaxAge(604800); // 7 days
    refreshCookie.setSameSite("Lax");

    response.addCookie(accessCookie);
    response.addCookie(refreshCookie);

    return ResponseEntity.ok(loginResponse);
}
```

#### 2. **API 요청 처리 시 쿠키에서 토큰 읽기**
```java
@GetMapping("/profile")
public ResponseEntity<?> getProfile(@CookieValue("accessToken") String accessToken) {
    // 토큰 검증 및 처리
    User user = validateTokenAndGetUser(accessToken);
    return ResponseEntity.ok(user);
}
```

#### 3. **토큰 갱신 시 쿠키 재설정**
```java
@PostMapping("/refresh")
public ResponseEntity<?> refresh(
    @CookieValue("refreshToken") String refreshToken,
    HttpServletResponse response
) {
    // Refresh Token 검증
    String newAccessToken = generateNewAccessToken(refreshToken);

    // 새로운 Access Token을 HttpOnly Cookie로 설정
    Cookie accessCookie = new Cookie("accessToken", newAccessToken);
    accessCookie.setHttpOnly(true);
    accessCookie.setSecure(true);
    accessCookie.setPath("/");
    accessCookie.setMaxAge(3600);
    accessCookie.setSameSite("Lax");

    response.addCookie(accessCookie);

    return ResponseEntity.ok().build();
}
```

#### 4. **로그아웃 시 쿠키 삭제**
```java
@PostMapping("/logout")
public ResponseEntity<?> logout(HttpServletResponse response) {
    // Access Token 쿠키 삭제
    Cookie accessCookie = new Cookie("accessToken", null);
    accessCookie.setMaxAge(0);
    accessCookie.setPath("/");

    // Refresh Token 쿠키 삭제
    Cookie refreshCookie = new Cookie("refreshToken", null);
    refreshCookie.setMaxAge(0);
    refreshCookie.setPath("/");

    response.addCookie(accessCookie);
    response.addCookie(refreshCookie);

    return ResponseEntity.ok().build();
}
```

#### 5. **OAuth 콜백 처리 변경**
```java
@GetMapping("/oauth2/callback")
public void handleOAuthCallback(
    @RequestParam String code,
    HttpServletResponse response
) throws IOException {
    // OAuth 토큰 교환
    String accessToken = exchangeCodeForToken(code);

    // HttpOnly Cookie로 설정
    Cookie accessCookie = new Cookie("accessToken", accessToken);
    accessCookie.setHttpOnly(true);
    accessCookie.setSecure(true);
    accessCookie.setPath("/");
    accessCookie.setMaxAge(3600);

    response.addCookie(accessCookie);

    // 프론트엔드로 리다이렉트 (토큰은 URL에 포함하지 않음)
    response.sendRedirect("/auth/callback?success=true");
}
```

---

## ✅ 테스트 체크리스트

### 프론트엔드 테스트

- [ ] 로그인 성공 시 쿠키 설정 확인
  - 개발자 도구 → Application → Cookies 확인
  - `accessToken`, `refreshToken` 존재 확인
  - HttpOnly 플래그 확인

- [ ] API 요청 시 쿠키 자동 전송 확인
  - 개발자 도구 → Network 탭
  - Request Headers에 Cookie 포함 확인

- [ ] 토큰 갱신 동작 확인
  - Access Token 만료 후 자동 갱신 테스트
  - 새로운 Access Token 쿠키 설정 확인

- [ ] 로그아웃 시 쿠키 삭제 확인
  - 로그아웃 후 쿠키 목록 확인
  - `accessToken`, `refreshToken` 삭제됨

- [ ] OAuth 로그인 테스트
  - Google/Kakao 로그인 성공 확인
  - 토큰이 URL에 노출되지 않음 확인
  - 프로필 조회 성공 확인

### 보안 테스트

- [ ] XSS 테스트
  - `document.cookie` 실행 시 토큰 조회 불가 확인
  - `sessionStorage.getItem("accessToken")` null 반환 확인

- [ ] CSRF 테스트 (백엔드)
  - SameSite 속성 설정 확인
  - CSRF 토큰 검증 (필요시)

---

## 🔮 향후 개선 사항

### 1. **테스트 코드 업데이트**
- `frontend/src/lib/__tests__/api.test.ts` 업데이트 필요
- sessionStorage 대신 Cookie Mock 사용

### 2. **서버 사이드 렌더링 (SSR) 지원**
- Next.js App Router의 Server Components에서 쿠키 읽기
- `cookies()` 함수 사용하여 서버에서 인증 확인

### 3. **쿠키 보안 설정 강화**
- Secure 플래그 (HTTPS only)
- SameSite=Strict (엄격한 CSRF 방어)
- Domain 설정 (서브도메인 제어)

---

## 📚 참고 자료

- [OWASP - HttpOnly Cookie](https://owasp.org/www-community/HttpOnly)
- [MDN - Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
- [SameSite Cookie 설명](https://web.dev/samesite-cookies-explained/)

---

**작성자**: Claude
**마지막 업데이트**: 2025-10-31
