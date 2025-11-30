# 화면별 레이아웃 설계

> 모바일 전용 (640px) 화면 구성

## 📐 레이아웃 기본 원칙

### Design Mode

```
🎨 Light Mode Only
- 다크모드 미지원
- 단일 디자인 시스템 집중
- 일관된 사용자 경험
```

### Grid System

```
전체 너비: 640px (최대)
좌우 패딩: 16px
컨텐츠 영역: 608px
```

### Spacing Scale

```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
```

### Color Palette (Light Mode)

```
Primary: hsl(142 76% 36%)      - 초록색 (CTA, 강조)
Secondary: hsl(142 30% 96%)    - 연한 초록 (배경)
Background: hsl(0 0% 100%)     - 흰색
Foreground: hsl(0 0% 9%)       - 거의 검정 (텍스트)
Muted: hsl(142 30% 96%)        - 회색조 배경
Border: hsl(142 30% 90%)       - 경계선
```

### 💀 스켈레톤 UI (Loading States)

**위치**: `components/ui/Skeleton.tsx`

**기본 사용법**:

```tsx
import {
  Skeleton,
  CampgroundCardSkeleton,
  ReviewCardSkeleton,
  SiteCardSkeleton,
  ListSkeleton
} from "@/components/ui";

// 1. 기본 스켈레톤
<Skeleton className="h-4 w-full" />

// 2. 캠핑장 카드 스켈레톤
{isLoading ? (
  <div className="flex gap-4">
    {[1, 2, 3, 4].map((i) => (
      <CampgroundCardSkeleton key={i} />
    ))}
  </div>
) : (
  // 실제 데이터
)}

// 3. 리뷰 카드 스켈레톤 (리스트)
{isLoading ? (
  <ListSkeleton
    count={3}
    ItemSkeleton={ReviewCardSkeleton}
    className="space-y-3"
  />
) : (
  // 실제 데이터
)}

// 4. 사이트 카드 스켈레톤
{isLoading ? (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <SiteCardSkeleton key={i} />
    ))}
  </div>
) : (
  // 실제 데이터
)}
```

**사용 가능한 스켈레톤**:

- `Skeleton`: 범용 스켈레톤 베이스
- `CampgroundCardSkeleton`: 캠핑장 카드 (이미지 + 제목 + 위치/평점)
- `ReviewCardSkeleton`: 리뷰 카드 (작성자 + 별점 + 내용)
- `SiteCardSkeleton`: 사이트 카드 (사이트명 + 타입 + 가격)
- `ListSkeleton`: 반복 렌더링 헬퍼

**⚠️ 필수 규칙**:

- 모든 데이터 로딩 시 반드시 스켈레톤 UI 사용
- 인라인 스켈레톤 작성 금지 (컴포넌트 재사용)
- 스켈레톤 크기/구조는 실제 컴포넌트와 동일하게

---

## 🏠 홈 (랜딩)

