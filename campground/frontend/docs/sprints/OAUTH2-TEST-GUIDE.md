# OAuth2 로그인 테스트 가이드

**날짜**: 2025-11-13  
**목적**: 카카오/네이버 소셜 로그인 실제 테스트

---

## 📋 사전 준비 사항

### 1. 환경변수 확인

`.env.local` 파일에 다음 값이 설정되어 있는지 확인:

```bash
# 카카오 로그인
NEXT_PUBLIC_KAKAO_REST_API_KEY=bbefec8e2bb060a63249bf25a3c737f1
NEXT_PUBLIC_KAKAO_CLIENT_ID=bbefec8e2bb060a63249bf25a3c737f1

# 네이버 로그인
NEXT_PUBLIC_NAVER_CLIENT_ID=NvwJHLtK_ttnE3wDTFZj
```

### 2. 개발자 센터 설정 확인

#### 카카오 개발자 센터

- URL: https://developers.kakao.com/
- Redirect URI: `http://localhost:3001/login/callback`
- 상태: ✅ 이미 설정됨 (기존 Client ID 사용)

#### 네이버 개발자 센터

- URL: https://developers.naver.com/
- Redirect URI: `http://localhost:3001/login/callback`
- 상태: ✅ 이미 설정됨 (기존 Client ID 사용)

---

## 🧪 테스트 시나리오

### 시나리오 1: 카카오 로그인

#### Step 1: 로그인 페이지 접속

```
URL: http://localhost:3001/login
```

**확인 사항**:

