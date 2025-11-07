# 🔄 반응형 → 모바일 우선 마이그레이션 로그

> **CampStation - 391개 반응형 클래스 제거 프로젝트**  
> 시작일: 2025-11-07  
> 목표: 하나의 모바일 우선 디자인으로 통합

---

## �️ 기술 스택

### **핵심 기술**

- **Next.js 16.0.1** + **React 19** + **TypeScript 5.7**
- **Tailwind CSS 3.4+** (Breakpoint 제거 예정)
- **Capacitor 6+** (iOS/Android 하이브리드 앱)

### **주요 변경사항**

- Tailwind breakpoint 제거 (sm, md, lg, xl, 2xl → 없음)
- 모바일 우선 고정 레이아웃 (max-w-[480px])
- Capacitor 플랫폼 감지 활용
- 네이버 지도 통합 (카카오맵 완전 제거 완료)

---

## �📊 현황 분석

### **반응형 사용 현황**

```bash
총 반응형 클래스: 391개
- sm: (640px) - 약 150개
- md: (768px) - 약 180개
- lg: (1024px) - 약 40개
- xl: (1280px) - 약 15개
- 2xl: (1536px) - 약 6개
```

### **영향받는 파일 (예상)**

- UI 컴포넌트: ~30개
- 페이지 컴포넌트: ~15개
- 레이아웃 컴포넌트: ~5개
- 기타: ~10개

---

## 🎯 마이그레이션 규칙

### **규칙 1: Breakpoint 제거**

| Before (반응형)  | After (모바일 우선) | 설명                    |
| ---------------- | ------------------- | ----------------------- |
| `sm:text-lg`     | `text-base`         | 모바일 기준 크기로 통일 |
| `md:grid-cols-2` | `grid-cols-2`       | 기본값이 모바일         |
| `lg:px-8`        | `px-4`              | 모바일에 맞는 패딩      |
| `xl:max-w-7xl`   | `max-w-[480px]`     | 앱 최대 너비 고정       |

### **규칙 2: 레이아웃 패턴**

```tsx
// ❌ Before: 복잡한 반응형 그리드
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

// ✅ After: 단순한 모바일 그리드
<div className="grid grid-cols-2 gap-3">
```

### **규칙 3: 간격 시스템**

```tsx
// ❌ Before: 뷰포트별 다른 간격
<div className="p-2 sm:p-4 md:p-6 lg:p-8">

// ✅ After: 일관된 간격 (4px 배수)
<div className="p-4">
```

### **규칙 4: 텍스트 크기**

```tsx
// ❌ Before: 뷰포트별 크기
<h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">

// ✅ After: 고정 크기
<h1 className="text-2xl font-bold">
```

---

## 📋 작업 순서

### **Phase 1: 인프라 구축** ✅

#### 1.1 Tailwind 설정 변경

- [x] `globals.css` - Safe Area CSS 추가
- [x] 모바일 우선 breakpoint 설정 (--breakpoint-mobile: 480px)
- [x] 기존 sm/md/lg/xl/2xl 제거 준비 완료

#### 1.2 전역 컴포넌트 생성

- [x] `AppContainer.tsx` - 앱 전역 래퍼 (max-w-[480px])
- [x] `DeviceMockup.tsx` - 데스크톱 목업 프레임 (추후 Capacitor 추가 시 활성화)

#### 1.3 레이아웃 적용

- [x] `layout.tsx` - AppContainer 적용 완료
- [x] 전역 래퍼 구조 설정: DeviceMockup > AppContainer > AppProviders
---

### **Phase 2: UI 컴포넌트** 🎨

#### 2.1 기본 UI (우선순위 높음)

- [x] `Button.tsx` - 버튼 (이미 모바일 우선)
- [x] `Input.tsx` - 입력 필드 (파일 없음)
- [x] `Toast.tsx` - 알림 (sm:w-96, sm:px-0 제거)
- [x] `Modal.tsx` - 모달 (이미 모바일 우선)
- [x] `NavigationButton.tsx` - 네비게이션 버튼 (sm:left-6, sm:right-6 제거)
- [x] `SiteModal.tsx` - 사이트 모달 (sm/md 전체 제거: items-end→items-center, rounded-t-3xl→rounded-2xl, grid md:grid-cols-2/3→space-y-4/grid-cols-2)
- [x] `LoadingSpinner.tsx` - 로딩 (크기 조정: w-4→w-6, w-12→w-10)
- [x] `ImageGallery.tsx` - 이미지 갤러리 (이미 모바일 우선)
- [x] `Card.tsx` - 카드 (이미 모바일 우선)

#### 2.2 예약 관련 UI

- [x] `SiteSelectionSection.tsx` - 사이트 선택 (md:grid-cols-2 → grid-cols-1)
- [x] `DateSelectionSection.tsx` - 날짜 선택 (md:grid-cols-2 → space-y-4)
- [x] `ReservationsClient.tsx` - 예약 클라이언트 (sm:px-6 lg:px-8, sm:text-3xl 제거)
- [x] `ReservationList.tsx` - 예약 목록 (sm:px-6, md:flex-row md:items-center md:justify-between 제거)
- [x] `ReservationDetailModal.tsx` - 예약 상세 (lg:grid-cols-3 → space-y-6)
- [x] `PaymentHistory.tsx` - 결제 내역 (sm:flex-row sm:justify-between sm:items-start/center 제거)