```
┌─────────────────────────────────┐ 640px
│ Header (sticky)           56px  │
│ [Logo] CampStation      [Login] │
├─────────────────────────────────┤
│ ← 16px padding →                │
│ Hero Section            240px   │
│ ┌─────────────────────────────┐ │ 608px
│ │                             │ │
│ │   자연과 함께하는            │ │
│ │   특별한 캠핑 경험           │ │
│ │                             │ │
│ │   전국 최고의 캠핑장을       │ │
│ │   한눈에 비교하고 예약하세요  │ │
│ │                             │ │
│ │   [캠핑장 둘러보기] (Primary)│ │
│ │   [지도로 찾기]    (Outline) │ │
│ │                             │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ ← 16px padding →                │
│ Quick Search            120px   │
│ ┌─────────────────────────────┐ │ 608px
│ │ 📍 인기 지역                │ │
│ │ [제주도] [강원도] [경기도]  │ │
│ │ [부산] [전라도] [충청도]    │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ ← 16px padding →                │
│ Featured Campgrounds    (동적)  │
│ ┌─────────────────────────────┐ │ 608px
│ │ 🔥 이번 주 인기 캠핑장       │ │
│ ├─────────────────────────────┤ │
│ │ [Horizontal Scroll]         │ │
│ │ ┌───┐ ┌───┐ ┌───┐          │ │
│ │ │img│ │img│ │img│          │ │
│ │ │ A │ │ B │ │ C │  →       │ │
│ │ └───┐ └───┘ └───┘          │ │
│ └─────────────────────────────┘ │
│                          (320px)│
├─────────────────────────────────┤
│ ← 16px padding →                │
│ Features Section        360px   │
│ ┌─────────────────────────────┐ │ 608px
│ │ 🔍 쉬운 검색                │ │
│ │ 원하는 지역과 조건으로...    │ │
│ ├─────────────────────────────┤ │
│ │ 📅 실시간 예약              │ │
│ │ 실시간으로 예약 가능 여부... │ │
│ ├─────────────────────────────┤ │
│ │ ✅ 안전한 결제              │ │
│ │ 다양한 결제 수단으로...     │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘

**구현 상태**: ✅ 완료
- Hero Section: 240px (헤드라인 + 2개 CTA)
- Quick Search: 120px (인기 지역 6개 그리드)
- Featured Campgrounds: 동적 높이 (인기 캠핑장 API 연동, 가로 스크롤)
- Features Section: 360px (3개 카드)
- API: `GET /api/v1/campgrounds/popular?limit=6`
│ │ 다양한 결제 수단으로...      │ │
│ └─────────────────────────────┘ │
│                                 │
├─────────────────────────────────┤
│ ← 16px padding →                │
│ Recent Reviews          (동적)  │
│ ┌─────────────────────────────┐ │ 608px
│ │ ⭐ 최근 리뷰                │ │
│ ├─────────────────────────────┤ │
│ │ "정말 좋았어요!" - 홍길동   │ │
│ │ ★★★★★ 제주 오름 캠핑장    │ │
│ ├─────────────────────────────┤ │
│ │ "깨끗하고 조용해요" - 김철수│ │
│ │ ★★★★☆ 강원 숲속 캠핑장    │ │
│ └─────────────────────────────┘ │
│                          (240px)│
├─────────────────────────────────┤
│ Bottom Tab Nav          56px    │
└─────────────────────────────────┘
```

### 컴포넌트 구성

```tsx
<Layout>
  <Header sticky>
    <Logo />
    <LoginButton />
  </Header>

  <main className="px-4 py-8 pb-20">
    {/* Hero Section */}
    <section className="flex flex-col items-center gap-6 text-center">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">
          자연과 함께하는
          <br />
          <span className="text-primary">특별한 캠핑 경험</span>
        </h1>
        <p className="text-muted-foreground">
          전국 최고의 캠핑장을 한눈에 비교하고 예약하세요.
        </p>
      </div>

      <div className="flex w-full flex-col gap-3">
        <Link href="/campgrounds">
          <Button variant="primary" size="lg" fullWidth>
            캠핑장 둘러보기
          </Button>
        </Link>
        <Link href="/map">
          <Button variant="outline" size="lg" fullWidth>
            지도로 찾기
          </Button>
        </Link>
      </div>
    </section>

    {/* Quick Search - 인기 지역 */}
    <section className="mt-8">
      <h2 className="mb-4 text-lg font-bold">📍 인기 지역</h2>
      <div className="grid grid-cols-3 gap-3">
        <RegionChip>제주도</RegionChip>
        <RegionChip>강원도</RegionChip>
        <RegionChip>경기도</RegionChip>
        <RegionChip>부산</RegionChip>
        <RegionChip>전라도</RegionChip>
        <RegionChip>충청도</RegionChip>
      </div>
    </section>

    {/* Featured Campgrounds - 이번 주 인기 */}
    <section className="mt-8">
      <h2 className="mb-4 text-lg font-bold">🔥 이번 주 인기 캠핑장</h2>
      <HorizontalScroll>
        {featuredCampgrounds.map((camp) => (
          <FeaturedCampCard key={camp.id} data={camp} />
        ))}
      </HorizontalScroll>
    </section>

    {/* Features */}
    <section className="mt-8 space-y-4">
      <FeatureCard icon="🔍" title="쉬운 검색" />
      <FeatureCard icon="📅" title="실시간 예약" />
      <FeatureCard icon="✅" title="안전한 결제" />
    </section>

    {/* Recent Reviews */}
    <section className="mt-8">
      <h2 className="mb-4 text-lg font-bold">⭐ 최근 리뷰</h2>
      <div className="space-y-3">
        {recentReviews.slice(0, 3).map((review) => (
          <ReviewPreviewCard key={review.id} data={review} />
        ))}
      </div>
    </section>
  </main>

  <BottomTabNav />
</Layout>
```

