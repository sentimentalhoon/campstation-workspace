# 디자인 시스템

> **모바일 전용 (Mobile-Only) 디자인**
> 최대 폭 640px (Tailwind의 `sm` breakpoint)로 고정된 단일 디자인 시스템

## 📱 디자인 원칙

### 1. 모바일 우선 (Mobile-Only)

- **단일 뷰포트**: 최대 너비 640px
- **반응형 불필요**: 데스크톱/태블릿 대응 없음
- **터치 최적화**: 모든 인터랙션이 터치 기반
- **세로 스크롤**: 가로 스크롤 금지

### 2. 접근성

- **최소 터치 영역**: 44x44px (Apple HIG 기준)
- **명확한 시각적 피드백**: active, focus, disabled 상태
- **충분한 대비**: WCAG AA 이상 (4.5:1)

### 3. 성능

- **가벼운 애셋**: 이미지 최적화 필수
- **빠른 로딩**: Core Web Vitals 준수
- **네이티브 느낌**: 부드러운 애니메이션 (60fps)

## 🎨 색상 시스템

### Primary Colors (메인 브랜드 컬러)

```css
--primary: 142 76% 36% /* 녹색 (#16a34a) - 캠핑, 자연 */ --primary-foreground: 0
  0% 100% /* 흰색 텍스트 */;
```

### Semantic Colors (의미 기반 컬러)

```css
--success: 142 76% 36% /* 성공 - 녹색 */ --error: 0 84% 60%
  /* 에러 - 빨강 (#ef4444) */ --warning: 38 92% 50% /* 경고 - 주황 (#f97316) */
  --info: 221 83% 53% /* 정보 - 파랑 (#3b82f6) */;
```

### Neutral Colors (중립 컬러)

```css
--background: 0 0% 100% /* 배경 - 흰색 */ --foreground: 0 0% 9%
  /* 텍스트 - 거의 검정 */ --muted: 0 0% 96% /* 비활성 배경 */
  --muted-foreground: 0 0% 45% /* 비활성 텍스트 */ --border: 0 0% 90%
  /* 테두리 */;
```

### 사용 예시

```tsx
// 주요 액션 버튼
<button className="bg-primary text-primary-foreground">
  예약하기
</button>

// 에러 메시지
<div className="text-error">
  예약에 실패했습니다
</div>
```

## 📏 간격 시스템 (Spacing)

Tailwind의 기본 간격 스케일 사용 (4px 단위):

| Token | px  | 사용처                 |
| ----- | --- | ---------------------- |
| `1`   | 4   | 아이콘 여백, 미세 간격 |
| `2`   | 8   | 버튼 내부 패딩(세로)   |
| `3`   | 12  | 카드 내부 간격         |
| `4`   | 16  | 섹션 내부 간격         |
| `6`   | 24  | 컴포넌트 간 간격       |
| `8`   | 32  | 섹션 간 간격           |
| `12`  | 48  | 페이지 주요 영역 간격  |

### 레이아웃 여백

```tsx
// 페이지 컨테이너 (좌우 여백)
<div className="px-4">  {/* 16px */}

// 섹션 간 여백 (상하)
<section className="py-8">  {/* 32px */}

// 카드 내부 패딩
<div className="p-4">  {/* 16px */}
```

## 🔤 타이포그래피

### 폰트 패밀리

```css
font-sans:
  system-ui,
  -apple-system,
  sans-serif; /* 시스템 폰트 */
```

### 폰트 크기 스케일

| 용도        | Class       | Size | Line Height |
| ----------- | ----------- | ---- | ----------: |
| 페이지 제목 | `text-3xl`  | 30px |        36px |
| 섹션 제목   | `text-2xl`  | 24px |        32px |
| 카드 제목   | `text-xl`   | 20px |        28px |
| 본문(일반)  | `text-base` | 16px |        24px |
| 본문(작게)  | `text-sm`   | 14px |        20px |
| 캡션        | `text-xs`   | 12px |        16px |

