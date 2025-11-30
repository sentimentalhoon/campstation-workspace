# Sprint 6 진행 상황

**작성일**: 2025-11-13  
**현재 진행도**: 50% (1.5/3)

---

## ✅ 완료된 작업 요약

### Sprint 5 - 100% ✅

**Phase 1: OWNER** ✅

- 공통 컴포넌트 4개
- OWNER 페이지 3개
- API & Hooks
- 권한 체크 & 테스트

**Phase 2: ADMIN** ✅

- ADMIN API (admin.ts, 330줄, 15+ 엔드포인트)
- ADMIN Hooks 5개
- ADMIN 페이지 5개 (대시보드, 사용자, 캠핑장, 예약, 신고)
- UserTable 컴포넌트
- 권한 체크 (withAdminAuth)

**Phase 3: 고급 기능** ✅

- Recharts 차트 라이브러리 (36 packages)
- xlsx 엑셀 다운로드 (9 packages)
- 차트 컴포넌트 5개
- 통계 기능 3개 페이지
- 총 29h, 3,640줄, 25개 파일

---

### Sprint 6 - 50% 🚀

**Task 1: OAuth2 소셜 로그인** ✅ 100%

- [x] OAuth2 타입 정의 (types/oauth.ts)
- [x] OAuth2 API (lib/api/oauth.ts)
- [x] 소셜 로그인 UI (카카오/네이버 버튼)
- [x] OAuth2 콜백 페이지 (Suspense)
- [x] AuthContext.setUser() 추가
- [x] 에러 페이지 3개 (401, 403, 500)
- [x] 환경변수 설정 (.env.local)

**Task 2: 백엔드 API 연동** 🚀 50%

- [x] 토큰 갱신 유틸리티 (lib/utils/token.ts)
- [x] API 클라이언트 자동 토큰 추가
- [x] 401 에러 자동 갱신
- [x] 환경 설정 확인
- [x] 백엔드 API 테스트 (Health Check, 캠핑장 목록)
- [x] 테스트 가이드 작성 (OAuth2, ADMIN)
- [ ] OAuth2 실제 로그인 테스트
- [ ] ADMIN 대시보드 실제 사용

**Task 3: 알림 시스템** ⏳ 0% (선택 사항)

- [ ] 알림 타입 정의
- [ ] NotificationContext
- [ ] 알림 UI

---

## 📊 Sprint 6 통계

### 생성 파일 (15개)

1. types/oauth.ts
2. lib/api/oauth.ts
3. lib/utils/token.ts
4. app/(auth)/login/callback/page.tsx
5. app/error/401/page.tsx
6. app/error/403/page.tsx
7. app/error/500/page.tsx
8. .env.local.example
9. test-api.js
10. docs/sprints/SPRINT6-DAY2-COMPLETE.md
11. docs/sprints/SPRINT6-DAY3-CHECKLIST.md
12. docs/sprints/SPRINT6-DAY3-TEST-RESULTS.md
13. docs/sprints/SPRINT6-DAY3-COMPLETE.md
14. docs/sprints/OAUTH2-TEST-GUIDE.md
15. docs/sprints/ADMIN-DASHBOARD-TEST-GUIDE.md

### 수정 파일 (5개)

1. app/(auth)/login/page.tsx (소셜 로그인 버튼)
2. contexts/AuthContext.tsx (setUser 추가)
3. lib/api/client.ts (자동 토큰 & 401 갱신)
4. lib/constants/config.ts (REFRESH_TOKEN 상수)
5. docs/sprints/sprint-6.md (진행도 업데이트)

### 코드 추가

- 약 800줄 (OAuth2 + 토큰 관리 + 에러 페이지)

---

## 🎯 다음 작업 (Day 4-5)

### 우선순위 1: 실제 테스트 (필수)

#### 1. 통계 차트 (Chart.js / Recharts)

- 사용자 증가 추세 그래프
- 매출 통계 차트
- 캠핑장별 예약 현황
- 지역별 분포

#### 2. 엑셀 다운로드

- 예약 내역 엑셀 다운로드
- 매출 리포트 다운로드
- 사용자 목록 다운로드

#### 3. 알림 시스템

- 실시간 알림 (신고, 예약, 승인)
- 알림 목록 페이지
- 알림 읽음 처리

**예상 시간**: 2-3일

**우선순위**: 중간

---

### 옵션 2: Sprint 6 시작 - 소셜 로그인

**목표**: 카카오/네이버 소셜 로그인 연동

### 옵션 2: 백엔드 API 연동

**목표**: 프론트엔드 구현된 기능을 백엔드 API와 연동

**작업 범위**:

#### 1. OWNER API 연동

- `ownerApi.getMyCampgrounds()` 실제 호출
- `ownerApi.createCampground()` FormData 전송
- `ownerApi.updateCampground()` 수정
- `ownerApi.getSites()` 구역 목록
- `ownerApi.getReservations()` 예약 목록
- `ownerApi.getStats()` 통계

#### 2. 에러 처리

- API 에러 핸들링
- 토스트 알림
- 로딩 상태

#### 3. 테스트

- E2E 테스트 .skip 제거
- 실제 API 호출 테스트

**예상 시간**: 2-3일

**우선순위**: 중간

**장점**:

- 실제 동작하는 기능
- 백엔드 연동 검증
- E2E 테스트 실행 가능

**단점**:

- 백엔드 API 완성 필요
- 백엔드 팀과 협업 필요

---

### 옵션 3: Phase 3 - 고급 기능 구현

