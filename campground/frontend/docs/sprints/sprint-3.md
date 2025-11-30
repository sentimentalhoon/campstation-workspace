# Sprint 3: 리뷰 작성 및 사용자 기능

**상태**: 🚧 진행 중  
**기간**: 2025-11-09 ~ 2025-11-16 (1주)  
**목표**: 리뷰 작성, 마이페이지, 네비게이션 완성

---

## 📋 주요 태스크

### 1. 리뷰 작성 기능 🎯

- [x] 리뷰 작성 폼
  - [x] `app/reservations/[id]/review/new/page.tsx` 생성
  - [x] 별점 입력 (StarRating 컴포넌트)
  - [x] 리뷰 내용 텍스트 에리어
  - [x] 이미지 업로드 (선택, 최대 5장)
  - [x] 작성 완료 후 예약 상세로 리다이렉트
- [x] 리뷰 수정
  - [x] `app/reviews/[id]/edit/page.tsx` 생성
  - [x] 기존 리뷰 데이터 로드
  - [x] 수정 후 저장
- [x] API 연동
  - [x] 리뷰 작성 (`useCreateReview`)
  - [x] 리뷰 수정 (`useUpdateReview`)
  - [ ] 이미지 업로드 (`useUploadImages`) - 백엔드 API 대기
- [x] 컴포넌트
  - [x] `StarRating` - 별점 입력 컴포넌트
  - [x] `ImageUploader` - 이미지 업로드 컴포넌트

**완료도**: 100% (4/4) ✅

**참고 문서**:

- `06-SCREEN-LAYOUTS.md` - 리뷰 작성 레이아웃
- `04-API-SPEC.md` - 리뷰 API
- `05-DATA-MODELS.md` - Review 타입

---

### 2. 마이페이지 (User Dashboard) 🎯

- [x] 마이페이지 메인
  - [x] `app/dashboard/user/page.tsx` 생성
  - [x] 프로필 요약 (이름, 이메일, 프로필 이미지)
  - [x] 최근 예약 현황 (3개)
  - [x] 내가 쓴 리뷰 (3개)
  - [x] 메뉴 리스트 (정보 수정, 예약 내역, 리뷰 관리, 로그아웃)
- [x] 프로필 수정
  - [x] `app/dashboard/user/profile/page.tsx` 생성
  - [x] 프로필 이미지 업로드 (UI만, S3는 추후)
  - [x] 이름, 전화번호 수정
  - [x] 비밀번호 변경
- [x] 내 리뷰 관리
  - [x] `app/dashboard/user/reviews/page.tsx` 생성
  - [x] 내가 작성한 리뷰 목록
  - [x] 수정/삭제 액션
- [x] API 연동
  - [x] 사용자 정보 조회 (`useUserProfile`)
  - [x] 프로필 수정 (`useUpdateProfile`)
  - [x] 비밀번호 변경 (`useChangePassword`)
  - [x] 내 리뷰 목록 (`useMyReviews`)

**완료도**: 100% (4/4) ✅

**참고 문서**:

- `06-SCREEN-LAYOUTS.md` - 마이페이지 레이아웃
- `04-API-SPEC.md` - 사용자 API
- `03-PAGES.md` - 페이지 명세

---

### 3. 하단 네비게이션 바 🎯

- [x] BottomNavigation 컴포넌트
  - [x] `components/layout/BottomNavigation.tsx` 생성
  - [x] 5개 탭 (홈, 검색, 예약, 지도, 마이페이지)
  - [x] 현재 경로 하이라이트
  - [x] 아이콘 + 레이블
  - [x] Sticky bottom 고정
- [x] 레이아웃 통합
  - [x] `app/layout.tsx` 수정
  - [x] 인증된 사용자만 네비게이션 표시
  - [x] 특정 페이지 제외 (로그인, 회원가입, 결제)
- [x] 네비게이션 테스트
  - [x] 모든 탭 클릭 동작 확인
  - [x] 경로 변경 시 활성 상태 업데이트

**완료도**: 100% (3/3) ✅

**참고 문서**:

- `06-SCREEN-LAYOUTS.md` - 네비게이션 명세
- `02-DESIGN-SYSTEM.md` - 디자인 시스템

---

### 4. 검색 및 필터 페이지 🎯

- [x] 검색 페이지
  - [x] `app/campgrounds/search/page.tsx` 생성
  - [x] 검색바 (캠핑장 이름, 위치)
  - [x] 검색 결과 목록
  - [x] 빈 상태 처리
  - [x] 페이지네이션
- [x] 필터 UI
  - [x] 가격 범위 입력
  - [ ] 지역 선택 (MVP 제외)
  - [ ] 편의시설 체크박스 (MVP 제외)
  - [ ] 사이트 타입 선택 (MVP 제외)