### 폰트 두께

- **Regular (400)**: 본문
- **Medium (500)**: 강조 텍스트
- **Semibold (600)**: 버튼, 제목
- **Bold (700)**: 주요 제목

### 사용 예시

```tsx
// 페이지 제목
<h1 className="text-3xl font-bold">캠핑장 찾기</h1>

// 카드 제목
<h3 className="text-xl font-semibold">제주 오름 캠핑장</h3>

// 본문
<p className="text-base text-foreground">
  자연 속에서 힐링하세요
</p>

// 보조 정보
<span className="text-sm text-muted-foreground">
  2박 3일 · ₩120,000
</span>
```

## 📐 레이아웃

### 최대 너비 제약

```tsx
// 모든 페이지 컨테이너에 적용
<div className="mx-auto max-w-[640px] px-4">{/* 콘텐츠 */}</div>
```

### 그리드 시스템

```tsx
// 2열 그리드 (작은 카드)
<div className="grid grid-cols-2 gap-4">

// 1열 리스트 (큰 카드)
<div className="flex flex-col gap-4">
```

### Safe Area (노치 대응)

```tsx
// iOS 노치 대응
<header className="sticky top-0 pt-safe">
<footer className="pb-safe">
```

## 🎯 컴포넌트 규격

### Button (버튼)

```tsx
// 크기
sm: h-9 px-3 text-sm      // 36px 높이
md: h-11 px-4 text-base   // 44px 높이 (권장)
lg: h-12 px-6 text-lg     // 48px 높이

// 최소 터치 영역: 44px
```

### Input (입력 필드)

```tsx
sm: h-9 px-3 text-sm      // 36px 높이
md: h-11 px-4 text-base   // 44px 높이 (권장)
lg: h-12 px-4 text-base   // 48px 높이

// 모바일 키보드 고려: type="tel", inputMode="numeric" 등
```

### Card (카드)

```tsx
// 기본 패딩
<Card className="p-4">    // 16px

// 그림자
className="shadow-sm"     // 미세한 그림자

// 모서리
className="rounded-lg"    // 8px
```

### Modal (모달)

```tsx
// 전체 화면 권장 (모바일에서)
<Modal className="h-full w-full max-w-[640px]">

// 또는 하단 시트
<Modal className="rounded-t-2xl">  // 상단만 둥글게
```

## ✨ 인터랙션

### 터치 피드백

```tsx
// 버튼
active:scale-95 transition-transform

// 카드 (클릭 가능한 경우)
active:bg-muted transition-colors

// 링크
active:text-primary/80
```

### 애니메이션 지속 시간

```css
duration-150  /* 빠름 - 버튼 피드백 */
duration-200  /* 보통 - 일반 전환 */
duration-300  /* 느림 - 모달 등장 */
```

### 스크롤 동작

```tsx
// 부드러운 스크롤
<div className="overflow-y-auto scroll-smooth">

// 스냅 스크롤 (이미지 갤러리 등)
<div className="snap-x snap-mandatory overflow-x-auto">
  <div className="snap-center">
```

## 🖼️ 이미지 가이드

### 비율

```tsx
// 캠핑장 썸네일
aspect - [4 / 3]; // 4:3 비율

// 배너 이미지
aspect - [16 / 9]; // 16:9 비율

// 프로필 이미지
aspect - square; // 1:1 비율
```

### 최적화

- **포맷**: WebP (fallback: JPEG)
- **최대 너비**: 640px (2x: 1280px)
- **용량**: 썸네일 < 100KB, 전체 이미지 < 300KB
- **Next.js Image 사용**: 자동 최적화

```tsx
<Image
  src="/campground.jpg"
  alt="캠핑장 전경"
  width={640}
  height={480}
  className="object-cover"
/>
```

## 🎭 아이콘

### 크기

