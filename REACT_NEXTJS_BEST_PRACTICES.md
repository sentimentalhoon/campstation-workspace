# React 19 & Next.js 16 최신 모범 사례 (2025)

> **업데이트**: 2025-11-06 (Next.js 16.0.1 + React 19.2.0)  
> **대상**: Next.js 16+, React 19+, TypeScript, React Compiler  
> **목표**: 성능 최적화, 자동 메모이제이션, 현대적 패턴 적용

---

## 🎯 Next.js 16 & React 19 주요 변경사항

### ✨ React Compiler (자동 메모이제이션)

- **React Compiler 활성화**: `reactCompiler: true` 설정으로 자동 최적화
- **수동 최적화 감소**: `useMemo`, `useCallback` 대부분 불필요
- **컴포넌트 자동 메모**: React.memo 자동 적용
- **여전히 필요한 것**: 올바른 key 사용, 적절한 상태 구조

### 🔄 Async Request APIs (필수)

- **params**: `Promise<{ id: string }>` → `await params` 필요
- **searchParams**: `Promise<{ q: string }>` → `await searchParams` 필요
- **cookies()**: `await cookies()` 필수
- **headers()**: `await headers()` 필수
- **draftMode()**: `await draftMode()` 필수

### 🚀 Turbopack 기본 사용

- **개발/프로덕션**: 모두 Turbopack 기본 활성화
- **빌드 속도**: Webpack 대비 5-10배 빠름
- **Webpack 사용**: `--webpack` 플래그로 옵트아웃 가능

### 📦 React 19 새 기능

- **use()**: Promise와 Context를 직접 읽기
- **useFormStatus()**: 폼 제출 상태 관리
- **useFormState()**: 서버 액션 상태 관리
- **useOptimistic()**: 낙관적 UI 업데이트

---

## 📌 핵심 원칙

### 1. 상태 관리 원칙

- **상태는 사용하는 곳 가까이에 배치**
- **전역 상태는 최소화** (Context는 변경 빈도가 낮은 것만)
- **독립적인 기능은 상태도 독립적으로**

### 2. 리렌더링 최적화

- **React.memo()로 컴포넌트 메모이제이션**
- **useCallback()으로 함수 안정화**
- **useMemo()로 계산 비용이 큰 값 캐싱**
- **key는 안정적이고 고유한 값 사용** (절대 index 사용 금지)

### 3. 컴포넌트 설계

- **단일 책임 원칙**: 하나의 컴포넌트는 하나의 역할만
- **Props는 최소화**: 필요한 것만 전달
- **Prop Drilling 방지**: 3단계 이상이면 Context/Composition 고려

---

## 🏗️ 올바른 구조

### ❌ 잘못된 패턴: 중앙 집중식 상태

```tsx
// ❌ BAD: 모든 상태가 부모에 집중
export default function EditPage() {
  const [formData, setFormData] = useState({});
  const [images, setImages] = useState([]);
  const [sites, setSites] = useState([]);

  // formData 변경 → 전체 페이지 리렌더링!
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <BasicInfo formData={formData} onChange={handleInputChange} />
      <ImageSection images={images} /> {/* 불필요한 리렌더링! */}
      <SiteSection sites={sites} /> {/* 불필요한 리렌더링! */}
    </>
  );
}
```

**문제점**:

- formData 변경 → 부모 리렌더링 → 모든 자식 리렌더링
- ImageSection, SiteSection은 formData와 무관한데도 리렌더링됨
- 성능 저하, Network 요청 반복

---

### ✅ 올바른 패턴: 상태 격리 + 메모이제이션

