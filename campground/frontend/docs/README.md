# CampStation Frontend 개발 가이드

> Next.js 16 + React 19 + TypeScript + Tailwind 4 기반 캠핑장 예약 플랫폼

## 📚 문서 목차

### 🔧 기술 문서 (Technical Docs)

코드 작성 방법, 아키텍처, 컨벤션 등 "어떻게 코드를 작성할지"에 대한 문서

- **[00. 프로젝트 구조](./technical/00-PROJECT-STRUCTURE.md)** - 폴더 구조, 파일 명명 규칙, Import 순서
- **[01. 아키텍처](./technical/01-ARCHITECTURE.md)** - 기술 스택, 설계 원칙, 상태 관리
- **[02. 코딩 컨벤션](./technical/02-CODING-CONVENTIONS.md)** - 코드 스타일, 네이밍, 베스트 프랙티스
- **[03. 컴포넌트 패턴](./technical/03-COMPONENT-PATTERNS.md)** - 컴포넌트 설계 및 작성 가이드
- **[04. API 가이드](./technical/04-API-GUIDE.md)** - API 클라이언트, 에러 처리, React Query
- **[05. 상태 관리](./technical/05-STATE-MANAGEMENT.md)** - Server/Client/URL State 관리 전략
- **[캐싱 전략](./technical/caching-strategy.md)** ✨ - React Query 캐싱 전략 (Sprint 4)
- **[컴포넌트 라이브러리](./technical/component-library.md)** ✨ - UI 컴포넌트 사용 가이드
- **[성능 최적화](./technical/performance-optimization.md)** ✨ - 번들, React, 이미지 최적화
- **[Lighthouse 테스트](./technical/lighthouse-testing-guide.md)** ✨ - 성능 측정 가이드
- **[디자인 시스템](./technical/design-system.md)** - 색상, 타이포그래피, 컴포넌트 디자인
- **[변경사항 로그](./technical/CHANGELOG-REFACTOR.md)** - 리팩토링 히스토리

---

### 📋 명세 문서 (Specifications)

무엇을 만들지, 어떤 기능이 필요한지에 대한 문서

- **[명세 문서 목차](./specifications/README.md)** - 전체 명세 문서 인덱스
- **[01. 기능 목록](./specifications/01-FEATURES.md)** - 기능별 우선순위 및 상태
- **[02. 사용자 플로우](./specifications/02-USER-FLOWS.md)** - 8가지 사용자 시나리오
- **[03. 페이지 명세](./specifications/03-PAGES.md)** - 13개 페이지 상세 스펙
- **[04. API 명세](./specifications/04-API-SPEC.md)** - 백엔드 API 엔드포인트
- **[05. 데이터 모델](./specifications/05-DATA-MODELS.md)** - TypeScript 타입 정의
- **[06. 화면 레이아웃](./specifications/06-SCREEN-LAYOUTS.md)** - 화면별 레이아웃 다이어그램
- **[07. 컴포넌트 명세](./specifications/07-COMPONENTS-SPEC.md)** - 38개 컴포넌트 스펙
- **[08. 개발 로드맵](./specifications/08-ROADMAP.md)** - 5개 스프린트 개발 계획
- **[09. MVP 범위](./specifications/09-MVP-SCOPE.md)** - MVP 단계 정의

---

### 🏃 스프린트 문서 (Sprints)

프로젝트 진행 상황 및 스프린트별 작업 내용

- **[Sprint 0](./sprints/sprint-0.md)** - 프로젝트 초기 설정 (100% 완료)
- **[Sprint 1](./sprints/sprint-1.md)** - 기본 레이아웃 및 인증 (100% 완료)
- **[Sprint 2](./sprints/sprint-2.md)** - 캠핑장 검색 및 상세 (100% 완료)
- **[Sprint 3](./sprints/sprint-3.md)** - 예약 시스템 (100% 완료)
- **[Sprint 4](./sprints/sprint-4.md)** ✅ - 성능 최적화 및 UX 개선 (93% 완료)
- **[Sprint 5](./sprints/sprint-5.md)** 📝 - E2E 테스트 및 추가 기능 (계획)

---

### 🧪 테스트 문서 (Testing)

테스트 전략 및 가이드

- **[E2E 테스트 가이드](./testing/e2e-testing-guide.md)** ✨ - Playwright 기반 E2E 테스트
- **[통합 테스트](./testing/integration-tests.md)** - React Query 통합 테스트

---

### 🚀 운영 문서 (Operations)

배포, 환경 설정, 모니터링, 개발 워크플로우

- **[운영 문서 목차](./operations/README.md)** - 전체 운영 문서 인덱스
- **[01. 배포 가이드](./operations/01-deployment.md)** - Docker 배포 및 DDNS 설정
- **[02. 환경 변수](./operations/02-environment.md)** - 환경 변수 관리
- **[03. 모니터링](./operations/03-monitoring.md)** - 로그 및 성능 모니터링
- **[04. 문제 해결](./operations/04-troubleshooting.md)** - 트러블슈팅 가이드
- **[05. 보안](./operations/05-security.md)** - 보안 체크리스트
- **[06. 운영 매뉴얼](./operations/06-operations-manual.md)** ✨ - 일일/주간/월간 운영
- **[07. API 통합](./operations/07-api-integration.md)** ✨ - Frontend-Backend API 통합
- **[08. 개발 워크플로우](./operations/08-development-workflow.md)** ✨ - Git, 브랜치, 코드 리뷰

---

## 🚀 빠른 시작

### 1. 새로운 페이지 만들기

