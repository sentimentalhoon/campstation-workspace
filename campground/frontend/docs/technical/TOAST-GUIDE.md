# Toast 알림 시스템 사용 가이드

> CampStation Toast 알림 시스템 구현 및 사용법

## 📋 개요

Toast 알림 시스템은 사용자에게 비침투적으로 메시지를 전달하는 UI 컴포넌트입니다.
브라우저 기본 `alert()` 대신 사용하여 일관된 사용자 경험을 제공합니다.

---

## 🎯 구현 내용

### 1. 구성 요소

#### Toast 컴포넌트 (`components/ui/Toast.tsx`)

- 개별 Toast 알림을 렌더링
- 4가지 variant: success, error, warning, info
- 자동 사라짐 기능 (기본 3초)
- 수동 닫기 버튼 제공
- 슬라이드 애니메이션

#### ToastContext (`contexts/ToastContext.tsx`)

- 전역 Toast 상태 관리
- 최대 3개까지 동시 표시
- Queue 기반 관리

#### useToast Hook (`hooks/ui/useToast.ts`)

- Toast 표시를 위한 커스텀 Hook
- 간단한 API 제공

---

## 🚀 사용법

### 기본 사용

```tsx
"use client";

import { useToast } from "@/hooks/ui/useToast";

function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success("저장되었습니다");
  };

  const handleError = () => {
    toast.error("오류가 발생했습니다");
  };

  const handleWarning = () => {
    toast.warning("주의가 필요합니다");
  };

  const handleInfo = () => {
    toast.info("참고하세요");
  };

  return (
    <div>
      <button onClick={handleSuccess}>성공</button>
      <button onClick={handleError}>에러</button>
      <button onClick={handleWarning}>경고</button>
      <button onClick={handleInfo}>정보</button>
    </div>
  );
}
```

### duration 옵션 사용

```tsx
const toast = useToast();

// 5초 동안 표시
toast.success("저장되었습니다", 5000);

// 1초 동안 표시
toast.info("빠른 알림", 1000);
```

### API 에러 처리와 함께 사용

```tsx
import { useToast } from "@/hooks/ui/useToast";
import { ApiError } from "@/lib/api/errors";

function MyComponent() {
  const toast = useToast();

  const handleSubmit = async () => {
    try {
      await saveData();
      toast.success("저장되었습니다");
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.data.message);
      } else {
        toast.error("알 수 없는 오류가 발생했습니다");
      }
    }
  };
}
```

### React Query와 함께 사용

```tsx
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/ui/useToast";

function MyComponent() {
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: saveData,
    onSuccess: () => {
      toast.success("저장되었습니다");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.data.message);
      } else {
        toast.error("저장에 실패했습니다");
      }
    },
  });
}
```

---

## 🎨 Toast Variants

### success (성공)

- 색상: 초록색
- 아이콘: ✓
- 사용 시기: 작업 성공, 저장 완료, 등록 완료 등

### error (에러)

- 색상: 빨간색
- 아이콘: ✕
- 사용 시기: API 에러, 검증 실패, 작업 실패 등

### warning (경고)

- 색상: 노란색
- 아이콘: ⚠
- 사용 시기: 주의 필요, 확인 요청, 제한 사항 등

### info (정보)

- 색상: 회색
- 아이콘: ℹ
- 사용 시기: 안내, 팁, 상태 변경 알림 등

---

## ⚙️ 설정

### ToastProvider 설정

```tsx
// app/layout.tsx
<ToastProvider maxToasts={3}>{children}</ToastProvider>
```

**옵션**:

- `maxToasts`: 최대 동시 표시 Toast 수 (기본: 3)

---

## 📐 디자인 가이드

### 위치

- 화면 하단 (bottom: 80px - BottomNav 위)
- 모바일 최적화 (max-width: 640px)
- 좌우 padding: 16px

### 애니메이션

- 슬라이드 업 (translateY + opacity)
- 애니메이션 시간: 300ms
- Easing: ease-out

### 스택 동작

- 새 Toast는 기존 Toast 위에 쌓임
- 최대 3개 초과 시 가장 오래된 Toast 자동 제거
- 각 Toast는 8px 간격으로 배치

---

## 🔄 마이그레이션

### Before (alert 사용)

```tsx
const handleSubmit = async () => {
  try {
    await saveData();
    alert("저장되었습니다");
  } catch (error) {
    alert("저장에 실패했습니다");
  }
};
```

### After (Toast 사용)

```tsx
const toast = useToast();

const handleSubmit = async () => {
  try {
    await saveData();
    toast.success("저장되었습니다");
  } catch (error) {
    if (error instanceof ApiError) {
      toast.error(error.data.message);
    } else {
      toast.error("저장에 실패했습니다");
    }
  }
};
```

---

## ✅ 적용 완료 파일

### HOC

- ✅ `components/hoc/withOwnerAuth.tsx` - 권한 에러
- ✅ `components/hoc/withAdminAuth.tsx` - 권한 에러

### 유틸리티

- ✅ `lib/utils/excel.ts` - 데이터 없음 경고 (console.warn으로 변경)

---

## 🧪 테스트 방법

### 수동 테스트

1. **성공 Toast**
   - 로그인 성공 시 확인
   - 찜하기 추가 시 확인

2. **에러 Toast**
   - 잘못된 로그인 정보로 로그인 시도
   - 권한 없는 페이지 접근

3. **자동 사라짐**
   - Toast 표시 후 3초 대기
   - 자동으로 사라지는지 확인

4. **수동 닫기**
   - X 버튼 클릭
   - 즉시 사라지는지 확인

5. **다중 Toast**
   - 연속으로 여러 Toast 표시
   - 최대 3개까지만 표시되는지 확인

---

## 🐛 문제 해결

### Toast가 표시되지 않음

```tsx
// ToastProvider가 누락되었는지 확인
// app/layout.tsx
<ToastProvider>{children}</ToastProvider>
```

### "useToast must be used within ToastProvider" 에러

```tsx
// ToastProvider 내부에서만 사용 가능
// Client Component에서 사용해야 함
"use client";

import { useToast } from "@/hooks/ui/useToast";
```

### Toast가 BottomNav에 가려짐

```tsx
// ToastProvider에서 bottom: 80px 설정 확인
// BottomNav는 h-16 (64px)
```

---

## 📚 참고 문서

- `/docs/technical/UX-IMPROVEMENTS.md` - UX 개선 작업
- `/docs/technical/03-COMPONENT-PATTERNS.md` - 컴포넌트 패턴
- `/docs/technical/04-API-GUIDE.md` - API 에러 처리
- `/docs/technical/05-STATE-MANAGEMENT.md` - Context 패턴

---

## 🔜 향후 개선 사항

### P2 (추후 고려)

- [ ] Toast 위치 커스터마이징 (top/bottom)
- [ ] Toast 아이콘 커스터마이징
- [ ] Toast 액션 버튼 추가
- [ ] Toast 애니메이션 옵션
- [ ] Toast 사운드 효과

### P3 (선택적)

- [ ] Toast Storybook 문서화
- [ ] Toast E2E 테스트
- [ ] Toast 접근성 개선 (ARIA)