```tsx
// ✅ GOOD: 상태를 각 섹션에 격리
export default function EditPage() {
  const [activeTab, setActiveTab] = useState('basic');
  const campgroundId = useParams().id;

  return (
    <CampgroundEditProvider campgroundId={campgroundId}>
      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 각 섹션이 독립적으로 상태 관리 */}
      {activeTab === 'basic' && <BasicInfoSection />}
      {activeTab === 'images' && <ImageSection />}
      {activeTab === 'sites' && <SiteSection />}
    </CampgroundEditProvider>
  );
}

// BasicInfoSection.tsx
const BasicInfoSection = memo(() => {
  // 여기서만 formData 관리
  const [formData, setFormData] = useState({});
  const { campgroundId, handleSave } = useCampgroundEdit();

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <form>
      <input
        value={formData.name}
        onChange={(e) => handleInputChange('name', e.target.value)}
      />
    </form>
  );
});

// ImageSection.tsx
const ImageSection = memo(() => {
  // 여기서만 images 관리
  const [images, setImages] = useState<string[]>([]);

  // BasicInfoSection 리렌더링 → ImageSection 영향 없음!
  return (
    <div className="grid grid-cols-4 gap-4">
      {images.map((url) => (
        <img key={url} src={url} /> {/* key는 url (안정적) */}
      ))}
    </div>
  );
});
```

**장점**:

- BasicInfo 입력 → BasicInfoSection만 리렌더링
- ImageSection, SiteSection은 완전히 독립적
- 각 섹션의 상태가 명확히 분리됨

---

## 🎯 Context 사용 원칙

### Context는 "느린 변경" 데이터만

```tsx
// ✅ GOOD: Context는 전역 설정/인증 등
const CampgroundEditContext = createContext({
  campgroundId: "",
  isSaving: false,
  handleSave: async () => {}, // 전역 저장 액션
});

// ❌ BAD: Context에 자주 변경되는 상태
const CampgroundEditContext = createContext({
  formData: {}, // ❌ 타이핑할 때마다 변경
  setFormData: () => {}, // ❌ 전체 리렌더링 유발
});
```

### Context 분리 전략

```tsx
// 읽기 전용 Context (변경 없음)
const CampgroundDataContext = createContext({
  campgroundId: "",
  initialData: {},
});

// 저장 액션 Context (함수만, 변경 없음)
const CampgroundActionsContext = createContext({
  handleSave: async () => {},
  handleDelete: async () => {},
});
```

---

## 🔑 Key 사용 원칙

### ❌ 절대 금지: index를 key로 사용

```tsx
// ❌ BAD: 리렌더링 시 이미지 재로드
{
  images.map((url, index) => <img key={index} src={url} />);
}
```

**문제**:

- 부모 리렌더링 → 같은 index지만 React는 DOM 재사용
- src는 같아도 컴포넌트가 리마운트되어 이미지 재로드

### ✅ 올바른 방법: 고유하고 안정적인 값

```tsx
// ✅ GOOD: URL을 key로 사용
{
  images.map((url) => <img key={url} src={url} />);
}

// ✅ GOOD: 객체인 경우 ID 사용
{
  items.map((item) => <Item key={item.id} data={item} />);
}
```

---

## 🎨 컴포넌트 메모이제이션

### React.memo() 사용 기준

**사용해야 할 때**:

- ✅ props가 자주 변경되지 않는 컴포넌트
- ✅ 렌더링 비용이 큰 컴포넌트 (복잡한 계산, 큰 리스트)
- ✅ 부모가 자주 리렌더링되는데 자식은 독립적인 경우

```tsx
// ✅ GOOD: ImageSection은 이미지 변경 시에만 리렌더링
const ImageSection = memo(({ images }: { images: string[] }) => {
  return (
    <div>
      {images.map(url => <img key={url} src={url} />)}
    </div>
  );
});

// ✅ GOOD: 커스텀 비교 함수
const BasicInfoSection = memo(
  ({ formData }) => { ... },
  (prevProps, nextProps) => {
    // latitude/longitude만 비교
    return prevProps.formData.latitude === nextProps.formData.latitude &&
           prevProps.formData.longitude === nextProps.formData.longitude;
  }
);
```

**사용하지 말아야 할 때**:

- ❌ props가 매번 변경되는 컴포넌트
- ❌ 렌더링이 매우 가벼운 컴포넌트 (단순 div, span)
- ❌ memo 비교 비용이 렌더링 비용보다 큰 경우

---

## 🪝 Hook 최적화

### useCallback 사용