#### 2.3 레이아웃 UI

- [ ] `Header.tsx` - 헤더
- [ ] `Footer.tsx` - 푸터
- [ ] `Navigation.tsx` - 네비게이션
- [ ] `Sidebar.tsx` - 사이드바

#### 2.3 복합 UI

- [ ] `Card.tsx` - 카드
- [ ] `ImageGallery.tsx` - 이미지 갤러리
- [ ] `SiteModal.tsx` - 사이트 모달
- [ ] `CampgroundCard.tsx` - 캠핑장 카드

---

### **Phase 3: 페이지 컴포넌트** 📄

#### 3.1 핵심 페이지

- [ ] `page.tsx` (Home) - 홈
- [ ] `campgrounds/page.tsx` - 캠핑장 목록
- [ ] `campgrounds/[id]/page.tsx` - 캠핑장 상세
- [ ] `map/page.tsx` - 지도
- [ ] `login/page.tsx` - 로그인
- [ ] `register/page.tsx` - 회원가입

#### 3.2 예약 플로우

- [ ] `reservations/page.tsx` - 예약 목록
- [ ] `reservations/[id]/page.tsx` - 예약 상세
- [ ] `reservations/[id]/payment/page.tsx` - 결제
- [ ] `payment/success/page.tsx` - 결제 성공
- [ ] `payment/fail/page.tsx` - 결제 실패

#### 3.3 관리 페이지

- [ ] `dashboard/user/page.tsx` - 사용자 대시보드
- [ ] `dashboard/owner/page.tsx` - 운영자 대시보드
- [ ] `dashboard/admin/page.tsx` - 관리자 대시보드

---

### **Phase 4: 기능 컴포넌트** 🛠️

#### 4.1 지도 관련

- [ ] `NaverMap.tsx` - 네이버 지도
- [ ] `LocationPicker.tsx` - 위치 선택기
- [ ] `CampgroundSidebar.tsx` - 지도 사이드바

#### 4.2 폼 관련

- [ ] `SearchForm.tsx` - 검색 폼
- [ ] `ReservationForm.tsx` - 예약 폼
- [ ] `CampgroundForm.tsx` - 캠핑장 등록 폼

---

## 🔍 변경 상세 로그

### **컴포넌트별 변경 내역**

#### ✅ `Toast.tsx`

```diff
- <div className="fixed right-4 top-4 z-50 w-full max-w-sm px-4 sm:w-96 sm:px-0">
+ <div className="fixed right-4 top-4 z-50 w-full max-w-sm px-4">
```

**변경 이유:** sm: breakpoint 제거, 모바일 우선 레이아웃으로 통일

---

#### ✅ `NavigationButton.tsx`

```diff
- const position = isPrev ? "left-3 sm:left-6" : "right-3 sm:right-6";
+ const position = isPrev ? "left-4" : "right-4";
```

**변경 이유:** 버튼 위치를 모든 기기에서 동일하게 유지

---

#### ✅ `SiteModal.tsx`

```diff
- <div className="flex items-end sm:items-center justify-center min-h-screen sm:p-4">
+ <div className="flex items-end justify-center min-h-screen">
```

**변경 이유:** 모바일 UX에 맞춰 하단 슬라이드업 방식 유지

---

#### ⏳ `ImageGallery.tsx` (작업 예정)

**현재 상태:** 반응형 그리드 사용

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
```

**변경 예정:**

```tsx
<div className="grid grid-cols-2 gap-3">
```

---

## 📈 진행 상황

### **전체 진행률**

```
[████░░░░░░░░░░░░░░░░] 6/391 (1.5%)

