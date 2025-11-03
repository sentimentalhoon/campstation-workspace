# 📱 모바일 최적화 TODO 리스트

## 🎯 목표
- **모바일 우선 (Mobile First)** 개발
- **최대 폭**: 1024px (iPad Pro 기준)
- **최소 폭**: 320px (iPhone SE)
- **하이브리드 앱 대비** 모바일 UX 최적화

## 📊 현재 상태 분석

### ✅ 이미 구현된 것
- Tailwind CSS 반응형 유틸리티 사용 중 (`sm:`, `md:`, `lg:`)
- PWA 설정 (`next-pwa`)
- 다크모드 지원
- 일부 컴포넌트 반응형 디자인

### ❌ 개선 필요한 것
- 일관성 없는 반응형 구현
- 터치 인터랙션 부족
- 모바일 전용 네비게이션 미흡
- 큰 화면에서 레이아웃 과도하게 넓음

---

## 📝 상세 작업 목록

### ✅ Phase 0: 준비 단계

#### Task 0.1: 전역 레이아웃 컨테이너 생성
```tsx
// src/components/layout/MobileContainer.tsx
- max-w-[1024px] 설정
- 중앙 정렬 (mx-auto)
- 양옆 패딩 (px-4 sm:px-6 md:px-8)
- 모든 페이지에서 재사용
```

**우선순위**: 🔴 최고
**예상 시간**: 30분
**파일**: 
- `src/components/layout/MobileContainer.tsx` (신규)

---

### 📋 Phase 1: 공통 컴포넌트 (Foundation)

#### Task 1.1: Header 모바일 최적화
**현재 파일**: `src/components/layout/header/index.tsx`

**작업 내용**:
- [ ] 모바일: 햄버거 메뉴
- [ ] 데스크톱: 전체 메뉴
- [ ] 로고 크기 반응형
- [ ] 검색바 접기/펼치기
- [ ] max-w-[1024px] 적용

**우선순위**: 🔴 최고
**예상 시간**: 2시간

#### Task 1.2: Footer 모바일 최적화
**현재 파일**: `src/components/layout/Footer.tsx`

**작업 내용**:
- [ ] 1단 레이아웃 (모바일)
- [ ] 2-3단 레이아웃 (데스크톱)
- [ ] 링크 터치 타겟 최소 44px
- [ ] max-w-[1024px] 적용

**우선순위**: 🟡 중간
**예상 시간**: 1시간

#### Task 1.3: 하단 네비게이션 바 생성 (모바일 전용)
**신규 파일**: `src/components/layout/BottomNav.tsx`

**작업 내용**:
- [ ] 고정 하단 네비게이션 (fixed bottom-0)
- [ ] 주요 메뉴: 홈, 캠핑장, 예약, 마이페이지
- [ ] 아이콘 + 라벨
- [ ] 활성 상태 표시
- [ ] 768px 미만에서만 표시

**우선순위**: 🔴 최고
**예상 시간**: 2시간

---

### 🏠 Phase 2: 홈페이지

#### Task 2.1: HeroSection 모바일 최적화
**현재 파일**: `src/components/home/sections/HeroSection.tsx`

**작업 내용**:
- [ ] 검색바 모바일 레이아웃 (세로 배치)
- [ ] 버튼 크기 터치 최적화 (min-h-12)
- [ ] 배지/태그 가로 스크롤
- [ ] max-w-[1024px] 적용

**우선순위**: 🔴 최고
**예상 시간**: 1시간
**상태**: 일부 구현됨

#### Task 2.2: CampgroundList 모바일 최적화
**현재 파일**: `src/components/home/sections/CampgroundList.tsx`

**작업 내용**:
- [ ] 1열 (모바일)
- [ ] 2열 (태블릿 768px+)
- [ ] 카드 높이 최적화
- [ ] 이미지 레이지 로딩
- [ ] 무한 스크롤 최적화

**우선순위**: 🔴 최고
**예상 시간**: 2시간

#### Task 2.3: FilterModal 모바일 최적화
**작업 내용**:
- [ ] 하단 시트 (Bottom Sheet) 형태로 변경
- [ ] 전체 화면 모달 (모바일)
- [ ] 스와이프로 닫기
- [ ] 필터 선택 UX 개선

