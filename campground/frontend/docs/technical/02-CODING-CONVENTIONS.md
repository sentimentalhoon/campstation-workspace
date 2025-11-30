# 코딩 컨벤션

> CampStation 프론트엔드 코드 스타일 가이드

## 네이밍 규칙

### 파일 & 폴더

```typescript
// 컴포넌트 파일: PascalCase
Button.tsx
CampgroundCard.tsx
UserProfileHeader.tsx

// 훅 파일: camelCase with 'use' prefix
useAuth.ts
useCampgrounds.ts
useLocalStorage.ts

// 유틸리티 파일: camelCase
format.ts
validation.ts
dateHelpers.ts

// 타입 파일: camelCase
user.ts
campground.ts
api.ts

// API 파일: camelCase
auth.ts
campgrounds.ts
reservations.ts

// 폴더: kebab-case or camelCase
components/ui/
components/features/auth/
lib/api/
hooks/features/

// 상수 파일: camelCase or kebab-case
constants.ts
api-endpoints.ts
```

### 변수 & 함수

```typescript
// 변수: camelCase
const userName = "John";
const campgroundList = [];
let isLoading = false;

// 상수: UPPER_SNAKE_CASE
const API_BASE_URL = "http://localhost:8080/api";
const MAX_RETRY_COUNT = 3;
const DEFAULT_PAGE_SIZE = 10;

// 함수: camelCase
function getUserProfile() {}
async function fetchCampgrounds() {}
const handleClick = () => {};

// Boolean: is/has/should/can prefix
const isActive = true;
const hasPermission = false;
const shouldRender = true;
const canEdit = false;

// 이벤트 핸들러: handle prefix
const handleClick = () => {};
const handleSubmit = () => {};
const handleChange = (e) => {};

// React Component: PascalCase
function UserProfile() {}
const CampgroundCard = () => {};
```

### 타입 & 인터페이스

```typescript
// Type: PascalCase
type User = {
  id: number;
  name: string;
};

type CampgroundFilter = {
  location?: string;
  amenities?: string[];
};

// Interface: PascalCase (선호: type)
interface ButtonProps {
  variant: "primary" | "secondary";
  onClick: () => void;
}

// Enum: PascalCase (피하기, union type 사용 권장)
// ❌ Bad
enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

// ✅ Good
type UserRole = "ADMIN" | "USER" | "OWNER";

// Generic: 단일 대문자 또는 PascalCase
type ApiResponse<T> = {
  data: T;
  success: boolean;
};

function createArray<TItem>(items: TItem[]): TItem[] {
  return items;
}
```

## 코드 스타일

### Import 순서

```typescript
// 1. React & Next.js
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// 2. 외부 라이브러리
import { format } from "date-fns";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";

// 3. @/ alias imports (절대 경로)
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/auth/useAuth";
import { campgroundApi } from "@/lib/api/campgrounds";
import { formatKRW } from "@/lib/utils/format";
import type { Campground } from "@/types/domain/campground";

// 4. 상대 경로 imports
import { CampgroundCard } from "./CampgroundCard";
import { styles } from "./styles.module.css";

// 5. Type-only imports (선택적 - 명확성을 위해 분리 가능)
import type { ReactNode, ComponentProps } from "react";
```

### 컴포넌트 구조

```typescript
/**
 * 컴포넌트 JSDoc (선택적이지만 권장)
 */

// 1. Imports
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { User } from "@/types/domain/user";

// 2. Types & Interfaces
type UserCardProps = {
  user: User;
  onEdit?: (user: User) => void;
};

// 3. Constants (컴포넌트 외부)
const DEFAULT_AVATAR = "/images/default-avatar.png";
const MAX_NAME_LENGTH = 50;

// 4. Main Component
export function UserCard({ user, onEdit }: UserCardProps) {
  // 4-1. Hooks
  const [isExpanded, setIsExpanded] = useState(false);
  const { data } = useQuery({ ... });

  // 4-2. Event Handlers
  const handleToggle = () => {
    setIsExpanded(prev => !prev);
  };

  const handleEdit = () => {
    onEdit?.(user);
  };

  // 4-3. Computed Values
  const displayName = user.name.slice(0, MAX_NAME_LENGTH);
  const avatarUrl = user.avatar || DEFAULT_AVATAR;

  // 4-4. Effects
  useEffect(() => {
    // ...
  }, []);

  // 4-5. Render
  return (
    <div>
      {/* ... */}
    </div>
  );
}

// 5. Sub-components (same file, if small)
function UserAvatar({ url }: { url: string }) {
  return <img src={url} alt="avatar" />;
}

// 6. Helper functions (컴포넌트 외부)
function truncateName(name: string, maxLength: number): string {
  return name.length > maxLength ? name.slice(0, maxLength) + "..." : name;
}
```