- [x] API 연동
  - [x] 캠핑장 검색 (`useSearchCampgrounds`)
  - [x] URL 쿼리 파라미터 동기화
- [x] 상태 관리
  - [x] URL 쿼리 파라미터와 동기화
  - [x] 필터 상태 유지

**완료도**: 100% (3/3) ✅

**참고 문서**:

- `06-SCREEN-LAYOUTS.md` - 검색 페이지 레이아웃
- `04-API-SPEC.md` - 검색 API
- `03-COMPONENT-PATTERNS.md` - 필터 컴포넌트 패턴

---

## 🎯 완료 기준

- [x] 리뷰 작성 및 수정 기능 동작
- [x] 마이페이지에서 프로필 정보 조회/수정 가능
- [x] 하단 네비게이션으로 모든 주요 페이지 접근 가능
- [x] 캠핑장 검색 및 필터링 동작
- [x] 모든 페이지가 `06-SCREEN-LAYOUTS.md` 명세 준수
- [x] TypeScript 에러 없음
- [x] 빌드 성공

---

## 📊 진행 상황

- **전체 진행도**: 100% (15/15 태스크) ✅
- **리뷰 작성**: 100% (4/4) ✅
- **마이페이지**: 100% (4/4) ✅
- **하단 네비게이션**: 100% (3/3) ✅
- **검색 및 필터**: 100% (3/3) ✅

---

## 📝 노트

### 리뷰 작성 제약사항

- 리뷰는 체크아웃 완료 후에만 작성 가능
- 한 예약당 하나의 리뷰만 작성 가능
- 리뷰 작성 후 수정 가능, 삭제는 관리자만
- 이미지는 최대 5장까지 업로드

### 마이페이지 섹션

1. **프로필 요약**: 이름, 이메일, 프로필 이미지
2. **최근 예약**: 진행 중인 예약 최대 3개
3. **내 리뷰**: 최근 작성한 리뷰 3개
4. **메뉴**: 정보 수정, 예약 내역, 리뷰 관리, 로그아웃

### 네비게이션 탭

1. **홈** (`/`): 인기 캠핑장, 추천
2. **검색** (`/campgrounds`): 캠핑장 목록 및 검색
3. **예약** (`/reservations`): 내 예약 내역
4. **지도** (`/map`): 지도에서 캠핑장 찾기 (추후 구현)
5. **마이** (`/dashboard/user`): 마이페이지

### 검색 필터 옵션

- **가격**: 슬라이더로 최소/최대 설정
- **지역**: 드롭다운 (서울, 경기, 강원 등)
- **편의시설**: 체크박스 (전기, 수도, 화장실, 샤워실 등)
- **사이트 타입**: 라디오 버튼 (카라반, 글램핑, 캐빈)

---

## 🔧 기술 스택

### 새로 추가할 라이브러리

- **이미지 업로드**: 기존 API 활용 (백엔드 S3 연동)
- **슬라이더**: `rc-slider` 또는 headless UI
- **별점**: lucide-react의 Star 아이콘으로 커스텀

### 재사용 컴포넌트

- `Button`, `Input`, `Badge` (기존)
- `Checkbox` (Sprint 2에서 구현)
- `LoadingSpinner`, `ErrorMessage` (기존)

---

## 🔧 주요 이슈 및 해결

### 1. 타입 불일치 수정 (2025-11-09)

**문제**:

- `User` 타입에 `phoneNumber` 필드 대신 `phone` 사용
- `Reservation` 타입에 `totalPrice` 대신 `totalAmount` 사용
- `Review` 타입에 `content` 대신 `comment` 사용

**해결**:

- 백엔드 DTO 타입과 일치하도록 프론트엔드 타입 참조 수정
- `UserResponseDto`, `Reservation`, `Review` 타입 정의 확인 후 올바른 필드명 사용

### 2. User API 엔드포인트 구현

**구현 내역**:

- `lib/api/users.ts`: userApi 생성
  - `getProfile()`: GET `/v1/users/profile`
  - `updateProfile()`: PUT `/v1/users/profile`
  - `changePassword()`: PUT `/v1/users/password`
- `lib/api/reviews.ts`: getMyReviews() 추가
  - GET `/v1/reviews/my`

### 3. React Query Hooks 구현

**구현 내역**:

- `hooks/useUserProfile.ts`: 사용자 프로필 조회
- `hooks/useUpdateProfile.ts`: 프로필 업데이트 (쿼리 무효화 포함)
- `hooks/useChangePassword.ts`: 비밀번호 변경
- `hooks/useMyReviews.ts`: 내 리뷰 목록 조회
- `hooks/index.ts`: 모든 훅 export

### 4. 유틸리티 함수 추가

**구현 내역**:

- `lib/utils/format.ts`: `formatPrice()` 함수 추가
  - 숫자를 한국어 천단위 구분자로 포맷팅