- [ ] 카카오 로그인 버튼 표시 (노란색 #FEE500)
- [ ] 카카오 로고 아이콘 표시
- [ ] 버튼 클릭 가능

#### Step 2: 카카오 인증 페이지

**확인 사항**:

- [ ] 카카오 로그인 페이지로 리다이렉트
- [ ] URL에 `client_id`, `redirect_uri`, `state` 파라미터 포함
- [ ] 카카오 계정으로 로그인

#### Step 3: 콜백 처리

**확인 사항**:

- [ ] `/login/callback?code=xxx&state=xxx` 으로 리다이렉트
- [ ] 로딩 화면 표시
- [ ] state 검증 성공
- [ ] 백엔드 API 호출 (`POST /v1/auth/oauth/kakao`)
- [ ] 응답 확인:
  ```json
  {
    "accessToken": "...",
    "refreshToken": "...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "사용자",
      "role": "MEMBER"
    }
  }
  ```

#### Step 4: 토큰 저장 및 리다이렉트

**확인 사항**:

- [ ] localStorage에 토큰 저장:
  - `campstation-auth-token` (Access Token)
  - `campstation-refresh-token` (Refresh Token)
- [ ] AuthContext에 사용자 정보 저장
- [ ] 홈페이지 또는 이전 페이지로 리다이렉트

#### Step 5: 로그인 상태 확인

**확인 사항**:

- [ ] 헤더에 사용자 이름 표시
- [ ] 로그인 버튼 → 로그아웃 버튼 변경
- [ ] 프로필 메뉴 접근 가능

---

### 시나리오 2: 네이버 로그인

#### Step 1: 로그인 페이지 접속

```
URL: http://localhost:3001/login
```

**확인 사항**:

- [ ] 네이버 로그인 버튼 표시 (초록색 #03C75A)
- [ ] 네이버 로고 아이콘 표시
- [ ] 버튼 클릭 가능

#### Step 2: 네이버 인증 페이지

**확인 사항**:

- [ ] 네이버 로그인 페이지로 리다이렉트
- [ ] URL에 `client_id`, `redirect_uri`, `state` 파라미터 포함
- [ ] 네이버 계정으로 로그인

#### Step 3: 콜백 처리

**확인 사항**:

- [ ] `/login/callback?code=xxx&state=xxx` 으로 리다이렉트
- [ ] 로딩 화면 표시
- [ ] state 검증 성공
- [ ] 백엔드 API 호출 (`POST /v1/auth/oauth/naver`)
- [ ] 응답 확인 (카카오와 동일)

#### Step 4~5: 카카오와 동일

---

### 시나리오 3: 토큰 갱신 테스트

#### Step 1: 토큰 만료 시뮬레이션

**방법**:

1. localStorage에서 Access Token 확인
2. JWT 디코딩하여 만료 시간 확인
3. 또는 5분 대기

#### Step 2: API 호출

**확인 사항**:

- [ ] API 요청 시 자동 토큰 갱신 시도
- [ ] `POST /v1/auth/refresh` 호출
- [ ] 새 Access Token 저장
- [ ] 원래 API 요청 재시도 성공

#### Step 3: 갱신 실패 시나리오

**확인 사항**:

- [ ] Refresh Token도 만료된 경우
- [ ] `/error/401` 페이지로 리다이렉트
- [ ] "로그인하기" 버튼 표시

---

### 시나리오 4: 에러 처리 테스트

#### 4.1 CSRF 공격 시뮬레이션

**방법**:

1. `/login/callback?code=test&state=invalid_state` 직접 접속

**확인 사항**:

- [ ] state 검증 실패
- [ ] 에러 메시지 표시
- [ ] 로그인 페이지로 리다이렉트

#### 4.2 백엔드 에러

**방법**:

1. 백엔드 서버 중지
2. 로그인 시도

**확인 사항**:

- [ ] 네트워크 에러 처리
- [ ] 사용자 친화적 에러 메시지
- [ ] 재시도 옵션 제공

#### 4.3 권한 부족

**방법**:

1. MEMBER 역할로 로그인
2. `/dashboard/admin` 접속 시도

**확인 사항**:

- [ ] `/error/403` 페이지 표시
- [ ] "접근 권한이 없습니다" 메시지
- [ ] "홈으로" 버튼 작동

---

## 🔍 디버깅 도구

### 1. 브라우저 개발자 도구

#### localStorage 확인

```javascript
// 콘솔에서 실행
localStorage.getItem("campstation-auth-token");
localStorage.getItem("campstation-refresh-token");
```

#### JWT 디코딩

```javascript
// Access Token 디코딩
const token = localStorage.getItem("campstation-auth-token");
const payload = JSON.parse(atob(token.split(".")[1]));
console.log(payload);
```

#### 만료 시간 확인

```javascript
const token = localStorage.getItem("campstation-auth-token");
const payload = JSON.parse(atob(token.split(".")[1]));
const expireDate = new Date(payload.exp * 1000);
console.log("만료 시간:", expireDate);
console.log("남은 시간:", (payload.exp * 1000 - Date.now()) / 1000 / 60, "분");
```

### 2. Network 탭 모니터링

**확인할 요청**:

- `POST /v1/auth/oauth/kakao`
- `POST /v1/auth/oauth/naver`
- `POST /v1/auth/refresh`
- `GET /v1/auth/me`

**확인 사항**:

- Request Headers: `Authorization: Bearer ...`
- Response Status: 200, 401, 403, 500
- Response Body: JSON 구조

### 3. React DevTools

**AuthContext 상태 확인**:

- `user` 객체
- `isAuthenticated` 값
- `isLoading` 값

---

## 📊 테스트 결과 기록

### 카카오 로그인

| 단계        | 결과                | 비고 |
| ----------- | ------------------- | ---- |
| 버튼 클릭   | [ ] 성공 / [ ] 실패 |      |
| 인증 페이지 | [ ] 성공 / [ ] 실패 |      |
| 콜백 처리   | [ ] 성공 / [ ] 실패 |      |
| 토큰 저장   | [ ] 성공 / [ ] 실패 |      |
| 리다이렉트  | [ ] 성공 / [ ] 실패 |      |

### 네이버 로그인

| 단계        | 결과                | 비고 |
| ----------- | ------------------- | ---- |
| 버튼 클릭   | [ ] 성공 / [ ] 실패 |      |
| 인증 페이지 | [ ] 성공 / [ ] 실패 |      |
| 콜백 처리   | [ ] 성공 / [ ] 실패 |      |
| 토큰 저장   | [ ] 성공 / [ ] 실패 |      |
| 리다이렉트  | [ ] 성공 / [ ] 실패 |      |

### 토큰 갱신

| 시나리오                | 결과                | 비고 |
| ----------------------- | ------------------- | ---- |
| 자동 갱신               | [ ] 성공 / [ ] 실패 |      |
| 갱신 실패 시 리다이렉트 | [ ] 성공 / [ ] 실패 |      |

### 에러 처리

| 시나리오        | 결과                | 비고 |
| --------------- | ------------------- | ---- |
| CSRF 검증       | [ ] 성공 / [ ] 실패 |      |
| 네트워크 에러   | [ ] 성공 / [ ] 실패 |      |
| 권한 부족 (403) | [ ] 성공 / [ ] 실패 |      |

---

## 🚨 알려진 이슈

### Issue 1: Redirect URI 불일치

**증상**: 카카오/네이버 로그인 시 "Redirect URI mismatch" 에러

**원인**: 개발자 센터에 등록된 Redirect URI와 실제 URI 불일치

**해결**:

1. 카카오/네이버 개발자 센터 접속
2. 앱 설정 → Redirect URI 확인
3. `http://localhost:3001/login/callback` 추가/수정

### Issue 2: Client ID 미설정

**증상**: OAuth URL에 `client_id=undefined` 포함

**원인**: `.env.local` 파일에 환경변수 미설정

**해결**:

1. `.env.local` 파일 확인
2. `NEXT_PUBLIC_KAKAO_CLIENT_ID` 설정
3. `NEXT_PUBLIC_NAVER_CLIENT_ID` 설정
4. 개발 서버 재시작 (`npm run dev`)

### Issue 3: CORS 에러

**증상**: 백엔드 API 호출 시 CORS 에러

**원인**: 백엔드에서 프론트엔드 도메인 허용 안됨

**해결**:

1. 백엔드 `application.yml` 확인
2. `cors.allowed-origins`에 `http://localhost:3001` 추가
3. 백엔드 서버 재시작

---

## 📝 참고사항

### OAuth2 플로우 요약

```
1. 사용자: 로그인 버튼 클릭
2. 프론트: OAuth URL로 리다이렉트 (state 생성)
3. 카카오/네이버: 사용자 인증
4. 카카오/네이버: /login/callback?code=xxx&state=xxx로 리다이렉트
5. 프론트: state 검증
6. 프론트: 백엔드에 code 전송
7. 백엔드: 카카오/네이버에 토큰 요청
8. 백엔드: 사용자 정보 조회/생성
9. 백엔드: JWT 토큰 발급
10. 프론트: 토큰 저장 및 사용자 정보 저장
11. 프론트: 홈페이지 리다이렉트
```

### 보안 고려사항

- ✅ state 파라미터로 CSRF 방지
- ✅ HTTPS 사용 권장 (프로덕션)
- ✅ Refresh Token은 HttpOnly 쿠키 권장 (향후 개선)
- ✅ 토큰 만료 시간 5분 전 자동 갱신

---

**작성일**: 2025-11-13  
**다음 단계**: ADMIN 대시보드 실제 테스트
