# Phase 2 완료: 홈페이지 모바일 최적화

**작업 날짜**: 2025년 11월 4일  
**담당 Phase**: Phase 2 (홈페이지)  
**우선순위**: 🔴 최고

---

## 📋 작업 요약

홈페이지의 모든 섹션에 MobileContainer를 적용하고, 카드 그리드를 모바일 우선으로 개선했습니다. React 19 및 Next.js 15의 최신 기법을 활용하여 성능과 UX를 최적화했습니다.

### ✅ 완료된 작업

#### 1. **HeroSection 모바일 최적화** (`src/components/home/sections/HeroSection.tsx`)
- ✅ MobileContainer 적용 (max-width: 1024px)
- ✅ 반응형 패딩 (p-4 sm:p-6 md:p-7)
- ✅ 반응형 간격 (space-y-4 sm:space-y-6)
- ✅ 검색 버튼 active:scale-95 피드백
- ✅ 추천 태그 터치 최적화

#### 2. **HomeLandingShell 레이아웃 개선** (`src/components/home/HomeLandingShell.tsx`)
- ✅ 각 섹션에 개별 MobileContainer 적용
- ✅ 반응형 간격 (gap-6 sm:gap-7)
- ✅ 하단 여백 조정 (pb-20 sm:pb-24 md:pb-28) - BottomNav 겹침 방지
- ✅ 불필요한 max-w 제거 (MobileContainer가 담당)

#### 3. **FeaturedCampgroundSection 카드 그리드** (`src/components/home/sections/FeaturedCampgroundSection.tsx`)
- ✅ 모바일: 1열 레이아웃 (grid-cols-1)
- ✅ 태블릿 이상: 2열 레이아웃 (sm:grid-cols-2)
- ✅ 반응형 간격 (gap-3 sm:gap-4 md:gap-5)

#### 4. **QuickFilterRow 터치 최적화** (`src/components/home/sections/QuickFilterRow.tsx`)
- ✅ 최소 터치 타겟 72px (모바일)
- ✅ 반응형 패딩 및 간격
- ✅ active:scale-95 피드백
- ✅ 아이콘 크기 반응형 (text-base sm:text-lg)
- ✅ 자간 조정 (tracking-tight sm:tracking-[0.25em])

---

## 🎨 디자인 개선 사항

### 1. **모바일 우선 레이아웃**

#### Before (기존)
```tsx
// HomeLandingShell.tsx
<div className="max-w-[768px] px-4 gap-7">
  <HeroSection />
  <QuickFilterRow />
  {/* ... */}
</div>
```

#### After (개선)
```tsx
// HomeLandingShell.tsx
<div className="gap-6 sm:gap-7 pb-20 sm:pb-24 md:pb-28">
  <HeroSection />  {/* 자체 MobileContainer */}
  <MobileContainer>
    <QuickFilterRow />
  </MobileContainer>
  <MobileContainer>
    <FeaturedCampgroundSection />
  </MobileContainer>
</div>
```

**개선 효과**:
- 각 섹션이 독립적으로 최대 폭 관리
- 일관된 중앙 정렬 및 패딩
- BottomNav와의 겹침 방지 (하단 여백 증가)

### 2. **카드 그리드 반응형**

#### Before (기존)
```tsx
<div className="grid grid-cols-2 gap-3 sm:gap-4">
```

#### After (개선)
```tsx
<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:gap-5">
```

**브레이크포인트별 레이아웃**:
- **모바일 (< 640px)**: 1열 (세로 스크롤, 카드 크기 최대화)
- **태블릿 (≥ 640px)**: 2열 (균형있는 레이아웃)
- **데스크톱 (≥ 768px)**: 2열 + 간격 증가 (여유로운 레이아웃)

### 3. **터치 인터랙션 강화**

#### HeroSection 검색 버튼
```tsx
// Before
<button className="... transition hover:bg-primary-hover">

// After
<button className="... transition hover:bg-primary-hover active:scale-95">
```

#### QuickFilterRow 필터 버튼
```tsx
// Before
<Link className="min-w-[88px] px-3 py-2">

// After
<Link className="min-w-[72px] px-2 py-2 active:scale-95 sm:min-w-[88px] sm:px-3 sm:py-2.5">
```

**개선 효과**:
- 터치 시 시각적 피드백 (scale-95)
- 모바일에서 더 컴팩트한 크기
- 44px 이상 터치 타겟 보장

---

## 📁 수정된 파일

