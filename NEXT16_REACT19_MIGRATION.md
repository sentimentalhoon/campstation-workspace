# 🚀 Next.js 16 & React 19 마이그레이션 계획

> **업데이트**: 2025-11-06  
> **현재 버전**: Next.js 16.0.1 + React 19.2.0 + React Compiler  
> **목표**: 최신 기능 활용으로 성능 향상 및 현대적 패턴 적용

---

## ✅ 완료된 작업

### Phase 0: 기본 업그레이드 (완료)

- ✅ Next.js 15.5.4 → 16.0.1 업그레이드
- ✅ React 19.1.0 → 19.2.0 업그레이드
- ✅ React Compiler 설정 (`reactCompiler: true`)
- ✅ Turbopack 기본 활성화
- ✅ TypeScript JSX 런타임 자동 설정 (`jsx: "react-jsx"`)
- ✅ 불필요한 React 임포트 제거 (codemod 적용)

### Phase 1: key={index} 안티패턴 수정 (완료)

- ✅ 14개 파일의 key={index} 문제 수정
- ✅ 안정적인 key 사용 (id, url, date 등)

### Phase 2: Async Request APIs 마이그레이션 (완료)

- ✅ 모든 Dynamic Route params → `Promise<T>` 타입 변경
- ✅ 5개 파일 마이그레이션 완료
- ✅ 빌드 성공 검증 완료

---

## 🎯 마이그레이션 필요 항목

### Phase 2: Async Request APIs 마이그레이션 (완료 ✅)

#### 2.1 모든 파일 완료

- ✅ `campgrounds/[id]/page.tsx` - async params 적용됨
- ✅ `campgrounds/[id]/sites/page.tsx` - async params 적용됨
- ✅ `campgrounds/[id]/edit/page.tsx` - async params 적용됨
- ✅ `campgrounds/[id]/sites/[siteId]/pricing/page.tsx` - async params 적용됨
- ✅ `reservations/[id]/page.tsx` - async params 적용 완료 (2025-11-06)

#### 2.2 검증 결과

**총 40개 page.tsx 파일 검증 완료**:

- Dynamic Route params 사용: 5개 파일
- 모두 `Promise<T>` 타입으로 마이그레이션 완료
- 빌드 성공 (Next.js 16.0.1 + Turbopack)

**Client Component searchParams (변경 불필요)**

- ✅ `payment/success/page.tsx` - useSearchParams() 사용 (Client Component)
- ✅ `payment/fail/page.tsx` - useSearchParams() 사용 (Client Component)
- ✅ `(auth)/auth/callback/page.tsx` - useSearchParams() 사용 (Client Component)
- ✅ `(auth)/login/page.tsx` - useSearchParams() 사용 (Client Component)

> **결론**: Phase 2 완료! 모든 필수 마이그레이션 완료됨.

---

### Phase 3: Form Actions & Server Actions

#### 3.1 현재 폼 제출 패턴

프로젝트는 **Client-side API 요청** 패턴을 사용 중:

```tsx
// 현재 패턴
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  await apiRequest.post('/api/endpoint', data);
};

<form onSubmit={handleSubmit}>
```

#### 3.2 Server Actions 도입 고려 사항

**현재 아키텍처**:

- ✅ Backend: Spring Boot REST API (별도 서버)
- ✅ Frontend: Next.js Client Components
- ✅ 인증: HttpOnly cookies (백엔드에서 관리)
- ✅ API: `apiRequest` (axios 기반, credentials 포함)

**Server Actions 적용 가능 영역**:

1. **읽기 전용 작업** (Backend 없이 Next.js만 사용):

   - 파일 업로드 전처리
   - 이미지 최적화
   - 로컬 데이터 검증

2. **프록시 역할** (Backend API 호출):
   - Server Component에서 serverApiRequest 사용
   - 토큰 자동 주입
   - 에러 처리 중앙화

**현재 상태**:

- ❌ Server Actions 미사용 (`'use server'` 검색 결과 없음)
- ✅ serverApiRequest 패턴 사용 중 (Server Component에서 직접 호출)

#### 3.3 마이그레이션 제안

**우선순위 낮음** - 현재 아키텍처가 잘 작동 중:

```tsx
// 현재 패턴 (유지 권장)
// Client Component
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  await apiRequest.post("/api/campgrounds", formData);
};

// Server Component
const campground = await serverApiRequest<Campground>(`/api/campgrounds/${id}`);
```

**선택적 도입 (향후)**:

```tsx
// Server Action (파일 업로드 전처리 예시)
"use server";
export async function optimizeImage(formData: FormData) {
  const file = formData.get("image") as File;
  // 이미지 압축, 리사이징 등
  return optimizedFile;
}
```

---

