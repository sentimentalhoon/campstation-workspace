# 개발 로드맵

> CampStation Frontend 개발 계획 및 마일스톤

## 🎯 전체 목표

**목표**: 모바일 전용 캠핑장 예약 플랫폼 구축  
**기간**: 약 8주 (50시간 순수 개발 시간 기준)  
**방법론**: Agile, 2주 스프린트

---

## 📅 스프린트 계획

### Sprint 0: 프로젝트 세팅 (완료) ✅

**기간**: 2025-11-01 ~ 2025-11-09  
**목표**: 개발 환경 구축 및 기반 작업

#### 완료 항목

- [x] Next.js 16 프로젝트 생성
- [x] TypeScript + Tailwind CSS 설정
- [x] 폴더 구조 정의
- [x] 문서화 (8개 기술 문서 + 7개 명세 문서)
- [x] 타입 시스템 구축 (15+ 타입 파일)
- [x] API 클라이언트 구조 (base + 5 feature modules)
- [x] 기본 UI 컴포넌트 (9개)
- [x] 레이아웃 컴포넌트 (3개)
- [x] 인증 시스템 (AuthContext)
- [x] 로그인/회원가입 페이지
- [x] 캠핑장 목록 페이지
- [x] Docker 환경 구성
- [x] Git 저장소 연동 (5 commits)

**산출물**:

- ✅ 15개 문서 파일
- ✅ 70+ 코드 파일
- ✅ GitHub 저장소 (sentimentalhoon/campstation-frontend)

---

### Sprint 1: 캠핑장 상세 및 예약 기초 (완료) ✅

**기간**: 2025-11-09 (1일)  
**목표**: 캠핑장 상세 정보 표시 및 예약 프로세스 시작

#### 주요 태스크

- [x] **캠핑장 상세 페이지**
  - [x] 이미지 갤러리 컴포넌트 (ImageGallery)
  - [x] 상세 정보 섹션
  - [x] 편의시설 그리드 (FacilityGrid)
  - [x] 리뷰 목록 (ReviewList)
  - [x] Sticky CTA 버튼
- [x] **예약 페이지 (Step 1-3)**
  - [x] 날짜 선택 (Calendar 컴포넌트)
  - [x] 사이트 선택 (SiteSelector)
  - [x] 인원 입력 (GuestCounter)
  - [x] Step Indicator
  - [x] Summary Bar
- [x] **API 연동**
  - [x] 캠핑장 상세 조회 (useCampgroundDetail)
  - [x] 사이트 조회 (campgroundApi.getSites)
  - [x] 예약 생성 (reservationApi.create)
- [x] **타입 정합성**
  - [x] 백엔드 API 응답과 프론트엔드 타입 일치
  - [x] CampSite → Site 타입 통일
  - [x] 필드명 매핑 (thumbnailUrls, siteNumber, basePrice 등)

#### 실제 공수

- 캠핑장 상세: 4h
- 예약 페이지: 5h
- API 연동 및 타입 수정: 6h
- **총 15h**

#### 완료 기준

- [x] 캠핑장 상세 페이지에서 모든 정보 표시
- [x] 날짜/사이트/인원 선택 가능
- [x] 예약 데이터 생성 API 호출 성공
- [x] TypeScript 빌드 에러 0개
- [x] 백엔드 API 응답 100% 호환

---

### Sprint 2: 결제 및 예약 관리 (완료) ✅

**기간**: 2025-11-09 (1일)  
**목표**: 결제 연동 및 예약 내역 관리

#### 주요 태스크

- [x] **토스 페이먼츠 연동**
  - [x] SDK 설치 및 설정 (@tosspayments/tosspayments-sdk)
  - [x] 결제 페이지 (app/payment/[id]/page.tsx)
  - [x] 결제 위젯 통합 (usePaymentWidget)
  - [x] 결제 성공 페이지 (app/payment/success/page.tsx)
  - [x] 결제 실패 페이지 (app/payment/fail/page.tsx)
  - [x] 결제 검증 (paymentApi.verify)