**우선순위**: 🟡 중간
**예상 시간**: 2시간

---

### 🏕️ Phase 3: 캠핑장 목록

#### Task 3.1: CampgroundsPage 레이아웃
**현재 파일**: `src/app/campgrounds/page.tsx`

**작업 내용**:
- [ ] max-w-[1024px] 컨테이너 적용
- [ ] 필터 바 모바일 최적화
- [ ] 정렬 드롭다운 터치 최적화
- [ ] 카드 그리드 반응형

**우선순위**: 🔴 최고
**예상 시간**: 2시간

#### Task 3.2: CampgroundCard 최적화
**현재 파일**: `src/components/campgrounds/CampgroundCard.tsx`

**작업 내용**:
- [ ] 터치 피드백 추가
- [ ] 이미지 최적화 (Next.js Image)
- [ ] 텍스트 크기 조정
- [ ] 버튼 터치 타겟 44px+

**우선순위**: 🔴 최고
**예상 시간**: 1.5시간

---

### 🔍 Phase 4: 캠핑장 상세

#### Task 4.1: CampgroundDetailView 모바일 레이아웃
**현재 파일**: `src/app/campgrounds/[id]/CampgroundDetailView.tsx`

**작업 내용**:
- [ ] 이미지 갤러리 스와이프 최적화
- [ ] 정보 섹션 세로 배치
- [ ] 예약 버튼 고정 하단 (Sticky)
- [ ] 탭 네비게이션 터치 최적화
- [ ] max-w-[1024px] 적용

**우선순위**: 🔴 최고
**예상 시간**: 3시간

#### Task 4.2: ImageGallery 터치 제스처
**현재 파일**: `src/components/ui/ImageGallery.tsx`

**작업 내용**:
- [ ] 스와이프로 이미지 전환
- [ ] 핀치 줌 (선택적)
- [ ] 썸네일 가로 스크롤
- [ ] 전체 화면 모드

**우선순위**: 🟡 중간
**예상 시간**: 2시간

#### Task 4.3: SiteModal 모바일 최적화
**현재 파일**: `src/components/ui/SiteModal.tsx`

**작업 내용**:
- [ ] 전체 화면 모달 (모바일)
- [ ] 하단 시트 (태블릿)
- [ ] 사이트 선택 카드 터치 최적화
- [ ] 날짜 선택기 모바일 최적화

**우선순위**: 🔴 최고
**예상 시간**: 2.5시간

---

### 🗺️ Phase 5: 지도 페이지

#### Task 5.1: MapPage 전체 화면 최적화
**현재 파일**: `src/app/campgrounds/map/page.tsx`

**작업 내용**:
- [ ] 전체 화면 지도 (vh-100)
- [ ] 하단 시트 (캠핑장 리스트)
- [ ] 스와이프로 시트 높이 조절
- [ ] 지도 제스처 최적화 (확대/축소/드래그)
- [ ] 현재 위치 버튼

**우선순위**: 🟡 중간
**예상 시간**: 3시간

---

### 📅 Phase 6: 예약 목록

#### Task 6.1: ReservationsPage 레이아웃
**현재 파일**: `src/app/reservations/page.tsx`

**작업 내용**:
- [ ] max-w-[1024px] 적용
- [ ] 탭 네비게이션 모바일 최적화
- [ ] 필터 버튼 고정
- [ ] 카드 레이아웃 최적화

**우선순위**: 🔴 최고
**예상 시간**: 2시간

#### Task 6.2: ReservationCard 모바일 최적화
**현재 파일**: `src/components/reservation/ReservationList.tsx`

**작업 내용**:
- [ ] 카드 정보 세로 배치
- [ ] 액션 버튼 터치 최적화
- [ ] 상태 배지 가독성 개선
- [ ] 스와이프 액션 (선택적)

**우선순위**: 🟡 중간
**예상 시간**: 1.5시간

---

### 💳 Phase 7: 결제

#### Task 7.1: PaymentPage 모바일 최적화
**현재 파일**: `src/app/reservations/[id]/payment/page.tsx`

