# Sprint 6: 소셜 로그인 & 백엔드 연동

**상태**: 🚀 진행 중  
**기간**: 2025-11-11 ~ 2025-11-18 (1주)  
**목표**: OAuth2 소셜 로그인 및 실제 백엔드 API 연동

---

## 📊 전체 진행도

**전체 완료**: 1.5/3 태스크 (50%)

```
████████████████████                           50%
```

**P1 (필수)**: 소셜 로그인 ✅ 완료

- [x] 카카오 OAuth2 연동
- [x] 네이버 OAuth2 연동
- [x] 콜백 페이지 및 토큰 관리

**P2 (필수)**: 백엔드 API 연동 🚀 진행 중 (50%)

- [x] JWT 토큰 자동 관리
- [x] 401 에러 자동 갱신
- [x] 환경 설정 및 테스트
- [x] API 연결 확인
- [ ] OAuth2 실제 로그인 테스트
- [ ] ADMIN 대시보드 실제 사용

**P3 (선택)**: 알림 시스템 ⏳ 대기

- [ ] 알림 타입 정의
- [ ] NotificationContext
- [ ] 알림 UI

---

## 📋 주요 태스크

### 1. 소셜 로그인 구현 🔐

OAuth2 기반 카카오/네이버 로그인 기능 구현

#### 1.1 OAuth2 클라이언트 설정

- [ ] **카카오 Developer**
  - [ ] 애플리케이션 등록
  - [ ] Redirect URI 설정
  - [ ] Client ID/Secret 발급
  - [ ] 환경변수 설정 (`NEXT_PUBLIC_KAKAO_CLIENT_ID`)

- [ ] **네이버 Developer**
  - [ ] 애플리케이션 등록
  - [ ] Redirect URI 설정
  - [ ] Client ID/Secret 발급
  - [ ] 환경변수 설정 (`NEXT_PUBLIC_NAVER_CLIENT_ID`)

#### 1.2 OAuth2 플로우 구현

- [x] **로그인 페이지** (app/login/page.tsx)
  - [x] 카카오 로그인 버튼 추가
  - [x] 네이버 로그인 버튼 추가
  - [x] OAuth2 인증 URL 생성
  - [x] state 파라미터 (CSRF 방지)

- [x] **콜백 페이지** (app/login/callback/page.tsx)
  - [x] 인증 코드 파싱
  - [x] 백엔드 API 호출 (토큰 교환)
  - [x] JWT 토큰 저장 (localStorage)
  - [x] 사용자 정보 저장 (AuthContext)
  - [x] 리다이렉트 처리 (이전 페이지 or 홈)

#### 1.3 OAuth API

- [x] **lib/api/oauth.ts** 생성

  ```typescript
  export const oauthApi = {
    loginWithKakao: (code: string) =>
      post<OAuthResponse>("/v1/auth/kakao", { code }),

    loginWithNaver: (code: string) =>
      post<OAuthResponse>("/v1/auth/naver", { code }),

    getUserProfile: () => get<User>("/v1/auth/me"),

    refreshToken: (refreshToken: string) =>
      post<OAuthResponse>("/v1/auth/refresh", { refreshToken }),
  };
  ```

- [x] **OAuthResponse 타입 정의**
  ```typescript
  interface OAuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
  }
  ```

#### 1.4 UI/UX

