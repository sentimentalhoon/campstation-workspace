# OAuth2 로그인 테스트 가이드

## 🔐 카카오 로그인 테스트

### 1. 카카오 개발자 콘솔 설정 확인

#### 📌 Redirect URI 설정

카카오 개발자 콘솔 (https://developers.kakao.com/) 접속:

1. **내 애플리케이션** → **앱 선택**
2. **제품 설정** → **카카오 로그인** → **Redirect URI**
3. 다음 URI를 등록:
   ```
   http://localhost:8080/login/oauth2/code/kakao
   ```

#### 📌 Client ID 확인

- **앱 설정** → **앱 키**
- **REST API 키** 복사: `bbefec8e2bb060a63249bf25a3c737f1` (현재 .env.local에 설정됨)

#### 📌 동의 항목 설정

- **제품 설정** → **카카오 로그인** → **동의 항목**
- 필수 동의 항목:
  - ✅ 닉네임 (profile_nickname)
  - ✅ 카카오계정 (이메일) (account_email)

#### 📌 활성화 상태 확인

- **제품 설정** → **카카오 로그인** → **활성화 설정**
- **ON** 상태 확인

---

### 2. 백엔드 환경 변수 설정

`backend/src/main/resources/application-dev.yml`:

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          kakao:
            client-id: bbefec8e2bb060a63249bf25a3c737f1 # 카카오 REST API 키
            client-secret: your-kakao-client-secret # 필요시 설정 (선택)
            redirect-uri: http://localhost:8080/login/oauth2/code/kakao
            scope:
              - account_email
              - profile_nickname

frontend:
  url: http://localhost:3000 # 추가됨
```

---

### 3. 프론트엔드 환경 변수 설정

`frontend/.env.local`:

```bash
# OAuth2 Social Login
NEXT_PUBLIC_KAKAO_REST_API_KEY=bbefec8e2bb060a63249bf25a3c737f1
NEXT_PUBLIC_KAKAO_CLIENT_ID=bbefec8e2bb060a63249bf25a3c737f1  # 추가 필요
```

---

### 4. 로그인 플로우 테스트

#### Step 1: 로그인 페이지 접속

```
http://localhost:3000/login
```

#### Step 2: "카카오로 시작하기" 버튼 클릭

- 프론트엔드: `http://localhost:8080/oauth2/authorization/kakao`로 리다이렉트
- 백엔드: 카카오 OAuth2 인증 페이지로 리다이렉트

#### Step 3: 카카오 로그인 및 동의

- 카카오 계정 로그인
- 동의 항목 확인 (이메일, 닉네임)
- "동의하고 계속하기" 클릭

#### Step 4: 콜백 처리

- 카카오 → 백엔드: `http://localhost:8080/login/oauth2/code/kakao?code=...`
- 백엔드: Spring Security OAuth2가 자동 처리
- 백엔드 → 프론트: `http://localhost:3000/auth/callback?success=true` + HttpOnly 쿠키 (JWT)

#### Step 5: 사용자 정보 조회

- 프론트엔드: `/api/v1/auth/me` 호출 (쿠키 자동 전송)
- AuthContext에 사용자 정보 저장
- 홈으로 리다이렉트

---

### 5. 예상 결과

#### ✅ 성공 시

1. `/auth/callback?success=true` 페이지로 이동
2. "로그인 처리 중..." 로딩 표시
3. 홈(`/`) 또는 이전 페이지로 리다이렉트
4. 우측 상단에 사용자 닉네임 표시

#### ❌ 실패 시

1. `/auth/callback?error=...` 또는 에러 표시
2. 브라우저 개발자 도구 → Console/Network 탭 확인
3. 백엔드 로그 확인 (`org.springframework.security.oauth2: DEBUG`)

---

### 6. 디버깅 체크리스트

#### 🔍 프론트엔드

```javascript
// 브라우저 개발자 도구 Console
console.log(
  "카카오 로그인 URL:",
  "http://localhost:8080/oauth2/authorization/kakao"
);
```

#### 🔍 백엔드 로그

```bash
# Spring Security OAuth2 디버그 로그 확인
# application-dev.yml에 이미 설정됨:
# org.springframework.security.oauth2: DEBUG
```

#### 🔍 네트워크 요청

1. `/oauth2/authorization/kakao` → 302 Redirect (카카오로)
2. 카카오 로그인 → 302 Redirect (백엔드 콜백으로)
3. `/login/oauth2/code/kakao` → 302 Redirect (프론트 콜백으로)
4. `/auth/callback?success=true` → 200 OK
5. `/api/v1/auth/me` → 200 OK (사용자 정보)

---

## 🟢 네이버 로그인 테스트

### 1. 네이버 개발자 센터 설정 확인

#### 📌 Redirect URI 설정

네이버 개발자 센터 (https://developers.naver.com/) 접속:

1. **내 애플리케이션** → **앱 선택**
2. **API 설정**
3. **서비스 URL**: `http://localhost:3000`
4. **Callback URL**: `http://localhost:8080/login/oauth2/code/naver`

#### 📌 Client ID/Secret 확인

- Client ID: `NvwJHLtK_ttnE3wDTFZj` (현재 .env.local에 설정됨)
- Client Secret: `S_QEyzOOGg` (현재 .env.local에 설정됨)

#### 📌 제공 정보 선택

- ✅ 회원 이름
- ✅ 이메일 주소
- ✅ 프로필 사진

---

### 2. 백엔드 환경 변수 설정

`backend/src/main/resources/application-dev.yml`:

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          naver:
            client-id: NvwJHLtK_ttnE3wDTFZj
            client-secret: S_QEyzOOGg
            redirect-uri: http://localhost:8080/login/oauth2/code/naver
            scope:
              - name
              - email
              - profile_image
```

---

### 3. 로그인 플로우 테스트

카카오와 동일한 플로우, **"네이버로 시작하기"** 버튼 클릭

---

## 🔥 실제 테스트 시작

### 테스트 순서:

1. ✅ 프론트엔드 실행 확인: http://localhost:3000
2. ✅ 백엔드 실행 확인: http://localhost:8080/actuator/health
3. ⏳ 카카오 개발자 콘솔 설정 확인
4. ⏳ 카카오 로그인 테스트
5. ⏳ 네이버 개발자 센터 설정 확인
6. ⏳ 네이버 로그인 테스트
7. ⏳ 토큰 갱신 플로우 테스트

---

## 📋 트러블슈팅

### 문제 1: "Redirect URI mismatch"

- 카카오/네이버 개발자 콘솔에서 Redirect URI 재확인
- **정확히 일치해야 함**: `http://localhost:8080/login/oauth2/code/kakao`

### 문제 2: "Invalid client_id"

- `.env.local`과 `application-dev.yml`의 Client ID 일치 확인
- 카카오/네이버 개발자 콘솔에서 앱 키 재확인

### 문제 3: 콜백 페이지 404

- 프론트엔드 라우팅 확인: `app/(auth)/callback/page.tsx`
- 백엔드 리다이렉트 URL 확인: `frontend.url` + `/auth/callback`

### 문제 4: 쿠키가 전송되지 않음

- CORS 설정 확인: `allow-credentials: true`
- 백엔드 `CookieConfig` 확인: `HttpOnly`, `SameSite=Lax`

---

**다음 단계**: 카카오 개발자 콘솔 설정 확인 후 실제 로그인 테스트 🚀