**작업 내용**:
- [ ] 결제 폼 세로 배치
- [ ] Toss Payments 위젯 모바일 최적화
- [ ] 요약 정보 고정 또는 접기 가능
- [ ] 결제 버튼 고정 하단

**우선순위**: 🔴 최고
**예상 시간**: 2시간

---

### 🔐 Phase 8: 인증

#### Task 8.1: LoginPage 모바일 최적화
**현재 파일**: `src/app/(auth)/login/page.tsx`

**작업 내용**:
- [ ] 폼 입력 필드 크기 최적화
- [ ] 소셜 로그인 버튼 크기 최적화 (min-h-12)
- [ ] 로고 크기 조정
- [ ] max-w-[480px] 적용

**우선순위**: 🟡 중간
**예상 시간**: 1시간

#### Task 8.2: RegisterPage 모바일 최적화
**현재 파일**: `src/app/(auth)/register/page.tsx`

**작업 내용**:
- [ ] 폼 레이아웃 세로 배치
- [ ] 입력 필드 터치 최적화
- [ ] 약관 동의 체크박스 크기
- [ ] max-w-[480px] 적용

**우선순위**: 🟡 중간
**예상 시간**: 1시간

---

### 📊 Phase 9: 대시보드

#### Task 9.1: User Dashboard 모바일 최적화
**현재 파일**: `src/app/dashboard/user/page.tsx`

**작업 내용**:
- [ ] 카드 1열 배치 (모바일)
- [ ] 통계 카드 터치 인터랙션
- [ ] 차트 반응형
- [ ] max-w-[1024px] 적용

**우선순위**: 🟡 중간
**예상 시간**: 2시간

#### Task 9.2: Owner Dashboard 모바일 최적화
**현재 파일**: `src/app/dashboard/owner/page.tsx`

**작업 내용**:
- [ ] 카드 레이아웃 최적화
- [ ] 테이블 가로 스크롤
- [ ] 액션 버튼 터치 최적화
- [ ] max-w-[1024px] 적용

**우선순위**: 🟡 중간
**예상 시간**: 2시간

#### Task 9.3: Admin Dashboard 모바일 최적화
**현재 파일**: `src/app/dashboard/admin/page.tsx`

**작업 내용**:
- [ ] 관리 기능 모바일 레이아웃
- [ ] 테이블 반응형 또는 카드형
- [ ] 필터/검색 모바일 최적화
- [ ] max-w-[1024px] 적용

**우선순위**: 🔵 낮음
**예상 시간**: 2시간

---

### ⚙️ Phase 10: 관리 기능

#### Task 10.1: CampgroundEditPage 모바일 최적화
**현재 파일**: `src/app/campgrounds/[id]/edit/page.tsx`

**작업 내용**:
- [ ] 폼 입력 레이아웃 최적화
- [ ] 이미지 업로드 모바일 UX
- [ ] 저장 버튼 고정 하단
- [ ] max-w-[768px] 적용 (폼 최적화)

**우선순위**: 🟡 중간
**예상 시간**: 2시간

#### Task 10.2: SiteManagementPage 모바일 최적화
**현재 파일**: `src/app/campgrounds/[id]/sites/page.tsx`

**작업 내용**:
- [ ] 사이트 카드 1열 배치
- [ ] 추가/수정 모달 전체 화면
- [ ] 액션 버튼 터치 최적화
- [ ] max-w-[1024px] 적용

**우선순위**: 🟡 중간
**예상 시간**: 1.5시간

---

### 🎨 Phase 11: 공통 UI 컴포넌트

#### Task 11.1: Modal/Dialog 모바일 최적화
**파일들**: 
- `src/components/ui/SiteModal.tsx`
- `src/components/reservation/ReservationDetailModal.tsx`
- 기타 모든 모달

**작업 내용**:
- [ ] 모바일: 전체 화면 (100vh)
- [ ] 태블릿: 하단 시트 또는 중앙 모달
- [ ] 닫기 제스처 (스와이프 다운)
- [ ] 배경 스크롤 방지

**우선순위**: 🔴 최고
**예상 시간**: 3시간