### 특징

1. **Hero 중심**: 큰 헤드라인과 CTA 버튼으로 즉시 행동 유도
2. **인기 지역**: 빠른 검색을 위한 지역 칩
3. **Featured 캠핑장**: 가로 스크롤 카드로 인기 캠핑장 미리보기
4. **Features**: 서비스 특징 강조
5. **Recent Reviews**: 사회적 증거(social proof) 제공

---

## 🏕️ 캠핑장 목록 (검색/필터)

```
┌─────────────────────────────────┐ 640px
│ Header (sticky)           56px  │
│ [←] 캠핑장 목록         [Filter]│
├─────────────────────────────────┤
│ Search Bar (padding: 8px) 44px  │
│ ┌─────────────────────────────┐ │ 624px
│ │ 🔍 지역, 캠핑장 이름 검색   │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ ← 16px padding →                │
│ Search History (조건부)   (동적)│
│ ┌─────────────────────────────┐ │ 608px
│ │ 🕐 최근 검색어              │ │
│ │ [제주도] [강원도] [지우기]  │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ ← 16px padding →                │
│ Active Filter Chips       40px  │
│ [가격 ₩0-5만 ×] [와이파이 ×]   │
│ (horizontal scroll)             │
├─────────────────────────────────┤
│ ← 16px padding →                │
│ Results Count             32px  │
│ 총 128개 캠핑장                 │
├─────────────────────────────────┤
│ ← 16px padding →                │
│ Campground Card 1        280px  │
│ ┌─────────────────────────────┐ │ 608px
│ │ ┌───────────────┐  [♡]      │ │
│ │ │               │            │ │
│ │ │  Image 4:3    │            │ │
│ │ │               │            │ │
│ │ └───────────────┘            │ │
│ │ 제주 오름 캠핑장              │ │
│ │ ★★★★☆ 4.5 (128)            │ │
│ │ 📍 제주시                    │ │
│ │ ₩50,000 / 박    [상세보기]  │ │
│ └─────────────────────────────┘ │
│                          (gap 16px)
│ Campground Card 2        280px  │
│ ┌─────────────────────────────┐ │
│ │ ...                         │ │
│                                 │
│ (scroll)                        │
│                                 │
├─────────────────────────────────┤
│ Pagination (조건부)       56px  │
│ [◀] 1 2 3 ... 10 [▶]           │
├─────────────────────────────────┤
│ (scroll padding)          56px  │
├─────────────────────────────────┤
│ Bottom Tab Nav           56px   │
└─────────────────────────────────┘
```

### 컴포넌트 구성

