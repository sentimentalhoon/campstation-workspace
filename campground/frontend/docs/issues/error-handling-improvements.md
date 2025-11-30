# 에러 핸들링 개선 (Phase 6)

## 📋 개요

예약-결제 시스템의 에러 핸들링을 체계화하여 사용자 경험을 개선하고 시스템 안정성을 향상시켰습니다.

**작업 일자**: 2024
**관련 Phase**: Phase 6 - Error Handling Improvements

## 🎯 목표

1. **재시도 로직**: 일시적 오류에 대한 자동 재시도
2. **에러 분류**: 에러 타입별 적절한 처리
3. **사용자 피드백**: 명확하고 실용적인 에러 메시지
4. **복구 가능성**: 재시도 버튼으로 사용자가 직접 복구 가능

## 🛠️ 구현 내용

### 1. React Query 재시도 전략

```typescript
// hooks/useReservationDetail.ts
retry: (failureCount, error) => {
  if (error instanceof ApiError) {
    // 4xx 클라이언트 에러는 재시도 안함
    if (error.status >= 400 && error.status < 500) {
      return false;
    }
  }
  // 5xx 서버 에러는 최대 2번 재시도
  return failureCount < 2;
},
retryDelay: (attemptIndex) =>
  Math.min(1000 * 2 ** attemptIndex, 30000), // 지수 백오프: 1초 → 2초 → 4초 (최대 30초)
```

**재시도 정책**:

- **4xx 에러**: 재시도 안함 (클라이언트 문제)
- **5xx 에러**: 최대 2번 재시도
- **지수 백오프**: 1초 → 2초 → 4초 (최대 30초 캡)

### 2. 에러 타입별 메시지

#### 예약 생성 에러 (useReservationFlow.ts)

```typescript
import { ApiError } from "@/lib/api/errors";

catch (error) {
  let errorMessage = "예약 생성에 실패했습니다. 다시 시도해주세요.";

  if (error instanceof ApiError) {
    if (error.isValidationError()) {
      // 400: 필드별 상세 에러
      const fieldErrors = error.getAllFieldErrors();
      errorMessage = Object.values(fieldErrors).join("\n");
    } else if (error.status === 409) {
      // 409: 예약 충돌
      errorMessage = "이미 예약된 날짜입니다. 다른 날짜를 선택해주세요.";
    } else if (error.status === 401) {
      // 401: 인증 필요
      errorMessage = "로그인이 필요합니다.";
    } else if (error.status === 403) {
      // 403: 권한 없음
      errorMessage = "예약 권한이 없습니다.";
    } else if (error.isServerError()) {
      // 5xx: 서버 오류
      errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    }
  } else if (error instanceof Error && error.message.includes("network")) {
    // 네트워크 오류
    errorMessage = "네트워크 연결을 확인해주세요.";
  }

  alert(errorMessage);
}
```

**에러 타입 매핑**:
| HTTP 상태 | 에러 타입 | 사용자 메시지 | 재시도 |
|----------|---------|------------|--------|
| 400 | Validation | 필드별 상세 메시지 | ❌ |
| 401 | Unauthorized | "로그인이 필요합니다" | ❌ |
| 403 | Forbidden | "권한이 없습니다" | ❌ |
| 404 | Not Found | "찾을 수 없습니다" | ❌ |
| 409 | Conflict | "이미 예약된 날짜입니다" | ❌ |
| 5xx | Server Error | "서버 오류가 발생했습니다" | ✅ |
| Network | Network Error | "네트워크 연결을 확인해주세요" | ✅ |

### 3. 결제 페이지 에러 UI

```typescript
// app/payment/page.tsx
if (error) {
  let errorMessage = "예약 정보를 불러올 수 없습니다.";
  let showRetry = false;

  if (error instanceof ApiError) {
    if (error.status === 404) {
      errorMessage = "예약을 찾을 수 없습니다.";
    } else if (error.status === 403) {
      errorMessage = "예약 정보에 접근할 권한이 없습니다.";
    } else if (error.isServerError()) {
      errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      showRetry = true; // 5xx 에러는 재시도 버튼 표시
    }
  } else {
    errorMessage = "예약 정보를 불러오는 중 오류가 발생했습니다.";
    showRetry = true;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="space-y-4 text-center">
        <p className="text-neutral-600">{errorMessage}</p>
        <div className="space-x-2">
          {showRetry && (
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
            >
              다시 시도
            </button>
          )}
          <button
            onClick={() => router.push(ROUTES.CAMPGROUNDS.LIST)}
            className="text-primary hover:underline"
          >
            캠핑장 목록으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
```

