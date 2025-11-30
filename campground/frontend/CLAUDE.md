# CLAUDE.md - AI Assistant Guide for CampStation Frontend

> Comprehensive guide for AI assistants (like Claude) working on this codebase

**Last Updated**: 2025-11-17
**Project**: CampStation Frontend - Mobile-First Camping Reservation Platform
**Tech Stack**: Next.js 16 + React 19 + TypeScript 5 + Tailwind CSS 4

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [Codebase Structure](#codebase-structure)
4. [Development Conventions](#development-conventions)
5. [Component Patterns](#component-patterns)
6. [API Integration](#api-integration)
7. [State Management](#state-management)
8. [Common Tasks](#common-tasks)
9. [Testing](#testing)
10. [Important Notes for AI Assistants](#important-notes-for-ai-assistants)

---

## Project Overview

### What is CampStation?

CampStation is a **mobile-first camping reservation platform** built for the Korean market. Users can search for campgrounds, make reservations, write reviews, and manage bookings.

### Key Features

- **Campground Search & Booking**: Search nationwide campgrounds with real-time availability
- **Review System**: Upload images, rate experiences with star ratings
- **Favorites**: Save and manage favorite campgrounds
- **Payment Integration**: Toss Payments for secure transactions
- **User Management**: Registration, login, profile management
- **Mobile Optimized**: Responsive design (max-width: 640px), PWA support

### Current Status

- **Sprint**: Sprint 4 completed (93%)
- **TypeScript Errors**: 0
- **Test Coverage**: 5/5 unit tests passing
- **Build Time**: ~7.9 seconds
- **Routes**: 19 pages
- **First Load JS**: 409.49KB

---

## Architecture & Tech Stack

### Core Technologies

```typescript
{
  "framework": "Next.js 16 (App Router)",
  "react": "19.2.0 (with React Compiler)",
  "typescript": "5+",
  "styling": "Tailwind CSS 4",
  "state": "TanStack Query v5 (React Query)",
  "dates": "date-fns v4",
  "payment": "Toss Payments SDK",
  "testing": {
    "unit": "Vitest",
    "e2e": "Playwright",
    "component": "React Testing Library"
  }
}
```

### Architecture Principles

1. **Server-First Architecture**
   - Default to Server Components
   - Use `"use client"` only when necessary (state, events, browser APIs)
   - Fetch data on the server whenever possible

2. **API Layer Pattern**
   ```
   Page (Server Component)
       ↓
   Custom Hook (useQuery/useMutation)
       ↓
   API Client (lib/api/)
       ↓
   Backend API (Spring Boot)
   ```

3. **Type Safety**
   - End-to-end TypeScript type safety
   - Strict mode enabled
   - No `any` types (use proper typing or `unknown`)

4. **React 19 Optimizations**
   - React Compiler enabled (automatic memoization)
   - **DO NOT** use `useMemo`, `useCallback`, or `React.memo` manually
   - Use `useOptimistic` for optimistic updates
   - Use `useTransition` for non-blocking updates

---

## Codebase Structure

```
campstation-frontend/
├── app/                      # Next.js App Router (Pages & Routing)
│   ├── (auth)/              # Auth pages (login, register)
│   ├── campgrounds/         # Campground pages
│   ├── reservations/        # Reservation pages
│   ├── reviews/             # Review pages
│   ├── favorites/           # Favorites page
│   ├── admin/              # Admin dashboard
│   ├── api/                # API routes (proxy, server actions)
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
│
├── components/
│   ├── ui/                 # Pure UI components (Button, Card, Input, etc.)
│   ├── layout/             # Layout components (Header, Footer, Navigation)
│   ├── features/           # Feature-specific components
│   │   ├── campground/    # Campground cards, filters, etc.
│   │   ├── reservation/   # Reservation forms, lists
│   │   ├── reviews/       # Review cards, forms
│   │   └── admin/         # Admin tables, forms
│   ├── common/            # Shared components (ErrorBoundary, LoadingSpinner)
│   └── providers/         # Context providers (QueryProvider, AuthProvider)
│
├── hooks/
│   ├── ui/                # UI-related hooks (useToast, useModal)
│   ├── features/          # Feature hooks (useCampgrounds, useReservations)
│   ├── auth/             # Auth hooks (useAuth)
│   └── index.ts          # Hook exports
│
├── lib/
│   ├── api/              # API client & endpoints
│   │   ├── client.ts    # Base API client (fetch wrapper)
│   │   ├── auth.ts      # Auth API
│   │   ├── campgrounds.ts   # Campground API
│   │   ├── reservations.ts  # Reservation API
│   │   └── reviews.ts       # Review API
│   ├── utils/           # Utility functions (format, validation)
│   ├── constants/       # Constants & configs
│   ├── errors/          # Custom error classes
│   └── security/        # Security utilities (sanitization, CSRF)
│
├── types/
│   ├── domain/          # Domain models (User, Campground, Reservation)
│   ├── api/            # API types (ApiResponse, PaginatedResponse)
│   └── ui/             # UI component prop types
│
├── contexts/           # React Context (AuthContext, ThemeContext)
│
├── public/            # Static assets
│   ├── images/
│   └── icons/
│
├── docs/              # Documentation
│   ├── technical/    # Technical docs (architecture, conventions)
│   ├── specifications/  # Feature specs
│   ├── sprints/      # Sprint documentation
│   ├── operations/   # Deployment, monitoring, troubleshooting
│   └── testing/      # Testing guides
│
└── __tests__/        # Test files (unit, integration, e2e)
```

### File Naming Conventions

```typescript
// Components: PascalCase
Button.tsx
CampgroundCard.tsx
UserProfileHeader.tsx

// Hooks: camelCase with 'use' prefix
useAuth.ts
useCampgrounds.ts
useLocalStorage.ts

// Utilities: camelCase
format.ts
validation.ts
dateHelpers.ts

// Types: camelCase
user.ts
campground.ts
api.ts

// API modules: camelCase
auth.ts
campgrounds.ts
reservations.ts
```

---

## Development Conventions

### Import Order

Always follow this import order:

```typescript
// 1. React & Next.js
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// 2. External libraries
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

// 3. @/ alias imports (absolute paths)
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/auth/useAuth";
import { campgroundApi } from "@/lib/api/campgrounds";
import type { Campground } from "@/types/domain/campground";

// 4. Relative imports
import { CampgroundCard } from "./CampgroundCard";
import styles from "./styles.module.css";
```

### Naming Rules

```typescript
// Variables: camelCase
const userName = "John";
const campgroundList = [];

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = "http://localhost:8080/api";
const MAX_RETRY_COUNT = 3;

// Boolean variables: is/has/should/can prefix
const isActive = true;
const hasPermission = false;
const shouldRender = true;

// Event handlers: handle prefix
const handleClick = () => {};
const handleSubmit = () => {};
const handleChange = (e) => {};

// Types: PascalCase
type User = { ... };
type CampgroundFilter = { ... };

// Prefer type over interface
// ✅ Good
type ButtonProps = { ... };

// ❌ Avoid
interface ButtonProps { ... }

// Prefer union types over enums
// ✅ Good
type UserRole = "ADMIN" | "USER" | "OWNER";

// ❌ Avoid
enum UserRole { ADMIN = "ADMIN", USER = "USER" }
```

### TypeScript Strict Rules

```typescript
// ✅ Enable in tsconfig.json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true
}

// ✅ Good: Proper typing
const user: User | null = await getUser();
if (!user) return null;

// ❌ Bad: Using 'any'
const user: any = await getUser();

// ✅ Good: Type guards
function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value
  );
}

// ✅ Good: Optional chaining
const userName = user?.name;

// ❌ Bad: Non-null assertion
const userName = user!.name;
```

---

## Component Patterns

### 1. Server vs Client Components

**Server Component (Default)**

Use for:
- Data fetching
- SEO-critical content
- Static content
- Database queries
- Secret handling

```typescript
// app/campgrounds/page.tsx
import { campgroundApi } from "@/lib/api/campgrounds";
import { CampgroundList } from "@/components/features/campground/CampgroundList";

export default async function CampgroundsPage() {
  // Fetch on server
  const data = await campgroundApi.getAll();

  return (
    <div>
      <h1>캠핑장 목록</h1>
      <CampgroundList campgrounds={data.content} />
    </div>
  );
}
```

**Client Component**

Use when you need:
- `useState`, `useEffect`, React hooks
- Event listeners (`onClick`, `onChange`)
- Browser APIs (`localStorage`, `window`)
- Interactivity, animations
- Context (`useContext`)

```typescript
// components/features/campground/CampgroundFilters.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type FiltersProps = {
  onFilterChange: (filters: Filters) => void;
};

export function CampgroundFilters({ onFilterChange }: FiltersProps) {
  const [filters, setFilters] = useState<Filters>({});

  return (
    <div>
      {/* Filter UI */}
      <Button onClick={() => onFilterChange(filters)}>
        Apply
      </Button>
    </div>
  );
}
```

### 2. Component Structure Template

```typescript
/**
 * Component description (optional but recommended)
 */

// 1. Imports
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { User } from "@/types/domain/user";

// 2. Types
type UserCardProps = {
  user: User;
  onEdit?: (user: User) => void;
};

// 3. Constants (outside component)
const DEFAULT_AVATAR = "/images/default-avatar.png";
const MAX_NAME_LENGTH = 50;

// 4. Main Component
export function UserCard({ user, onEdit }: UserCardProps) {
  // 4-1. Hooks
  const [isExpanded, setIsExpanded] = useState(false);

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

  // 4-4. Early returns
  if (!user) return null;

  // 4-5. Render
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}

// 5. Sub-components (if small)
function UserAvatar({ url }: { url: string }) {
  return <img src={url} alt="avatar" />;
}
```

### 3. React 19 Patterns

**CRITICAL: React Compiler is Enabled**

```typescript
// ❌ NEVER DO THIS (React Compiler handles it automatically)
import { useMemo, useCallback, memo } from "react";

function CampgroundList({ campgrounds, filters }: Props) {
  // ❌ DON'T use useMemo
  const filteredData = useMemo(() => {
    return campgrounds.filter(c => c.location === filters.location);
  }, [campgrounds, filters.location]);

  // ❌ DON'T use useCallback
  const handleClick = useCallback((id: number) => {
    console.log(id);
  }, []);

  return <List data={filteredData} onClick={handleClick} />;
}

// ❌ DON'T use React.memo
export default memo(CampgroundList);
```

```typescript
// ✅ DO THIS (React Compiler auto-optimizes)
function CampgroundList({ campgrounds, filters }: Props) {
  // React Compiler automatically memoizes this
  const filteredData = campgrounds.filter(
    c => c.location === filters.location
  );

  // React Compiler automatically memoizes this
  const handleClick = (id: number) => {
    console.log(id);
  };

  return <List data={filteredData} onClick={handleClick} />;
}
```

**useOptimistic - Optimistic Updates**

```typescript
"use client";

import { useOptimistic } from "react";
import { reservationApi } from "@/lib/api/reservations";

type Props = {
  reservation: Reservation;
};

export function ReservationCard({ reservation }: Props) {
  const [optimisticReservation, updateOptimisticReservation] = useOptimistic(
    reservation,
    (state, update: Partial<Reservation>) => ({ ...state, ...update })
  );

  async function handleCancel() {
    // Immediately update UI
    updateOptimisticReservation({ status: "CANCELLED" });

    try {
      await reservationApi.cancel(reservation.id);
    } catch (error) {
      // Auto-rollback on error
      console.error("Failed to cancel:", error);
    }
  }

  return (
    <div>
      <h3>{optimisticReservation.campgroundName}</h3>
      <Badge>{optimisticReservation.status}</Badge>
      <Button onClick={handleCancel}>Cancel</Button>
    </div>
  );
}
```

**useTransition - Non-blocking Updates**

```typescript
"use client";

import { useState, useTransition } from "react";

export function CampgroundSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);

    // Non-blocking update (UI stays responsive)
    startTransition(async () => {
      const data = await searchCampgrounds(newQuery);
      setResults(data);
    });
  };

  return (
    <div>
      <Input
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search campgrounds..."
      />
      {isPending && <LoadingIndicator />}
      <ResultList results={results} />
    </div>
  );
}
```

---

## API Integration

### API Client Pattern

All API calls go through the base client in `lib/api/client.ts`:

```typescript
// lib/api/client.ts
export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    credentials: "include", // HttpOnly cookies
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await parseErrorResponse(response);
    throw new ApiError(response.status, errorData);
  }

  return response.json();
}
```

### Feature-specific API Modules

```typescript
// lib/api/campgrounds.ts
import { apiClient } from "./client";
import type { Campground } from "@/types/domain/campground";

export const campgroundApi = {
  getAll: (params?: SearchParams) =>
    apiClient<Campground[]>("/v1/campgrounds", { params }),

  getById: (id: number) =>
    apiClient<Campground>(`/v1/campgrounds/${id}`),

  create: (data: CreateCampgroundDto) =>
    apiClient<Campground>("/v1/campgrounds", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
```

### React Query Integration

```typescript
// hooks/features/useCampgrounds.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { campgroundApi } from "@/lib/api/campgrounds";

export function useCampgrounds(params?: SearchParams) {
  return useQuery({
    queryKey: ["campgrounds", params],
    queryFn: () => campgroundApi.getAll(params),
  });
}

export function useCreateCampground() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: campgroundApi.create,
    onSuccess: () => {
      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ["campgrounds"] });
    },
  });
}
```

### Server Component Data Fetching

```typescript
// app/campgrounds/page.tsx
import { campgroundApi } from "@/lib/api/campgrounds";

export default async function CampgroundsPage() {
  // Direct API call on server
  const data = await campgroundApi.getAll();

  return <CampgroundList campgrounds={data.content} />;
}
```

---

## State Management

### State Classification

```typescript
// 1. Server State (React Query)
// - Data from API
// - Needs caching & revalidation
const { data, isLoading } = useQuery({
  queryKey: ['campgrounds', filters],
  queryFn: () => campgroundApi.getAll(filters),
});

// 2. Client State (Context)
// - User auth
// - Theme settings
// - Global UI state
const { user, isAuthenticated } = useAuth();

// 3. URL State (Search Params)
// - Filters, search queries
// - Pagination
// - Sorting
const searchParams = useSearchParams();
const page = searchParams.get('page') || '1';

// 4. Local State (useState)
// - Component-specific UI state
// - Form inputs
// - Modal open/close
const [isOpen, setIsOpen] = useState(false);
```

### React Query Default Config

```typescript
// lib/query/client.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,        // 1 minute
      gcTime: 5 * 60 * 1000,       // 5 minutes (v5: cacheTime → gcTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

---

## Common Tasks

### 1. Adding a New Feature

Follow this workflow:

```typescript
// 1. Define types (types/domain/)
// types/domain/review.ts
export type Review = {
  id: number;
  rating: number;
  comment: string;
  campgroundId: number;
  userId: number;
  createdAt: string;
};

// 2. Create API functions (lib/api/)
// lib/api/reviews.ts
export const reviewApi = {
  getAll: (campgroundId: number) =>
    apiClient<Review[]>(`/v1/reviews?campgroundId=${campgroundId}`),

  create: (data: CreateReviewDto) =>
    apiClient<Review>("/v1/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// 3. Create custom hooks (hooks/features/)
// hooks/features/useReviews.ts
export function useReviews(campgroundId: number) {
  return useQuery({
    queryKey: ["reviews", campgroundId],
    queryFn: () => reviewApi.getAll(campgroundId),
  });
}

// 4. Create UI components (components/features/)
// components/features/reviews/ReviewList.tsx
export function ReviewList({ campgroundId }: Props) {
  const { data, isLoading } = useReviews(campgroundId);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      {data?.map(review => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}

// 5. Integrate into pages (app/)
// app/campgrounds/[id]/page.tsx
export default async function CampgroundPage({ params }: Props) {
  return (
    <div>
      <CampgroundDetail id={params.id} />
      <ReviewList campgroundId={params.id} />
    </div>
  );
}
```

### 2. Creating a New UI Component

```typescript
// components/ui/Card.tsx
type CardProps = {
  children: React.ReactNode;
  variant?: "default" | "outlined" | "elevated";
  className?: string;
  onClick?: () => void;
};

export function Card({
  children,
  variant = "default",
  className,
  onClick
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg p-4",
        variantStyles[variant],
        onClick && "cursor-pointer hover:shadow-lg",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

const variantStyles = {
  default: "bg-card border border-border",
  outlined: "border-2 border-primary",
  elevated: "shadow-md bg-card",
};
```

### 3. Error Handling Pattern

```typescript
"use client";

import { useCampgrounds } from "@/hooks/features/useCampgrounds";
import { ApiError } from "@/lib/api/errors";

export function CampgroundList() {
  const { data, error, isLoading } = useCampgrounds();

  // Loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Error handling
  if (error) {
    if (error instanceof ApiError) {
      if (error.isAuthError()) {
        return <ErrorMessage>Please log in to continue</ErrorMessage>;
      }
      if (error.isValidationError()) {
        return <ErrorMessage>Invalid request</ErrorMessage>;
      }
    }
    return <ErrorMessage>Failed to load campgrounds</ErrorMessage>;
  }

  // Empty state
  if (!data || data.length === 0) {
    return <EmptyState message="No campgrounds found" />;
  }

  // Success state
  return (
    <div>
      {data.map((campground) => (
        <CampgroundCard key={campground.id} campground={campground} />
      ))}
    </div>
  );
}
```

### 4. Form Handling

```typescript
"use client";

import { useState } from "react";
import { useCreateReservation } from "@/hooks/features/useReservations";

export function ReservationForm({ campgroundId }: Props) {
  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    guestCount: 1,
  });

  const createMutation = useCreateReservation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createMutation.mutateAsync({
        campgroundId,
        ...formData,
      });
      // Success - redirect or show success message
    } catch (error) {
      // Error handling
      console.error("Failed to create reservation:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="date"
        value={formData.checkIn}
        onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
        label="Check-in"
      />
      <Input
        type="date"
        value={formData.checkOut}
        onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
        label="Check-out"
      />
      <Button
        type="submit"
        loading={createMutation.isPending}
        disabled={createMutation.isPending}
      >
        Reserve
      </Button>
    </form>
  );
}
```

---

## Testing

### Unit Tests (Vitest)

```typescript
// __tests__/utils/format.test.ts
import { describe, it, expect } from "vitest";
import { formatCurrency } from "@/lib/utils/format";

describe("formatCurrency", () => {
  it("formats Korean currency correctly", () => {
    expect(formatCurrency(10000)).toBe("₩10,000");
    expect(formatCurrency(0)).toBe("₩0");
  });
});
```

### Component Tests

```typescript
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("renders with children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick handler", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByText("Click"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### E2E Tests (Playwright)

```typescript
// e2e/campgrounds.spec.ts
import { test, expect } from "@playwright/test";

test("user can view campground details", async ({ page }) => {
  await page.goto("/campgrounds/1");

  await expect(page.locator("h1")).toContainText("Campground Name");
  await expect(page.locator('[data-testid="price"]')).toBeVisible();
});
```

### Run Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

---

## Important Notes for AI Assistants

### 1. React 19 Compiler Rules

**CRITICAL**: This project uses React 19 Compiler for automatic optimization.

- **NEVER** use `useMemo`, `useCallback`, or `React.memo` unless absolutely necessary
- The compiler automatically memoizes components and values
- Only exception: when a function is in a `useEffect` dependency array

### 2. Server vs Client Components

**Default to Server Components**:
- Only add `"use client"` when you need interactivity
- Server Components are better for performance and SEO
- Always ask: "Does this component need client-side JavaScript?"

### 3. Type Safety

**No shortcuts with types**:
- Never use `any` (use `unknown` if type is truly unknown)
- Always define proper types in `types/` directory
- Use type guards for runtime type checking
- Enable all strict TypeScript checks

### 4. API Patterns

**Always use the API layer**:
- Never call `fetch` directly in components
- All API calls go through `lib/api/` modules
- Use React Query hooks for client components
- Direct API calls for server components

### 5. File Organization

**Follow the folder structure**:
- UI components → `components/ui/`
- Feature components → `components/features/`
- Hooks → `hooks/features/`
- API functions → `lib/api/`
- Types → `types/domain/` or `types/api/`

### 6. Mobile-First Design

**Max width: 640px**:
- All designs are mobile-first
- Use Tailwind's mobile-first breakpoints
- Minimum touch target: 44x44px
- Test on mobile viewports

### 7. Security Practices

**Important security rules**:
- Auth tokens in HttpOnly cookies (never localStorage)
- Secrets in Server Components only (not exposed to client)
- Always sanitize user input
- Use CSP headers (already configured in `next.config.ts`)

### 8. Error Handling

**Comprehensive error handling**:
- Always handle loading, error, and empty states
- Use `ApiError` class for type-safe error checking
- Show user-friendly error messages
- Log errors for debugging

### 9. Performance

**Optimization checklist**:
- Use Next.js `<Image>` component (never `<img>`)
- Lazy load components when appropriate (`dynamic()`)
- Minimize bundle size (already configured)
- Use React Query caching effectively

### 10. Documentation

**When making changes**:
- Update relevant docs in `docs/` folder
- Add JSDoc comments to exported functions
- Update this CLAUDE.md if architecture changes
- Keep examples in docs up-to-date

---

## Quick Reference Commands

```bash
# Development
npm run dev                 # Start dev server (localhost:3000)
npm run build              # Production build
npm run start              # Start production server

# Code Quality
npm run lint               # ESLint check
npm run lint:fix           # Auto-fix linting issues
npm run format             # Format with Prettier
npm run type-check         # TypeScript type check

# Testing
npm run test               # Unit tests (Vitest)
npm run test:ui            # Unit tests with UI
npm run test:coverage      # Test coverage report
npm run test:e2e           # E2E tests (Playwright)
npm run test:e2e:ui        # E2E tests with UI
```

---

## Key Documentation Files

For deeper understanding, read these docs:

1. **Technical Guides**
   - `/docs/technical/01-ARCHITECTURE.md` - Architecture principles
   - `/docs/technical/02-CODING-CONVENTIONS.md` - Coding standards
   - `/docs/technical/03-COMPONENT-PATTERNS.md` - Component patterns
   - `/docs/technical/04-API-GUIDE.md` - API integration guide

2. **Specifications**
   - `/docs/specifications/` - Feature specifications
   - `/docs/README.md` - Documentation index

3. **Operations**
   - `/docs/operations/01-deployment.md` - Deployment guide
   - `/docs/operations/04-troubleshooting.md` - Common issues

---

## Environment Variables

```bash
# .env.local (development)
NEXT_PUBLIC_API_URL=http://localhost:8080/api
BACKEND_URL=http://localhost:8080/api
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=your_client_id

# Production
NEXT_PUBLIC_API_URL=https://mycamp.duckdns.org/api
BACKEND_URL=http://backend:8080/api
```

---

## Git Workflow

```bash
# Current branch
claude/claude-md-mi2k9r8iupu1t4dd-01WjCTg5n5Jzit4LNzCbnAXy

# Commit message format
<type>(<scope>): <subject>

# Examples
feat(campground): add search filter by amenities
fix(reservation): prevent double booking race condition
docs(claude): update CLAUDE.md with React 19 patterns
```

---

## Contact & Support

- **Documentation**: `/docs/README.md`
- **Issues**: Check `/docs/operations/04-troubleshooting.md`
- **API Spec**: `/docs/specifications/04-API-SPEC.md`
- **Component Library**: `/docs/technical/component-library.md`

---

**Remember**: When in doubt, check the `/docs` folder first. This codebase is well-documented!

---

**Last Updated**: 2025-11-17
**Version**: 2.0.0 (Sprint 4)
