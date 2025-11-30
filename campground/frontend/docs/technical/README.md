# 기술 문서 (Technical Documentation)

> "어떻게 코드를 작성할지"에 대한 가이드

## 📚 문서 목록

### [00. 프로젝트 구조](./00-PROJECT-STRUCTURE.md)

프로젝트 폴더 구조, 파일 명명 규칙, Import 순서 등 프로젝트 전체 구조에 대한 가이드

**주요 내용**:

- 디렉토리 구조 및 역할
- 파일 명명 규칙 (PascalCase, camelCase 등)
- Route Groups 사용법
- 컴포넌트 분류 기준 (ui, layout, features)
- Import 순서 및 절대 경로 설정

---

### [01. 아키텍처](./01-ARCHITECTURE.md)

핵심 기술 스택과 아키텍처 설계 원칙

**주요 내용**:

- Server-First Architecture
- API Layer 3-Tier 구조
- 상태 관리 전략 (Server State, Client State, URL State)
- 에러 처리 계층별 전략
- 타입 안전성 보장 방법
- React 19 + Next.js 16 성능 최적화
- 보안 원칙 (HttpOnly Cookie, Server-side secrets)

---

### [02. 코딩 컨벤션](./02-CODING-CONVENTIONS.md)

코드 스타일, 네이밍 규칙, 베스트 프랙티스

**주요 내용**:

- 네이밍 규칙 (변수, 함수, 타입, 컴포넌트)
- Import 순서
- 컴포넌트 구조 (Hooks → Handlers → Render)
- 함수 작성 규칙 (Arrow vs Function Declaration)
- JSX/TSX 스타일 가이드
- 타입 정의 스타일 (Type vs Interface)
- 주석 작성 규칙
- ESLint & Prettier 설정
- Git 커밋 메시지 규칙

---

### [03. 컴포넌트 패턴](./03-COMPONENT-PATTERNS.md)

컴포넌트 설계 및 작성 가이드

**주요 내용**:

- Server vs Client Component
- Compound Component Pattern
- Render Props Pattern
- Custom Hooks
- Props 설계 원칙
- 성능 최적화 (React Compiler, Suspense)
- 베스트 프랙티스 (상태 최소화, 캐시 활용)

---

### [04. API 가이드](./04-API-GUIDE.md)

API 통신 및 데이터 페칭 가이드

**주요 내용**:

- API Client 구조 (3-Tier)
- React Query 사용법
- 에러 처리 전략
- 인증/인가 (JWT, HttpOnly Cookie)
- 타입 안전성 보장
- 캐싱 전략

---

### [05. 상태 관리](./05-STATE-MANAGEMENT.md)

상태 관리 전략 및 패턴

**주요 내용**:

- Server State (React Query)
- Client State (Context API)
- URL State (Search Params)
- Form State (Controlled Components)
- 상태 선택 기준
- 베스트 프랙티스

---

### [디자인 시스템](./design-system.md)

UI/UX 디자인 시스템

**주요 내용**:

- 색상 팔레트
- 타이포그래피
- 간격 시스템
- 컴포넌트 디자인 가이드
- 반응형 디자인 (모바일 퍼스트)
- 접근성 (Accessibility)

---

### [변경사항 로그](./CHANGELOG-REFACTOR.md)

프로젝트 리팩토링 히스토리 및 주요 변경사항

---

## 🎯 사용 가이드

### 새로운 개발자가 읽어야 할 순서

1. **[00. 프로젝트 구조](./00-PROJECT-STRUCTURE.md)** - 전체 구조 파악
2. **[01. 아키텍처](./01-ARCHITECTURE.md)** - 기술 스택 이해
3. **[02. 코딩 컨벤션](./02-CODING-CONVENTIONS.md)** - 코드 작성 규칙
4. **[03. 컴포넌트 패턴](./03-COMPONENT-PATTERNS.md)** - 컴포넌트 작성법
5. **[04. API 가이드](./04-API-GUIDE.md)** - API 통신 방법
6. **[디자인 시스템](./design-system.md)** - UI 작성 가이드

### 특정 작업 시 참고할 문서

**새로운 페이지 만들 때**:

- [00. 프로젝트 구조](./00-PROJECT-STRUCTURE.md) - 파일 위치
- [03. 컴포넌트 패턴](./03-COMPONENT-PATTERNS.md) - 컴포넌트 작성
- [디자인 시스템](./design-system.md) - UI 디자인

**API 연동할 때**:

- [04. API 가이드](./04-API-GUIDE.md) - API 클라이언트
- [05. 상태 관리](./05-STATE-MANAGEMENT.md) - React Query

**상태 관리할 때**:

- [05. 상태 관리](./05-STATE-MANAGEMENT.md) - 상태 선택 기준
- [03. 컴포넌트 패턴](./03-COMPONENT-PATTERNS.md) - Context 패턴

**코드 리뷰할 때**:

- [02. 코딩 컨벤션](./02-CODING-CONVENTIONS.md) - 스타일 체크
- [01. 아키텍처](./01-ARCHITECTURE.md) - 설계 원칙 확인

---

## 📌 관련 링크

- [명세 문서 전체](../specifications/README.md) - 무엇을 만들지
- [프로젝트 루트 문서](../README.md) - 전체 문서 인덱스
