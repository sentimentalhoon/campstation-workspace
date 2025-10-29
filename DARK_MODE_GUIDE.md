# 다크모드 적용 가이드

## 완료된 작업 ✅

### 1. 테마 시스템 기초 구축

- ✅ `ThemeContext` 생성 (`src/contexts/ThemeContext.tsx`)
- ✅ `ThemeProvider` 추가 (`AppProviders`에 통합)
- ✅ `ThemeToggle` 버튼 컴포넌트 생성 (`src/components/ui/ThemeToggle.tsx`)
- ✅ `globals.css`에 다크모드 변수 추가

### 2. 홈페이지 (/) 부분 수정 완료

- ✅ `HomeLandingShell.tsx` - 라이트 모드 기본, 다크모드 클래스 추가
- ✅ `HeroSection.tsx` - 전체 라이트/다크 모드 지원
- ✅ `QuickFilterRow.tsx` - 전체 라이트/다크 모드 지원

---

## 남은 작업 📋

### 1. 홈페이지 나머지 컴포넌트 수정

**파일 위치:**

- `frontend/src/components/home/sections/FeaturedCampgroundSection.tsx`
- `frontend/src/components/home/sections/RecentCampgroundList.tsx`

**적용 패턴:**

```tsx
// 기존 (다크 테마만)
className = "bg-white/5 border-white/10 text-slate-100";

// 변경 후 (라이트 기본 + 다크 지원)
className =
  "bg-white border-gray-200 text-gray-900 dark:bg-white/5 dark:border-white/10 dark:text-slate-100";
```

**주요 변경 포인트:**

1. `bg-` 클래스: 흰색 배경 기본, `dark:` 접두사로 다크 모드 추가
2. `border-` 클래스: `gray-200` 기본, `dark:white/10`
3. `text-` 클래스: `gray-900` 기본, `dark:text-white` 또는 `dark:text-slate-100`
4. 그라데이션 배경: 투명도 낮춰서 라이트 모드에 맞게 조정

---

### 2. 예약 페이지 (/reservations) 수정

**파일:** `frontend/src/app/reservations/ReservationsClient.tsx`

**적용해야 할 패턴:**

#### 배경색

```tsx
// 기존
className = "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950";

// 변경 후
className =
  "bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950";
```

#### 카드 배경

```tsx
// 기존
className = "bg-white/5 backdrop-blur";

// 변경 후
className = "bg-white shadow-lg dark:bg-white/5 dark:backdrop-blur";
```

#### 테두리

```tsx
// 기존
className = "border-white/10";

// 변경 후
className = "border-gray-200 dark:border-white/10";
```

#### 텍스트

```tsx
// 기존
className = "text-slate-100";

// 변경 후
className = "text-gray-900 dark:text-slate-100";
```

**변경해야 할 주요 영역:**

1. 로딩 스피너 배경 (line ~174)
2. UnauthorizedNotice 배경 (line ~182)
3. 메인 컨테이너 배경 (line ~216)
4. 예약 카드 스타일 (line ~339)
5. 상태 배지 색상 (getStatusColor 함수 - 라이트 모드용 색상 추가)

---

### 3. 사용자 대시보드 (/dashboard/user) 수정

**파일:** `frontend/src/app/dashboard/user/DashboardClient.tsx`

**MobileCard 컴포넌트 수정:**

```tsx
// 기존 (line ~86)
<div
  className={`
    bg-white/5 backdrop-blur rounded-3xl border border-white/10 p-6
    transition-all duration-300 ease-out
    ${hover ? "hover:bg-white/10 hover:border-white/20 active:scale-[0.98]" : ""}
    ...
  `}
>

// 변경 후
<div
  className={`
    bg-white border-gray-200 rounded-3xl shadow-lg p-6
    dark:bg-white/5 dark:backdrop-blur dark:border-white/10
    transition-all duration-300 ease-out
    ${hover ? "hover:shadow-xl dark:hover:bg-white/10 dark:hover:border-white/20 active:scale-[0.98]" : ""}
    ...
  `}
>
```

**변경해야 할 주요 섹션:**

1. 메인 배경 그라데이션 (line ~223)
2. 프로필 카드 (line ~235)
3. 탭 버튼 스타일 (line ~270+)
4. 모든 MobileCard 사용 영역

**하위 탭 컴포넌트들:**