```tsx
// 작은 아이콘 (인라인)
className = "w-4 h-4"; // 16px

// 일반 아이콘 (버튼)
className = "w-5 h-5"; // 20px

// 큰 아이콘 (강조)
className = "w-6 h-6"; // 24px
```

### 스타일

- **선 두께**: 1.5px (Heroicons outline 기본값)
- **색상**: 텍스트와 동일 (`currentColor`)

```tsx
<svg className="text-muted-foreground h-5 w-5">{/* 아이콘 패스 */}</svg>
```

## 📱 네이티브 UX 패턴

### 헤더

```tsx
// 고정 헤더
<header className="bg-background sticky top-0 z-50 border-b">
  <div className="flex h-14 items-center justify-between px-4">
    <button>뒤로</button>
    <h1>페이지 제목</h1>
    <button>메뉴</button>
  </div>
</header>
```

### 하단 탭 네비게이션

```tsx
<nav className="bg-background fixed right-0 bottom-0 left-0 border-t">
  <div className="mx-auto flex max-w-[640px]">
    <button className="flex-1 py-2">
      <Icon />
      <span className="text-xs">홈</span>
    </button>
    {/* ... */}
  </div>
</nav>
```

### 리스트 아이템

```tsx
<div className="active:bg-muted flex items-center gap-3 p-4">
  <Image className="h-16 w-16 rounded-lg" />
  <div className="min-w-0 flex-1">
    <h3 className="truncate font-semibold">캠핑장 이름</h3>
    <p className="text-muted-foreground text-sm">부가 정보</p>
  </div>
  <ChevronRight className="text-muted-foreground h-5 w-5" />
</div>
```

### Pull-to-Refresh

```tsx
// React Query의 refetch 활용
const { refetch, isRefetching } = useQuery(...)

// 스크롤 최상단에서 당겨서 새로고침
```

## 🚫 금지 사항

1. **640px 초과 너비**: 데스크톱 레이아웃 불필요
2. **작은 터치 영역**: 최소 44x44px 미만 금지
3. **호버 효과**: 모바일에 호버 없음 (`:hover` 사용 금지)
4. **가로 스크롤**: 세로 스크롤만 사용
5. **복잡한 그리드**: 최대 2열까지만

## 📋 체크리스트

새 컴포넌트 만들 때:

- [ ] 최대 너비 640px 제약 적용
- [ ] 터치 영역 최소 44px 확인
- [ ] active 상태 피드백 구현
- [ ] 시맨틱 컬러 사용 (primary, error 등)
- [ ] Tailwind 간격 토큰 사용 (임의 값 금지)
- [ ] 이미지 최적화 (Next.js Image)
- [ ] 텍스트 크기 가독성 확인 (최소 14px)

## 🎨 예제: 전체 페이지 레이아웃

```tsx
export default function CampgroundListPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* 헤더 */}
      <header className="bg-background sticky top-0 z-50 border-b">
        <div className="mx-auto flex h-14 max-w-[640px] items-center justify-between px-4">
          <h1 className="text-xl font-semibold">캠핑장 찾기</h1>
          <button className="flex h-10 w-10 items-center justify-center">
            <SearchIcon className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="mx-auto max-w-[640px] px-4 py-6 pb-20">
        <div className="flex flex-col gap-4">
          {campgrounds.map((camp) => (
            <Card key={camp.id} className="p-4">
              <Image
                src={camp.image}
                alt={camp.name}
                width={608} // 640 - 32 (패딩)
                height={456}
                className="aspect-[4/3] rounded-lg object-cover"
              />
              <h3 className="mt-3 text-xl font-semibold">{camp.name}</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {camp.location}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-primary text-lg font-semibold">
                  {formatKRW(camp.price)}
                </span>
                <Button size="sm">예약하기</Button>
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* 하단 네비게이션 */}
      <nav className="bg-background fixed right-0 bottom-0 left-0 border-t">
        <div className="mx-auto flex max-w-[640px]">
          <TabButton icon={HomeIcon} label="홈" active />
          <TabButton icon={MapIcon} label="지도" />
          <TabButton icon={CalendarIcon} label="예약" />
          <TabButton icon={UserIcon} label="내정보" />
        </div>
      </nav>
    </div>
  );
}
```

