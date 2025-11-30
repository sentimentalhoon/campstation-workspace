# 컴포넌트 라이브러리

> CampStation UI 컴포넌트 사용 가이드

## 📋 목차

1. [개요](#개요)
2. [UI 컴포넌트](#ui-컴포넌트)
3. [공통 컴포넌트](#공통-컴포넌트)
4. [사용 원칙](#사용-원칙)
5. [스타일링 가이드](#스타일링-가이드)

---

## 📖 개요

CampStation의 모든 UI 컴포넌트는 재사용성, 접근성, 일관성을 중심으로 설계되었습니다.

### 컴포넌트 위치

```
components/
├── ui/                    # 기본 UI 컴포넌트
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   └── ...
└── common/                # 공통 비즈니스 컴포넌트
    ├── QueryStateHandler.tsx
    └── ...
```

### Import 방식

```typescript
// UI 컴포넌트
import { Button, Card, Modal } from "@/components/ui";

// 공통 컴포넌트
import { QueryStateHandler } from "@/components/common";
```

---

## 🎨 UI 컴포넌트

### Button

다양한 스타일과 상태를 지원하는 버튼 컴포넌트

**Props**:

```typescript
type ButtonProps = {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;
```

**예시**:

```tsx
// Primary 버튼 (기본)
<Button>예약하기</Button>

// Secondary 버튼
<Button variant="secondary">취소</Button>

// Danger 버튼
<Button variant="danger">삭제</Button>

// Ghost 버튼 (투명 배경)
<Button variant="ghost">더보기</Button>

// Outline 버튼
<Button variant="outline">필터</Button>

// 크기 변경
<Button size="sm">작은 버튼</Button>
<Button size="lg">큰 버튼</Button>

// 로딩 상태
<Button loading>처리 중...</Button>

// 전체 너비
<Button fullWidth>로그인</Button>

// 비활성화
<Button disabled>사용 불가</Button>

// 아이콘과 함께
<Button>
  <HeartIcon className="h-4 w-4" />
  찜하기
</Button>
```

**접근성**:

- `focus-visible:ring-2`: 키보드 포커스 시 링 표시
- `disabled:opacity-50`: 비활성 상태 명확히 표시
- ARIA 속성 자동 처리

---

### Card

콘텐츠를 그룹화하는 카드 컴포넌트

**Props**:

```typescript
type CardProps = {
  children: ReactNode;
  hover?: boolean; // 호버 효과
  padding?: "none" | "sm" | "md" | "lg";
} & HTMLAttributes<HTMLDivElement>;
```

**하위 컴포넌트**:

- `CardHeader`: 카드 헤더
- `CardTitle`: 카드 제목
- `CardDescription`: 카드 설명
- `CardContent`: 카드 본문
- `CardFooter`: 카드 푸터

**예시**:

```tsx
// 기본 카드
<Card>
  <CardHeader>
    <CardTitle>캠핑장 이름</CardTitle>
    <CardDescription>강원도 춘천시</CardDescription>
  </CardHeader>
  <CardContent>
    <p>캠핑장 설명...</p>
  </CardContent>
  <CardFooter>
    <Button>자세히 보기</Button>
  </CardFooter>
</Card>

// 호버 효과가 있는 카드
<Card hover>
  <CardContent>호버 시 그림자 증가</CardContent>
</Card>

// 패딩 없는 카드 (이미지 등)
<Card padding="none">
  <Image src="/image.jpg" alt="캠핑장" />
  <CardContent>
    <CardTitle>이미지가 있는 카드</CardTitle>
  </CardContent>
</Card>

// 작은 패딩
<Card padding="sm">
  <CardContent>컴팩트한 카드</CardContent>
</Card>
```

---

### Input

텍스트 입력 필드 컴포넌트

**Props**:

```typescript
type InputProps = {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
} & InputHTMLAttributes<HTMLInputElement>;
```

**예시**:

```tsx
// 기본 입력
<Input
  type="text"
  placeholder="이름을 입력하세요"
/>

// 라벨과 함께
<Input
  label="이메일"
  type="email"
  placeholder="example@email.com"
/>

// 에러 상태
<Input
  label="비밀번호"
  type="password"
  error="비밀번호는 8자 이상이어야 합니다"
/>

// 도움말 텍스트
<Input
  label="전화번호"
  helperText="010-1234-5678 형식으로 입력하세요"
/>

// 아이콘과 함께
<Input
  leftIcon={<SearchIcon />}
  placeholder="검색..."
/>

<Input
  type="password"
  rightIcon={<EyeIcon />}
/>

// 전체 너비
<Input fullWidth label="주소" />

// 비활성화
<Input disabled value="수정 불가" />

// 읽기 전용
<Input readOnly value="조회만 가능" />
```

---

### Modal

모달 다이얼로그 컴포넌트

**Props**:

```typescript
type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
};
```

**예시**:

```tsx
function ExampleComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        모달 열기
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="예약 확인"
        description="예약 정보를 확인해주세요"
      >
        <div className="space-y-4">
          <p>예약 내용...</p>
          <div className="flex gap-2">
            <Button onClick={() => setIsOpen(false)}>
              취소
            </Button>
            <Button variant="primary">
              확인
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// 큰 모달
<Modal size="lg" isOpen={isOpen} onClose={onClose}>
  {/* 내용 */}
</Modal>

// 전체 화면 모달
<Modal size="full" isOpen={isOpen} onClose={onClose}>
  {/* 내용 */}
</Modal>

// 오버레이 클릭으로 닫기 비활성화
<Modal
  isOpen={isOpen}
  onClose={onClose}
  closeOnOverlayClick={false}
>
  {/* 내용 */}
</Modal>

// 닫기 버튼 숨기기
<Modal
  isOpen={isOpen}
  onClose={onClose}
  showCloseButton={false}
>
  {/* 내용 */}
</Modal>
```

**기능**:

- ESC 키로 닫기
- 오버레이 클릭으로 닫기
- Body scroll 방지
- 포커스 트랩

---

### Select

드롭다운 선택 컴포넌트

**Props**:

```typescript
type SelectProps = {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  options: Array<{ value: string; label: string }>;
} & SelectHTMLAttributes<HTMLSelectElement>;
```

**예시**:

```tsx
// 기본 셀렉트
<Select
  options={[
    { value: 'seoul', label: '서울' },
    { value: 'busan', label: '부산' },
    { value: 'jeju', label: '제주' },
  ]}
  placeholder="지역을 선택하세요"
/>

// 라벨과 함께
<Select
  label="지역 선택"
  options={regions}
  defaultValue="seoul"
/>

// 에러 상태
<Select
  label="캠핑장 선택"
  options={campgrounds}
  error="캠핑장을 선택해주세요"
/>

// React Hook Form과 함께
<Select
  label="지역"
  {...register('region', { required: true })}
  options={regions}
  error={errors.region?.message}
/>
```

---

### Checkbox

체크박스 컴포넌트

**Props**:

```typescript
type CheckboxProps = {
  label?: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>;
```

**예시**:

```tsx
// 기본 체크박스
<Checkbox label="이용약관에 동의합니다" />

// 제어 컴포넌트
<Checkbox
  checked={isAgreed}
  onChange={(e) => setIsAgreed(e.target.checked)}
  label="개인정보 처리방침에 동의합니다"
/>

// 에러 상태
<Checkbox
  label="필수 약관 동의"
  error="필수 항목입니다"
/>

// 비활성화
<Checkbox label="사용 불가" disabled />

// React Hook Form
<Checkbox
  {...register('terms')}
  label="약관 동의"
  error={errors.terms?.message}
/>
```

---

### Textarea

여러 줄 텍스트 입력 컴포넌트

**Props**:

```typescript
type TextareaProps = {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  rows?: number;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;
```

**예시**:

```tsx
// 기본 텍스트에어리어
<Textarea
  placeholder="내용을 입력하세요"
  rows={4}
/>

// 라벨과 함께
<Textarea
  label="리뷰 내용"
  placeholder="캠핑장 이용 후기를 작성해주세요"
  rows={6}
/>

// 에러 상태
<Textarea
  label="문의 내용"
  error="최소 10자 이상 입력해주세요"
/>

// 최대 길이 제한
<Textarea
  label="한줄평"
  maxLength={100}
  helperText="최대 100자"
/>
```

---

### Badge

상태나 카테고리를 표시하는 뱃지 컴포넌트

**Props**:

```typescript
type BadgeProps = {
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
} & HTMLAttributes<HTMLSpanElement>;
```

**예시**:

```tsx
// 기본 뱃지
<Badge>New</Badge>

// 다양한 variant
<Badge variant="primary">프리미엄</Badge>
<Badge variant="success">예약 완료</Badge>
<Badge variant="warning">대기 중</Badge>
<Badge variant="danger">취소됨</Badge>

// 크기 변경
<Badge size="sm">작은 뱃지</Badge>
<Badge size="lg">큰 뱃지</Badge>

// 상태 표시
<div className="flex items-center gap-2">
  <h3>캠핑장 이름</h3>
  {campground.isPremium && (
    <Badge variant="primary">프리미엄</Badge>
  )}
</div>
```

---

### LoadingSpinner

로딩 상태를 표시하는 스피너 컴포넌트

**Props**:

```typescript
type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "white";
  text?: string;
};
```

**예시**:

```tsx
// 기본 스피너
<LoadingSpinner />

// 텍스트와 함께
<LoadingSpinner text="로딩 중..." />

// 크기 변경
<LoadingSpinner size="sm" />
<LoadingSpinner size="lg" />

// 흰색 스피너 (어두운 배경에)
<div className="bg-gray-900 p-8">
  <LoadingSpinner variant="white" />
</div>

// 전체 화면 로딩
<div className="fixed inset-0 flex items-center justify-center bg-white/80">
  <LoadingSpinner size="lg" text="데이터를 불러오는 중..." />
</div>
```

**접근성**:

- `role="status"`: 스크린 리더에 상태 알림
- `aria-live="polite"`: 변경사항 알림
- `aria-label`: 로딩 상태 설명

---

### ErrorMessage

에러 메시지를 표시하는 컴포넌트

**Props**:

```typescript
type ErrorMessageProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  showRetryButton?: boolean;
};
```

**예시**:

```tsx
// 기본 에러 메시지
<ErrorMessage message="데이터를 불러오는데 실패했습니다" />

// 제목과 함께
<ErrorMessage
  title="오류 발생"
  message="네트워크 연결을 확인해주세요"
/>

// 재시도 버튼
<ErrorMessage
  message="데이터 로딩 실패"
  onRetry={() => refetch()}
  showRetryButton
/>

// React Query와 함께
{error && (
  <ErrorMessage
    title="캠핑장 목록 로딩 실패"
    message={error.message}
    onRetry={() => refetch()}
    showRetryButton
  />
)}
```

**접근성**:

- `role="alert"`: 에러 발생 즉시 스크린 리더에 알림
- `aria-live="assertive"`: 긴급 알림
- `aria-atomic="true"`: 전체 메시지 읽기

---

### StepIndicator

단계별 진행 상태를 표시하는 컴포넌트

**Props**:

```typescript
type StepIndicatorProps = {
  steps: string[];
  currentStep: number;
  completedSteps?: number[];
};
```

**예시**:

```tsx
// 기본 스텝 인디케이터
<StepIndicator
  steps={['정보 입력', '결제', '완료']}
  currentStep={1}
/>

// 완료된 단계 표시
<StepIndicator
  steps={['예약 정보', '결제 정보', '예약 확인']}
  currentStep={2}
  completedSteps={[0]}
/>

// 예약 프로세스
function ReservationProcess() {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ['날짜 선택', '옵션 선택', '결제', '완료'];

  return (
    <div>
      <StepIndicator
        steps={steps}
        currentStep={currentStep}
      />
      {/* 각 단계별 컨텐츠 */}
    </div>
  );
}
```

---

## 🔧 공통 컴포넌트

### QueryStateHandler

React Query 상태 (로딩/에러/빈 데이터)를 통합 처리하는 컴포넌트

**Props**:

```typescript
type QueryStateHandlerProps = {
  isLoading: boolean;
  error: Error | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  emptyAction?: {
    label: string;
    href: string;
  };
  loadingText?: string;
  children: ReactNode;
};
```

**예시**:

```tsx
// 기본 사용
function CampgroundList() {
  const { data, isLoading, error } = useCampgrounds();

  return (
    <QueryStateHandler
      isLoading={isLoading}
      error={error}
      isEmpty={data?.data.content.length === 0}
      emptyMessage="캠핑장이 없습니다"
    >
      {data?.data.content.map((campground) => (
        <CampgroundCard key={campground.id} campground={campground} />
      ))}
    </QueryStateHandler>
  );
}

// 빈 상태에 액션 추가
<QueryStateHandler
  isLoading={isLoading}
  error={error}
  isEmpty={favorites.length === 0}
  emptyMessage="찜한 캠핑장이 없습니다"
  emptyAction={{
    label: "캠핑장 둘러보기",
    href: "/campgrounds"
  }}
>
  {favorites.map(fav => <FavoriteCard key={fav.id} {...fav} />)}
</QueryStateHandler>

// 커스텀 로딩 텍스트
<QueryStateHandler
  isLoading={isLoading}
  error={error}
  isEmpty={false}
  loadingText="예약 정보를 불러오는 중..."
>
  {children}
</QueryStateHandler>
```

**장점**:

- 일관된 UX (로딩/에러/빈 상태)
- 코드 중복 제거
- 접근성 자동 처리
- 에러 재시도 기능

---

## 📐 사용 원칙

### 1. 컴포넌트 선택 기준

```tsx
// ❌ 매번 새로운 버튼 스타일 작성
<button className="px-4 py-2 bg-blue-500 text-white rounded">
  클릭
</button>

// ✅ Button 컴포넌트 사용
<Button variant="primary">클릭</Button>
```

### 2. Props 확장

```tsx
// UI 컴포넌트는 기본 HTML 속성 지원
<Button
  type="submit"
  aria-label="폼 제출"
  onClick={handleSubmit}
>
  제출
</Button>

<Input
  type="email"
  required
  autoComplete="email"
  onFocus={handleFocus}
/>
```

### 3. 조합 사용

```tsx
// 컴포넌트들을 조합하여 복잡한 UI 구성
<Card hover>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>캠핑장 이름</CardTitle>
      <Badge variant="success">예약 가능</Badge>
    </div>
    <CardDescription>강원도 춘천시</CardDescription>
  </CardHeader>
  <CardContent>
    <img src="/campground.jpg" alt="캠핑장" />
  </CardContent>
  <CardFooter className="flex gap-2">
    <Button variant="outline" fullWidth>
      <HeartIcon /> 찜하기
    </Button>
    <Button variant="primary" fullWidth>
      예약하기
    </Button>
  </CardFooter>
</Card>
```

### 4. 폼 처리

```tsx
// React Hook Form과 함께 사용
import { useForm } from "react-hook-form";

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="이메일"
        type="email"
        {...register("email", { required: "이메일을 입력하세요" })}
        error={errors.email?.message}
      />

      <Input
        label="비밀번호"
        type="password"
        {...register("password", { required: true })}
        error={errors.password && "비밀번호를 입력하세요"}
      />

      <Button type="submit" fullWidth>
        로그인
      </Button>
    </form>
  );
}
```

---

## 🎨 스타일링 가이드

### Tailwind CSS 클래스 확장

```tsx
// className prop으로 추가 스타일 적용
<Button className="mt-4 shadow-lg">
  커스텀 스타일
</Button>

<Card className="bg-gradient-to-r from-blue-500 to-purple-500">
  그라디언트 배경
</Card>
```

### cn() 유틸리티 사용

```tsx
import { cn } from "@/lib/utils";

// 조건부 클래스 적용
<Button
  className={cn(
    "base-class",
    isActive && "active-class",
    hasError && "error-class"
  )}
>
  버튼
</Button>;
```

### 테마 변수 사용

```tsx
// Tailwind 테마 색상 사용
<div className="bg-background text-foreground">
  <h1 className="text-primary">제목</h1>
  <p className="text-muted-foreground">설명</p>
  <Button variant="primary">버튼</Button>
</div>
```

---

## 🧪 테스트 예시

```tsx
// Button.test.tsx
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui";

describe("Button", () => {
  it("renders children correctly", () => {
    render(<Button>클릭</Button>);
    expect(screen.getByText("클릭")).toBeInTheDocument();
  });

  it("applies variant styles", () => {
    render(<Button variant="danger">삭제</Button>);
    const button = screen.getByText("삭제");
    expect(button).toHaveClass("bg-red-500");
  });

  it("shows loading spinner when loading", () => {
    render(<Button loading>제출</Button>);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
```

---

## 📚 참고 문서

- [코딩 컨벤션](../02-CODING-CONVENTIONS.md)
- [컴포넌트 패턴](../03-COMPONENT-PATTERNS.md)
- [접근성 가이드](https://www.w3.org/WAI/ARIA/apg/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**마지막 업데이트**: 2025-01-27  
**버전**: 1.0.0 (Sprint 4)
