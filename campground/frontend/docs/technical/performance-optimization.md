# 성능 최적화 가이드

> Next.js 애플리케이션 성능 최적화 종합 가이드

## 📋 목차

1. [성능 측정](#성능-측정)
2. [번들 크기 최적화](#번들-크기-최적화)
3. [React 성능 최적화](#react-성능-최적화)
4. [이미지 최적화](#이미지-최적화)
5. [네트워크 최적화](#네트워크-최적화)
6. [렌더링 최적화](#렌더링-최적화)
7. [Core Web Vitals](#core-web-vitals)

---

## 📊 성능 측정

### 현재 성능 지표 (Sprint 4)

```
✅ 빌드 시간: 7.9초
✅ First Load JS: 409.49KB
✅ 페이지 수: 19개 (Static: 17, Dynamic: 2)
✅ TypeScript 에러: 0개
```

### 목표 지표

| 메트릭                 | 현재  | 목표    | 상태 |
| ---------------------- | ----- | ------- | ---- |
| 빌드 시간              | 7.9s  | < 10s   | ✅   |
| First Load JS          | 409KB | < 350KB | ⏳   |
| Lighthouse Performance | TBD   | > 90    | ⏳   |
| LCP                    | TBD   | < 2.5s  | ⏳   |
| FID                    | TBD   | < 100ms | ⏳   |
| CLS                    | TBD   | < 0.1   | ⏳   |

### 측정 도구

```bash
# 1. Next.js 번들 분석
npm run build
npm run analyze

# 2. Lighthouse (Chrome DevTools)
# F12 → Lighthouse → Generate Report

# 3. React DevTools Profiler
# Chrome Extension 설치 후 Profiler 탭

# 4. Network 탭
# Chrome DevTools → Network → Disable cache
```

---

## 📦 번들 크기 최적화

### 1. 번들 분석

```bash
# @next/bundle-analyzer 설치 (이미 설치됨)
npm install -D @next/bundle-analyzer

# 빌드 및 분석
npm run analyze
```

**분석 결과 해석**:

- 큰 패키지 찾기
- 중복 패키지 확인
- Tree-shaking 안 되는 패키지

### 2. Dynamic Import (코드 분할)

```typescript
// ❌ 정적 import - 초기 번들에 포함
import { HeavyComponent } from './HeavyComponent';

export default function Page() {
  return <HeavyComponent />;
}

// ✅ 동적 import - 필요할 때만 로드
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
});

export default function Page() {
  return <HeavyComponent />;
}
```

**적용 대상**:

```typescript
// 모달 컴포넌트
const Modal = dynamic(() => import('@/components/ui/Modal'));

// 차트 라이브러리
const Chart = dynamic(() => import('react-chartjs-2'), {
  ssr: false, // 서버 렌더링 비활성화
});

// 에디터
const Editor = dynamic(() => import('@/components/Editor'), {
  ssr: false,
  loading: () => <p>에디터 로딩 중...</p>,
});

// 지도 (Naver Maps)
const MapComponent = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div>지도 로딩 중...</div>,
});
```

### 3. 라이브러리 최적화

```typescript
// ❌ 전체 라이브러리 import
import _ from "lodash";
import moment from "moment";

// ✅ 필요한 함수만 import
import debounce from "lodash/debounce";
import { format } from "date-fns"; // moment 대신 date-fns 사용

// ✅ Tree-shaking 지원 라이브러리 사용
import { format, addDays } from "date-fns"; // 사용한 함수만 번들에 포함
```

**권장 라이브러리 변경**:
| 기존 | 권장 | 이유 |
|------|------|------|
| Moment.js (232KB) | date-fns (13KB) | 크기 작음, Tree-shaking |
| Lodash (전체) | lodash-es | Tree-shaking 지원 |
| Axios | Fetch API | 브라우저 네이티브 |

### 4. 패키지 크기 확인

```bash
# 패키지별 크기 확인
npx size-limit

# 또는
npm install -D size-limit @size-limit/preset-app
```

```json
// package.json
{
  "size-limit": [
    {
      "path": ".next/static/chunks/*.js",
      "limit": "500 KB"
    }
  ]
}
```

---

## ⚛️ React 성능 최적화

### ⚠️ 중요: React 19 Compiler 사용 중

**우리 프로젝트는 React 19 Compiler를 사용합니다!**

React Compiler가 자동으로 다음을 처리합니다:

- ✅ 컴포넌트 메모이제이션 (`React.memo` 자동 적용)
- ✅ 값 메모이제이션 (`useMemo` 자동 적용)
- ✅ 함수 메모이제이션 (`useCallback` 자동 적용)

**따라서 대부분의 경우 `memo`, `useMemo`, `useCallback`을 수동으로 사용하지 마세요!**

### 1. React Compiler의 자동 최적화 (권장)

```typescript
// ✅ React 19 Compiler가 자동으로 최적화
export function CampgroundCard({ campground }: Props) {
  return <div>{campground.name}</div>;
}
// → Compiler가 필요시 자동으로 memo 적용

// ✅ 복잡한 계산도 자동 최적화
function CampgroundList({ campgrounds, filters }) {
  const filteredCampgrounds = campgrounds.filter(c =>
    c.region === filters.region && c.price <= filters.maxPrice
  );
  // → Compiler가 필요시 자동으로 메모이제이션

  return <>{/* ... */}</>;
}

// ✅ 함수도 자동 최적화
function SearchPage() {
  const handleSearch = (query: string) => {
    searchCampgrounds(query);
  };
  // → Compiler가 필요시 자동으로 메모이제이션

  return <SearchBar onSearch={handleSearch} />;
}
```

### 2. 수동 최적화 (거의 필요 없음)

**성능 문제가 실제로 발생하고, React Compiler가 최적화하지 못하는 경우에만** 수동 사용:

```typescript
// ⚠️ 케이스 1: 매우 복잡한 커스텀 비교 로직이 필요한 경우
export const CampgroundCard = React.memo(
  ({ campground }: Props) => {
    return <div>{campground.name}</div>;
  },
  (prevProps, nextProps) => {
    // 복잡한 커스텀 비교 로직
    return (
      prevProps.campground.id === nextProps.campground.id &&
      prevProps.campground.updatedAt === nextProps.campground.updatedAt
    );
  }
);

// ⚠️ 케이스 2: useEffect 의존성 배열의 함수 안정성이 필요한 경우
function Component() {
  const stableFunction = useCallback(() => {
    // useEffect 의존성에 사용되는 함수
  }, []);

  useEffect(() => {
    stableFunction();
  }, [stableFunction]);
}
```

**원칙**:

1. 먼저 React Compiler에 맡기세요
2. React DevTools Profiler로 성능 문제 확인
3. 실제 문제가 있을 때만 수동 최적화

### 3. 가상화 (Virtualization)

긴 리스트는 가상화로 최적화:

```typescript
// react-window 설치
npm install react-window

// 가상화된 리스트
import { FixedSizeList } from 'react-window';

function CampgroundList({ campgrounds }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <CampgroundCard campground={campgrounds[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={campgrounds.length}
      itemSize={200}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

### 4. 불필요한 리렌더링 방지

React Compiler를 사용하더라도 피해야 할 패턴:

```typescript
// ❌ 객체를 inline으로 생성 (매번 새 참조)
<Component style={{ margin: 10 }} />

// ✅ 객체를 컴포넌트 외부에 선언
const styles = { margin: 10 };
<Component style={styles} />

// ❌ 배열을 매번 생성
<Component items={[1, 2, 3]} />

// ✅ 배열을 컴포넌트 외부에 선언
const items = [1, 2, 3];
<Component items={items} />
```

**참고**: React Compiler가 이런 경우도 최적화할 수 있지만, 명시적으로 외부에 선언하는 것이 더 명확합니다.

---

## 🖼️ 이미지 최적화

### 1. Next.js Image 컴포넌트 사용

```typescript
// ❌ 일반 img 태그
<img src="/campground.jpg" alt="캠핑장" width={500} />

// ✅ Next.js Image 컴포넌트
import Image from 'next/image';

<Image
  src="/campground.jpg"
  alt="캠핑장"
  width={500}
  height={300}
  priority // LCP 이미지인 경우
  placeholder="blur" // 블러 효과
  blurDataURL="data:image/..." // 블러 이미지 데이터
/>
```

**Image 컴포넌트 장점**:

- 자동 WebP 변환
- 지연 로딩 (Lazy loading)
- 자동 크기 최적화
- CLS 방지

### 2. 이미지 크기 최적화

```typescript
// next.config.js
module.exports = {
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/webp"],
    minimumCacheTTL: 60,
  },
};
```

### 3. 외부 이미지 최적화

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ["example.com", "s3.amazonaws.com"],
    // 또는
    remotePatterns: [
      {
        protocol: "https",
        hostname: "example.com",
        port: "",
        pathname: "/images/**",
      },
    ],
  },
};
```

### 4. 이미지 압축

```bash
# 빌드 전 이미지 압축
npm install -D imagemin imagemin-mozjpeg imagemin-optipng

# 또는 온라인 도구
# - TinyPNG (https://tinypng.com)
# - Squoosh (https://squoosh.app)
```

---

## 🌐 네트워크 최적화

### 1. React Query 캐싱 전략

```typescript
// hooks/useCampgrounds.ts
export const useCampgrounds = (params: SearchParams) => {
  return useQuery({
    queryKey: ["campgrounds", params],
    queryFn: () => campgroundApi.getList(params),

    // 캐싱 전략
    staleTime: 10 * 60 * 1000, // 10분 - 데이터가 신선한 시간
    gcTime: 15 * 60 * 1000, // 15분 - 캐시 유지 시간

    // 불필요한 refetch 방지
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
};
```

**캐싱 전략 가이드**:
| 데이터 유형 | staleTime | gcTime | refetchOnWindowFocus |
|------------|-----------|--------|---------------------|
| 캠핑장 목록 | 10분 | 15분 | false |
| 캠핑장 상세 | 5분 | 10분 | false |
| 찜 목록 | 2분 | 5분 | true |
| 예약 목록 | 1분 | 5분 | true |
| 사용자 정보 | 30분 | 1시간 | false |

자세한 내용은 [캐싱 전략 문서](./caching-strategy.md) 참조

### 2. API 요청 최적화

```typescript
// ❌ N+1 문제
campgrounds.forEach(async (c) => {
  const reviews = await getReviews(c.id);
});

// ✅ 배치 요청
const campgroundIds = campgrounds.map((c) => c.id);
const allReviews = await getReviewsBatch(campgroundIds);

// ✅ 서버에서 Join
const campgroundsWithReviews = await getCampgroundsWithReviews();
```

### 3. Prefetching

```typescript
// 링크 호버 시 데이터 미리 로드
import { useQueryClient } from '@tanstack/react-query';

function CampgroundCard({ campground }) {
  const queryClient = useQueryClient();

  const handleMouseEnter = () => {
    queryClient.prefetchQuery({
      queryKey: ['campgrounds', campground.id],
      queryFn: () => campgroundApi.getById(campground.id),
    });
  };

  return (
    <Link href={`/campgrounds/${campground.id}`} onMouseEnter={handleMouseEnter}>
      {/* ... */}
    </Link>
  );
}
```

### 4. 요청 병합 (Deduplication)

React Query는 자동으로 중복 요청을 병합합니다:

```typescript
// 여러 컴포넌트에서 동일한 데이터 요청 시
// 실제로는 1번만 요청됨
function Component1() {
  const { data } = useCampground(1);
}

function Component2() {
  const { data } = useCampground(1); // 중복 요청 안됨
}
```

---

## 🎨 렌더링 최적화

### 1. Server Components (Next.js 14+)

```typescript
// app/campgrounds/page.tsx
// 기본적으로 Server Component

export default async function CampgroundsPage() {
  // 서버에서 데이터 가져오기
  const campgrounds = await getCampgrounds();

  return (
    <div>
      <h1>캠핑장 목록</h1>
      {campgrounds.map(c => (
        <CampgroundCard key={c.id} campground={c} />
      ))}
    </div>
  );
}
```

### 2. Client Components 최소화

```typescript
// ❌ 전체를 Client Component로
'use client';

export default function Page() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <StaticContent /> {/* 불필요하게 클라이언트에서 렌더링 */}
      <Counter count={count} setCount={setCount} />
    </div>
  );
}

// ✅ 필요한 부분만 Client Component로
export default function Page() {
  return (
    <div>
      <StaticContent /> {/* Server Component */}
      <CounterClient /> {/* Client Component */}
    </div>
  );
}

// components/CounterClient.tsx
'use client';
export function CounterClient() {
  const [count, setCount] = useState(0);
  return <Counter count={count} setCount={setCount} />;
}
```

### 3. Streaming & Suspense

```typescript
// app/campgrounds/page.tsx
import { Suspense } from 'react';

export default function Page() {
  return (
    <div>
      <h1>캠핑장 목록</h1>

      {/* 빠른 콘텐츠 먼저 표시 */}
      <QuickContent />

      {/* 느린 콘텐츠는 Suspense로 */}
      <Suspense fallback={<LoadingSpinner />}>
        <SlowContent />
      </Suspense>
    </div>
  );
}

async function SlowContent() {
  const data = await fetchSlowData();
  return <div>{data}</div>;
}
```

### 4. CSS-in-JS 최적화

Tailwind CSS는 이미 최적화되어 있지만:

```typescript
// ❌ 동적 className (런타임 계산)
<div className={`text-${color}-500`} />

// ✅ 정적 className (빌드 타임 최적화)
<div className={color === 'blue' ? 'text-blue-500' : 'text-red-500'} />

// ✅ cn() 유틸리티 사용
<div className={cn('base-class', isActive && 'active-class')} />
```

---

## 📈 Core Web Vitals 최적화

### LCP (Largest Contentful Paint) < 2.5s

**최적화 방법**:

```typescript
// 1. 중요 이미지에 priority 속성
<Image
  src="/hero.jpg"
  alt="Hero"
  priority // LCP 이미지
  width={1200}
  height={600}
/>

// 2. 폰트 최적화
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // FOIT 방지
  preload: true,
});

// 3. 중요 CSS 인라인
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
  },
};
```

### FID (First Input Delay) < 100ms

**최적화 방법**:

```typescript
// 1. 긴 작업 분할
// ❌ 긴 동기 작업
data.forEach((item) => {
  processItem(item); // 블로킹
});

// ✅ 작업 분할
async function processItems(data) {
  for (let i = 0; i < data.length; i++) {
    processItem(data[i]);

    // 100개마다 브라우저에 제어권 넘김
    if (i % 100 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
}

// 2. Web Worker 사용
// worker.ts
self.addEventListener("message", (e) => {
  const result = heavyComputation(e.data);
  self.postMessage(result);
});

// 컴포넌트
const worker = new Worker("/worker.js");
worker.postMessage(data);
worker.onmessage = (e) => {
  setResult(e.data);
};
```

### CLS (Cumulative Layout Shift) < 0.1

**최적화 방법**:

```typescript
// 1. 이미지 크기 명시
<Image
  src="/image.jpg"
  alt="Image"
  width={500}  // 반드시 명시
  height={300} // 반드시 명시
/>

// 2. 폰트 로딩 최적화
const inter = Inter({
  display: 'swap',
  preload: true,
  adjustFontFallback: true, // 레이아웃 시프트 최소화
});

// 3. 동적 콘텐츠에 최소 높이 설정
<div className="min-h-[200px]">
  {isLoading ? <LoadingSpinner /> : <Content />}
</div>

// 4. Skeleton UI 사용
<div className="h-32 bg-gray-200 animate-pulse rounded" />
```

---

## 🔍 성능 모니터링

### 1. 실시간 모니터링

```typescript
// lib/performance.ts
export function reportWebVitals(metric: NextWebVitalsMetric) {
  console.log(metric);

  // Analytics로 전송
  if (metric.label === "web-vital") {
    switch (metric.name) {
      case "LCP":
        // LCP 데이터 전송
        break;
      case "FID":
        // FID 데이터 전송
        break;
      case "CLS":
        // CLS 데이터 전송
        break;
    }
  }
}

// app/layout.tsx
export { reportWebVitals } from "@/lib/performance";
```

### 2. 성능 예산 설정

```json
// budget.json
[
  {
    "path": "/_next/static/**/*.js",
    "maxSize": "400kb",
    "resourceType": "script"
  },
  {
    "path": "/_next/static/**/*.css",
    "maxSize": "50kb",
    "resourceType": "stylesheet"
  }
]
```

---

## 📋 체크리스트

### 빌드 전

- [ ] 불필요한 패키지 제거
- [ ] 이미지 압축
- [ ] 폰트 최적화
- [ ] CSS 정리

### 빌드 후

- [ ] 번들 크기 확인 (< 450KB)
- [ ] Lighthouse 점수 확인 (> 90)
- [ ] Core Web Vitals 확인
- [ ] 네트워크 요청 확인

### 배포 전

- [ ] 프로덕션 빌드 테스트
- [ ] 성능 프로파일링
- [ ] 메모리 누수 확인
- [ ] 로딩 시간 측정

---

## 📚 참고 문서

- [Lighthouse 테스트 가이드](./lighthouse-testing-guide.md)
- [캐싱 전략](./caching-strategy.md)
- [Next.js 성능](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web Vitals](https://web.dev/vitals/)
- [React 성능](https://react.dev/learn/render-and-commit)

---

**마지막 업데이트**: 2025-01-27  
**버전**: 1.0.0 (Sprint 4 기준)
