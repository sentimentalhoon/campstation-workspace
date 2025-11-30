# UX 개선 작업

> CampStation 사용자 경험 개선 로드맵

## 📋 개요

**작업 기간**: 2025-11-11 ~  
**목표**: MVP 기능 완성 후 사용자 경험 향상을 위한 핵심 개선 작업  
**참고 문서**: `/docs/technical`, `/docs/specifications`

---

## 🎯 개선 작업 우선순위

### 1순위: Toast 알림 시스템 (P0)

**현재 문제**:

- `alert()` 사용으로 브라우저 네이티브 팝업 표시
- UX 일관성 부족
- 모바일에서 사용성 저하

**개선 목표**:

- 비침투적 알림 UI 제공
- 일관된 디자인 시스템 적용
- 자동 사라짐 기능

**작업 범위**:

- `components/ui/Toast.tsx` 생성
- `contexts/ToastContext.tsx` 생성
- `hooks/ui/useToast.ts` 생성
- 7개 페이지 + 1개 hook의 `alert()` 제거

**참고 문서**:

- `/docs/technical/03-COMPONENT-PATTERNS.md` - UI 컴포넌트 패턴
- `/docs/technical/02-CODING-CONVENTIONS.md` - 네이밍 및 JSDoc 규칙
- `/docs/technical/04-API-GUIDE.md` - ApiError 패턴 통합

---

### 2순위: 에러 바운더리 (P0)

**현재 문제**:

- 예상치 못한 에러 발생 시 흰 화면
- 사용자에게 복구 옵션 미제공
- 프로덕션 에러 추적 어려움

**개선 목표**:

- React 에러 바운더리로 앱 크래시 방지
- 사용자 친화적 에러 UI 제공
- 에러 로깅 시스템 구축

**작업 범위**:

- `components/errors/ErrorBoundary.tsx` 생성
- 에러 폴백 UI 컴포넌트 생성
- 주요 페이지/레이아웃에 적용
- 에러 로깅 유틸리티 추가

**참고 문서**:

- `/docs/technical/03-COMPONENT-PATTERNS.md` - Layout Components
- `/docs/technical/01-ARCHITECTURE.md` - 아키텍처 패턴

---

### 3순위: 보안 강화 (P1)

**현재 상태**:

- 기본 XSS 방지 (React 내장)
- HttpOnly 쿠키 사용 중

**개선 목표**:

- Input Sanitization 강화
- CSP (Content Security Policy) 설정
- CSRF 토큰 검증

**작업 범위**:

- Input 검증 유틸리티
- XSS 방지 헬퍼 함수
- Next.js 보안 헤더 설정

---

### 4순위: 성능 최적화 (P1)

**현재 상태**:

- React Query 기본 캐싱 사용
- Next.js Image 최적화 적용

**개선 목표**:

- 캐싱 전략 최적화
- 이미지 lazy loading
- 번들 사이즈 최적화

**작업 범위**:

- React Query 설정 튜닝
- 이미지 최적화 검증
- 코드 스플리팅 분석

---

## 📝 작업 상세

### Phase 1: Toast 알림 시스템

#### 1.1 Toast UI 컴포넌트 구현

**파일**: `components/ui/Toast.tsx`

**요구사항**:

- 4가지 variant: success, error, warning, info
- 자동 사라짐 (기본 3초)
- 닫기 버튼 제공
- 애니메이션 (슬라이드 인/아웃)
- 모바일 최적화

**코딩 규칙**:

````typescript
// 타입 정의 (Interface 대신 Type 사용)
type ToastProps = {
  variant: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
  onClose: () => void;
};

// JSDoc 작성
/**
 * Toast 알림 컴포넌트
 *
 * @example
 * ```tsx
 * <Toast
 *   variant="success"
 *   message="저장되었습니다"
 *   onClose={() => {}}
 * />
 * ```
 */
````

#### 1.2 Toast Provider 및 Context 구현

**파일**: `contexts/ToastContext.tsx`

**요구사항**:

- 전역 Toast 상태 관리
- 다중 Toast 지원 (최대 3개)
- Queue 관리

**참고**: `/docs/technical/05-STATE-MANAGEMENT.md`

#### 1.3 useToast Hook 구현

**파일**: `hooks/ui/useToast.ts`

**API**:

```typescript
const { toast } = useToast();

toast.success("성공 메시지");
toast.error("에러 메시지");
toast.warning("경고 메시지");
toast.info("정보 메시지");
```

#### 1.4 기존 alert() 제거

**대상 파일** (IMPROVEMENTS.md 참고):

- `app/(pages)/campgrounds/page.tsx`
- `app/(pages)/favorites/page.tsx`
- `app/(pages)/my/page.tsx`
- `app/(pages)/reviews/page.tsx`
- `app/(auth)/login/page.tsx`
- `app/(auth)/signup/page.tsx`
- `app/(auth)/profile/page.tsx`
- `hooks/auth/useAuth.ts`

**변경 예시**:

```typescript
// Before
alert("로그인에 성공했습니다");

// After
toast.success("로그인에 성공했습니다");
```

#### 1.5 ApiError 통합

**ApiError와 함께 사용**:

```typescript
catch (error) {
  if (error instanceof ApiError) {
    toast.error(error.data.message);
  } else {
    toast.error("알 수 없는 오류가 발생했습니다");
  }
}
```

---

### Phase 2: 에러 바운더리

#### 2.1 ErrorBoundary 컴포넌트 구현

**파일**: `components/errors/ErrorBoundary.tsx`

**요구사항**:

- React Error Boundary API 사용
- 에러 정보 로깅
- 개발/프로덕션 환경 구분

**참고**: React 공식 문서 - Error Boundaries

#### 2.2 에러 폴백 UI 구현

**파일**: `components/errors/ErrorFallback.tsx`

**요구사항**:

- 사용자 친화적 메시지
- 복구 옵션 제공 (새로고침, 홈으로 이동)
- 에러 상세 정보 (개발 환경만)

#### 2.3 에러 로깅 시스템

**파일**: `lib/errors/logger.ts`

**요구사항**:

```typescript
/**
 * 에러 로깅
 *
 * @param error - 에러 객체
 * @param context - 추가 컨텍스트 정보
 */
function logError(error: Error, context?: Record<string, any>): void {
  if (process.env.NODE_ENV === "production") {
    // 프로덕션: 외부 서비스 전송 (TODO: Sentry 등)
    console.error("[Error]", error, context);
  } else {
    // 개발: 콘솔 출력
    console.error("[Error]", error, context);
  }
}
```

#### 2.4 적용

**대상**:

- `app/layout.tsx` - 전역 에러 바운더리
- 주요 페이지별 에러 바운더리 (선택적)

---

## 🎯 완료 기준

### Toast 시스템

- ✅ Toast 컴포넌트 구현 완료
- ✅ ToastContext 및 Provider 구현
- ✅ useToast Hook 구현
- ✅ 모든 alert() 제거
- ✅ ApiError와 통합
- ✅ 모바일 최적화 확인

### 에러 바운더리

- ✅ ErrorBoundary 컴포넌트 구현
- ✅ ErrorFallback UI 구현
- ✅ 에러 로깅 시스템 구현
- ✅ 주요 레이아웃에 적용
- ✅ 개발/프로덕션 환경 구분

---

## 📚 참고 문서

### 기술 문서

- `/docs/technical/00-PROJECT-STRUCTURE.md` - 프로젝트 구조
- `/docs/technical/01-ARCHITECTURE.md` - 아키텍처
- `/docs/technical/02-CODING-CONVENTIONS.md` - 코딩 컨벤션
- `/docs/technical/03-COMPONENT-PATTERNS.md` - 컴포넌트 패턴
- `/docs/technical/04-API-GUIDE.md` - API 가이드
- `/docs/technical/05-STATE-MANAGEMENT.md` - 상태 관리

### 명세 문서

- `/docs/specifications/09-MVP-SCOPE.md` - MVP 범위

---

## 📊 진행 상황

### 2025-11-11

#### Phase 1: Toast 알림 시스템 ✅ 완료

- ✅ Toast UI 컴포넌트 개선 (`components/ui/Toast.tsx`)
- ✅ ToastContext 및 Provider 구현 (`contexts/ToastContext.tsx`)
- ✅ useToast Hook 구현 (`hooks/ui/useToast.ts`)
- ✅ ToastProvider를 `app/layout.tsx`에 적용
- ✅ 기존 alert() 제거
  - `components/hoc/withOwnerAuth.tsx`
  - `components/hoc/withAdminAuth.tsx`
  - `lib/utils/excel.ts` (console.warn으로 변경)
- ✅ TOAST-GUIDE.md 문서 작성

**구현 내용**:

- 4가지 variant 지원: success, error, warning, info
- 최대 3개까지 동시 표시
- 자동 사라짐 (기본 3초)
- 수동 닫기 버튼
- 슬라이드 애니메이션
- 모바일 최적화 (max-width: 640px)

#### Phase 2: 에러 바운더리 ✅ 완료

- ✅ ErrorBoundary 컴포넌트 구현 (`components/errors/ErrorBoundary.tsx`)
- ✅ Error Logger 유틸리티 구현 (`lib/errors/logger.ts`)
- ✅ ErrorBoundary를 `app/layout.tsx`에 전역 적용
- ✅ 사용자 친화적 폴백 UI 구현
  - 😵 이모지
  - "앗, 문제가 발생했어요" 메시지
  - "다시 시도" 버튼
  - "홈으로 이동" 버튼
  - 에러 상세 정보 (개발 환경만)
- ✅ 개발/프로덕션 환경 구분
- ✅ ERROR-BOUNDARY-GUIDE.md 문서 작성

**구현 내용**:

- React Error Boundary API 사용
- 에러 로깅 시스템 (logError, logWarning, logInfo)
- 외부 서비스 연동 준비 (Sentry 등)
- 커스텀 폴백 UI 지원
- 에러 콜백 지원

---

## 🔧 제외 항목

### CI/CD

- 클라우드 서비스 미사용으로 제외
- 로컬/자체 서버 배포 방식 유지

### 외부 서비스

- Sentry (에러 추적): 추후 필요시 추가
- Analytics: MVP 범위 외