### 함수 작성 규칙

```typescript
// ✅ Good: Arrow function for React components
export const UserProfile = ({ user }: Props) => {
  return <div>{user.name}</div>;
};

// ✅ Also Good: Function declaration
export function UserProfile({ user }: Props) {
  return <div>{user.name}</div>;
}

// ✅ Good: Arrow function for utilities
export const formatDate = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};

// ✅ Good: Async/await
async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// ❌ Bad: Promise then/catch chaining (prefer async/await)
function fetchUser(id: number): Promise<User> {
  return fetch(`/api/users/${id}`)
    .then(res => res.json())
    .catch(err => console.error(err));
}

// ✅ Good: Early return
function processUser(user: User | null) {
  if (!user) return null;
  if (!user.isActive) return null;

  return user.name;
}

// ❌ Bad: Nested conditions
function processUser(user: User | null) {
  if (user) {
    if (user.isActive) {
      return user.name;
    }
  }
  return null;
}
```

### JSX/TSX 스타일

```typescript
// ✅ Good: Self-closing tags
<Button />
<Image src={url} alt="campground" />

// ❌ Bad
<Button></Button>

// ✅ Good: Props on separate lines (if many)
<Button
  variant="primary"
  size="lg"
  onClick={handleClick}
  disabled={isLoading}
>
  Click me
</Button>

// ✅ Good: Props on same line (if few)
<Button variant="primary" onClick={handleClick}>
  Click me
</Button>

// ✅ Good: Conditional rendering with &&
{isLoading && <LoadingSpinner />}
{error && <ErrorMessage error={error} />}

// ✅ Good: Conditional rendering with ternary
{user ? <UserProfile user={user} /> : <LoginPrompt />}

// ❌ Bad: Nested ternary
{user ? (
  isAdmin ? <AdminPanel /> : <UserPanel />
) : (
  <LoginPrompt />
)}

// ✅ Good: Extract to variable or function
const Panel = user ? (isAdmin ? <AdminPanel /> : <UserPanel />) : <LoginPrompt />;
return <div>{Panel}</div>;

// ✅ Good: Boolean props
<Button primary />
<Modal isOpen />

// ❌ Bad
<Button primary={true} />
<Modal isOpen={true} />

// ✅ Good: Spread props sparingly
<Button {...commonProps} variant="primary" />

// ❌ Bad: Too much spreading (hard to track props)
<Button {...props1} {...props2} {...props3} />
```

### 타입 정의 스타일

```typescript
// ✅ Good: Type over Interface
type User = {
  id: number;
  name: string;
  email: string;
};

// ✅ Good: Readonly when appropriate
type Config = {
  readonly apiUrl: string;
  readonly timeout: number;
};

// ✅ Good: Optional properties
type UserProfile = {
  name: string;
  avatar?: string;
  bio?: string;
};

// ✅ Good: Union types
type UserRole = "ADMIN" | "USER" | "OWNER";
type ButtonVariant = "primary" | "secondary" | "danger";

// ✅ Good: Intersection types
type Timestamped = {
  createdAt: string;
  updatedAt: string;
};

type User = {
  id: number;
  name: string;
} & Timestamped;

// ✅ Good: Generic types
type ApiResponse<T> = {
  data: T;
  success: boolean;
  message?: string;
};

// ✅ Good: Utility types
type PartialUser = Partial<User>;
type UserKeys = keyof User;
type UserName = Pick<User, "name">;
type UserWithoutId = Omit<User, "id">;

// ✅ Good: Type guards
function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value
  );
}
```