```tsx
<Layout>
  <Header sticky>
    <BackButton />
    <Title>캠핑장 목록</Title>
    <FilterButton
      onClick={() => setShowFilters(true)}
      badge={activeFilterCount}
    />
  </Header>

  {/* Search Bar */}
  <div className="sticky top-14 z-10 bg-white px-2 py-2">
    <form onSubmit={handleSearch}>
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        onFocus={() => setShowSearchHistory(true)}
        placeholder="지역, 캠핑장 이름 검색"
      />
    </form>
  </div>

  {/* Search History (조건부) */}
  {showSearchHistory && history.length > 0 && (
    <div className="border-b bg-neutral-50 px-4 py-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">🕐 최근 검색어</span>
        <Button variant="ghost" size="sm" onClick={clearHistory}>
          지우기
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {history.map((term) => (
          <Chip
            key={term}
            onClick={() => handleHistoryClick(term)}
            onRemove={() => removeSearchTerm(term)}
          >
            {term}
          </Chip>
        ))}
      </div>
    </div>
  )}

  {/* Active Filters */}
  {activeFilterCount > 0 && (
    <div className="border-b px-4 py-2">
      <div className="flex gap-2 overflow-x-auto">
        {activeFilters.priceRange && (
          <FilterChip onRemove={() => handleRemoveFilter("price")}>
            가격 ₩{activeFilters.priceRange.min / 10000}-
            {activeFilters.priceRange.max / 10000}만
          </FilterChip>
        )}
        {activeFilters.amenities.map((amenity) => (
          <FilterChip
            key={amenity}
            onRemove={() => handleRemoveFilter("amenity", amenity)}
          >
            {AMENITY_LABELS[amenity]}
          </FilterChip>
        ))}
        {activeFilters.siteTypes.map((type) => (
          <FilterChip
            key={type}
            onRemove={() => handleRemoveFilter("siteType", type)}
          >
            {SITE_TYPE_LABELS[type]}
          </FilterChip>
        ))}
        {activeFilters.capacity && (
          <FilterChip onRemove={() => handleRemoveFilter("capacity")}>
            {activeFilters.capacity}명 이상
          </FilterChip>
        )}
      </div>
    </div>
  )}

  <main className="px-4 py-6 pb-20">
    {/* Results Count */}
    <div className="mb-4 text-sm text-neutral-600">
      총 {data?.data.totalElements || 0}개 캠핑장
    </div>

    {/* Loading State */}
    {isLoading && <LoadingSpinner />}

    {/* Error State */}
    {error && <ErrorMessage message="캠핑장을 불러올 수 없습니다" />}

    {/* Empty State */}
    {!isLoading && !error && data?.data.content.length === 0 && (
      <EmptyState message="검색 결과가 없습니다" />
    )}

    {/* Campground List */}
    {data?.data.content && data.data.content.length > 0 && (
      <div className="space-y-4">
        {data.data.content.map((camp) => (
          <CampgroundCard key={camp.id} data={camp} />
        ))}
      </div>
    )}

    {/* Pagination */}
    {data?.data && data.data.totalPages > 1 && (
      <Pagination
        currentPage={page}
        totalPages={data.data.totalPages}
        onPageChange={setPage}
      />
    )}
  </main>

  <BottomTabNav />

  {/* Filter Sheet (Modal) */}
  {showFilters && (
    <CampgroundFilters
      initialValues={activeFilters}
      onApply={handleApplyFilters}
      onClose={() => setShowFilters(false)}
    />
  )}
</Layout>
```

### 특징

1. **검색 중심**: 상단 고정 검색바로 즉시 검색 가능
2. **검색 히스토리**: 최근 검색어 표시 및 재사용
3. **Active Filters**: 현재 적용된 필터를 칩으로 표시, 개별 제거 가능
4. **Results Count**: 검색 결과 개수 명시
5. **Filter Badge**: 헤더 필터 버튼에 active count 표시
6. **Pagination**: 페이지네이션으로 많은 결과 처리

### 홈 vs 캠핑장 목록 차이점

| 항목           | 홈 (랜딩)                   | 캠핑장 목록 (검색)         |
| -------------- | --------------------------- | -------------------------- |
| **목적**       | 서비스 소개, 유입           | 캠핑장 검색 및 필터링      |
| **Header**     | Logo + Login                | Back + Title + Filter      |
| **Hero**       | ✅ 큰 헤드라인 + CTA        | ❌ 없음                    |
| **Search**     | ❌ 직접 검색 없음           | ✅ 상단 고정 검색바        |
| **Content**    | Featured 카드 (가로 스크롤) | 전체 목록 (세로 스크롤)    |
| **Filter**     | ❌ 없음 (인기 지역만)       | ✅ 상세 필터 (Sheet Modal) |
| **CTA**        | "캠핑장 둘러보기" 버튼      | 각 카드의 "상세보기" 버튼  |
| **Features**   | ✅ 서비스 특징 소개         | ❌ 없음                    |
| **Reviews**    | ✅ 최근 리뷰 미리보기       | ❌ 없음                    |
| **Pagination** | ❌ 없음                     | ✅ 페이지네이션            |

---

## 🏕️ 캠핑장 상세