Phase 1 (인프라): [██████████] 6/6 (100%) ✅
Phase 2 (UI): [░░░░░░░░░░] 0/30 (0%)
Phase 3 (페이지): [░░░░░░░░░░] 0/15 (0%)
Phase 4 (기능): [░░░░░░░░░░] 0/10 (0%)
```

### **일일 진행 로그**

#### 2025-11-07 (DAY 1)

- [x] 현황 분석 완료 (391개 반응형 클래스 확인)
- [x] `MOBILE_FIRST_DESIGN_GUIDE.md` 작성 (기술스택 포함)
- [x] `RESPONSIVE_TO_MOBILE_MIGRATION.md` 작성
- [x] `globals.css` Safe Area CSS 추가
- [x] `AppContainer.tsx` 컴포넌트 생성 (max-w-[480px])
- [x] `DeviceMockup.tsx` 컴포넌트 생성 (향후 Capacitor용)
- [x] `layout.tsx` AppContainer 적용
- [x] **Phase 1 완료! 🎉**
- [ ] Phase 2 시작 (UI 컴포넌트 마이그레이션)

---

## 🧪 테스트 계획

### **각 컴포넌트 변경 후 테스트**

#### 1. 모바일 테스트

```bash
- iPhone SE (375px): 최소 너비 확인
- iPhone 14 (390px): 기준 너비 확인
- iPhone 14 Pro Max (428px): 최대 너비 확인
```

#### 2. 태블릿 테스트

```bash
- iPad Mini (768px): 중앙 정렬 확인
- iPad Pro (1024px): 중앙 정렬 + 여백 확인
```

#### 3. 데스크톱 테스트

```bash
- 1920x1080: 디바이스 목업 프레임 확인
- 2560x1440: 초고해상도에서 레이아웃 확인
```

### **시각적 회귀 테스트**

```bash
# Percy/Chromatic 스크린샷 비교
- Before: 반응형 스크린샷 저장
- After: 모바일 우선 스크린샷 비교
- Diff: 변경사항 확인
```

---

## 🐛 알려진 이슈 & 해결

### **Issue #1: 모달이 데스크톱에서 너무 작음**

**증상:** 데스크톱에서 모달이 480px로 제한되어 답답함  
**해결:** Capacitor 플랫폼 감지로 웹에서만 max-w 제거

```tsx
const isWeb = Capacitor.getPlatform() === "web";
<Modal className={isWeb ? "max-w-2xl" : "max-w-[480px]"} />;
```

### **Issue #2: 이미지 갤러리 레이아웃 깨짐**

**증상:** 3열 그리드가 2열로 변경되면서 이미지 비율 문제  
**해결:** aspect-ratio로 고정 비율 유지

```tsx
<div className="grid grid-cols-2 gap-3">
  <img className="aspect-square object-cover" />
</div>
```

---

## 📊 성과 측정

### **목표 지표**

| 지표            | Before | Current | Target | 측정 방법               |
| --------------- | ------ | ------- | ------ | ----------------------- |
| 반응형 클래스   | 391개  | ~370개  | 0개    | grep 검색               |
| Phase 1 완료율  | 0%     | 100%    | 100%   | 체크리스트              |
| Phase 2 완료율  | 0%     | 5%      | 100%   | 체크리스트              |
| 번들 크기       | -      | -       | -5~10% | webpack-bundle-analyzer |
| Lighthouse 점수 | -      | -       | +5점   | Chrome DevTools         |
| 개발 시간       | -      | -       | -30%   | 주관적 평가             |

### **추적 명령어**

```bash
# 남은 반응형 클래스 확인
Get-ChildItem -Path src -Recurse -Filter "*.tsx" | Select-String -Pattern "sm:|md:|lg:|xl:|2xl:" -CaseSensitive

# 번들 크기 분석
npm run build:analyze

# Lighthouse 점수
npm run lighthouse
```

---

## 🎓 학습 노트

### **배운 점**

- ✅ 반응형이 항상 정답은 아니다
- ✅ 일관된 경험이 더 중요하다
- ✅ 제약이 오히려 디자인을 단순하게 만든다

### **주의할 점**

- ⚠️ 모든 콘텐츠가 480px에 맞는지 확인
- ⚠️ 긴 텍스트는 줄바꿈 처리
- ⚠️ 이미지는 반응형 유지 (width: 100%)

---

## � 작업 로그

### 2025-01-XX - Phase 2 시작

**완료한 작업:**

1. ✅ Toast.tsx

   - 제거: `sm:w-96`, `sm:px-0`
   - 변경: ToastContainer의 고정 크기 유지

2. ✅ NavigationButton.tsx

   - 제거: `sm:left-6`, `sm:right-6`
   - 변경: `left-3` / `right-3`로 통일

3. ✅ SiteModal.tsx (대규모 리팩토링)
   - 제거: `sm:items-center` (items-center로 통일)
   - 제거: `sm:p-4` (p-4로 통일)
   - 제거: `rounded-t-3xl sm:rounded-2xl` (rounded-2xl로 통일)
   - 제거: `slide-in-from-bottom sm:zoom-in-95` (zoom-in-95로 통일)
   - 제거: `sm:px-6 sm:py-5` (px-4 py-4로 통일)
   - 제거: 모바일 핸들 바 (`sm:hidden`)
   - 제거: `sm:text-xl` (text-lg로 통일)
   - 제거: `md:grid-cols-2` (space-y-4로 변경, 세로 스택)
   - 제거: `md:grid-cols-3` (grid-cols-2로 통일)
   - 제거: `sm:flex-row sm:justify-end` (flex-col로 통일)

**진행률:**

- 완료 컴포넌트: 3개 (Toast, NavigationButton, SiteModal)
- 남은 반응형 클래스: ~370개 (원래 391개 중 약 21개 제거)

---

## �📚 참고 자료

- [MOBILE_FIRST_DESIGN_GUIDE.md](./MOBILE_FIRST_DESIGN_GUIDE.md)
- [Capacitor 공식 문서](https://capacitorjs.com/docs)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)

---

**문서 버전:** 1.0.0  
**최종 수정일:** 2025-11-07  
**다음 단계:** Tailwind 설정 변경 및 AppContainer 생성
