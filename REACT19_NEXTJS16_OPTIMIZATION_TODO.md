# React 19 & Next.js 16 최적화 TODO 리스트

> **프로젝트**: CampStation Frontend  
> **생성일**: 2025-11-06  
> **현재 버전**: Next.js 16.0.1, React 19.2.0  
> **목적**: React 19 & Next.js 16의 최신 기능 및 모범 사례 적용

---

## 📊 분석 요약

### ✅ 완료된 항목

- ✅ Next.js 16.0.1, React 19.2.0 업그레이드
- ✅ React Compiler 활성화
- ✅ Turbopack 빌드 도구 적용
- ✅ `key={index}` 안티패턴 제거 (14개 파일)
- ✅ Async Request APIs 마이그레이션 (5개 동적 라우트)
- ✅ `useOptimistic` Hook 적용 (2개 컴포넌트)
- ✅ `React.FC`, `React.memo`, `forwardRef` 제거 완료

### 🔍 발견된 최적화 대상

총 **6개 카테고리**, **23개 항목**

---

## 🎯 우선순위별 최적화 작업

## 1️⃣ CRITICAL - 즉시 수정 필요 (4개)

### 🔴 C-1: Template Literal in className (50+ 발생)

**문제**: 동적 className에서 템플릿 리터럴 과다 사용  
**영향**: React Compiler 최적화 방해, 불필요한 문자열 재생성  
**예시**:

```tsx
// ❌ 현재 (안티패턴)
className={`flex items-center gap-3 ${status.bg} p-4`}

// ✅ 최적화
import { cn } from "@/lib/utils";
className={cn("flex items-center gap-3 p-4", status.bg)}
```

**발생 위치**:

- `app/reservations/[id]/ReservationDetail.tsx` (3곳)
- `components/ui/LoadingSpinner.tsx` (2곳)
- `components/reservation/ReservationCard.tsx` (2곳)
- `components/dashboard/**/*.tsx` (10+ 곳)
- `components/campground-detail/**/*.tsx` (5+ 곳)

**작업**:

- [ ] `lib/utils/cn.ts` 유틸리티 함수 생성
- [ ] 50+ 파일에서 템플릿 리터럴을 `cn()` 함수로 교체
- [ ] ESLint 규칙 추가 (`no-template-curly-in-string`)

---

### 🔴 C-2: useEffect/useCallback/useMemo 의존성 배열 최적화 (100+ 발생)

**문제**: 과도한 의존성 배열, 불필요한 재실행  
**영향**: 성능 저하, React Compiler 최적화 효과 감소

**예시**:

```tsx
// ❌ 현재
useEffect(() => {
  loadReservations();
}, [mode, statusFilter]); // loadReservations가 의존성에 없음

// ✅ 최적화
useEffect(() => {
  if (mode === "admin") {
    loadReservations();
  }
}, [mode, statusFilter, loadReservations]);
```

**발생 위치**:

- `hooks/useAutoLogout.ts` (10+ useEffect)
- `hooks/reservation/*.ts` (5+ useCallback)
- `components/reservation/ReservationList.tsx` (5+ useEffect)
- `components/map/CampgroundMap.tsx` (3+ useEffect)

**작업**:

- [ ] `useAutoLogout.ts` 의존성 배열 수정 (10개)
- [ ] `useReservationPrice.ts` 의존성 최적화 (3개)
- [ ] `ReservationList.tsx` 의존성 정리 (5개)
- [ ] ESLint `react-hooks/exhaustive-deps` 경고 해결

---

### 🔴 C-3: Server Component에서 불필요한 "use client" (20+ 발생)

**문제**: Server Component로 구현 가능한데 Client Component로 작성됨  
**영향**: 번들 크기 증가, 초기 로딩 속도 저하

**예시**:

```tsx
// ❌ 현재
"use client";
export default function StaticContent() {
  return <div>...</div>; // useState, useEffect 없음
}

// ✅ 최적화
export default function StaticContent() {
  return <div>...</div>;
}
```

**발생 위치**:

- `components/dashboard/admin/SectionHeader.tsx`
- `components/dashboard/admin/StatusBadge.tsx`
- `components/common/ImagePlaceholder.tsx`
- `app/campgrounds/[id]/components/QuickStatsGrid.tsx`

**작업**:

- [ ] 20개 파일 분석하여 Server Component 전환 가능 여부 확인
- [ ] 상태/이벤트 핸들러 없는 컴포넌트 "use client" 제거
- [ ] 하위 컴포넌트만 Client Component로 분리

---

### 🔴 C-4: Image 컴포넌트 최적화 (30+ 발생)