```tsx
// ✅ GOOD: 함수를 자식에게 전달할 때
const ParentComponent = () => {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    setCount((c) => c + 1);
  }, []); // 의존성 없음 → 함수 재생성 안 됨

  return <MemoizedChild onClick={handleClick} />;
};

// ❌ BAD: useCallback 없이 함수 전달
const handleClick = () => {
  // 매번 새 함수 생성
  setCount((c) => c + 1);
};
```

### useMemo 사용

```tsx
// ✅ GOOD: 계산 비용이 큰 값
const expensiveValue = useMemo(() => {
  return items.filter(
    (item) => item.name.includes(searchTerm) && item.price > minPrice
  );
}, [items, searchTerm, minPrice]);

// ❌ BAD: 단순 계산에 useMemo 사용 (오버헤드)
const simpleValue = useMemo(() => a + b, [a, b]); // 불필요
```

---

## 📦 파일 구조

```
src/
├── app/
│   └── campgrounds/
│       └── [id]/
│           └── edit/
│               ├── page.tsx              # Server Component
│               └── CampgroundEditClient.tsx  # Client Component (최소 상태)
├── components/
│   └── campground-edit/
│       ├── BasicInfoSection.tsx    # 독립 상태 관리
│       ├── ImageSection.tsx        # 독립 상태 관리
│       └── SiteSection.tsx         # 독립 상태 관리
├── contexts/
│   └── CampgroundEditContext.tsx   # 전역 설정만
└── hooks/
    ├── useCampgroundEdit.ts        # Context 소비 hook
    └── useCampgroundData.ts        # 데이터 페칭 hook
```

---

## 🚫 안티패턴 체크리스트

- [ ] `key={index}` 사용 → `key={item.id}` 또는 `key={url}` 사용
- [ ] 부모에서 모든 상태 관리 → 각 섹션에서 상태 격리
- [ ] Context에 자주 변경되는 상태 → 느린 변경 데이터만
- [ ] memo 없이 큰 컴포넌트 전달 → memo 적용
- [ ] 함수를 매번 재생성 → useCallback 사용
- [ ] useEffect 의존성에 객체/배열 → useMemo로 안정화
- [ ] Props Drilling (3단계 이상) → Context/Composition

---

## 🔍 리렌더링 디버깅

### React DevTools Profiler 사용

1. Chrome Extension 설치
2. Profiler 탭 열기
3. 녹화 시작 → 입력 → 녹화 중지
4. **Flame Graph**에서 리렌더링 원인 확인

### 컴포넌트에 로그 추가

```tsx
const BasicInfoSection = memo(() => {
  console.log("BasicInfoSection rendered");

  useEffect(() => {
    console.log("BasicInfoSection mounted");
    return () => console.log("BasicInfoSection unmounted");
  }, []);

  return <div>...</div>;
});
```

---

## 🔥 Next.js 16 & React 19 고급 패턴

### 1️⃣ Async Request APIs 사용법

#### ✅ params와 searchParams (필수 마이그레이션)

```tsx
// ❌ 구식 (Next.js 14)
export default function Page({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { q: string };
}) {
  const id = params.id;
  const query = searchParams.q;
}

// ✅ 현대적 (Next.js 16)
export default async function Page(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const id = params.id;
  const query = searchParams.q;
}
```

#### ✅ cookies()와 headers() 사용

```tsx
// Server Component에서
import { cookies, headers } from "next/headers";

export default async function Page() {
  // ✅ await 필수
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const headersList = await headers();
  const userAgent = headersList.get("user-agent");

  return <div>Token: {token?.value}</div>;
}
```

#### ✅ Server Action에서 cookies 사용

```tsx
"use server";
import { cookies } from "next/headers";

export async function createSession(data: FormData) {
  const cookieStore = await cookies();

  cookieStore.set("session", "value", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}
```

---

### 2️⃣ React 19 use() Hook

#### ✅ Promise 읽기

```tsx
import { use } from "react";

function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  // ✅ use()로 Promise 직접 읽기
  const user = use(userPromise);

  return <div>{user.name}</div>;
}

// 사용
<Suspense fallback={<Skeleton />}>
  <UserProfile userPromise={fetchUser()} />
</Suspense>;
```

