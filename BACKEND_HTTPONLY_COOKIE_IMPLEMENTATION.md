# 백엔드 HttpOnly Cookie 구현 완료 보고서

> **작성일**: 2025-10-31
> **목적**: Access Token과 Refresh Token을 HttpOnly Cookie로 완전히 전환하여 보안 강화

---

## 📋 변경 요약

### ✅ 이미 구현되어 있던 사항

백엔드는 이미 대부분의 기능이 HttpOnly Cookie를 사용하도록 구현되어 있었습니다:

1. **로그인 엔드포인트** (`POST /api/v1/auth/login`)
   - ✅ Access Token HttpOnly 쿠키 설정
   - ✅ Refresh Token HttpOnly 쿠키 설정
   - ✅ Secure, SameSite 속성 설정 (환경별 분리)

2. **토큰 갱신 엔드포인트** (`POST /api/v1/auth/refresh`)
   - ✅ Refresh Token을 쿠키에서 읽기
   - ✅ 새로운 Access Token을 HttpOnly 쿠키로 설정
   - ✅ 새로운 Refresh Token을 HttpOnly 쿠키로 설정

3. **로그아웃 엔드포인트** (`POST /api/v1/auth/logout`)
   - ✅ Access Token 쿠키 삭제
   - ✅ Refresh Token 쿠키 삭제
   - ✅ Redis 토큰 블랙리스트 등록

4. **JWT 인증 필터** (`JwtAuthenticationFilter`)
   - ✅ 쿠키에서 Access Token 읽기
   - ✅ Authorization 헤더도 지원 (하위 호환성)
   - ✅ 블랙리스트 검증
   - ✅ 토큰 만료 시간 검증

### 🔧 수정한 사항 (2개 파일)

#### 1. **회원가입 엔드포인트** - Access Token 쿠키 추가

**파일**: `backend/src/main/java/com/campstation/camp/auth/controller/AuthController.java`

**변경 전**:
```java
// Refresh Token만 쿠키로 설정
ResponseCookie refreshTokenCookie = ResponseCookie
    .from("refreshToken", refreshToken)
    .httpOnly(true)
    .path("/")
    .maxAge(jwtRefreshExpirationMs / 1000)
    .build();

return ResponseEntity.status(HttpStatus.CREATED)
    .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
    .body(CommonResponse.success("회원가입 성공", response));
```

**변경 후**:
```java
// Access Token 쿠키 설정 추가
ResponseCookie accessTokenCookie = ResponseCookie
    .from("accessToken", accessToken)
    .httpOnly(true)
    .path("/")
    .maxAge(jwtExpirationMs / 1000) // 2시간
    .secure(!"dev".equals(activeProfile))
    .sameSite(!"dev".equals(activeProfile) ? "None" : "Lax")
    .build();

// Refresh Token 쿠키 설정
ResponseCookie refreshTokenCookie = ResponseCookie
    .from("refreshToken", refreshToken)
    .httpOnly(true)
    .path("/")
    .maxAge(jwtRefreshExpirationMs / 1000) // 30일
    .secure(!"dev".equals(activeProfile))
    .sameSite(!"dev".equals(activeProfile) ? "None" : "Lax")
    .build();

return ResponseEntity.status(HttpStatus.CREATED)
    .header(HttpHeaders.SET_COOKIE, accessTokenCookie.toString())
    .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
    .body(CommonResponse.success("회원가입 성공", response));
```

**변경 이유**:
- 회원가입 시에도 즉시 로그인 상태가 되어야 하므로 Access Token이 필요
- 로그인 엔드포인트와 동일한 보안 정책 적용

---

#### 2. **OAuth2 Success Handler** - 토큰을 URL에서 쿠키로 변경

**파일**: `backend/src/main/java/com/campstation/camp/shared/OAuth2AuthenticationSuccessHandler.java`

**변경 전**:
```java
// JWT 토큰 생성
String token = jwtUtil.generateAccessToken(oauth2User.getUser());

// 토큰을 쿼리 파라미터로 전달 ⚠️ 보안 위험!
String targetUrl = UriComponentsBuilder
    .fromUriString("http://localhost:3000/auth/callback")
    .queryParam("accessToken", token)  // ⚠️ URL에 토큰 노출
    .queryParam("email", email)
    .build().toUriString();

getRedirectStrategy().sendRedirect(request, response, targetUrl);
```

