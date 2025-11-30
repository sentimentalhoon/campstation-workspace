# Error Boundary 사용 가이드

> CampStation Error Boundary 구현 및 사용법

## 📋 개요

Error Boundary는 React 컴포넌트 트리에서 발생하는 에러를 잡아내어
앱 전체가 크래시되는 것을 방지하는 컴포넌트입니다.

---

## 🎯 구현 내용

### 1. 구성 요소

#### ErrorBoundary 컴포넌트 (`components/errors/ErrorBoundary.tsx`)

- React Error Boundary API 사용
- 에러 발생 시 폴백 UI 표시
- 에러 정보 로깅
- 개발/프로덕션 환경 구분

#### Error Logger (`lib/errors/logger.ts`)

- 에러 로깅 유틸리티
- 경고 및 정보 로깅
- 외부 서비스 연동 준비 (Sentry 등)

---

## 🚀 사용법

### 기본 사용 (전역 적용)

```tsx
// app/layout.tsx
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
```

### 커스텀 폴백 UI

```tsx
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";

function MyPage() {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div className="p-4 text-center">
          <h1>페이지 로딩 실패</h1>
          <p>{error.message}</p>
          <button onClick={reset}>다시 시도</button>
        </div>
      )}
    >
      <MyComponent />
    </ErrorBoundary>
  );
}
```

### 에러 콜백 사용

```tsx
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { logError } from "@/lib/errors/logger";

function MyPage() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        logError(error, {
          location: "MyPage",
          componentStack: errorInfo.componentStack,
        });
      }}
    >
      <MyComponent />
    </ErrorBoundary>
  );
}
```

### 특정 섹션에만 적용

```tsx
function Dashboard() {
  return (
    <div>
      <Header />

      <ErrorBoundary>
        <CriticalSection />
      </ErrorBoundary>

      <Footer />
    </div>
  );
}
```

---

## 🎨 기본 폴백 UI

ErrorBoundary는 기본 폴백 UI를 제공합니다:

### 구성 요소

- 😵 이모지
- "앗, 문제가 발생했어요" 제목
- 안내 메시지
- "다시 시도" 버튼
- "홈으로 이동" 버튼
- 에러 상세 정보 (개발 환경만)

### 동작

- **다시 시도**: 에러 상태 초기화하여 컴포넌트 재렌더링
- **홈으로 이동**: `/` 경로로 네비게이션

---

## 🔧 Error Logger 사용법

### 에러 로깅

```tsx
import { logError } from "@/lib/errors/logger";

try {
  await fetchData();
} catch (error) {
  logError(error, {
    location: "MyComponent.fetchData",
    userId: user?.id,
  });
}
```

### 경고 로깅

```tsx
import { logWarning } from "@/lib/errors/logger";

logWarning("Deprecated API used", {
  location: "MyComponent",
  apiName: "oldApi",
});
```

### 정보 로깅

```tsx
import { logInfo } from "@/lib/errors/logger";

logInfo("User action logged", {
  action: "click",
  target: "submit-button",
});
```

---

## 🌍 환경별 동작

### 개발 환경 (NODE_ENV=development)

**ErrorBoundary**:

- 콘솔에 에러 정보 출력
- 폴백 UI에 에러 상세 정보 표시 (접을 수 있음)

**Logger**:

- console.group으로 그룹화된 로그
- 에러 메시지, 스택, 컨텍스트 모두 출력

### 프로덕션 환경 (NODE_ENV=production)

**ErrorBoundary**:

- 에러 정보만 콘솔에 기록
- 폴백 UI는 사용자 친화적 메시지만 표시

**Logger**:

- 구조화된 JSON 형태로 로그
- 외부 서비스 전송 준비 (TODO: Sentry 연동)

---

## 🚫 Error Boundary 제한사항

Error Boundary가 **잡지 못하는** 에러:

1. **이벤트 핸들러 내부 에러**

   ```tsx
   // ❌ Error Boundary가 잡지 못함
   const handleClick = () => {
     throw new Error("Error in event handler");
   };

   // ✅ try-catch로 처리
   const handleClick = () => {
     try {
       // ...
     } catch (error) {
       logError(error);
     }
   };
   ```

2. **비동기 코드 (setTimeout, Promise 등)**

   ```tsx
   // ❌ Error Boundary가 잡지 못함
   useEffect(() => {
     setTimeout(() => {
       throw new Error("Async error");
     }, 1000);
   }, []);

   // ✅ try-catch로 처리
   useEffect(() => {
     const timer = setTimeout(() => {
       try {
         // ...
       } catch (error) {
         logError(error);
       }
     }, 1000);
     return () => clearTimeout(timer);
   }, []);
   ```