### Phase 4: React 19 Hooks 활용

#### 4.1 use() Hook 적용 가능 영역

**Promise 읽기 패턴**:

```tsx
// 현재: Server Component에서 await
export default async function Page() {
  const data = await fetchData();
  return <Component data={data} />;
}

// 향후: use() Hook으로 Promise 전달
export default function Page() {
  const dataPromise = fetchData();
  return (
    <Suspense fallback={<Loading />}>
      <Component dataPromise={dataPromise} />
    </Suspense>
  );
}

function Component({ dataPromise }) {
  const data = use(dataPromise);
  return <div>{data}</div>;
}
```

**적용 후보**:

- ⏳ `CampgroundDetailPage` - 캠핑장 상세 데이터 로딩
- ⏳ `ReservationDetail` - 예약 상세 데이터 로딩
- ⏳ `SiteManagementClient` - 사이트 목록 로딩

#### 4.2 useOptimistic() 적용 가능 영역

**좋아요/북마크 기능**:

```tsx
// 현재: 서버 응답 대기 후 업데이트
const handleLike = async () => {
  await apiRequest.post(`/api/reviews/${id}/like`);
  mutate(); // SWR revalidate
};

// 향후: 낙관적 업데이트
const [optimisticLikes, addOptimisticLike] = useOptimistic(
  likes,
  (state, delta) => state + delta
);

const handleLike = async () => {
  addOptimisticLike(1); // 즉시 UI 업데이트
  await apiRequest.post(`/api/reviews/${id}/like`);
};
```

**적용 후보**:

- ⏳ 리뷰 좋아요/싫어요 버튼 (기능 미구현)
- ⏳ 리뷰 작성 (작성 중 상태 표시)
- ⏳ 예약 상태 변경 (취소, 확정 등)

**✅ 적용 완료**:

- ✅ FavoritesTab - 즐겨찾기 해제 (2025-11-06)
- ✅ CampgroundCard - 찜하기 토글 (2025-11-06)

#### 4.3 useFormStatus() & useFormState()

**현재 상태**:

```tsx
// 로딩 상태 수동 관리
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  try {
    await apiRequest.post("/api/endpoint", data);
  } finally {
    setIsLoading(false);
  }
};
```

**Server Actions 도입 시 적용 가능**:

```tsx
// useFormStatus로 자동 관리
function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? "처리 중..." : "제출"}</button>;
}
```

---

### Phase 5: View Transitions API

#### 5.1 페이지 전환 애니메이션

**적용 후보**:

- ⏳ 캠핑장 목록 → 상세 페이지
- ⏳ 예약 목록 → 예약 상세
- ⏳ 로그인 → 대시보드
- ⏳ 검색 결과 → 상세 페이지

**구현 예시**:

```tsx
"use client";
import { useRouter } from "next/navigation";
import { startTransition } from "react";

function CampgroundCard({ id }) {
  const router = useRouter();

  const handleClick = () => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        startTransition(() => {
          router.push(`/campgrounds/${id}`);
        });
      });
    } else {
      router.push(`/campgrounds/${id}`);
    }
  };

  return <button onClick={handleClick}>상세 보기</button>;
}
```

---

## 📋 상세 마이그레이션 체크리스트

### ✅ Phase 2: Async Request APIs (완료)

#### 모든 파일 마이그레이션 완료 (2025-11-06)

**마이그레이션된 파일**:

- ✅ `campgrounds/[id]/page.tsx`
- ✅ `campgrounds/[id]/sites/page.tsx`
- ✅ `campgrounds/[id]/edit/page.tsx`
- ✅ `campgrounds/[id]/sites/[siteId]/pricing/page.tsx`
- ✅ `reservations/[id]/page.tsx`

**검증 결과**:

- 총 40개 page.tsx 파일 검사
- Dynamic Route params 사용: 5개
- 모두 `Promise<T>` 타입으로 변경 완료
- 빌드 성공 (Turbopack + TypeScript)

---

### ⏳ Phase 3: useOptimistic() 적용 (UX 향상)

#### 3.1 리뷰 좋아요 기능

- [ ] ReviewCard 컴포넌트 찾기
- [ ] useOptimistic Hook 적용
- [ ] 즉시 피드백 UI 구현
- [ ] 서버 에러 시 롤백 처리

#### 3.2 북마크/즐겨찾기

- [ ] 북마크 버튼 컴포넌트 찾기
- [ ] useOptimistic Hook 적용
- [ ] 아이콘 즉시 변경
- [ ] 서버 동기화

#### 3.3 리뷰 작성

- [ ] ReviewModal 컴포넌트 확인
- [ ] 작성 중 상태 낙관적 표시
- [ ] 제출 후 즉시 목록에 추가
- [ ] 서버 응답 대기 중 "저장 중" 표시