- [x] **예약 내역 페이지**
  - [x] 예약 목록 조회 (app/reservations/page.tsx)
  - [x] 탭 필터링 (ALL/PENDING/CONFIRMED/COMPLETED/CANCELLED)
  - [x] 예약 상세 페이지 (app/reservations/[id]/page.tsx)
  - [x] QR 코드 표시 (react-qr-code)
  - [x] 예약 취소 기능 (useCancelReservation)
- [x] **컴포넌트 개발**
  - [x] ReservationCard - 예약 카드 컴포넌트
  - [x] PriceBreakdown - 가격 상세 컴포넌트
  - [x] QRCode - QR 코드 표시
  - [x] StatusBadge - 예약 상태 배지

#### 실제 공수

- 토스 페이먼츠: 5h
- 예약 내역: 5h
- 컴포넌트 및 테스트: 3h
- **총 13h**

#### 완료 기준

- [x] 결제 프로세스 완료 가능
- [x] 예약 내역 조회 및 상세 확인
- [x] QR 코드 생성 및 표시
- [x] 예약 취소 기능 동작
- [x] 결제 성공/실패 처리

---

### Sprint 3: 리뷰 작성 및 사용자 기능 (완료) ✅

**기간**: 2025-11-09 (1일)  
**목표**: 리뷰 작성, 마이페이지, 네비게이션, 검색 완성

#### 주요 태스크

- [x] **하단 탭 네비게이션**
  - [x] BottomNav 컴포넌트
  - [x] 라우팅 연동 (홈/검색/예약/마이)
  - [x] Active 상태 관리
- [x] **마이페이지**
  - [x] 마이페이지 홈 (app/dashboard/user/page.tsx)
  - [x] 프로필 수정 (app/dashboard/user/profile/page.tsx)
  - [x] 내 리뷰 목록 (app/dashboard/user/reviews/page.tsx)
  - [x] 사용자 정보 표시
  - [x] 로그아웃 기능
- [x] **리뷰 작성 기능**
  - [x] 리뷰 작성 페이지 (app/reservations/[id]/review/new/page.tsx)
  - [x] 리뷰 수정 페이지 (app/reviews/[id]/edit/page.tsx)
  - [x] StarRating 컴포넌트 (별점 입력)
  - [x] ImageUploader 컴포넌트 (이미지 업로드 UI)
  - [x] useCreateReview Hook
  - [x] useUpdateReview Hook
- [x] **검색 및 필터**
  - [x] 검색 페이지 (app/campgrounds/search/page.tsx)
  - [x] 키워드 검색
  - [x] 가격 필터 (최소/최대)
  - [x] useSearchCampgrounds Hook
  - [x] URL 쿼리 파라미터 연동
  - [x] Suspense 적용

#### 실제 공수

- 하단 탭: 2h
- 마이페이지: 4h
- 리뷰 작성: 4h
- 검색 및 필터: 3h
- **총 13h**

#### 완료 기준

- [x] 모든 주요 페이지가 탭으로 접근 가능
- [x] 마이페이지에서 프로필 수정 가능
- [x] 리뷰 작성 및 수정 기능 동작
- [x] 검색 및 필터 기능 동작
- [x] 18개 라우트 생성 (16 static, 2 dynamic)
- [x] TypeScript 빌드 에러 0개

---

### Sprint 4: 추가 기능 및 최적화 (완료) ✅

**기간**: 2025-11-09 ~ 2025-11-10  
**목표**: 찜하기, 이미지 업로드, 테스트, 최적화, MVP 완성  
**진행도**: 100% (7/7 태스크)

#### 주요 태스크

- [x] **찜하기 기능** (P0) ✅
  - [x] 찜 추가/삭제/토글 API 연동 (7개 엔드포인트)
  - [x] FavoriteButton 컴포넌트 (Heart 아이콘)
  - [x] 찜 목록 페이지 (app/dashboard/user/favorites)
  - [x] React Query 낙관적 업데이트
  - [x] 캠핑장 상세 페이지 통합