#### ✅ Context 읽기 (조건부 가능)

```tsx
import { use } from "react";

function Button() {
  const theme = use(ThemeContext);

  // ✅ 조건부로 사용 가능 (useContext는 불가능)
  if (condition) {
    const auth = use(AuthContext);
  }

  return <button className={theme}>Click</button>;
}
```

---

### 3️⃣ Server Actions와 Form Actions

#### ✅ useFormStatus()로 제출 상태 관리

```tsx
"use client";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending, data, method } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? "저장 중..." : "저장"}
    </button>
  );
}
```

#### ✅ useFormState()로 서버 액션 상태 관리

```tsx
"use client";
import { useFormState } from "react-dom";
import { createCampground } from "./actions";

function CampgroundForm() {
  const [state, formAction] = useFormState(createCampground, { message: "" });

  return (
    <form action={formAction}>
      <input name="name" required />
      {state.message && <p>{state.message}</p>}
      <SubmitButton />
    </form>
  );
}
```

#### ✅ Server Action 작성

```tsx
"use server";

export async function createCampground(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;

  try {
    await db.campgrounds.create({ name });
    return { message: "캠핑장이 생성되었습니다." };
  } catch (error) {
    return { message: "오류가 발생했습니다." };
  }
}
```

---

### 4️⃣ useOptimistic()로 낙관적 UI

#### ✅ 즉시 피드백 UI

```tsx
"use client";
import { useOptimistic } from "react";

function LikeButton({ reviewId, initialLikes }: Props) {
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    initialLikes,
    (state, newLike: number) => state + newLike
  );

  async function handleLike() {
    // ✅ 즉시 UI 업데이트
    addOptimisticLike(1);

    // 서버 요청
    await likeReview(reviewId);
  }

  return <button onClick={handleLike}>좋아요 {optimisticLikes}</button>;
}
```

#### ✅ 낙관적 상태와 폼 결합

```tsx
"use client";
import { useOptimistic } from "react";
import { addReview } from "./actions";

function Reviews({ reviews }: { reviews: Review[] }) {
  const [optimisticReviews, addOptimisticReview] = useOptimistic(
    reviews,
    (state, newReview: Review) => [...state, { ...newReview, pending: true }]
  );

  async function formAction(formData: FormData) {
    const newReview = {
      id: Date.now(),
      content: formData.get("content") as string,
    };

    // ✅ 즉시 화면에 표시
    addOptimisticReview(newReview);

    // 서버 요청
    await addReview(formData);
  }

  return (
    <>
      <form action={formAction}>
        <textarea name="content" required />
        <button type="submit">리뷰 작성</button>
      </form>

      {optimisticReviews.map((review) => (
        <div key={review.id} className={review.pending ? "opacity-50" : ""}>
          {review.content}
        </div>
      ))}
    </>
  );
}
```

---

### 5️⃣ React Compiler 최적화

#### ✅ 자동 메모이제이션 활용

```tsx
// ✅ React Compiler가 자동으로 메모이제이션
function ExpensiveComponent({ data }: Props) {
  // 수동 useMemo 불필요 - 컴파일러가 자동 처리
  const computed = data.items.reduce((acc, item) => acc + item.price, 0);

  // 수동 useCallback 불필요 - 컴파일러가 자동 처리
  const handleClick = () => {
    console.log(computed);
  };

  return <div onClick={handleClick}>Total: {computed}</div>;
}
```

#### ⚠️ 여전히 필요한 최적화

```tsx
// ✅ key는 여전히 중요 (컴파일러가 해결 못함)
{
  items.map((item) => (
    <Item key={item.id} {...item} /> // ✅ 안정된 key
  ));
}

// ✅ 큰 리스트는 가상화 필요
import { FixedSizeList } from "react-window";

// ✅ 무거운 계산은 웹 워커로
const result = await heavyComputation();
```

---

### 6️⃣ View Transitions API

#### ✅ 부드러운 페이지 전환