**문제**: `priority`, `loading`, `sizes` 속성 누락  
**영향**: LCP(Largest Contentful Paint) 저하

**예시**:

```tsx
// ❌ 현재
<Image src={image} alt="campground" fill />

// ✅ 최적화
<Image
  src={image}
  alt="campground"
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
  priority={index === 0}
  loading={index > 2 ? "lazy" : "eager"}
/>
```

**발생 위치**:

- `components/ui/ImageGallery.tsx`
- `components/campgrounds/CampgroundCard.tsx`
- `components/home/sections/FeaturedCampgroundSection.tsx`

**작업**:

- [ ] 모든 `<Image>` 컴포넌트에 `sizes` 속성 추가
- [ ] 첫 3개 이미지에 `priority={true}` 설정
- [ ] 나머지 이미지는 `loading="lazy"`

---

## 2️⃣ HIGH - 중요 최적화 (7개)

### 🟠 H-1: useState 초기값 최적화 (50+ 발생)

**문제**: 복잡한 계산을 초기값에서 매번 수행  
**영향**: 불필요한 계산, 초기 렌더링 지연

**예시**:

```tsx
// ❌ 현재
const [data, setData] = useState(expensiveCalculation());

// ✅ 최적화 (Lazy initialization)
const [data, setData] = useState(() => expensiveCalculation());
```

**작업**:

- [ ] `useState` 초기값에 함수 전달하도록 수정 (10+ 파일)

---

### 🟠 H-2: useMemo 과다 사용 (30+ 발생)

**문제**: React Compiler가 자동 최적화하는데 수동 `useMemo` 사용  
**영향**: 코드 복잡도 증가, 가독성 저하

**예시**:

```tsx
// ❌ React Compiler 시대에 불필요
const sortedData = useMemo(() => data.sort(), [data]);

// ✅ React Compiler가 자동 최적화
const sortedData = data.sort();
```

**작업**:

- [ ] React Compiler 자동 최적화 가능한 `useMemo` 제거
- [ ] 진짜 무거운 계산만 `useMemo` 유지

---

### 🟠 H-3: fetch 호출 최적화 (20+ 발생)

**문제**: Server Component에서 fetch에 `cache`, `revalidate` 옵션 누락  
**영향**: 불필요한 API 호출, 성능 저하

**예시**:

```tsx
// ❌ 현재
const data = await fetch("/api/campgrounds");

// ✅ 최적화
const data = await fetch("/api/campgrounds", {
  next: { revalidate: 60 }, // 60초 캐싱
});
```

**작업**:

- [ ] Server Component의 모든 fetch에 캐시 전략 추가

---

### 🟠 H-4: useTransition Hook 미적용 (5개 적용 가능)

**문제**: 무거운 상태 업데이트에서 UI 블로킹  
**영향**: 사용자 경험 저하 (버튼 클릭 반응 느림)

**적용 대상**:

- `components/campgrounds/CampgroundsClient.tsx` (필터 적용 시)
- `components/map/MapFilters.tsx` (지도 필터 변경 시)
- `components/dashboard/admin/DataTable.tsx` (정렬 시)

**예시**:

```tsx
// ✅ 추가 필요
const [isPending, startTransition] = useTransition();

const handleFilter = (newFilter) => {
  startTransition(() => {
    setFilter(newFilter); // 무거운 작업
  });
};
```

**작업**:

- [ ] `CampgroundsClient.tsx`에 `useTransition` 적용
- [ ] `MapFilters.tsx`에 `useTransition` 적용
- [ ] `DataTable.tsx` 정렬에 `useTransition` 적용

---

### 🟠 H-5: Server Actions 미적용 (10+ 폼)

**문제**: 클라이언트에서 API 호출, Server Actions로 전환 가능  
**영향**: 네트워크 오버헤드, 보안 취약점

**적용 대상**:

- `app/(auth)/login/page.tsx` (로그인 폼)
- `app/(auth)/register/page.tsx` (회원가입 폼)
- `components/campground-edit/**` (캠핑장 수정 폼)
- `components/dashboard/user/ProfileTab.tsx` (프로필 수정)

**예시**:

```tsx
// ✅ Server Actions 적용
"use server";
export async function loginAction(formData: FormData) {
  const email = formData.get("email");
  // 서버에서 직접 처리
}
```

**작업**:

- [ ] `lib/actions/auth.ts` 생성 (로그인/회원가입)
- [ ] `lib/actions/campground.ts` 생성 (캠핑장 CRUD)
- [ ] 10+ 폼을 Server Actions로 전환