**변경 후**:
```java
// JWT Access Token 및 Refresh Token 생성
String accessToken = jwtUtil.generateAccessToken(oauth2User.getUser());
String refreshToken = jwtUtil.generateRefreshToken(oauth2User.getUser());

// Redis에 토큰 저장
jwtTokenService.saveToken(
    oauth2User.getUser().getUsername(),
    accessToken,
    jwtExpirationMs / 1000
);

// HttpOnly 쿠키에 Access Token 설정
ResponseCookie accessTokenCookie = ResponseCookie
    .from("accessToken", accessToken)
    .httpOnly(true)
    .path("/")
    .maxAge(jwtExpirationMs / 1000) // 2시간
    .secure(!"dev".equals(activeProfile))
    .sameSite(!"dev".equals(activeProfile) ? "None" : "Lax")
    .build();

// HttpOnly 쿠키에 Refresh Token 설정
ResponseCookie refreshTokenCookie = ResponseCookie
    .from("refreshToken", refreshToken)
    .httpOnly(true)
    .path("/")
    .maxAge(jwtRefreshExpirationMs / 1000) // 30일
    .secure(!"dev".equals(activeProfile))
    .sameSite(!"dev".equals(activeProfile) ? "None" : "Lax")
    .build();

// 쿠키 설정
response.addHeader(HttpHeaders.SET_COOKIE, accessTokenCookie.toString());
response.addHeader(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString());

// 프론트엔드로 리다이렉트 (토큰은 URL에 포함하지 않음 ✅)
String targetUrl = UriComponentsBuilder
    .fromUriString(frontendUrl + "/auth/callback")
    .queryParam("success", "true")  // ✅ 성공 플래그만 전달
    .build().toUriString();

log.info("OAuth2 로그인 성공: {} - 토큰을 HttpOnly 쿠키로 설정", email);
getRedirectStrategy().sendRedirect(request, response, targetUrl);
```

**변경 이유**:
- **보안 강화**: URL에 토큰이 노출되지 않음
  - 브라우저 히스토리에 토큰 기록 없음
  - 서버 로그에 토큰 기록 없음
  - 네트워크 프록시에서 토큰 캡처 불가
- **일관성**: 일반 로그인과 동일한 방식으로 토큰 처리
- **XSS 방어**: HttpOnly 쿠키는 JavaScript에서 접근 불가

**추가된 설정 값**:
- `@Value("${frontend.url:http://localhost:3000}")` - 환경별 프론트엔드 URL 설정 가능

---

## 🔒 보안 설정 상세

### Cookie 속성 설정 (환경별 분리)

#### 개발 환경 (`spring.profiles.active=dev`)
```java
ResponseCookie cookie = ResponseCookie.from("accessToken", token)
    .httpOnly(true)      // JavaScript 접근 차단
    .secure(false)       // HTTP 허용 (로컬 개발)
    .sameSite("Lax")     // CSRF 방어 (일부)
    .path("/")           // 모든 경로에서 전송
    .maxAge(7200)        // 2시간 (초 단위)
    .build();
```

#### 운영 환경 (`spring.profiles.active=prod`)
```java
ResponseCookie cookie = ResponseCookie.from("accessToken", token)
    .httpOnly(true)      // JavaScript 접근 차단
    .secure(true)        // HTTPS만 허용 ⭐
    .sameSite("None")    // Cross-Origin 요청 허용 (HTTPS 필수)
    .path("/")           // 모든 경로에서 전송
    .maxAge(7200)        // 2시간 (초 단위)
    .build();
```

### 토큰 만료 시간

| 토큰 종류 | 만료 시간 | 설정 키 | 기본값 |
|---------|---------|---------|-------|
| Access Token | 2시간 | `jwt.expiration` | 7200000ms |
| Refresh Token | 30일 | `jwt.refresh.expiration` | 2592000000ms |

---

## 🔄 전체 인증 플로우

### 1. 로그인 플로우