- `frontend/src/components/dashboard/user/OverviewTab.tsx`
- `frontend/src/components/dashboard/user/ReservationsTab.tsx`
- `frontend/src/components/dashboard/user/ReviewsTab.tsx`
- `frontend/src/components/dashboard/user/FavoritesTab.tsx`
- `frontend/src/components/dashboard/user/ProfileTab.tsx`

---

### 4. Header에 테마 토글 버튼 추가

**파일:** `frontend/src/components/layout/Header.tsx`

**추가 위치:** 프로필 버튼 옆 또는 모바일 메뉴 안

```tsx
import { ThemeToggle } from "@/components/ui/ThemeToggle";

// 데스크톱 헤더 (프로필 메뉴 옆)
<div className="flex items-center gap-3">
  <ThemeToggle />
  {/* 기존 프로필 버튼 */}
</div>

// 모바일 메뉴 안
<div className="flex items-center justify-between p-4">
  <ThemeToggle />
  {/* 다른 메뉴 항목들 */}
</div>
```

---

## 자동 적용 스크립트 (선택사항)

복잡한 변경이 많으므로, 점진적으로 페이지별로 테스트하며 적용하는 것을 권장합니다.

### 빠른 테스트 방법

1. **현재 페이지에서 다크모드 토글 테스트:**

   - 브라우저 개발자 도구 콘솔에서:

   ```javascript
   document.documentElement.classList.toggle("dark");
   ```

2. **Tailwind 다크모드 클래스 확인:**
   - 모든 `dark:` 접두사가 붙은 클래스는 `.dark` 클래스가 `<html>` 태그에 있을 때만 적용됩니다.

---

## 색상 매핑 참고표

| 요소            | 라이트 모드                          | 다크 모드                                      |
| --------------- | ------------------------------------ | ---------------------------------------------- |
| **배경**        | `bg-white`, `bg-gray-50`             | `dark:bg-slate-900`, `dark:bg-white/5`         |
| **카드**        | `bg-white shadow-lg`                 | `dark:bg-white/5 dark:backdrop-blur`           |
| **텍스트**      | `text-gray-900`, `text-gray-700`     | `dark:text-white`, `dark:text-slate-100`       |
| **보조 텍스트** | `text-gray-600`, `text-gray-500`     | `dark:text-slate-300`, `dark:text-slate-400`   |
| **테두리**      | `border-gray-200`, `border-gray-300` | `dark:border-white/10`, `dark:border-white/20` |
| **호버 효과**   | `hover:bg-gray-50`                   | `dark:hover:bg-white/10`                       |
| **버튼 (주요)** | `bg-blue-600 hover:bg-blue-700`      | `dark:bg-sky-500 dark:hover:bg-sky-600`        |
| **버튼 (보조)** | `bg-white border-gray-300`           | `dark:bg-white/5 dark:border-white/10`         |

---

## 우선순위

1. **높음**: Header에 ThemeToggle 추가 (사용자가 테마를 전환할 수 있어야 함)
2. **높음**: 홈페이지 (/) 나머지 컴포넌트
3. **중간**: 예약 페이지 (/reservations)
4. **중간**: 대시보드 페이지 (/dashboard/user)
5. **낮음**: 나머지 페이지들 (필요시 동일한 패턴 적용)

---

## 주의사항

1. **그라데이션 배경**: 라이트 모드에서는 투명도를 낮춰서 (예: `/25` → `/15`) 너무 진하지 않게
2. **백드롭 블러**: 라이트 모드에서는 일반 `shadow-lg`로 충분할 수 있음
3. **상태 배지**: 각 상태별로 라이트/다크 모드 색상 매핑 필요
4. **이미지**: 다크 모드에서는 `brightness-90` 같은 필터를 추가할 수 있음
5. **포커스 링**: 접근성을 위해 `focus:ring-2` + 색상 추가

---

## 테스트 체크리스트

- [ ] 라이트 모드에서 모든 텍스트가 읽기 쉬운가?
- [ ] 다크 모드에서 모든 텍스트가 읽기 쉬운가?
- [ ] 테마 전환이 부드럽게 작동하는가?
- [ ] localStorage에 테마 설정이 저장되는가?
- [ ] 새로고침 후에도 테마가 유지되는가?
- [ ] 시스템 설정에 따라 초기 테마가 결정되는가?

---

## 도움이 필요한 경우

각 파일별로 구체적인 줄 번호와 변경 내용이 필요하면 말씀해주세요!