---

## 🎯 Best Practices (개발 가이드라인)

### 1. 색상 사용

#### ✅ Do (권장)

```tsx
// 디자인 토큰 사용
<div className="bg-primary text-primary-foreground">
<p className="text-error">에러 메시지</p>
<span className="text-muted-foreground">보조 정보</span>
```

#### ❌ Don't (지양)

```tsx
// 하드코딩된 Tailwind 색상
<div className="bg-green-600 text-white">
<p className="text-red-500">에러 메시지</p>
<span className="text-gray-500">보조 정보</span>
```

**이유**: 디자인 토큰을 사용하면 색상 체계 변경 시 한 곳만 수정하면 되고, 의미가 명확함

---

### 2. 간격/여백

#### ✅ Do (권장)

```tsx
// 디자인 시스템 간격 사용 (4px 배수)
<div className="space-y-4">      {/* 16px - 컴포넌트 간 */}
<section className="py-8">       {/* 32px - 섹션 간 */}
<Card className="p-4">           {/* 16px - 카드 내부 */}
```

#### ❌ Don't (지양)

```tsx
// 임의의 간격 사용
<div className="space-y-5">      {/* 20px - 비표준 */}
<section className="py-7">       {/* 28px - 비표준 */}
<Card className="p-3.5">         {/* 14px - 비표준 */}
```

**이유**: 일관된 간격으로 시각적 리듬 형성, 디자인 통일성 유지

---

### 3. 사용자 피드백

#### ✅ Do (권장)

```tsx
import { useToast } from "@/contexts/ToastContext";

const { showToast } = useToast();

// Toast 사용
showToast("예약이 완료되었습니다", "success");
showToast("결제에 실패했습니다", "error");

// Modal 사용 (중요한 확인)
<Modal open={isOpen} onClose={() => setIsOpen(false)}>
  <p>정말 예약을 취소하시겠습니까?</p>
  <Button onClick={handleConfirm}>확인</Button>
  <Button variant="outline" onClick={handleCancel}>
    취소
  </Button>
</Modal>;
```

#### ❌ Don't (지양)

```tsx
// alert/confirm 사용
alert("예약이 완료되었습니다");
const ok = confirm("정말 예약을 취소하시겠습니까?");
const reason = prompt("취소 사유를 입력하세요");
```

**이유**:

- `alert`/`confirm`은 모바일에서 UX가 나쁨
- 브라우저 네이티브 UI는 커스터마이징 불가
- Toast/Modal은 브랜드 일관성 유지

---

### 4. 터치 영역

#### ✅ Do (권장)

```tsx
// 최소 44px 터치 영역 (Apple HIG 기준)
<Button className="h-11 px-4">     {/* 44px 높이 */}
<Input className="h-11 px-4">      {/* 44px 높이 */}
<Checkbox className="h-5 w-5">     {/* 20px - 부모가 44px */}
```

#### ❌ Don't (지양)

```tsx
// 너무 작은 터치 영역
<Button className="h-8 px-2">      {/* 32px - 작음 */}
<Input className="h-9 px-3">       {/* 36px - 작음 */}
```

**이유**: 터치 오류 방지, 모바일 접근성 향상

---

### 5. 로딩 상태

#### ✅ Do (권장)

```tsx
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

{
  isLoading ? (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner />
    </div>
  ) : (
    <DataList data={data} />
  );
}

// 또는 Skeleton
{
  isLoading ? <Skeleton className="h-32 w-full" /> : <Card>...</Card>;
}
```

#### ❌ Don't (지양)