```
클라이언트                     백엔드
   │                           │
   │ POST /api/v1/auth/login  │
   │ { email, password }       │
   ├──────────────────────────>│
   │                           │ 1. 인증 확인
   │                           │ 2. JWT 생성
   │                           │ 3. Redis 저장
   │                           │
   │  Set-Cookie: accessToken  │
   │  Set-Cookie: refreshToken │
   │<──────────────────────────┤
   │                           │
   │ (쿠키 자동 저장)           │
```

### 2. API 요청 플로우

```
클라이언트                     백엔드                    Redis
   │                           │                          │
   │ GET /api/v1/users/profile │                          │
   │ Cookie: accessToken       │                          │
   ├──────────────────────────>│                          │
   │                           │ 1. 쿠키에서 토큰 추출     │
   │                           │ 2. 블랙리스트 확인        │
   │                           ├─────────────────────────>│
   │                           │ 3. 토큰 유효성 검증        │
   │                           │ 4. 인증 정보 설정          │
   │                           │ 5. 요청 처리              │
   │  { user profile data }    │                          │
   │<──────────────────────────┤                          │
```

### 3. 토큰 갱신 플로우

```
클라이언트                     백엔드
   │                           │
   │ POST /api/v1/auth/refresh │
   │ Cookie: refreshToken      │
   ├──────────────────────────>│
   │                           │ 1. 쿠키에서 Refresh Token 추출
   │                           │ 2. Refresh Token 검증
   │                           │ 3. 새 Access Token 생성
   │                           │ 4. 새 Refresh Token 생성
   │                           │ 5. Redis 저장
   │                           │
   │  Set-Cookie: accessToken  │
   │  Set-Cookie: refreshToken │
   │<──────────────────────────┤
```

### 4. OAuth2 로그인 플로우

```
클라이언트              소셜 로그인           백엔드
   │                     │                   │
   │ 로그인 버튼 클릭      │                   │
   ├────────────────────>│                   │
   │                     │ 인증 완료           │
   │                     ├──────────────────>│
   │                     │                   │ 1. 사용자 정보 확인/생성
   │                     │                   │ 2. JWT 생성
   │                     │                   │ 3. Redis 저장
   │                     │                   │ 4. HttpOnly 쿠키 설정
   │                     │                   │
   │ Redirect: /auth/callback?success=true   │
   │<──────────────────────────────────────┤
   │ Set-Cookie: accessToken                │
   │ Set-Cookie: refreshToken               │
   │                                         │
   │ GET /api/v1/users/profile              │
   ├────────────────────────────────────────>│
   │ (프로필 확인으로 인증 상태 검증)         │
```

---

## 🛡️ 보안 개선사항

### 1. XSS (Cross-Site Scripting) 공격 방어 강화

**변경 전**:
```javascript
// 프론트엔드에서 sessionStorage에 저장
sessionStorage.setItem('accessToken', token);

// ⚠️ XSS 공격으로 토큰 탈취 가능
console.log(sessionStorage.getItem('accessToken'));
```

**변경 후**:
```javascript
// HttpOnly 쿠키는 JavaScript에서 접근 불가
console.log(document.cookie); // accessToken 보이지 않음 ✅
```

### 2. 토큰 노출 최소화

**OAuth2 변경 전**:
```
리다이렉트 URL:
http://localhost:3000/auth/callback?accessToken=eyJhbGciOiJIUzI1NiIs...
                                     ^^^^^^^^^^^^^^^^^^^^^^^^
                                     ⚠️ URL에 토큰 노출!
```

**OAuth2 변경 후**:
```
리다이렉트 URL:
http://localhost:3000/auth/callback?success=true
                                     ✅ 토큰 노출 없음!

Set-Cookie: accessToken=eyJhbGciOiJIUzI1NiIs...; HttpOnly; Secure; SameSite=None
            ✅ HTTP 헤더로만 전송 (브라우저 히스토리에 기록 안됨)
```

### 3. CSRF (Cross-Site Request Forgery) 방어

**SameSite 속성**:
- **개발**: `Lax` - 일부 Cross-Origin 요청 차단
- **운영**: `None` + `Secure` - HTTPS 환경에서 Cross-Origin 허용

**추가 권장사항**:
- CSRF 토큰 사용 (Spring Security에서 기본 제공)
- Origin/Referer 헤더 검증

---

## 📝 설정 파일 업데이트

### application.yml 권장 설정

