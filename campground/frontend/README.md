# CampStation Frontend

> 모바일 전용 캠핑장 예약 플랫폼 - Next.js 16 + React 19 + TypeScript

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)]()
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)]()
[![React](https://img.shields.io/badge/React-19.2-blue)]()

## ✨ 주요 기능

- 🏕️ **캠핑장 검색 및 예약**: 전국 캠핑장 검색, 실시간 예약 시스템
- ⭐ **리뷰 시스템**: 이미지 업로드 지원, 별점 평가
- ❤️ **찜하기 기능**: 관심 캠핑장 저장 및 관리
- 💳 **토스페이먼츠 연동**: 안전한 결제 시스템
- 👤 **사용자 관리**: 회원가입, 로그인, 프로필 관리
- 📱 **모바일 최적화**: 반응형 디자인, PWA 지원

## 🚀 시작하기

### 로컬 개발 환경

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

개발 서버가 실행되면 [http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

### 도커 환경

**개발 환경 실행:**

```bash
# 프로젝트 루트 디렉토리에서
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

**프로덕션 환경 실행:**

```bash
# 프로젝트 루트 디렉토리에서
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up

# 또는 DDNS 도메인으로 접속 (mycamp.duckdns.org)
# 원격 서버에서 실행 시 자동으로 http://mycamp.duckdns.org 에서 접속 가능
```

**개별 서비스만 실행:**

```bash
# 프론트엔드만 실행
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up frontend

# 백그라운드 실행
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

## 📦 기술 스택

- **Framework**: Next.js 16 (App Router)
- **React**: 19.2.0 (React Compiler 활성화)
- **TypeScript**: 5+
- **Styling**: Tailwind CSS 4
- **State Management**: TanStack Query (React Query) v5
- **Date Library**: date-fns v4
- **Package Manager**: npm

## 🏗️ 프로젝트 구조

```
frontend/
├── app/                      # Next.js App Router
│   ├── (auth)/              # 인증 페이지
│   ├── campgrounds/         # 캠핑장 페이지
│   └── layout.tsx           # Root Layout
├── components/
│   ├── ui/                  # 재사용 가능한 UI 컴포넌트
│   ├── layout/              # 레이아웃 컴포넌트
│   ├── features/            # 기능별 컴포넌트
│   └── providers/           # Context Providers
├── contexts/                # React Context
├── hooks/                   # Custom Hooks
├── lib/
│   ├── api/                 # API 클라이언트
│   ├── utils/               # 유틸리티 함수
│   └── constants/           # 상수
├── types/
│   ├── domain/              # 도메인 타입
│   └── api/                 # API 타입
└── docs/                    # 프로젝트 문서
```

## 📱 디자인 시스템

이 프로젝트는 **모바일 전용** (최대 640px)으로 설계되었습니다.

- 최대 너비: 640px
- 최소 터치 영역: 44x44px
- 터치 최적화 UI
- 모바일 UX 패턴

자세한 내용은 [디자인 시스템 문서](./docs/design-system.md)를 참조하세요.

## 🛠️ 개발 스크립트

```bash
# 개발 서버 (Hot reload)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 린트 검사
npm run lint

# 린트 자동 수정
npm run lint:fix

# 코드 포맷팅
npm run format

# 타입 체크
npm run type-check

# 테스트 실행
npm run test

# 테스트 (UI 모드)
npm run test:ui

# 테스트 커버리지
npm run test:coverage

# 번들 분석 (Windows)
npm install -D cross-env
npm run build:analyze
```

## 📊 프로젝트 현황 (Sprint 4 완료)

### 완료된 기능

- ✅ **찜하기 시스템**: 낙관적 업데이트, 캐시 무효화
- ✅ **이미지 업로드**: MinIO S3 연동, 드래그앤드롭
- ✅ **성능 최적화**: React Query 캐싱 전략 수립
- ✅ **UX 개선**: 통합 상태 핸들러, 접근성 향상
- ✅ **SEO 최적화**: Open Graph, Twitter Card
- ✅ **테스트**: Vitest 환경, 단위 테스트 5개

### 성능 지표

- **빌드 시간**: 7.9초
- **First Load JS**: 409.49KB
- **Routes**: 19개
- **TypeScript 에러**: 0개
- **테스트 통과**: 5/5

### 다음 계획 (Sprint 5)

- 🔜 지도 검색 기능 (Naver Maps SDK)
- 🔜 E2E 테스트 (Playwright)
- 🔜 번들 크기 최적화 (목표: < 350KB)
- 🔜 관리자 대시보드

## 📚 문서

프로젝트 문서는 `docs/` 폴더에서 확인할 수 있습니다:

### 아키텍처 & 명세

- [프로젝트 구조](./docs/specifications/00-PROJECT-STRUCTURE.md)
- [아키텍처](./docs/specifications/01-ARCHITECTURE.md)
- [코딩 컨벤션](./docs/specifications/02-CODING-CONVENTIONS.md)
- [컴포넌트 패턴](./docs/specifications/03-COMPONENT-PATTERNS.md)
- [API 가이드](./docs/specifications/04-API-GUIDE.md)
- [상태 관리](./docs/specifications/05-STATE-MANAGEMENT.md)

### 스프린트 문서

- [Sprint 0](./docs/sprints/sprint-0.md) - 프로젝트 세팅
- [Sprint 1](./docs/sprints/sprint-1.md) - 캠핑장 상세 및 예약 기초
- [Sprint 2](./docs/sprints/sprint-2.md) - 결제 및 예약 관리
- [Sprint 3](./docs/sprints/sprint-3.md) - 네비게이션 및 UX 개선
- [Sprint 4](./docs/sprints/sprint-4.md) - 찜하기, 이미지 업로드, 최적화 ✅
- [Sprint 5](./docs/sprints/sprint-5.md) - 지도 검색, E2E 테스트 (예정)

### 기술 문서

- [캐싱 전략](./docs/technical/caching-strategy.md) - React Query 최적화
- [Lighthouse 테스팅 가이드](./docs/technical/lighthouse-testing-guide.md)

### 운영 문서

- [배포 가이드](./docs/operations/01-deployment.md)
- [환경 변수](./docs/operations/02-environment.md)
- [모니터링](./docs/operations/03-monitoring.md)
- [트러블슈팅](./docs/operations/04-troubleshooting.md)
- [보안](./docs/operations/05-security.md)

## 🐳 도커 설정

### Dockerfile

- `Dockerfile`: 프로덕션 환경용 (Multi-stage build, Standalone output)
- `Dockerfile.dev`: 개발 환경용 (Hot reload 지원)

### 환경 변수

환경별로 적절한 환경 변수 파일을 사용하세요:

**로컬 개발:**

```bash
cp .env.example .env.local
# .env.local 파일 수정 (localhost 기반 API URL)
```

**프로덕션 (DDNS):**

```bash
# .env.production 파일이 이미 준비되어 있습니다
# http://mycamp.duckdns.org 도메인 사용
# 필요시 API 키 등을 업데이트하세요
```

주요 환경 변수:

- `NEXT_PUBLIC_API_URL`: Backend API 엔드포인트
- `BACKEND_URL`: SSR에서 사용하는 내부 Backend URL
- `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`: Naver Map API 클라이언트 ID

## 🔗 관련 링크

- [Next.js Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)

## 📄 라이선스

이 프로젝트는 CampStation 팀의 소유입니다.