```tsx
// 로딩 상태 없음
<DataList data={data} />;

// 텍스트만 표시
{
  isLoading && <p>로딩중...</p>;
}
```

**이유**: 사용자에게 명확한 피드백, 인지된 성능 향상

---

### 6. 에러 처리

#### ✅ Do (권장)

```tsx
{
  error && (
    <div className="border-error/20 bg-error/10 rounded-lg border p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="text-error h-5 w-5" />
        <div>
          <p className="text-error font-medium">오류가 발생했습니다</p>
          <p className="text-error/80 mt-1 text-sm">{error.message}</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3"
            onClick={handleRetry}
          >
            다시 시도
          </Button>
        </div>
      </div>
    </div>
  );
}
```

#### ❌ Don't (지양)

```tsx
// 에러 상태 무시
{
  data && <DataList data={data} />;
}

// 콘솔만 출력
console.error(error);
```

**이유**: 사용자에게 문제 상황 명확히 전달, 복구 옵션 제공

---

### 7. 반응형 이미지

#### ✅ Do (권장)

```tsx
import Image from "next/image";

<Image
  src={imageUrl}
  alt="캠핑장 사진"
  width={608}
  height={456}
  className="aspect-[4/3] rounded-lg object-cover"
  loading="lazy"
/>;
```

#### ❌ Don't (지양)

```tsx
// 일반 img 태그
<img src={imageUrl} alt="캠핑장 사진" />

// 고정 크기 없음
<Image src={imageUrl} alt="..." />
```

**이유**: Next.js Image 최적화, CLS 방지, 성능 향상

---

### 8. 접근성

#### ✅ Do (권장)

```tsx
// 시맨틱 HTML
<nav>
  <ul>
    <li><a href="/home">홈</a></li>
  </ul>
</nav>

// aria 속성
<button aria-label="메뉴 열기">
  <MenuIcon />
</button>

// 키보드 접근성
<input type="text" onKeyDown={handleKeyDown} />
```

#### ❌ Don't (지양)

```tsx
// div 남용
<div onClick={handleClick}>클릭</div>

// 의미 없는 alt
<img src="..." alt="image" />

// 키보드 접근 불가
<div onClick={handleClick}>버튼</div>
```

**이유**: 스크린 리더 지원, 키보드 사용자 고려, WCAG 준수

---

### 9. 성능 최적화

#### ✅ Do (권장)

```tsx
// Dynamic import (코드 스플리팅)
const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <LoadingSpinner />,
});

// React Query 캐싱
const { data } = useQuery({
  queryKey: ["campgrounds"],
  queryFn: fetchCampgrounds,
  staleTime: 5 * 60 * 1000, // 5분
});

// 메모이제이션
const expensiveValue = useMemo(() => computeExpensive(data), [data]);
```

#### ❌ Don't (지양)

```tsx
// 모든 것을 한 번에 import
import HeavyComponent from "./HeavyComponent";

// 캐싱 없이 매번 fetch
useEffect(() => {
  fetch("/api/data").then(...);
}, []);

// 불필요한 재계산
const value = computeExpensive(data);  // 매 렌더링마다
```

**이유**: 초기 로딩 속도 향상, 불필요한 네트워크 요청 감소

---

### 10. 일관된 네이밍

#### ✅ Do (권장)

```tsx
// 명확한 함수명 (동사 + 명사)
const handleSubmit = () => {...}
const fetchCampgrounds = async () => {...}
const validateForm = (data) => {...}

// 명확한 변수명
const isLoading = true;
const hasError = false;
const userProfile = {...};
```

#### ❌ Don't (지양)

```tsx
// 모호한 함수명
const submit = () => {...}
const get = async () => {...}
const check = (data) => {...}

// 모호한 변수명
const flag = true;
const data = {...};
const temp = {...};
```

**이유**: 코드 가독성 향상, 유지보수 용이

---

**마지막 업데이트**: 2025-11-11