- [x] **이미지 업로드 완성** (P0) ✅
  - [x] 이미지 업로드 API 연동 (POST /v1/files/upload)
  - [x] ImageUploader 백엔드 연결
  - [x] 리뷰 작성/수정 이미지 통합
  - [x] 에러 핸들링 완료
- [x] **버그 수정** (P0) ✅
  - [x] TODO 주석 해결 (7개 해결)
  - [x] Review 작성 - campgroundId 수정
  - [x] Sprint 1-3 완료 코멘트 정리
- [x] **성능 최적화** (P1) ✅
  - [x] 이미지 최적화 (unoptimized 제거, Next.js WebP 자동 변환)
  - [x] Code splitting (ImageGallery, Calendar, TossPaymentWidget 동적 임포트)
  - [x] Bundle Analyzer 설정 (@next/bundle-analyzer)
- [x] **테스트 작성** (P1) ✅
  - [x] Vitest 환경 설정 (vitest.config.ts, vitest.setup.ts)
  - [x] 단위 테스트 작성 (Button, ErrorMessage, format, number, cn)

#### 실제 공수

- 찜하기: 4h ✅
- 이미지 업로드: 2h ✅
- 버그 수정: 1h ✅
- 최적화: 2h ✅
- 테스트: 2h ✅
- **총 11h**

#### 완료 기준

- [x] 찜하기 기능 완전 동작 ✅
- [x] 이미지 업로드 API 연동 완료 ✅
- [x] 주요 TODO 주석 해결 ✅
- [x] 주요 컴포넌트 단위 테스트 작성 ✅
- [x] Bundle 크기 최적화 (동적 임포트 적용) ✅
- [x] TypeScript 에러 0개 ✅
- [x] Build 성공 (7.9s, 19 routes) ✅

---

### Sprint 5: E2E 테스트 및 기능 개선 (완료) ✅

**기간**: 2025-11-10 ~ 2025-11-11 (2일)  
**목표**: E2E 테스트, 번들 최적화, 리뷰/찜하기/검색 개선, 관리자 기능  
**진행도**: 100% (13/13 태스크)

#### 주요 태스크

- [x] **번들 크기 최적화** (P1) ✅
  - [x] @next/bundle-analyzer 설치 및 설정
  - [x] optimizePackageImports 설정 (lucide-react, react-query, date-fns)
  - [x] QRCode 동적 임포트 (예약 상세)
  - [x] ImageUploader 동적 임포트 (리뷰 작성/수정)
  - [x] **성과**: 메인 청크 216KB → 195KB (10% 감소)
- [x] **Playwright E2E 테스트** (P1) ✅
  - [x] Playwright 설치 및 설정
  - [x] playwright.config.ts 생성
  - [x] 디렉토리 구조 (tests/, pages/, fixtures/)
  - [x] 홈페이지 테스트 (4개)
  - [x] 로그인 테스트 (5개)
  - [x] 캠핑장 테스트 (6개)
  - [x] 예약 테스트 (7개)
  - [x] 리뷰 테스트 (10개)
  - [x] 찜하기 테스트 (8개)
  - [x] Page Object Model 패턴 (6개 POM)
  - [x] E2E 테스트 확장 (40개 테스트)
- [x] **지도 검색** (P2) ✅
  - [x] 네이버맵 SDK 연동
  - [x] 지도 페이지 구현
  - [x] 마커 및 클러스터링
  - [x] 현재 위치 기반 검색
  - [x] 지도/목록 뷰 토글
- [x] **리뷰 시스템 개선** (P2) ✅
  - [x] 리뷰 수정 시 기존 이미지 표시
  - [x] 리뷰 좋아요 기능
  - [x] 리뷰 신고 기능
  - [x] 리뷰 정렬 (최신순, 평점순, 좋아요순)
- [x] **찜하기 개선** (P2) ✅
  - [x] 찜 목록 정렬 (최신순, 이름순)
  - [x] 토스트 알림 추가
- [x] **검색 기능 강화** (P2) ✅
  - [x] 고급 필터 (가격대, 편의시설, 타입, 인원)
  - [x] 검색 히스토리 (localStorage)