**UI 개선사항**:

- ✅ 에러 타입별 맞춤 메시지
- ✅ 복구 가능한 에러는 "다시 시도" 버튼 표시
- ✅ "캠핑장 목록으로" 대체 경로 제공
- ✅ 시각적으로 명확한 에러 상태

## 📊 개선 효과

### Before (Phase 5)

```typescript
// 단순 에러 처리
if (error) {
  return <div>에러가 발생했습니다.</div>;
}
```

### After (Phase 6)

```typescript
// 상세 에러 분류 및 복구 옵션
if (error instanceof ApiError) {
  if (error.status === 404) {
    return <NotFound />;
  } else if (error.isServerError()) {
    return <ServerError onRetry={refetch} />;
  }
}
```

**측정 가능한 개선**:

- 🎯 **에러 메시지 명확성**: 일반 메시지 → 상황별 맞춤 메시지
- 🔄 **복구율**: 0% → 자동 재시도 + 수동 재시도 버튼
- 📉 **불필요한 재시도**: 4xx 에러도 재시도 → 5xx만 선택적 재시도
- ⏱️ **응답 시간**: 일정 → 지수 백오프로 서버 부하 감소

## 🧪 테스트 시나리오

### 1. 서버 오류 (5xx)

```
1. 백엔드 서버 중지
2. 예약 페이지 접속
3. 예상: "서버 오류가 발생했습니다" + "다시 시도" 버튼
4. 자동 재시도 2회 후 실패
5. 서버 재시작 후 "다시 시도" 클릭
6. 예상: 정상 로드
```

### 2. 인증 오류 (401)

```
1. 로그아웃 상태에서 예약 시도
2. 예상: "로그인이 필요합니다" 메시지
3. 재시도 안함 (4xx)
4. 로그인 페이지로 리다이렉트
```

### 3. 날짜 충돌 (409)

```
1. 이미 예약된 날짜 선택
2. 예약 생성 시도
3. 예상: "이미 예약된 날짜입니다. 다른 날짜를 선택해주세요"
4. 재시도 안함 (4xx)
5. 날짜 선택 UI로 돌아감
```

### 4. 네트워크 오류

```
1. 네트워크 연결 끊기
2. 결제 페이지 접속
3. 예상: "네트워크 연결을 확인해주세요"
4. 자동 재시도 2회
5. 네트워크 복구 시 자동 로드
```

## 🔧 수정된 파일

### 1. `hooks/useReservationDetail.ts`

- React Query retry 로직 추가
- ApiError 타입 체크
- 지수 백오프 재시도 지연

### 2. `app/reservations/new/hooks/useReservationFlow.ts`

- ApiError import
- 에러 타입별 메시지 분기
- 필드별 validation 에러 처리

### 3. `app/payment/page.tsx`

- ApiError import
- 에러 UI 개선
- 재시도 버튼 조건부 표시
- 대체 경로 제공

### 4. `tsconfig.json`

- 테스트 파일 빌드 제외 설정
- `exclude` 패턴 추가

## 🚀 다음 단계 (Phase 7)

1. **E2E 테스트 작성**:
   - Playwright로 에러 시나리오 자동화
   - 재시도 로직 검증
   - 에러 메시지 표시 확인

2. **모니터링**:
   - 에러 발생률 추적
   - 재시도 성공률 측정
   - 사용자 피드백 수집

3. **추가 개선**:
   - Toast 알림으로 에러 표시
   - 에러 로깅 시스템 구축
   - Sentry 등 에러 추적 도구 통합

## 📚 참고 자료

- [React Query Error Handling](https://tanstack.com/query/latest/docs/react/guides/query-retries)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [Exponential Backoff](https://en.wikipedia.org/wiki/Exponential_backoff)

---

**작성자**: GitHub Copilot  
**최종 수정**: 2024  
**관련 문서**:

- `payment-reservation-workflow.md`
- `payment-verification.md`
- `payment-page-refactoring.md`