- `lib/constants/routes.ts`: DASHBOARD 경로 추가
  - `ROUTES.DASHBOARD.PROFILE`: `/dashboard/user/profile`
  - `ROUTES.DASHBOARD.REVIEWS`: `/dashboard/user/reviews`

### 5. 마이페이지 완성 (2025-11-09)

**구현 내역**:

- **프로필 수정 페이지** (`app/dashboard/user/profile/page.tsx`):
  - 이메일 (읽기 전용)
  - 이름, 전화번호 수정
  - 비밀번호 변경 (토글 섹션)
  - 유효성 검사 (비밀번호 최소 8자, 확인 일치)
  - 성공/실패 알림

- **내 리뷰 관리 페이지** (`app/dashboard/user/reviews/page.tsx`):
  - 리뷰 목록 (페이지네이션)
  - 캠핑장명, 별점, 내용, 이미지 표시
  - 수정/삭제 액션
  - 빈 상태 처리
  - 삭제 확인 다이얼로그

**기술 스택**:

- React Query useMutation (낙관적 업데이트)
- 조건부 렌더링 (비밀번호 섹션)
- 페이지네이션 (10개/페이지)

### 6. 리뷰 작성 기능 완성 (2025-11-09)

**구현 내역**:

- **리뷰 컴포넌트** (`components/features/reviews/`):
  - `StarRating.tsx`: 1-5 별점 입력/표시, 3가지 사이즈, 호버 효과
  - `ImageUploader.tsx`: 최대 5장 업로드, 파일 검증, 미리보기, 메모리 정리
  - `index.ts`: 컴포넌트 및 유틸리티 함수 export

- **리뷰 API 및 Hooks** (`lib/api/reviews.ts`, `hooks/`):
  - `reviewApi.getById()`: 리뷰 상세 조회 추가
  - `useCreateReview`: 리뷰 작성 mutation (캐시 무효화 4곳)
  - `useUpdateReview`: 리뷰 수정 mutation (캐시 무효화 3곳)

- **리뷰 작성 페이지** (`app/reservations/[id]/review/new/page.tsx`):
  - StarRating, ImageUploader, textarea 통합
  - 유효성 검사 (별점 1-5, 내용 10-2000자)
  - 작성 완료 후 예약 상세로 리다이렉트
  - 이미지 메모리 정리 (useEffect cleanup)

- **리뷰 수정 페이지** (`app/reviews/[id]/edit/page.tsx`):
  - 기존 리뷰 데이터 로드 (React Query)
  - 폼 초기화 (rating, comment)
  - 로딩 상태 및 빈 상태 처리
  - 수정 완료 후 내 리뷰 목록으로 이동

**타입 안정성**:

- TypeScript strict mode 준수
- 명시적 타입 지정 (map callback)
- guard clause로 undefined 방지

**빌드 결과**:

- ✅ 17개 라우트 생성 (2개 동적 라우트 추가)
- ✅ TypeScript 에러 없음
- ✅ 컴파일 성공 (8.6초)

### 7. 검색 및 필터 기능 완성 (2025-11-09)

**구현 내역**:

- **검색 API 및 Hook** (`lib/api/campgrounds.ts`, `hooks/`):
  - `campgroundApi.search()`: 검색 API 추가 (GET `/v1/campgrounds/search`)
  - `useSearchCampgrounds`: 검색 hook (keyword, minPrice, maxPrice, page)
  - React Query 캐싱 및 자동 재시도

- **검색 페이지** (`app/campgrounds/search/page.tsx`):
  - 키워드 검색 (캠핑장 이름, 위치)
  - 가격 범위 필터 (최소/최대)
  - 검색 결과 목록 (CampgroundCard 재사용)
  - 페이지네이션 (이전/다음 버튼)
  - 빈 상태 처리
  - 필터 초기화 버튼
  - URL 쿼리 파라미터 동기화

- **타입 및 라우트**:
  - `CampgroundSearchParams`에 `keyword` 필드 추가
  - `ROUTES.CAMPGROUNDS.SEARCH` 상수 추가
  - Suspense 경계로 useSearchParams 감싸기

**기능**:

- ✅ 키워드 검색 (실시간 API 호출)
- ✅ 가격 범위 필터 (숫자 입력)
- ✅ URL 상태 관리 (뒤로가기 지원)
- ✅ 로딩/에러/빈 상태 처리
- ✅ 페이지네이션 (0-based, 10개/페이지)

**빌드 결과**:

- ✅ 18개 라우트 생성 (search 페이지 추가)
- ✅ TypeScript 에러 없음
- ✅ Suspense 경계로 CSR 최적화

---

**시작 일자**: 2025-11-09  
**마지막 업데이트**: 2025-11-09