```yaml
spring:
  profiles:
    active: dev  # 또는 prod

jwt:
  expiration: 7200000        # 2시간 (밀리초)
  refresh:
    expiration: 2592000000   # 30일 (밀리초)

frontend:
  url: http://localhost:3000  # 개발 환경
  # url: https://campstation.com  # 운영 환경
```

### application-prod.yml (운영 환경)

```yaml
spring:
  profiles:
    active: prod

jwt:
  expiration: 7200000        # 2시간
  refresh:
    expiration: 2592000000   # 30일

frontend:
  url: https://campstation.com  # 운영 환경 URL
```

---

## ✅ 테스트 체크리스트

### 백엔드 테스트

- [ ] **로그인 테스트**
  - [ ] POST /api/v1/auth/login 성공 시 쿠키 설정 확인
  - [ ] Response Headers에 `Set-Cookie: accessToken` 존재
  - [ ] Response Headers에 `Set-Cookie: refreshToken` 존재
  - [ ] HttpOnly, Secure, SameSite 속성 확인

- [ ] **회원가입 테스트**
  - [ ] POST /api/v1/auth/signup 성공 시 쿠키 설정 확인
  - [ ] Access Token과 Refresh Token 모두 쿠키로 설정됨

- [ ] **토큰 갱신 테스트**
  - [ ] POST /api/v1/auth/refresh 요청 시 쿠키에서 Refresh Token 읽기
  - [ ] 새로운 Access Token과 Refresh Token 쿠키로 설정

- [ ] **로그아웃 테스트**
  - [ ] POST /api/v1/auth/logout 성공 시 쿠키 삭제 확인
  - [ ] maxAge=0으로 쿠키 만료

- [ ] **API 요청 테스트**
  - [ ] 쿠키에 있는 Access Token으로 인증 성공
  - [ ] Authorization 헤더도 여전히 작동 (하위 호환성)

- [ ] **OAuth2 로그인 테스트**
  - [ ] Google/Kakao 로그인 성공 시 쿠키 설정 확인
  - [ ] 리다이렉트 URL에 토큰 포함 안됨
  - [ ] `success=true` 파라미터만 전달됨

### 환경별 테스트

- [ ] **개발 환경 (HTTP)**
  - [ ] Secure=false 확인
  - [ ] SameSite=Lax 확인
  - [ ] localhost에서 정상 동작

- [ ] **운영 환경 (HTTPS)**
  - [ ] Secure=true 확인
  - [ ] SameSite=None 확인
  - [ ] HTTPS에서만 쿠키 전송

---

## 🔍 디버깅 가이드

### 쿠키가 설정되지 않는 경우

1. **CORS 설정 확인**
```java
@Configuration
public class WebConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
        configuration.setAllowCredentials(true); // ⭐ 중요!
        configuration.setAllowedHeaders(Arrays.asList("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

2. **프론트엔드 fetch 옵션 확인**
```javascript
fetch('http://localhost:8080/api/v1/auth/login', {
  method: 'POST',
  credentials: 'include',  // ⭐ 중요!
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email, password }),
});
```

3. **브라우저 개발자 도구 확인**
   - Application → Cookies → localhost:8080
   - `accessToken`, `refreshToken` 존재 확인
   - HttpOnly 체크박스 확인

### 쿠키가 전송되지 않는 경우

1. **도메인 불일치**
   - 쿠키는 동일 도메인에서만 전송됨
   - localhost:3000 → localhost:8080 (OK)
   - localhost:3000 → 127.0.0.1:8080 (NG)

2. **Path 설정**
   - Cookie Path는 `/`로 설정 (모든 경로)
   - 특정 경로만 필요하면 `/api`로 제한 가능

3. **Secure 속성**
   - 운영 환경: Secure=true이므로 HTTPS 필수
   - 개발 환경: Secure=false이므로 HTTP 가능

---

## 📚 참고 자료

- [RFC 6265 - HTTP State Management Mechanism (Cookies)](https://datatracker.ietf.org/doc/html/rfc6265)
- [OWASP - HttpOnly Cookie](https://owasp.org/www-community/HttpOnly)
- [Spring Security - OAuth2 Login](https://docs.spring.io/spring-security/reference/servlet/oauth2/login/core.html)
- [MDN - Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)

---

**작성자**: CampStation Development Team
**마지막 업데이트**: 2025-10-31