#### Task 11.2: Button 터치 최적화
**전역 적용**

**작업 내용**:
- [ ] 최소 높이 44px (min-h-11)
- [ ] 터치 피드백 (active:scale-95)
- [ ] 로딩 상태 명확화
- [ ] 아이콘 크기 조정

**우선순위**: 🔴 최고
**예상 시간**: 2시간

#### Task 11.3: Input/Form 터치 최적화
**전역 적용**

**작업 내용**:
- [ ] 입력 필드 최소 높이 44px
- [ ] 라벨 크기 조정
- [ ] 에러 메시지 가독성
- [ ] 자동완성 최적화

**우선순위**: 🔴 최고
**예상 시간**: 2시간

---

### 🎯 Phase 12: 터치 인터랙션

#### Task 12.1: 스와이프 제스처 구현
**적용 위치**:
- 이미지 갤러리
- 하단 시트
- 모달 닫기
- 캠핑장 카드 (선택적)

**작업 내용**:
- [ ] react-swipeable 또는 Framer Motion 사용
- [ ] 스와이프 방향별 액션 정의
- [ ] 애니메이션 최적화
- [ ] 햅틱 피드백 (진동)

**우선순위**: 🟡 중간
**예상 시간**: 3시간

#### Task 12.2: Pull to Refresh 구현
**적용 페이지**:
- 홈페이지
- 캠핑장 목록
- 예약 목록

**작업 내용**:
- [ ] 당겨서 새로고침 제스처
- [ ] 로딩 인디케이터
- [ ] 데이터 재요청 로직

**우선순위**: 🔵 낮음
**예상 시간**: 2시간

#### Task 12.3: Long Press 메뉴 (선택적)
**적용 위치**:
- 예약 카드
- 캠핑장 카드 (관리자)

**작업 내용**:
- [ ] 롱프레스 감지
- [ ] 컨텍스트 메뉴 표시
- [ ] 햅틱 피드백

**우선순위**: 🔵 낮음
**예상 시간**: 2시간

---

### 🧪 Phase 13: 테스트 & QA

#### Task 13.1: 화면 크기별 테스트
**테스트 기기/크기**:
- [ ] iPhone SE (320px)
- [ ] iPhone 12/13/14 (390px)
- [ ] iPhone 14 Pro Max (430px)
- [ ] iPad Mini (768px)
- [ ] iPad Pro (1024px)

**우선순위**: 🔴 최고
**예상 시간**: 4시간

#### Task 13.2: 터치 인터랙션 테스트
**테스트 항목**:
- [ ] 모든 버튼 터치 가능 (44px+)
- [ ] 스크롤 스무스
- [ ] 제스처 동작 확인
- [ ] 입력 필드 포커스

**우선순위**: 🔴 최고
**예상 시간**: 2시간

#### Task 13.3: 성능 테스트
**테스트 항목**:
- [ ] Lighthouse 모바일 점수 90+
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1

**우선순위**: 🟡 중간
**예상 시간**: 2시간

---

## 📊 작업 우선순위 요약

### 🔴 최고 우선순위 (1-2주)
1. Task 0.1: MobileContainer 생성
2. Task 1.1: Header 모바일 최적화
3. Task 1.3: 하단 네비게이션 바
4. Task 2.1-2.2: 홈페이지 최적화
5. Task 3.1-3.2: 캠핑장 목록 최적화
6. Task 4.1-4.3: 캠핑장 상세 최적화
7. Task 6.1: 예약 목록 최적화
8. Task 7.1: 결제 페이지 최적화
9. Task 11.1-11.3: 공통 UI 최적화
10. Task 13.1-13.2: 테스트

### 🟡 중간 우선순위 (2-3주)
11. Task 1.2: Footer 최적화
12. Task 2.3: FilterModal 최적화
13. Task 4.2: ImageGallery 제스처
14. Task 5.1: 지도 페이지 최적화
15. Task 6.2: 예약 카드 최적화
16. Task 8.1-8.2: 인증 페이지 최적화
17. Task 9.1-9.2: 대시보드 최적화
18. Task 10.1-10.2: 관리 기능 최적화
19. Task 12.1: 스와이프 제스처