---

### ⏳ Phase 4: use() Hook 적용 (코드 구조 개선)

#### 4.1 캠핑장 상세 페이지

- [ ] `campgrounds/[id]/page.tsx` 분석
- [ ] Promise 전달 패턴으로 변경
- [ ] Suspense 경계 설정
- [ ] 로딩 상태 개선

#### 4.2 예약 상세 페이지

- [ ] `reservations/[id]/page.tsx` 분석
- [ ] use() Hook 적용
- [ ] 에러 바운더리 추가

---

### ⏳ Phase 5: View Transitions (UX 향상)

#### 5.1 주요 네비게이션

- [ ] CampgroundCard 클릭 애니메이션
- [ ] 검색 → 상세 전환
- [ ] 목록 ↔ 상세 전환
- [ ] 로그인 → 대시보드 전환

#### 5.2 CSS 애니메이션

- [ ] globals.css에 View Transition 스타일 추가
- [ ] 커스텀 애니메이션 정의
- [ ] 브라우저 지원 확인

---

## 🎯 우선순위 및 실행 순서

### ✅ 완료된 작업

1. **Phase 2**: 모든 page.tsx의 params Promise 타입 마이그레이션 ✅
   - 소요 시간: 30분
   - 결과: 5개 파일 완료, 빌드 성공

### 🟡 다음 우선순위 (UX 향상)

2. **Phase 4.2**: useOptimistic() - 좋아요/북마크

   - 예상 시간: 2-3시간
   - 영향: 즉각적인 사용자 피드백
   - 적용 후보: 리뷰 좋아요, 캠핑장 북마크

3. **Phase 5**: View Transitions API
   - 예상 시간: 3-4시간
   - 영향: 부드러운 페이지 전환
   - 적용 후보: 캠핑장 목록 → 상세, 예약 목록 → 상세

### 🟢 낮음 (선택적 - 향후)

4. **Phase 4.1**: use() Hook 적용

   - 예상 시간: 4-5시간
   - 영향: 코드 구조 개선, 성능 향상
   - 현재: Server Component의 async/await 패턴이 잘 작동 중

5. **Phase 3**: Server Actions 도입
   - 예상 시간: 6-8시간
   - 영향: 아키텍처 변경
   - 이유: 현재 Client-side API 패턴이 잘 작동 중, Backend 분리 아키텍처 유지 권장

---

## 📊 현재 프로젝트 상태

### 아키텍처

- **Frontend**: Next.js 16.0.1 (App Router)
- **Backend**: Spring Boot (별도 서버)
- **인증**: HttpOnly cookies
- **API 레이어**:
  - Client: `apiRequest` (axios)
  - Server: `serverApiRequest` (fetch with token)

### 컴포넌트 구조

- **Server Components**: 40+ page.tsx 파일
- **Client Components**: 'use client' 명시
- **Patterns**:
  - Client-side 폼 제출 (onSubmit)
  - Server-side 데이터 페칭 (async function)
  - SWR for client-side data fetching

### React Compiler 상태

- ✅ 활성화됨 (`reactCompiler: true`)
- ✅ 자동 메모이제이션 작동 중
- ✅ 수동 useMemo/useCallback 대부분 불필요

---

## 🚦 다음 단계

### ✅ Phase 2 완료 (2025-11-06)

- Async Request APIs 마이그레이션 100% 완료
- 모든 필수 Breaking Changes 적용 완료
- 빌드 검증 성공

### 🎯 Phase 4.2 준비: useOptimistic() 적용

#### 1단계: 리뷰 좋아요 컴포넌트 찾기

```bash
# 좋아요 기능이 있는 컴포넌트 검색
grep -r "like" frontend/src/components/campground-detail/
grep -r "좋아요" frontend/src/components/
```

#### 2단계: useOptimistic() 적용

- ReviewCard 또는 Review 관련 컴포넌트 수정
- 즉시 피드백 UI 구현
- 서버 에러 시 롤백 처리

#### 3단계: 북마크/즐겨찾기 적용

- 북마크 버튼 컴포넌트 찾기
- 동일한 패턴으로 useOptimistic 적용

### 📋 실행 체크리스트

- [ ] 리뷰 좋아요 컴포넌트 파일 위치 확인
- [ ] useOptimistic Hook import 및 구현
- [ ] 낙관적 업데이트 로직 추가
- [ ] 에러 핸들링 및 롤백 구현
- [ ] 빌드 및 테스트
- [ ] 커밋 및 문서 업데이트

---

**마지막 업데이트**: 2025-11-06 15:30  
**작성자**: GitHub Copilot  
**상태**: Phase 2 완료 ✅ / Phase 4.2 준비 중