- [x] **관리자 기능 - Phase 1: OWNER** (P3) ✅
  - [x] 공통 컴포넌트 4개 (StatsCard, CampgroundForm, SiteManager, ReservationTable)
  - [x] OWNER 페이지 3개 (대시보드, 등록, 수정)
  - [x] API & Hooks (owner.ts, 4개 Custom Hooks)
  - [x] 권한 체크 (withOwnerAuth, withAdminAuth, permissions 유틸리티, 테스트)
- [x] **관리자 기능 - Phase 2: ADMIN** (P3) ✅
  - [x] ADMIN API (admin.ts, 330줄, 15+ 엔드포인트)
  - [x] ADMIN Hooks (5개: useAllUsers, useAllCampgrounds, useAllReservations, useReports, useAdminStats)
  - [x] ADMIN 대시보드 페이지 (통계 6개 섹션, 최근 활동, 빠른 링크)
  - [x] 사용자 관리 페이지 + UserTable 컴포넌트
  - [x] 캠핑장 관리 페이지 (승인/거부/삭제)
  - [x] 예약 관리 페이지 (취소/환불)
  - [x] 신고 관리 페이지 (승인/거부)
- [x] **관리자 기능 - Phase 3: 고급 기능** (P3) ✅
  - [x] 통계 차트 (Recharts, 5개 차트)
  - [x] 엑셀 다운로드 (xlsx, 3개 페이지)
  - ⏸️ 알림 시스템 (선택 사항, Sprint 6 이후)

#### 실제 공수

- 번들 최적화: 2h ✅
- E2E 테스트: 6h ✅
- 지도 검색: 4h ✅
- 리뷰 시스템: 2h ✅
- 찜하기 개선: 1h ✅
- 검색 기능: 2h ✅
- 관리자 Phase 1: 4h ✅
- 관리자 Phase 2: 4h ✅
- 관리자 Phase 3: 4h ✅
- **총 29h**
- 리뷰 개선: 3h ✅
- 찜하기 개선: 2h ✅
- 검색 강화: 3h ✅
- 관리자 Phase 1: 8h ✅
- 관리자 Phase 2: 4h ✅
- **총 28h** (완료) / 40h (예상)

#### 완료 기준

- [x] 번들 크기 350KB 이하 달성 ✅
- [x] E2E 테스트 주요 플로우 커버리지 80% 이상 ✅
- [x] 리뷰/찜하기/검색 개선 완료 ✅
- [x] 관리자 Phase 1 완료 ✅
- [x] 관리자 Phase 2 완료 ✅
- [ ] 관리자 Phase 3 완료
- [ ] TypeScript 에러 0개
- [ ] Build 성공

---

## �🚀 Post-MVP (v1.1+)

### Phase 6: 소셜 로그인 (v1.1)

**예정**: TBD

#### 태스크

- [ ] OAuth2 인증 플로우 구현
- [ ] 카카오 로그인 연동
- [ ] 네이버 로그인 연동
- [ ] 구글 로그인 (선택)
- [ ] OAuth 콜백 처리
- [ ] 소셜 계정 연동 UI

**예상 공수**: 8h

---

### Phase 7: 지도 검색 고도화 (v1.2)

**예정**: TBD

#### 태스크

- [ ] 네이버맵 SDK 연동 (React 19 호환 해결)
- [ ] 지도 페이지 완성
- [ ] 마커 표시 및 클러스터링
- [ ] 현재 위치 기반 검색
- [ ] 지도 이동 시 자동 검색
- [ ] Bottom Sheet 통합

**예상 공수**: 8h

---

### Phase 8: 고급 필터 및 정렬 (v1.3)

**예정**: TBD

#### 태스크

- [ ] 고급 필터 (편의시설, 테마, 사이트 타입)
- [ ] 정렬 기능 (가격, 평점, 거리)
- [ ] 필터 프리셋 저장
- [ ] 검색 히스토리

**예상 공수**: 6h

---

### Phase 9: 알림 및 푸시 (v1.4)

**예정**: TBD

#### 태스크

- [ ] 예약 확정 알림
- [ ] 체크인 리마인더
- [ ] 리뷰 요청 알림
- [ ] FCM 연동 (선택)