### 1. `frontend/src/components/home/sections/HeroSection.tsx`
**주요 변경**:
```tsx
import { MobileContainer } from "@/components/layout/MobileContainer";

export function HeroSection({ ... }) {
  return (
    <MobileContainer>
      <section className="... p-4 sm:p-6 md:p-7">
        <div className="space-y-4 sm:space-y-6">
          {/* 검색 폼 */}
          <button className="... active:scale-95">검색</button>
          
          {/* 추천 태그 */}
          <button className="... active:scale-95 sm:px-4">
            #{suggestion}
          </button>
        </div>
      </section>
    </MobileContainer>
  );
}
```

### 2. `frontend/src/components/home/HomeLandingShell.tsx`
**주요 변경**:
```tsx
import { MobileContainer } from "@/components/layout/MobileContainer";

export function HomeLandingShell({ ... }) {
  return (
    <div className="...">
      <div className="gap-6 sm:gap-7 pb-20 sm:pb-24 md:pb-28">
        <HeroSection />
        
        <MobileContainer>
          <QuickFilterRow />
        </MobileContainer>
        
        <MobileContainer>
          <FeaturedCampgroundSection title="이번 주말, 여기 어때요?" />
        </MobileContainer>
        
        <MobileContainer>
          <FeaturedCampgroundSection title="반려견과 함께 떠나요!" />
        </MobileContainer>
        
        <MobileContainer>
          <RecentCampgroundList />
        </MobileContainer>
      </div>
    </div>
  );
}
```

### 3. `frontend/src/components/home/sections/FeaturedCampgroundSection.tsx`
**주요 변경**:
```tsx
<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:gap-5">
  {page.map((campground) => (
    <CampgroundCard key={campground.id} campground={campground} />
  ))}
</div>
```

### 4. `frontend/src/components/home/sections/QuickFilterRow.tsx`
**주요 변경**:
```tsx
export function QuickFilterRow({ items }) {
  return (
    <nav className="gap-2 px-3 py-3 sm:gap-3 sm:px-4 md:px-5">
      {items.map((filter) => (
        <Link
          className="min-w-[72px] px-2 py-2 active:scale-95 
                     sm:min-w-[88px] sm:px-3 sm:py-2.5"
        >
          <span className="text-base sm:text-lg">{filter.icon}</span>
          <span className="tracking-tight sm:tracking-[0.25em]">
            {filter.label}
          </span>
        </Link>
      ))}
    </nav>
  );
}
```

---

## 🎯 React 19 & Next.js 15 최신 기법 활용

### 1. **서버 컴포넌트 + 클라이언트 컴포넌트 분리**
```tsx
// app/(site)/page.tsx - Server Component
export default async function Home() {
  const [weekendCampgrounds, petFriendlyCampgrounds, recentCampgrounds] =
    await Promise.all([
      getWeekendCampgrounds(),
      getPetFriendlyCampgrounds(),
      getRecentCampgrounds(),
    ]);

  return (
    <Layout>
      <HomeLandingShell
        weekendCampgrounds={weekendCampgrounds}
        petFriendlyCampgrounds={petFriendlyCampgrounds}
        recentCampgrounds={recentCampgrounds}
      />
    </Layout>
  );
}

// HomeLandingShell.tsx - Client Component
"use client";
export function HomeLandingShell({ weekendCampgrounds, ... }) {
  // 인터랙션 로직만 담당
}
```

**장점**:
- 서버에서 데이터 프리페칭 (빠른 초기 렌더링)
- 클라이언트 번들 크기 최소화
- SEO 최적화

### 2. **useMemo로 계산 비용 최적화**
```tsx
const distanceMap = useMemo(() => {
  if (!userLocation) return null;
  
  return calculateDistancesForCampgrounds(
    campgrounds.map((c) => ({
      id: c.id,
      latitude: c.latitude,
      longitude: c.longitude,
    })),
    userLocation.lat,
    userLocation.lng,
  );
}, [campgrounds, userLocation]);
```

**장점**:
- 위치 기반 거리 계산 캐싱
- 불필요한 재계산 방지

### 3. **useCallback으로 함수 안정화**
```tsx
const executeSearch = useCallback(
  (rawQuery: string): void => {
    const query = rawQuery.trim();
    if (!query) {
      router.push("/campgrounds");
      return;
    }

    const params = new URLSearchParams({ q: query });
    router.push(`/campgrounds?${params.toString()}`);
  },
  [router],
);
```

**장점**:
- 자식 컴포넌트 불필요한 리렌더링 방지
- 메모이제이션 효율성 향상

### 4. **readonly 타입으로 불변성 보장**
```tsx
interface HomeLandingShellProps {
  readonly weekendCampgrounds: readonly CampgroundSummary[];
  readonly petFriendlyCampgrounds: readonly CampgroundSummary[];
  readonly recentCampgrounds: readonly CampgroundSummary[];
}
```

**장점**:
- 컴파일 타임 불변성 체크
- 예상치 못한 데이터 변경 방지

---

## 📊 성능 개선 측정