```bash
# 1. 타입 정의
types/domain/newFeature.ts

# 2. API 함수
lib/api/newFeature.ts

# 3. Custom Hook
hooks/features/useNewFeature.ts

# 4. UI 컴포넌트
components/features/newFeature/NewFeatureCard.tsx

# 5. 페이지
app/new-feature/page.tsx
```

### 2. 새로운 컴포넌트 만들기

```typescript
// components/features/example/ExampleCard.tsx
"use client"; // 필요한 경우만

import { Card } from "@/components/ui/Card";
import type { Example } from "@/types/domain/example";

type ExampleCardProps = {
  data: Example;
  onClick?: (id: number) => void;
};

export function ExampleCard({ data, onClick }: ExampleCardProps) {
  return (
    <Card onClick={() => onClick?.(data.id)}>
      <h3>{data.title}</h3>
      <p>{data.description}</p>
    </Card>
  );
}
```

### 3. API 호출하기

```typescript
// lib/api/example.ts
import { apiClient } from "./client";
import type { Example } from "@/types/domain/example";

export const exampleApi = {
  getAll: () => apiClient<Example[]>("/v1/examples"),
  getById: (id: number) => apiClient<Example>(`/v1/examples/${id}`),
  create: (data: CreateExampleDto) =>
    apiClient<Example>("/v1/examples", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// hooks/features/useExamples.ts
import { useQuery } from "@tanstack/react-query";

export function useExamples() {
  return useQuery({
    queryKey: ["examples"],
    queryFn: exampleApi.getAll,
  });
}

// Component
function ExampleList() {
  const { data, isLoading } = useExamples();
  // ...
}
```

## 📋 체크리스트

### 새 기능 개발 시

- [ ] 타입 정의 (`types/domain/`)
- [ ] API 함수 작성 (`lib/api/`)
- [ ] Custom Hook 작성 (`hooks/features/`)
- [ ] UI 컴포넌트 작성 (`components/features/`)
- [ ] 페이지 통합 (`app/`)
- [ ] 에러 처리 구현
- [ ] 로딩 상태 처리
- [ ] 모바일 반응형 확인
- [ ] TypeScript 타입 에러 없음
- [ ] ESLint 경고 없음

### 코드 리뷰 시

- [ ] 네이밍이 명확한가?
- [ ] 타입이 제대로 지정되었는가?
- [ ] Server/Client Component 올바르게 구분되었는가?
- [ ] 에러 처리가 적절한가?
- [ ] React 19 기능 활용 (useOptimistic, useTransition)
- [ ] memo/useMemo/useCallback을 불필요하게 사용하지 않았는가? (React Compiler 사용 중)
- [ ] 200줄 이하로 컴포넌트 분리되었는가?
- [ ] Props 타입이 명시적인가?

## 🛠️ 개발 도구

### VSCode 확장 프로그램 (권장)

- **ESLint**: 코드 품질 검사
- **Prettier**: 코드 포맷팅
- **Tailwind CSS IntelliSense**: Tailwind 자동완성
- **TypeScript Error Translator**: 타입 에러 번역
- **Error Lens**: 인라인 에러 표시

### 유용한 명령어

```bash
# 개발 서버 시작
npm run dev

# 프로덕션 빌드
npm run build

# 타입 체크
npm run type-check

# Lint 검사
npm run lint

# Prettier 포맷팅
npm run format
```

## 📖 추가 참고 자료

### 공식 문서

- [Next.js 16](https://nextjs.org/docs)
- [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Tailwind CSS 4](https://tailwindcss.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)

### 내부 문서

- [기술 문서 전체 목록](./technical/) - 아키텍처, 코딩 컨벤션, 컴포넌트 패턴
- [명세 문서 전체 목록](./specifications/) - 기능, 페이지, API, 컴포넌트 명세

## 🤝 기여 가이드

1. 이 문서들을 먼저 읽기
2. 새로운 패턴 발견 시 문서 업데이트
3. 팀원과 논의 후 규칙 변경
4. 예시 코드는 실제 프로젝트 기반

## ❓ FAQ

**Q: React.memo, useMemo, useCallback을 사용해야 하나요?**  
A: **아니요! React 19 Compiler가 자동으로 최적화합니다.** 수동으로 사용하지 마세요. 극히 드물게 useEffect 의존성 배열에 함수가 필요한 경우에만 useCallback을 고려하세요.

**Q: Server Component와 Client Component 중 어떤 걸 쓰나요?**  
A: 기본은 Server Component. useState, useEffect, onClick 등이 필요한 경우에만 Client Component (`"use client"`).

**Q: 상태를 어디에 저장하나요?**  
A: API 데이터 → React Query, 전역 상태 → Context, URL 공유 → Search Params, 나머지 → useState

**Q: 타입을 어디에 정의하나요?**  
A: 도메인 모델은 `types/domain/`, API 타입은 `types/api/`, Props는 컴포넌트 파일 내부 또는 `types/ui/`

**Q: API 호출은 어디서 하나요?**
A: Server Component는 직접 호출, Client Component는 Custom Hook을 통해 React Query 사용.

## 📝 변경 이력

- **2025-01-27** (Sprint 4): 성능 최적화 문서 추가
  - 캐싱 전략 문서
  - 컴포넌트 라이브러리 문서
  - 성능 최적화 가이드
  - Lighthouse 테스트 가이드
  - E2E 테스트 가이드
  - 운영 매뉴얼 (일일/주간/월간)
  - API 통합 가이드
  - 개발 워크플로우 가이드
- **2025-01-09**: 초기 문서 작성

---

**작성자**: CampStation Team  
**최종 수정일**: 2025-01-27  
**버전**: 2.0.0 (Sprint 4 완료)