---

### 🟠 H-6: Suspense 경계 추가 (10+ 위치)

**문제**: 비동기 컴포넌트에 Suspense 없음  
**영향**: 로딩 상태 불명확, UX 저하

**적용 대상**:

- `app/campgrounds/page.tsx`
- `app/campgrounds/[id]/page.tsx`
- `app/dashboard/**/*.tsx`

**예시**:

```tsx
// ✅ 추가 필요
<Suspense fallback={<LoadingSpinner />}>
  <CampgroundsClient data={data} />
</Suspense>
```

**작업**:

- [ ] 모든 비동기 Server Component에 Suspense 추가
- [ ] `components/ui/LoadingSpinner.tsx` 재사용

---

### 🟠 H-7: Parallel Data Fetching 미적용 (5+ 페이지)

**문제**: 순차적 데이터 fetch로 로딩 시간 증가  
**영향**: 페이지 로딩 속도 저하

**예시**:

```tsx
// ❌ 현재 (순차적)
const campground = await fetchCampground(id);
const reviews = await fetchReviews(id);

// ✅ 최적화 (병렬)
const [campground, reviews] = await Promise.all([
  fetchCampground(id),
  fetchReviews(id),
]);
```

**작업**:

- [ ] `app/campgrounds/[id]/page.tsx` 병렬 fetch
- [ ] `app/dashboard/owner/page.tsx` 병렬 fetch
- [ ] `app/dashboard/user/page.tsx` 병렬 fetch

---

## 3️⃣ MEDIUM - 개선 권장 (8개)

### 🟡 M-1: Error Boundary 추가 (10+ 위치)

**문제**: 에러 발생 시 전체 앱 크래시  
**영향**: 사용자 경험 저하

**작업**:

- [ ] `app/error.tsx` 개선 (현재 있지만 기본적)
- [ ] 주요 페이지별 Error Boundary 추가

---

### 🟡 M-2: Metadata API 최적화 (20+ 페이지)

**문제**: 동적 metadata 미적용  
**영향**: SEO 최적화 부족

**예시**:

```tsx
// ✅ 추가 필요
export async function generateMetadata({ params }): Promise<Metadata> {
  const campground = await fetchCampground(params.id);
  return {
    title: campground.name,
    description: campground.description,
    openGraph: { ... }
  };
}
```

**작업**:

- [ ] 모든 동적 페이지에 `generateMetadata` 추가

---

### 🟡 M-3: Route Segment Config 미설정

**문제**: 페이지별 캐싱 전략 없음  
**영향**: 성능 최적화 기회 손실

**예시**:

```tsx
// ✅ 추가 필요
export const revalidate = 60; // 60초마다 재검증
export const dynamic = "force-dynamic"; // 항상 동적
```

**작업**:

- [ ] 정적 페이지: `export const revalidate = 3600`
- [ ] 동적 페이지: `export const dynamic = "force-dynamic"`

---

### 🟡 M-4: Loading.tsx 파일 추가 (10+ 라우트)

**문제**: Next.js 로딩 UI 미활용  
**영향**: 로딩 상태 일관성 부족

**작업**:

- [ ] `app/campgrounds/loading.tsx` 생성
- [ ] `app/dashboard/loading.tsx` 생성
- [ ] 주요 라우트별 `loading.tsx` 추가

---

### 🟡 M-5: Type Safety 강화

**문제**: `any` 타입 사용 (10+ 곳)  
**영향**: 타입 안정성 저하

**작업**:

- [ ] `any` 타입을 구체적 타입으로 변경
- [ ] `unknown` 사용 후 타입 가드 추가

---

### 🟡 M-6: Web Vitals 최적화

**문제**: 현재 성능 메트릭 미측정  
**영향**: 성능 저하 조기 감지 불가

**작업**:

- [ ] `app/layout.tsx`에 Web Vitals 리포팅 추가
- [ ] Lighthouse CI 설정 확인

---

### 🟡 M-7: 접근성(A11y) 개선

**문제**: ARIA 속성 누락  
**영향**: 스크린 리더 사용자 경험 저하

**작업**:

- [ ] 모달에 `role="dialog"`, `aria-labelledby` 추가
- [ ] 버튼에 `aria-label` 추가
- [ ] 키보드 네비게이션 테스트

---

### 🟡 M-8: CSS 최적화

**문제**: Tailwind 클래스 중복  
**영향**: 번들 크기 증가

**작업**:

- [ ] `@apply` 디렉티브로 공통 스타일 추출
- [ ] 사용하지 않는 Tailwind 클래스 제거

---