3. **Server Component 에러**
   - Next.js의 Server Component는 별도 error.tsx 사용

4. **Error Boundary 자체 에러**
   - Error Boundary 내부에서 발생한 에러

---

## 📐 적용 전략

### 전역 적용 (필수)

```tsx
// app/layout.tsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### 페이지별 적용 (선택)

```tsx
// app/(pages)/dashboard/page.tsx
<ErrorBoundary
  fallback={(error, reset) => <DashboardError error={error} reset={reset} />}
>
  <Dashboard />
</ErrorBoundary>
```

### 컴포넌트별 적용 (선택)

```tsx
// 중요한 컴포넌트만 보호
<ErrorBoundary>
  <CriticalWidget />
</ErrorBoundary>
```

---

## 🧪 테스트 방법

### 수동 테스트

#### 1. 렌더링 에러 발생

```tsx
// TestErrorComponent.tsx
function TestErrorComponent() {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error("Test error!");
  }

  return <button onClick={() => setShouldError(true)}>Trigger Error</button>;
}

// 사용
<ErrorBoundary>
  <TestErrorComponent />
</ErrorBoundary>;
```

#### 2. 다시 시도 버튼 확인

- 에러 발생 후 "다시 시도" 클릭
- 컴포넌트가 재렌더링되는지 확인

#### 3. 홈으로 이동 버튼 확인

- "홈으로 이동" 클릭
- `/` 경로로 이동하는지 확인

#### 4. 개발/프로덕션 환경 확인

- 개발 환경: 에러 상세 정보 표시
- 프로덕션 빌드: 에러 상세 정보 숨김

---

## 🔍 디버깅

### 콘솔에서 에러 확인

**개발 환경**:

```
🔴 [Error]
  Message: Cannot read property 'x' of undefined
  Stack: Error: ...
  Context: { location: "MyComponent", userId: "123" }
```

**프로덕션 환경**:

```json
{
  "message": "Cannot read property 'x' of undefined",
  "stack": "Error: ...",
  "context": { "location": "MyComponent" },
  "timestamp": "2025-11-11T10:30:00.000Z",
  "userAgent": "Mozilla/5.0 ...",
  "url": "https://example.com/dashboard"
}
```

---

## 🔜 향후 개선 사항

### P1 (우선순위 높음)

- [ ] Sentry 연동
- [ ] 에러 통계 대시보드
- [ ] 사용자별 에러 추적

### P2 (중간 우선순위)

- [ ] 에러별 커스텀 폴백 UI
- [ ] 에러 복구 전략 (자동 재시도)
- [ ] 에러 알림 (관리자 알림)

### P3 (낮은 우선순위)

- [ ] 에러 재현 도구
- [ ] 에러 분석 리포트
- [ ] A/B 테스트 (에러 UI)

---

## 📚 참고 문서

### 내부 문서

- `/docs/technical/UX-IMPROVEMENTS.md` - UX 개선 작업
- `/docs/technical/03-COMPONENT-PATTERNS.md` - 컴포넌트 패턴
- `/docs/technical/01-ARCHITECTURE.md` - 아키텍처

### 외부 문서

- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [Sentry React Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)

---

## 💡 Best Practices

### DO ✅

- 전역 ErrorBoundary는 필수
- 중요한 컴포넌트에는 개별 ErrorBoundary 적용
- 에러 로깅에 충분한 컨텍스트 정보 포함
- 사용자 친화적인 에러 메시지 제공
- 복구 옵션 제공 (다시 시도, 홈으로 이동)

### DON'T ❌

- ErrorBoundary로 모든 에러를 처리하려 하지 말기
- 이벤트 핸들러 에러는 try-catch 사용
- 비동기 에러는 Promise catch 사용
- 에러 메시지에 민감한 정보 포함하지 말기
- ErrorBoundary를 너무 세분화하지 말기

---

## 🎯 완료 체크리스트

- ✅ ErrorBoundary 컴포넌트 구현
- ✅ Error Logger 유틸리티 구현
- ✅ 전역 ErrorBoundary 적용 (app/layout.tsx)
- ✅ 기본 폴백 UI 구현
- ✅ 개발/프로덕션 환경 구분
- ✅ 다시 시도 기능
- ✅ 홈으로 이동 기능
- ✅ 에러 상세 정보 (개발 환경만)
- ✅ JSDoc 문서화
- ✅ 사용 가이드 작성