### 주석 규칙

```typescript
/**
 * JSDoc for exported functions/components
 *
 * @param user - User object
 * @param options - Optional configuration
 * @returns Formatted user display name
 *
 * @example
 * ```ts
 * formatUserName(user, { includeTitle: true });
 * // => "Dr. John Doe"
 * ```
 */
export function formatUserName(
  user: User,
  options?: FormatOptions
): string {
  // Implementation...
}

// ✅ Good: Explain WHY, not WHAT
// Disable cache for real-time data
const { data } = useQuery({ queryKey, queryFn, gcTime: 0 });

// ❌ Bad: Stating the obvious
// Get data from query
const { data } = useQuery({ queryKey, queryFn });

// ✅ Good: TODO comments
// TODO: Add pagination support
// FIXME: Memory leak when unmounting
// HACK: Temporary fix until API is updated

// ✅ Good: Complex logic explanation
// Calculate total with 10% tax and 5% service charge
// Formula: subtotal * 1.10 * 1.05
const total = subtotal * 1.10 * 1.05;

// ✅ Good: Disable linter with explanation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// API returns dynamic structure, type not available yet
const dynamicData: any = await fetchDynamicData();
```

## ESLint & Prettier 설정

### .eslintrc.json
```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### .prettierrc
```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

## Git 커밋 메시지

### 형식
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type
```
feat:     새로운 기능 추가
fix:      버그 수정
refactor: 리팩토링 (기능 변경 없음)
style:    코드 포맷팅, 세미콜론 누락 등
docs:     문서 수정
test:     테스트 코드
chore:    빌드 프로세스, 라이브러리 업데이트 등
perf:     성능 개선
```

### 예시
```bash
feat(auth): add OAuth login support

- Add Google OAuth provider
- Add GitHub OAuth provider
- Update login page UI

Closes #123
```

```bash
fix(reservation): prevent double booking

Fixed race condition in reservation creation
that allowed multiple users to book the same slot

Fixes #456
```

```bash
refactor(api): migrate to new API client pattern

- Centralize API calls in lib/api
- Add type-safe request/response handling
- Remove deprecated API utilities
```

## 금지 사항

### ❌ 절대 하지 말 것

```typescript
// ❌ any 타입 남용
const data: any = fetchData();

// ✅ 제대로 타입 지정
const data: User[] = fetchData();

// ❌ Non-null assertion 남용
const user = getUser()!;

// ✅ Optional chaining
const userName = getUser()?.name;

// ❌ Type casting 남용
const input = document.getElementById("input") as HTMLInputElement;

// ✅ Type guard 사용
const input = document.getElementById("input");
if (input instanceof HTMLInputElement) {
  input.value = "...";
}

// ❌ console.log 커밋
console.log("Debug data:", data);

// ✅ 개발 중에만 사용, 커밋 전 제거 or console.error/warn만 허용
if (process.env.NODE_ENV === "development") {
  console.log("Debug:", data);
}

// ❌ 하드코딩된 값
const url = "http://localhost:8080/api";

// ✅ 환경 변수
const url = process.env.NEXT_PUBLIC_API_URL;

// ❌ Magic numbers
setTimeout(callback, 3000);

// ✅ Named constants
const RETRY_DELAY = 3000;
setTimeout(callback, RETRY_DELAY);
```

## 베스트 프랙티스 요약

1. **타입 안전성**: `any` 사용 금지, 명시적 타입 선언
2. **명확한 네이밍**: 의도가 명확한 변수/함수명
3. **Early Return**: 중첩 if문 대신 early return
4. **주석 최소화**: 코드로 설명, 필요시에만 주석
5. **컴포넌트 분리**: 200줄 이하, 단일 책임 원칙
6. **Props 타입**: 모든 컴포넌트 Props 명시적 타입
7. **Async/Await**: Promise then/catch 대신 async/await
8. **Const 우선**: let 최소화, var 금지
9. **Optional Chaining**: &&& 체크 대신 ?. 사용
10. **ESLint/Prettier**: 자동 포맷팅 활용