## 4️⃣ LOW - 선택적 최적화 (4개)

### 🟢 L-1: View Transitions API 적용

**문제**: 페이지 전환 애니메이션 없음  
**영향**: 사용자 경험 개선 기회

**작업**:

- [ ] `next.config.ts`에 View Transitions 설정
- [ ] 페이지 전환 CSS 정의

---

### 🟢 L-2: Streaming SSR 활성화

**문제**: 전체 페이지 한 번에 렌더링  
**영향**: 초기 로딩 체감 속도 저하

**작업**:

- [ ] 주요 컴포넌트에 Suspense 추가
- [ ] `loading.tsx`로 스트리밍 활성화

---

### 🟢 L-3: Partial Prerendering (PPR) 적용

**문제**: Next.js 16의 PPR 미사용  
**영향**: 최신 기능 미활용

**작업**:

- [ ] `next.config.ts`에 `ppr: "incremental"` 설정
- [ ] 적합한 페이지 선정 후 적용

---

### 🟢 L-4: React Server Components 최대 활용

**문제**: Client Component 비율 높음 (~60%)  
**영향**: 번들 크기 증가

**작업**:

- [ ] Client Component 분석 후 Server Component 전환
- [ ] 상태 관리 최소화

---

## 📈 최적화 실행 계획

### Phase 1: Critical 수정 (1주)

1. Template Literal → `cn()` 함수 (2일)
2. useEffect/useCallback 의존성 배열 (2일)
3. Server Component 전환 (1일)
4. Image 최적화 (2일)

### Phase 2: High 개선 (1주)

5. useState lazy initialization (1일)
6. useMemo 제거 (1일)
7. fetch 캐싱 전략 (1일)
8. useTransition 적용 (1일)
9. Server Actions 전환 (2일)
10. Suspense 경계 추가 (1일)

### Phase 3: Medium 개선 (1주)

11. Error Boundary (1일)
12. Metadata API (2일)
13. Route Segment Config (1일)
14. Loading.tsx (1일)
15. Type Safety (2일)

### Phase 4: Low 최적화 (선택적)

16. View Transitions API
17. Streaming SSR
18. Partial Prerendering
19. Server Component 비율 증가

---

## 🎯 예상 성능 개선

- **번들 크기**: -30% (Server Component 전환)
- **LCP**: -40% (Image 최적화 + Suspense)
- **FID**: -50% (useTransition + useOptimistic)
- **CLS**: 0.1 이하 유지
- **Lighthouse 점수**: 90+ → 98+

---

## 📝 체크리스트

### Critical (4/4)

- [x] C-1: Template Literal → cn() (7/50 완료 - 진행중)
  - ✅ cn() 유틸리티 함수 생성 (clsx + tailwind-merge)
  - ✅ LoadingSpinner, NavigationButton, ImageGallery 최적화
  - ✅ ReservationDetail (3개), ReservationCard (2개) 최적화
  - ✅ Commit: "refactor: Replace template literals with cn() utility function"
  - ⏳ 43개 컴포넌트 남음 (Dashboard, Maps, Layout 등)
- [ ] C-2: useEffect 의존성 최적화
- [ ] C-3: Server Component 전환
- [ ] C-4: Image 최적화

### High (7/7)

- [ ] H-1: useState lazy init
- [ ] H-2: useMemo 제거
- [ ] H-3: fetch 캐싱
- [ ] H-4: useTransition 적용
- [ ] H-5: Server Actions
- [ ] H-6: Suspense 추가
- [ ] H-7: Parallel Fetching

### Medium (8/8)

- [ ] M-1: Error Boundary
- [ ] M-2: Metadata API
- [ ] M-3: Route Segment Config
- [ ] M-4: Loading.tsx
- [ ] M-5: Type Safety
- [ ] M-6: Web Vitals
- [ ] M-7: 접근성
- [ ] M-8: CSS 최적화

### Low (4/4)

- [ ] L-1: View Transitions
- [ ] L-2: Streaming SSR
- [ ] L-3: Partial Prerendering
- [ ] L-4: RSC 최대 활용

---

## 🔧 도구 및 리소스

### 필수 설치

```bash
npm install clsx tailwind-merge
npm install -D @typescript-eslint/eslint-plugin
```

### 유틸리티 함수 생성

```typescript
// lib/utils/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### ESLint 규칙 추가

```json
{
  "rules": {
    "react-hooks/exhaustive-deps": "error",
    "no-template-curly-in-string": "error",
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

---

**마지막 업데이트**: 2025-11-06  
**다음 리뷰**: Phase 1 완료 후