### 🔵 낮은 우선순위 (3-4주)
20. Task 9.3: Admin 대시보드
21. Task 12.2-12.3: Pull to Refresh, Long Press
22. Task 13.3: 성능 테스트

---

## 🛠️ 개발 가이드라인

### 1. Tailwind Breakpoints 표준
```typescript
// 320px+  : 기본 (모바일 세로)
// 640px+  : sm (모바일 가로, 큰 폰)
// 768px+  : md (태블릿 세로)
// 1024px+ : lg (태블릿 가로, 작은 노트북) ← 최대 폭

// 1280px+ : xl (사용하지 않음)
// 1536px+ : 2xl (사용하지 않음)
```

### 2. 터치 타겟 크기
```typescript
// 최소 크기: 44px x 44px (Apple HIG)
// 권장 크기: 48px x 48px (Material Design)

// Tailwind 클래스
min-h-11  // 44px
min-h-12  // 48px
```

### 3. 레이아웃 패턴
```tsx
// 페이지 레이아웃
<MobileContainer>
  <div className="px-4 sm:px-6 md:px-8 py-6">
    {/* 콘텐츠 */}
  </div>
</MobileContainer>

// 카드 그리드
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* 모바일: 1열, 태블릿: 2열 */}
</div>

// 버튼
<button className="min-h-12 px-6 rounded-xl active:scale-95 transition">
  {/* 터치 최적화 */}
</button>
```

### 4. 모달 패턴
```tsx
// 모바일: 전체 화면
const isMobile = useMediaQuery('(max-width: 768px)');

if (isMobile) {
  return <FullScreenModal />;
}

// 데스크톱: 중앙 모달
return <CenterModal />;
```

---

## 📈 진행 상황 트래킹

### Week 1 (예정)
- [ ] Phase 0: 준비 (Task 0.1)
- [ ] Phase 1: 공통 컴포넌트 (Task 1.1, 1.3)
- [ ] Phase 2: 홈페이지 (Task 2.1, 2.2)

### Week 2 (예정)
- [ ] Phase 3: 캠핑장 목록 (Task 3.1, 3.2)
- [ ] Phase 4: 캠핑장 상세 (Task 4.1, 4.3)
- [ ] Phase 11: 공통 UI (Task 11.1, 11.2, 11.3)

### Week 3 (예정)
- [ ] Phase 6: 예약 목록 (Task 6.1)
- [ ] Phase 7: 결제 (Task 7.1)
- [ ] Phase 8: 인증 (Task 8.1, 8.2)
- [ ] Phase 13: 테스트 (Task 13.1, 13.2)

### Week 4 (예정)
- [ ] 나머지 중간/낮은 우선순위 작업
- [ ] 버그 수정 및 최적화
- [ ] 최종 QA

---

## 🎯 성공 기준

### 필수 요구사항 ✅
- [ ] 모든 페이지 max-width 1024px 적용
- [ ] 모든 버튼 최소 44px 터치 타겟
- [ ] 모바일(320px)~태블릿(1024px) 완벽 지원
- [ ] 하단 네비게이션 바 동작
- [ ] 주요 모달 전체 화면 또는 하단 시트

### 성능 목표 🚀
- [ ] Lighthouse Mobile Score 90+
- [ ] LCP < 2.5초
- [ ] FID < 100ms
- [ ] CLS < 0.1

### UX 목표 🎨
- [ ] 터치 제스처 직관적
- [ ] 스크롤 스무스
- [ ] 로딩 상태 명확
- [ ] 에러 메시지 사용자 친화적

---

## 📚 참고 자료

- [Apple HIG - Touch Targets](https://developer.apple.com/design/human-interface-guidelines/touchscreen-gestures)
- [Material Design - Touch Targets](https://m3.material.io/foundations/interaction/gestures#86650b53-11b6-4c9e-b5c8-c95e3f8d9c0c)
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Next.js Image Optimization](https://nextjs.org/docs/pages/building-your-application/optimizing/images)

---

**작성일**: 2025-11-04
**최종 수정**: 2025-11-04
**담당자**: Development Team
**예상 완료**: 2025-12-02 (4주)