```tsx
"use client";
import { useRouter } from "next/navigation";
import { startTransition } from "react";

function Navigation() {
  const router = useRouter();

  function handleNavigate() {
    // ✅ View Transition 사용
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        startTransition(() => {
          router.push("/campgrounds");
        });
      });
    } else {
      router.push("/campgrounds");
    }
  }

  return <button onClick={handleNavigate}>캠핑장 보기</button>;
}
```

#### ✅ CSS로 애니메이션 정의

```css
/* globals.css */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.3s;
}

::view-transition-old(root) {
  animation-name: fade-out;
}

::view-transition-new(root) {
  animation-name: fade-in;
}

@keyframes fade-out {
  to {
    opacity: 0;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
}
```

---

### 7️⃣ 타입스크립트 개선

#### ✅ 자동 JSX 런타임

```tsx
// ❌ 더 이상 필요 없음
import React from "react";

// ✅ React 임포트 불필요 (tsconfig.json의 jsx: "react-jsx")
export default function Component() {
  return <div>Hello</div>;
}
```

#### ✅ 타입 안전한 Server Actions

```tsx
"use server";

// ✅ 타입 정의
type CreateResult =
  | { success: true; id: number }
  | { success: false; error: string };

export async function createCampground(data: FormData): Promise<CreateResult> {
  const name = data.get("name") as string;

  if (!name) {
    return { success: false, error: "이름을 입력하세요." };
  }

  const campground = await db.campgrounds.create({ name });
  return { success: true, id: campground.id };
}
```

---

## 📊 마이그레이션 체크리스트

### Phase 1: 필수 마이그레이션 (Breaking Changes)

- [ ] 모든 `params`를 `Promise<T>` 타입으로 변경
- [ ] 모든 `searchParams`를 `Promise<T>` 타입으로 변경
- [ ] `cookies()` 호출에 `await` 추가
- [ ] `headers()` 호출에 `await` 추가
- [ ] `draftMode()` 호출에 `await` 추가
- [ ] 불필요한 `React` 임포트 제거

### Phase 2: Server Actions 현대화

- [ ] 폼 제출에 `useFormState()` 적용
- [ ] 제출 버튼에 `useFormStatus()` 적용
- [ ] Server Actions에 타입 안전성 추가
- [ ] 에러 처리 개선

### Phase 3: 낙관적 UI 추가

- [ ] 좋아요/북마크에 `useOptimistic()` 적용
- [ ] 리뷰 작성에 즉시 피드백 추가
- [ ] 예약 생성에 낙관적 업데이트 적용

### Phase 4: 고급 최적화

- [ ] View Transitions API 적용
- [ ] `use()` Hook으로 Promise 처리
- [ ] React Compiler 최적화 검증
- [ ] 웹 워커로 무거운 계산 이동

---

## 🔍 참고 자료

- [Next.js 16 공식 문서](https://nextjs.org/docs)
- [React 19 릴리즈 노트](https://react.dev/blog/2024/12/05/react-19)
- [React Compiler 문서](https://react.dev/learn/react-compiler)
- [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)

---

**마지막 업데이트**: 2025-11-06  
**프로젝트**: CampStation  
**버전**: Next.js 16.0.1 + React 19.2.0

```

---

## 📚 참고 자료

- [React 공식 문서 - Performance](https://react.dev/reference/react/memo)
- [Next.js 15 문서](https://nextjs.org/docs)
- [React Performance Optimization](https://kentcdodds.com/blog/usememo-and-usecallback)
- [React Re-rendering Guide](https://www.developerway.com/posts/react-re-renders-guide)

---

## 🎯 요약

**기억해야 할 3가지**:

1. **상태는 격리**: 각 섹션이 자신의 상태만 관리
2. **memo 적극 사용**: 독립적인 컴포넌트는 memo로 감싸기
3. **key는 안정적으로**: 절대 index 사용 금지, 고유 ID 사용

이 원칙을 따르면:

- ✅ 불필요한 리렌더링 제거
- ✅ 이미지/리소스 재로드 방지
- ✅ API 중복 호출 방지
- ✅ 부드러운 사용자 경험
```