**예상 공수**: 8h

---

## 📊 진행 상황 트래킹

### 전체 진행률

| Sprint   | 기간        | 상태      | 진행률 |
| -------- | ----------- | --------- | ------ |
| Sprint 0 | 11/01-11/09 | ✅ 완료   | 100%   |
| Sprint 1 | 11/09       | ✅ 완료   | 100%   |
| Sprint 2 | 11/09       | ✅ 완료   | 100%   |
| Sprint 3 | 11/09       | ✅ 완료   | 100%   |
| Sprint 4 | 11/09-11/17 | 🚧 진행중 | 47%    |

**현재 상태**: Sprint 4 진행 중 (P0 태스크 완료)

---

### 기능별 완성도

| 기능 영역     | 완성도 | 상태    |
| ------------- | ------ | ------- |
| 인증          | 100%   | ✅ 완료 |
| 캠핑장 목록   | 100%   | ✅ 완료 |
| 캠핑장 검색   | 100%   | ✅ 완료 |
| 캠핑장 상세   | 100%   | ✅ 완료 |
| 예약 생성     | 100%   | ✅ 완료 |
| 결제          | 100%   | ✅ 완료 |
| 예약 관리     | 100%   | ✅ 완료 |
| 리뷰 작성     | 100%   | ✅ 완료 |
| 네비게이션    | 100%   | ✅ 완료 |
| 마이페이지    | 100%   | ✅ 완료 |
| 찜하기        | 100%   | ✅ 완료 |
| 이미지 업로드 | 100%   | ✅ 완료 |
| 지도 검색     | 0%     | ⏳ 대기 |

**참고**: P0 (필수) 기능 모두 완료, P1 최적화 작업 진행 예정

---

## 🎯 마일스톤

### M1: 핵심 기능 완료 (2025-11-09) ✅

- ✅ 모든 P0 기능 구현
  - 인증 (로그인/회원가입)
  - 캠핑장 목록/상세/검색
  - 예약 생성 (날짜/사이트/인원 선택)
  - 결제 (토스 페이먼츠)
  - 예약 관리 (목록/상세/취소)
  - 리뷰 작성/수정
  - 마이페이지
  - 네비게이션
- ✅ 18개 라우트 생성
- ✅ TypeScript 빌드 성공

### M2: MVP 완성 (2025-11-17 목표)

- [ ] 찜하기 기능
- [ ] 이미지 업로드 API 연동
- [ ] 단위 테스트 작성
- [ ] 성능 최적화
- [ ] 배포 준비

### M3: Post-MVP 기능 (TBD)

- [ ] 소셜 로그인 (카카오, 네이버)
- [ ] 지도 검색 (네이버맵)
- [ ] 고급 필터링
- [ ] 알림 기능

### M4: v1.0 정식 출시 (TBD)

- [ ] 모든 주요 기능 완성
- [ ] 프로덕션 배포
- [ ] 사용자 피드백 수집

---

## 📋 리스크 관리

### 주요 리스크

| 리스크                    | 영향도 | 대응 방안                               |
| ------------------------- | ------ | --------------------------------------- |
| 토스 페이먼츠 연동 복잡도 | 높음   | 공식 문서 참조, 충분한 테스트 시간 확보 |
| 네이버맵 API 사용량 제한  | 중간   | 사용량 모니터링, 캐싱 전략 수립         |
| 이미지 최적화 성능        | 중간   | Next.js Image 활용, WebP 포맷           |
| 모바일 브라우저 호환성    | 중간   | 주요 브라우저 테스트 계획 수립          |

---

## 🔄 변경 이력

| 날짜       | 버전 | 변경 내용                                          |
| ---------- | ---- | -------------------------------------------------- |
| 2025-11-09 | 1.0  | 초기 로드맵 작성                                   |
| 2025-11-09 | 2.0  | Sprint 1, 2, 3 완료 상태 반영 / Sprint 4 계획 수정 |

---

**마지막 업데이트**: 2025-11-09  
**다음 리뷰**: Sprint 4 시작 시 (2025-11-10)