```
┌─────────────────────────────────┐ 640px
│ Header                    56px  │
│ [←] 캠핑장 이름          [♡]    │
├─────────────────────────────────┤
│ Image Carousel          480px   │
│ (aspect-4/3, full width)        │
│ • • • ○ •  (indicators)         │
├─────────────────────────────────┤
│ ← 16px padding →                │
│ Title Section            80px   │
│ ┌─────────────────────────────┐ │ 608px
│ │ 제주 오름 캠핑장              │ │
│ │ ★★★★☆ 4.5 (128)             │ │
│ │ 📍 제주시                     │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ ← 16px padding →                │
│ Quick Info              100px   │
│ ┌─────────────────────────────┐ │ 608px
│ │ 체크인: 14:00               │ │
│ │ 체크아웃: 11:00             │ │
│ │ 📞 064-123-4567            │ │
│ │ 📍 제주특별자치도 ...        │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ ← 16px padding →                │
│ Description            (동적)   │
│ 캠핑장 소개 텍스트...            │
├─────────────────────────────────┤
│ ← 16px padding →                │
│ Facilities              120px   │
│ ┌──┬──┬──┬──┐                  │ 608px
│ │🚻│🚿│⚡│📶│                  │
│ ├──┼──┼──┼──┤                  │
│ │🅿️│🔥│🌲│🏊│                  │
│ └──┴──┴──┴──┘                  │
├─────────────────────────────────┤
│ ← 16px padding →                │
│ Sites Section          (동적)   │
│ ┌─────────────────────────────┐ │ 608px
│ │ A-01  ₩50,000    4명   [선택]│ │
│ ├─────────────────────────────┤ │
│ │ A-02  ₩50,000    4명   [선택]│ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ ← 16px padding →                │
│ Location (Mini Map)     200px   │
│ [지도 썸네일]                    │
│ [지도에서 보기]                  │
├─────────────────────────────────┤
│ ← 16px padding →                │
│ Reviews Section        (동적)   │
│ ★★★★☆ 4.5 평균 (128개)         │
│ ┌─────────────────────────────┐ │ 608px
│ │ 홍길동 ★★★★★               │ │
│ │ 정말 좋았어요!               │ │
│ └─────────────────────────────┘ │
│ [모든 리뷰 보기]                 │
├─────────────────────────────────┤
│ (scroll padding)         80px   │
├─────────────────────────────────┤
│ Sticky CTA Bar          72px    │
│ ┌─────────────────────────────┐ │ 640px (full)
│ │ ₩50,000 / 박    [예약하기]  │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### 주요 섹션

1. **Hero**: 이미지 갤러리 (스와이프)
2. **Info**: 기본 정보 + 평점
3. **Description**: 상세 설명
4. **Facilities**: 편의시설 그리드 (4열)
5. **Sites**: 사이트 선택 리스트
6. **Location**: 지도 미리보기
7. **Reviews**: 리뷰 3개 + 더보기
8. **CTA**: Sticky 예약 버튼

---

## 📅 예약하기

```
┌─────────────────────────────────┐ 640px
│ Header                    56px  │
│ [←] 예약하기                    │
├─────────────────────────────────┤
│ Step Indicator            40px  │
│ ●───●───○───○                   │
│ 날짜 사이트 정보 결제             │
├─────────────────────────────────┤
│ ← 16px padding →                │
│ === STEP 1: 날짜 선택 ===       │
│                                 │
│ Calendar Component      400px   │
│ ┌─────────────────────────────┐ │ 608px
│ │   2025년 12월               │ │
│ │ 일 월 화 수 목 금 토          │ │
│ │  1  2  3  4  5  6  7        │ │
│ │  8  9 10 11 12 13 14        │ │
│ │ 15 16 17 18 19 20 21        │ │
│ │ 22 23 24 25 26 27 28        │ │
│ └─────────────────────────────┘ │
│                                 │
│ Date Summary             60px   │
│ ┌─────────────────────────────┐ │ 608px
│ │ 체크인: 12월 1일 (금)        │ │
│ │ 체크아웃: 12월 3일 (일)      │ │
│ │ 총 2박                       │ │
│ └─────────────────────────────┘ │
│                                 │
├─────────────────────────────────┤
│ ← 16px padding →                │
│ === STEP 2: 사이트 선택 ===     │
│                                 │
│ Site Cards              (동적)   │
│ ┌─────────────────────────────┐ │ 608px
│ │ ○ A-01  일반사이트          │ │
│ │   ₩50,000 / 박  최대 4명    │ │
│ │   [사진] 설명...             │ │
│ ├─────────────────────────────┤ │
│ │ ● A-02  일반사이트 (선택)   │ │
│ │   ₩50,000 / 박  최대 4명    │ │
│ └─────────────────────────────┘ │
│                                 │
├─────────────────────────────────┤
│ ← 16px padding →                │
│ === STEP 3: 인원 입력 ===       │
│                                 │
│ Guest Counter           120px   │
│ ┌─────────────────────────────┐ │ 608px
│ │ 성인                         │ │
│ │ [-]  2  [+]                 │ │
│ │                             │ │
│ │ 아동 (만 12세 이하)          │ │
│ │ [-]  1  [+]                 │ │
│ └─────────────────────────────┘ │
│                                 │
│ Special Requests        100px   │
│ ┌─────────────────────────────┐ │ 608px
│ │ 특별 요청사항 (선택)         │ │
│ │ [textarea]                  │ │
│ └─────────────────────────────┘ │
│                                 │
├─────────────────────────────────┤
│ (scroll padding)         80px   │
├─────────────────────────────────┤
│ Sticky Summary Bar       72px   │
│ ┌─────────────────────────────┐ │ 640px (full)
│ │ 총 ₩100,000      [다음]    │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### Step별 구성