**목표**: 사용자 경험과 운영 효율성 향상

**작업 범위**:

#### 1. 통계 차트 (2-3일)

- **라이브러리**: Recharts 또는 Chart.js
- **차트 종류**:
  - 매출 추이 (선형 차트)
  - 예약 현황 (막대 차트)
  - 캠핑장별 점유율 (도넛 차트)
  - 월별 비교 (복합 차트)
- **필터**:
  - 기간 선택 (일/주/월/년)
  - 캠핑장 선택

#### 2. 엑셀 다운로드 (1일)

- **라이브러리**: xlsx
- **다운로드 대상**:
  - 예약 목록
  - 매출 통계
  - 사용자 목록 (ADMIN)
- **포맷**:
  - 날짜, 금액 포맷팅
  - 한글 헤더

#### 3. 알림 시스템 (2-3일)

- **알림 타입**:
  - 새 예약
  - 예약 취소
  - 리뷰 등록
  - 승인 결과 (OWNER)
- **UI**:
  - 헤더 알림 아이콘
  - 알림 드롭다운
  - 읽음/안읽음 상태
- **백엔드**:
  - WebSocket 또는 SSE
  - 알림 API

**예상 시간**: 5-7일

**우선순위**: 낮음

**장점**:

- 사용자 경험 향상
- 데이터 시각화
- 운영 효율성 증대

**단점**:

- 백엔드 지원 필요 (알림)
- 추가 라이브러리 도입

---

### 옵션 4: 추가 페이지 구현

**작업 범위**:

#### 1. OWNER 추가 페이지 (2-3일)

- `dashboard/owner/campgrounds/[id]/sites/page.tsx`
  - SiteManager 컴포넌트 활용
  - 구역별 예약 현황
- `dashboard/owner/campgrounds/[id]/reservations/page.tsx`
  - ReservationTable 컴포넌트 활용
  - 캠핑장별 예약 관리
- `dashboard/owner/stats/page.tsx`
  - 상세 통계 페이지
  - 차트 (옵션 3과 연계)

#### 2. OWNER 프로필 관리 (1일)

- 사업자 정보 수정
- 정산 계좌 관리

**예상 시간**: 3-4일

---

## 📊 추천 작업 순서

### 시나리오 A: 관리자 기능 완성 (추천) ⭐

1. **Phase 2: ADMIN 기능** (3-4일)
   - ADMIN 페이지 5개
   - ADMIN 컴포넌트 3개
   - API & Hooks

2. **백엔드 API 연동** (2-3일)
   - OWNER API 연동
   - ADMIN API 연동
   - E2E 테스트

3. **Phase 3: 고급 기능** (5-7일) - 선택
   - 통계 차트
   - 엑셀 다운로드
   - 알림 시스템

**총 예상 시간**: 5-7일 (고급 기능 제외)

**장점**:

- 관리자 기능 완전 구현
- 시스템 운영 가능
- 체계적인 권한 관리

---

### 시나리오 B: 빠른 연동 우선

1. **백엔드 API 연동** (2-3일)
   - OWNER API 연동
   - E2E 테스트

2. **Phase 2: ADMIN 기능** (3-4일)
   - ADMIN 페이지 & API 동시 연동

3. **추가 페이지** (3-4일) - 선택
   - OWNER 상세 페이지

**총 예상 시간**: 5-7일 (추가 페이지 제외)

**장점**:

- 빠른 실사용 가능
- 백엔드 검증 조기 진행

---

## 🎯 최종 추천

### **Phase 2 ADMIN 기능 구현 → 백엔드 API 연동**

**이유**:

1. **완성도**: 관리자 기능 전체 구현 완료
2. **일관성**: Phase 1과 같은 패턴으로 개발
3. **독립성**: 백엔드 의존도 낮음
4. **가치**: 시스템 운영에 필수 기능

**다음 스텝**:

1. ADMIN 대시보드 페이지부터 시작
2. UserTable, CampgroundApprovalCard 컴포넌트
3. admin.ts API & Hooks
4. withAdminAuth 적용
5. 테스트 작성

---

## 📝 참고사항

### 백엔드 API 필요 사항

**OWNER API** (이미 정의됨):

- GET `/v1/owner/campgrounds`
- POST `/v1/owner/campgrounds`
- PUT `/v1/owner/campgrounds/:id`
- GET `/v1/owner/campgrounds/:id/sites`
- POST `/v1/owner/campgrounds/:id/sites`
- GET `/v1/owner/reservations`
- PUT `/v1/owner/reservations/:id/status`
- GET `/v1/owner/stats`

**ADMIN API** (Phase 2에서 정의 필요):

- GET `/v1/admin/campgrounds` (전체 캠핑장)
- PUT `/v1/admin/campgrounds/:id/approve` (승인)
- PUT `/v1/admin/campgrounds/:id/reject` (거부)
- GET `/v1/admin/users` (전체 사용자)
- PUT `/v1/admin/users/:id/role` (역할 변경)
- GET `/v1/admin/reservations` (전체 예약)
- GET `/v1/admin/reports` (신고 목록)
- PUT `/v1/admin/reports/:id/process` (신고 처리)
- GET `/v1/admin/stats` (전체 통계)

### 기술 스택

**이미 사용 중**:

- React 19
- Next.js 15
- TypeScript
- Tailwind CSS
- Lucide Icons

**추가 고려 사항** (Phase 3):

- Recharts (차트)
- xlsx (엑셀)
- WebSocket (알림)

---

**결론**: Phase 2 ADMIN 기능 구현을 추천합니다! 🚀