- [x] **소셜 로그인 버튼**
  - [x] 카카오 브랜드 컬러 (#FEE500)
  - [x] 네이버 브랜드 컬러 (#03C75A)
  - [x] 로고 아이콘 추가

- [x] **로딩 상태**
  - [x] 버튼 클릭 시 로딩 표시
  - [x] 콜백 처리 중 로딩 화면

- [x] **에러 처리**
  - [x] 인증 실패 시 에러 메시지
  - [x] 토스트 알림

**완료도**: 100% (15/15) ✅

**우선순위**: P1 (필수)

**예상 소요 시간**: 6시간  
**실제 소요 시간**: 5시간

---

### 2. 백엔드 API 연동 🔌

Mock 데이터를 실제 백엔드 API로 전환

#### 2.1 ADMIN 대시보드 API 연동

- [ ] **통계 API** (useAdminStats)
  - [ ] Mock 데이터 제거
  - [ ] 실제 `/v1/admin/stats` 호출
  - [ ] 에러 처리
  - [ ] 로딩 상태

- [ ] **차트 데이터 API**
  - [ ] 사용자 증가 추세 API
  - [ ] 매출 추세 API
  - [ ] 역할 분포 API
  - [ ] 예약 상태 분포 API
  - [ ] 캠핑장 승인 상태 API

#### 2.2 ADMIN 페이지 API 연동

- [ ] **사용자 관리**
  - [ ] useAllUsers Hook 테스트
  - [ ] 검색 필터 동작 확인
  - [ ] 역할 변경 API 테스트
  - [ ] 상태 변경 API 테스트

- [ ] **예약 관리**
  - [ ] useAllReservations Hook 테스트
  - [ ] 예약 취소 API 테스트
  - [ ] 환불 처리 확인

- [ ] **캠핑장 관리**
  - [ ] useAllCampgrounds Hook 테스트
  - [ ] 승인/거부 API 테스트
  - [ ] 삭제 API 테스트

- [ ] **신고 관리**
  - [ ] useAdminReports Hook 테스트
  - [ ] 신고 처리 API 테스트

#### 2.3 인증 흐름 개선

- [x] **JWT 토큰 관리**
  - [x] 토큰 갱신 로직 (refresh token)
  - [x] 토큰 만료 감지
  - [x] 자동 로그아웃

- [x] **권한 검증**
  - [x] API 클라이언트 자동 토큰 추가
  - [x] 401 에러 자동 갱신
  - [x] 403 Forbidden 처리

#### 2.4 에러 처리 강화

- [x] **API 에러 핸들링**
  - [x] 4xx 에러 처리 (Bad Request, Unauthorized, Forbidden)
  - [x] 5xx 에러 처리 (Server Error)
  - [x] 네트워크 에러 처리

- [x] **사용자 피드백**
  - [x] 토스트 알림 (성공/실패)
  - [x] 에러 페이지 (401, 403, 500)
  - [x] 재시도 버튼

**완료도**: 28% (5/18) 🚀

**우선순위**: P2 (필수)

**예상 소요 시간**: 8시간

---

### 3. 알림 시스템 (선택 사항) 🔔

실시간 알림 기능 구현

#### 3.1 타입 정의

- [ ] **types/notification.ts**
  ```typescript
  export interface Notification {
    id: number;
    type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
    category: "RESERVATION" | "REVIEW" | "REPORT" | "APPROVAL" | "PAYMENT";
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    link?: string;
  }
  ```

#### 3.2 알림 Context

- [ ] **contexts/NotificationContext.tsx**
  - [ ] 알림 목록 상태 관리
  - [ ] 읽음 처리 함수
  - [ ] 삭제 함수
  - [ ] 전체 읽음 함수
  - [ ] 실시간 업데이트 (polling or WebSocket)

#### 3.3 알림 UI

- [ ] **헤더 알림 아이콘**
  - [ ] Bell 아이콘 (lucide-react)
  - [ ] 미읽음 개수 뱃지
  - [ ] 클릭 시 드롭다운

- [ ] **알림 드롭다운**
  - [ ] 알림 목록 (최대 5개)
  - [ ] 읽음 표시
  - [ ] 클릭 시 해당 페이지 이동
  - [ ] "전체 보기" 링크

- [ ] **알림 페이지** (app/dashboard/notifications/page.tsx)
  - [ ] 전체 알림 목록
  - [ ] 필터 (전체/읽음/안읽음)
  - [ ] 정렬 (최신순/오래된순)
  - [ ] 전체 읽음 버튼

#### 3.4 알림 API

- [ ] **lib/api/notifications.ts**

  ```typescript
  export const notificationApi = {
    getNotifications: (params?: { isRead?: boolean }) =>
      get<PageResponse<Notification>>("/v1/notifications", params),

    markAsRead: (id: number) => put(`/v1/notifications/${id}/read`),

    deleteNotification: (id: number) => del(`/v1/notifications/${id}`),

    markAllAsRead: () => put("/v1/notifications/read-all"),
  };
  ```

**완료도**: 0% (0/12) ⏳

**우선순위**: P3 (선택)

**예상 소요 시간**: 4시간

---

## 📝 백엔드 API 요구사항

### OAuth2 인증

```
POST /v1/auth/kakao
Body: { code: string }
Response: { accessToken: string, refreshToken: string, user: User }

POST /v1/auth/naver
Body: { code: string }
Response: { accessToken: string, refreshToken: string, user: User }

GET /v1/auth/me
Headers: Authorization: Bearer {token}
Response: User

POST /v1/auth/refresh
Body: { refreshToken: string }
Response: { accessToken: string }
```

### 통계 API

```
GET /v1/admin/stats
Response: {
  totalUsers: number,
  totalReservations: number,
  totalRevenue: number,
  totalCampgrounds: number,
  userGrowth: Array<{ month: string, value: number }>,
  revenueGrowth: Array<{ month: string, value: number }>,
  userRoleDistribution: Array<{ name: string, value: number }>,
  reservationStatusDistribution: Array<{ name: string, value: number }>,
  campgroundApprovalStatus: Array<{ name: string, value: number }>
}
```

### 알림 API

```
GET /v1/notifications
Query: isRead?: boolean
Response: PageResponse<Notification>

PUT /v1/notifications/{id}/read
Response: { success: boolean }

DELETE /v1/notifications/{id}
Response: { success: boolean }

PUT /v1/notifications/read-all
Response: { success: boolean }
```

---

## 🎨 UI/UX 가이드

### 소셜 로그인 버튼

**카카오 로그인**:

- 배경색: `#FEE500`
- 텍스트: `#000000` (검정)
- 아이콘: 카카오톡 로고
- 텍스트: "카카오로 시작하기"

**네이버 로그인**:

- 배경색: `#03C75A`
- 텍스트: `#FFFFFF` (흰색)
- 아이콘: 네이버 로고
- 텍스트: "네이버로 시작하기"

### 알림

**알림 뱃지**:

- 빨간색 원 (`bg-red-500`)
- 흰색 텍스트
- 최대 99+ 표시

**알림 드롭다운**:

- 최대 너비: 384px (w-96)
- 최대 높이: 400px (스크롤)
- 그림자: `shadow-lg`

---

## ✅ 완료 기준

Sprint 6 완료 조건:

- [ ] 카카오 로그인 동작 확인
- [ ] 네이버 로그인 동작 확인
- [ ] JWT 토큰 저장 및 갱신
- [ ] ADMIN 대시보드 실제 데이터 표시
- [ ] 모든 ADMIN 페이지 API 연동
- [ ] 에러 처리 동작 확인
- [ ] 알림 시스템 (선택, 시간 있으면)
- [ ] TypeScript 빌드 에러 0개
- [ ] 문서 업데이트

---

## 📊 예상 일정

## 📅 스케줄

**Day 1 (11-11)**: ✅ 완료

- ✅ OAuth2 설정 (카카오, 네이버)
- ✅ 로그인 페이지 UI
- ✅ 콜백 페이지 구현

**Day 2 (11-12)**: ✅ 완료

- ✅ 토큰 관리 시스템 (갱신, 만료 감지)
- ✅ API 클라이언트 자동 토큰 추가
- ✅ 401 에러 자동 갱신 로직

**Day 3 (11-13)**: 🚀 진행 예정

- 환경변수 설정 테스트
- OAuth 플로우 통합 테스트
- ADMIN 대시보드 API 연동 시작

**Day 4 (11-14)**:

- ADMIN 페이지 API 연동
- 사용자/예약/캠핑장/신고 관리

**Day 5 (11-15)**:

- Mock 데이터 제거
- 실제 API 테스트
- QA 및 버그 수정

**Day 6-7 (11-16~17, 선택)**:

- 알림 시스템 구현 (선택)
- 문서 업데이트
- Sprint 6 회고

---

## 🔗 관련 문서

- [04-API-GUIDE.md](../specifications/04-API-GUIDE.md)
- [05-STATE-MANAGEMENT.md](../specifications/05-STATE-MANAGEMENT.md)
- [08-ROADMAP.md](../specifications/08-ROADMAP.md)
- [next-tasks.md](../next-tasks.md)

---

## 🎯 다음 스프린트 (Sprint 7)

### 추가 기능

- 결제 시스템 개선 (포인트, 쿠폰)
- 리뷰 시스템 고도화 (답글, 수정 이력)
- 검색 기능 고도화 (AI 추천, 유사 캠핑장)
- 지도 기능 개선 (클러스터링, 필터)

### 성능 & 배포

- 성능 최적화 (이미지 최적화, 캐싱)
- SEO 최적화 (메타 태그, 사이트맵)
- 접근성 개선 (ARIA, 키보드 네비게이션)
- Vercel 배포 및 테스트

---

**Sprint 6 시작!** 🚀