- **Step 1**: 캘린더 날짜 선택
- **Step 2**: 라디오 버튼 사이트 선택
- **Step 3**: +/- 버튼 인원 입력
- **Step 4**: 결제 페이지로 이동

---

## 💳 결제

```
┌─────────────────────────────────┐ 640px
│ Header                    56px  │
│ [←] 결제하기                    │
├─────────────────────────────────┤
│ ← 16px padding →                │
│ Order Summary           180px   │
│ ┌─────────────────────────────┐ │ 608px
│ │ 제주 오름 캠핑장             │ │
│ │ A-01 사이트                  │ │
│ │ 12/1(금) - 12/3(일), 2박     │ │
│ │ 성인 2명, 아동 1명           │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ ← 16px padding →                │
│ Price Breakdown         120px   │
│ ┌─────────────────────────────┐ │ 608px
│ │ 사이트 요금    ₩100,000     │ │
│ │ 할인           -₩0          │ │
│ │ ───────────────────────────  │ │
│ │ 총 결제 금액   ₩100,000     │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ ← 16px padding →                │
│ Toss Payments Widget    400px   │
│ ┌─────────────────────────────┐ │ 608px
│ │ [결제 수단 선택]             │ │
│ │ ○ 신용카드                   │ │
│ │ ○ 계좌이체                   │ │
│ │ ○ 간편결제                   │ │
│ │   - 카카오페이               │ │
│ │   - 네이버페이               │ │
│ │   - 토스페이                 │ │
│ └─────────────────────────────┘ │
│                                 │
├─────────────────────────────────┤
│ ← 16px padding →                │
│ Agreement                60px   │
│ ☑ 결제 정보를 확인하였으며...    │
├─────────────────────────────────┤
│ (scroll padding)         80px   │
├─────────────────────────────────┤
│ Sticky Pay Button        72px   │
│ ┌─────────────────────────────┐ │ 640px (full)
│ │   ₩100,000 결제하기         │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

## 📋 예약 내역

```
┌─────────────────────────────────┐ 640px
│ Header                    56px  │
│ 내 예약                          │
├─────────────────────────────────┤
│ Tabs                      44px  │
│ [예정] [완료] [취소]             │
├─────────────────────────────────┤
│ ← 16px padding →                │
│ Reservation Card 1      140px   │
│ ┌─────────────────────────────┐ │ 608px
│ │ [이미지]                     │ │
│ │ 제주 오름 캠핑장             │ │
│ │ 12/1 - 12/3 (2박)           │ │
│ │ 예약 확정                    │ │
│ │ RSV-123                      │ │
│ └─────────────────────────────┘ │
│          (gap 16px)             │
│ Reservation Card 2              │
│ ┌─────────────────────────────┐ │ 608px
│ │ ...                         │ │
│                                 │
│ (scroll)                        │
│                                 │
├─────────────────────────────────┤
│ ← 16px padding →                │
│ Empty State            200px    │
│ ┌─────────────────────────────┐ │ 608px
│ │ 📋                          │ │
│ │ 예약 내역이 없습니다         │ │
│ │ [캠핑장 찾기]                │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Bottom Tab Nav          56px    │
└─────────────────────────────────┘
```

---

## 📄 예약 상세

```
┌─────────────────────────────────┐ 640px
│ Header                    56px  │
│ [←] 예약 상세                   │
├─────────────────────────────────┤
│ Status Badge             40px   │
│      [예약 확정]                 │
├─────────────────────────────────┤
│ ← 16px padding →                │
│ QR Code Section         240px   │
│ ┌─────────────────────────────┐ │ 608px
│ │     [QR Code]               │ │
│ │ 이 QR코드를 입구에서 스캔     │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ ← 16px padding →                │
│ Campground Info         120px   │
│ ┌─────────────────────────────┐ │ 608px
│ │ [썸네일]                     │ │
│ │ 제주 오름 캠핑장             │ │
│ │ 제주시                       │ │
│ │ 📞 064-123-4567             │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ ← 16px padding →                │
│ Reservation Details     180px   │
│ ┌─────────────────────────────┐ │ 608px
│ │ 예약번호                     │ │
│ │ RSV-20251109-123            │ │
│ │                             │ │
│ │ 체크인: 12월 1일 14:00      │ │
│ │ 체크아웃: 12월 3일 11:00    │ │
│ │                             │ │
│ │ 사이트: A-01                 │ │
│ │ 인원: 성인 2명, 아동 1명     │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ ← 16px padding →                │
│ Payment Info            120px   │
│ ┌─────────────────────────────┐ │ 608px
│ │ 결제 금액: ₩100,000         │ │
│ │ 결제 수단: 카드              │ │
│ │ 결제일: 2025.11.09          │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ ← 16px padding →                │
│ Action Buttons          120px   │
│ ┌─────────────────────────────┐ │ 608px
│ │ [길찾기] [전화걸기]          │ │
│ │ [예약 취소]                  │ │
│ │ [리뷰 작성]                  │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