### Before (Phase 1)
- 홈페이지 max-width: 768px (고정)
- 카드 그리드: 항상 2열
- 하단 여백: pb-28 (고정)

### After (Phase 2)
- 홈페이지 max-width: 1024px (MobileContainer)
- 카드 그리드: 모바일 1열 → 태블릿 2열
- 하단 여백: pb-20 sm:pb-24 md:pb-28 (반응형)

**예상 개선 효과**:
- 모바일 스크롤 거리 단축 (1열 레이아웃)
- 태블릿 화면 활용도 증가 (최대 1024px)
- BottomNav 겹침 없음 (하단 여백 충분)

---

## 🧪 테스트 시나리오

### 1. **반응형 레이아웃 테스트**
- [ ] 320px (iPhone SE): 1열 카드, 72px 필터 버튼
- [ ] 375px (iPhone 12): 모든 요소 터치 가능
- [ ] 640px: 2열 카드 전환 확인
- [ ] 768px (iPad): 2열 카드 + 간격 증가
- [ ] 1024px (iPad Pro): 최대 폭 도달, 중앙 정렬

### 2. **터치 인터랙션 테스트**
- [ ] 검색 버튼 터치 시 scale-95 애니메이션
- [ ] 필터 버튼 터치 시 scale-95 애니메이션
- [ ] 추천 태그 터치 시 scale-95 애니메이션
- [ ] 모든 터치 타겟 44px 이상 보장

### 3. **스크롤 테스트**
- [ ] 모바일: 페이지 끝까지 스크롤 시 BottomNav와 겹침 없음
- [ ] 태블릿: 부드러운 스크롤, 콘텐츠 중앙 정렬
- [ ] 데스크톱: 최대 1024px 유지, 좌우 여백 균등

### 4. **성능 테스트**
- [ ] Lighthouse 모바일 성능 90+ 점수
- [ ] 캠핑장 카드 이미지 lazy loading
- [ ] 거리 계산 캐싱 동작 확인

---

## 📝 다음 단계

### Phase 3: 캠핑장 목록 페이지 최적화
**예상 시간**: 3시간

**주요 작업**:
1. `src/app/campgrounds/page.tsx` MobileContainer 적용
2. 필터바 모바일 레이아웃 (하단 시트 or 전체 화면)
3. 정렬 드롭다운 터치 최적화
4. 캠핑장 카드 그리드 1열→2열 반응형
5. 무한 스크롤 or 페이지네이션 터치 최적화

**파일**:
- `src/app/campgrounds/page.tsx`
- `src/components/campgrounds/CampgroundFilterBar.tsx` (예상)
- `src/components/campgrounds/CampgroundGrid.tsx` (예상)

---

## 💡 추가 개선 사항 (선택)

### 1. **검색 자동완성**
```tsx
const [suggestions, setSuggestions] = useState<string[]>([]);

useEffect(() => {
  if (searchQuery.length < 2) {
    setSuggestions([]);
    return;
  }
  
  const fetchSuggestions = async () => {
    const results = await campgroundApi.searchSuggestions(searchQuery);
    setSuggestions(results);
  };
  
  const timeoutId = setTimeout(fetchSuggestions, 300);
  return () => clearTimeout(timeoutId);
}, [searchQuery]);
```

### 2. **스켈레톤 로딩**
```tsx
{isLoading ? (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="h-[280px] animate-pulse rounded-2xl bg-card" />
    ))}
  </div>
) : (
  <FeaturedCampgroundSection campgrounds={weekendCampgrounds} />
)}
```

### 3. **무한 스크롤 (Intersection Observer)**
```tsx
const observerRef = useRef<IntersectionObserver>();
const loadMoreRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  observerRef.current = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasNextPage) {
        loadMoreCampgrounds();
      }
    },
    { threshold: 0.5 }
  );
  
  if (loadMoreRef.current) {
    observerRef.current.observe(loadMoreRef.current);
  }
  
  return () => observerRef.current?.disconnect();
}, [hasNextPage, loadMoreCampgrounds]);
```

---

## 🎉 완료 체크리스트

- [x] HeroSection MobileContainer 적용
- [x] HomeLandingShell 레이아웃 개선
- [x] FeaturedCampgroundSection 카드 그리드 1열→2열
- [x] QuickFilterRow 터치 최적화
- [x] 반응형 간격 및 패딩 적용
- [x] BottomNav 겹침 방지 (하단 여백)
- [x] active:scale-95 피드백 추가
- [x] Prettier 포맷팅
- [ ] Git 커밋
- [ ] 실제 디바이스 테스트
- [ ] Lighthouse 점수 측정

---

**작성자**: GitHub Copilot  
**검토 필요**: 모바일/태블릿 실제 디바이스 테스트, 성능 측정