## 👤 마이페이지

```
┌─────────────────────────────────┐ 640px
│ Header                    56px  │
│ 마이페이지                       │
├─────────────────────────────────┤
│ ← 16px padding →                │
│ Profile Section         120px   │
│ ┌─────────────────────────────┐ │ 608px
│ │ [프로필 이미지]              │ │
│ │ 홍길동                       │ │
│ │ user@example.com            │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ ← 16px padding →                │
│ Menu List              (동적)   │
│ ┌─────────────────────────────┐ │ 608px
│ │ 내 예약              [>]    │ │
│ ├─────────────────────────────┤ │
│ │ 찜한 캠핑장          [>]    │ │
│ ├─────────────────────────────┤ │
│ │ 내 리뷰              [>]    │ │
│ ├─────────────────────────────┤ │
│ │ 결제 내역            [>]    │ │
│ ├─────────────────────────────┤ │
│ │ 고객센터             [>]    │ │
│ ├─────────────────────────────┤ │
│ │ 설정                 [>]    │ │
│ ├─────────────────────────────┤ │
│ │ 로그아웃                     │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Bottom Tab Nav          56px    │
└─────────────────────────────────┘
```

---

## 🧭 Bottom Tab Navigation

```
┌─────────────────────────────────┐
│         (main content)          │
├─────────────────────────────────┤
│ Tab Bar (fixed bottom)   56px   │
│ ┌───┬───┬───┬───┬───┐           │
│ │🏠 │�│📅│�️│�👤│           │
│ │홈 │검색│예약│지도│MY│           │
│ └───┴───┴───┴───┴───┘           │
└─────────────────────────────────┘
```

- **높이**: 56px (h-14)
- **각 탭**: 128px 너비 (640px / 5)
- **아이콘**: 20px (h-5 w-5)
- **텍스트**: 10px (text-[10px])
- **z-index**: 50

**모든 페이지의 하단 패딩**: pb-14 (56px) 필수

**Sticky CTA Bar가 있는 경우** (예: 캠핑장 상세):

- CTA Bar: `bottom-14` (Bottom Nav 위에 배치)
- 컨텐츠 패딩: `pb-32` (56px + 72px = 128px)

---

**마지막 업데이트**: 2025-11-10
