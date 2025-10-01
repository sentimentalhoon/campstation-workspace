# CampStation 기능 구현 로드맵

## 🎯 프로젝트 개요
CampStation은 Spring Boot 백엔드와 Next.js 프론트엔드를 사용하는 풀스택 캠핑장 예약 시스템입니다.

## 📋 현재 상태
- ✅ Backend API 완성 (Spring Boot 3.5.6, JWT 인증, REST API)
- ✅ Frontend 기본 설정 (Next.js 15, TypeScript, Tailwind CSS)
- ✅ Docker 컨테이너화 및 CI/CD 파이프라인
- ✅ 데이터베이스 설계 및 마이그레이션

## 🚀 기능 구현 계획

### **Phase 1: 핵심 기능 (1-2주)**

#### 1. 사용자 인증 시스템 🔐
- ✅ **Backend**: JWT 토큰 기반 인증 API
- 🔄 **Frontend**:
  - [ ] 회원가입 페이지 (`/register`)
  - [ ] 로그인 페이지 (`/login`) - 기본 구조 완료
  - [ ] 비밀번호 재설정 기능
  - [ ] 프로필 관리 페이지
  - [ ] 인증 상태 관리 (React Context/Provider)
  - [ ] 보호된 라우트 컴포넌트

#### 2. 캠핑장 관리 🏕️
- ✅ **Backend**: 캠핑장 CRUD API
- 🔄 **Frontend**:
  - [ ] 캠핑장 목록 페이지 (`/campgrounds`)
  - [ ] 캠핑장 검색 및 필터링
  - [ ] 캠핑장 상세 페이지 (`/campgrounds/[id]`)
  - [ ] 이미지 갤러리
  - [ ] 위치 정보 표시
  - [ ] 캠핑장 등록/수정 (관리자 전용)

#### 3. 예약 시스템 📅
- ✅ **Backend**: 예약 CRUD API
- 🔄 **Frontend**:
  - [ ] 예약 캘린더 컴포넌트
  - [ ] 예약 폼 (날짜, 인원, 사이트 선택)
  - [ ] 예약 확인 페이지
  - [ ] 예약 목록 및 상세
  - [ ] 예약 취소/수정 기능

### **Phase 2: 고급 기능 (1-2주)**

#### 4. 리뷰 시스템 ⭐
- ✅ **Backend**: 리뷰 CRUD 및 통계 API
- 🔄 **Frontend**:
  - [ ] 리뷰 작성/수정/삭제
  - [ ] 리뷰 목록 및 페이징
  - [ ] 별점 표시 컴포넌트
  - [ ] 이미지 업로드
  - [ ] 리뷰 필터링 및 정렬

#### 5. 사용자 대시보드 👤
- 🔄 **Frontend**:
  - [ ] 대시보드 메인 페이지 (`/dashboard`)
  - [ ] 내 예약 목록
  - [ ] 내 리뷰 목록
  - [ ] 예약 히스토리
  - [ ] 프로필 설정

#### 6. 검색 및 필터링 🔍
- 🔄 **Frontend**:
  - [ ] 고급 검색 기능
  - [ ] 필터 옵션 (가격, 편의시설, 날짜 등)
  - [ ] 검색 결과 정렬
  - [ ] 검색 히스토리

### **Phase 3: 관리자 기능 (1주)**

#### 7. 관리자 패널 ⚙️
- 🔄 **Frontend**:
  - [ ] 관리자 대시보드 (`/admin`)
  - [ ] 캠핑장 관리
  - [ ] 예약 관리
  - [ ] 사용자 관리
  - [ ] 시스템 통계

#### 8. 게스트 예약 기능 👥
- ✅ **Backend**: 게스트 예약 API
- 🔄 **Frontend**:
  - [ ] 게스트 예약 폼
  - [ ] 예약 조회 기능
  - [ ] 이메일 확인

### **Phase 4: UI/UX 및 성능 (1주)**

#### 9. 공통 컴포넌트 🧩
- 🔄 **Frontend**:
  - [ ] 헤더/네비게이션 바
  - [ ] 푸터 컴포넌트
  - [ ] 검색 바 컴포넌트
  - [ ] 필터 컴포넌트
  - [ ] 모달/팝업 컴포넌트
  - [ ] 로딩 스피너
  - [ ] 에러 바운더리

#### 10. 반응형 디자인 📱
- 🔄 **Frontend**:
  - [ ] 모바일 최적화
  - [ ] 태블릿 지원
  - [ ] 데스크톱 레이아웃
  - [ ] 터치 인터랙션

#### 11. 성능 최적화 ⚡
- 🔄 **Frontend**:
  - [ ] 이미지 최적화 (Next.js Image)
  - [ ] 코드 스플리팅
  - [ ] API 응답 캐싱
  - [ ] SEO 최적화
  - [ ] Core Web Vitals 개선

## 🛠️ 기술 스택

### Backend
- Spring Boot 3.5.6
- Java 21
- Spring Security + JWT
- Spring Data JPA
- MariaDB/MySQL
- Redis
- Gradle

### Frontend
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- React Hook Form
- React Query (선택사항)
- Jest + React Testing Library

### DevOps
- Docker & Docker Compose
- GitHub Actions CI/CD
- ESLint + Prettier

## 📊 진행 상황 추적

- [x] 프로젝트 초기 설정
- [x] Backend API 개발
- [x] Frontend 기본 설정
- [x] Docker 컨테이너화
- [x] CI/CD 파이프라인
- [ ] Phase 1: 핵심 기능 구현
- [ ] Phase 2: 고급 기능 구현
- [ ] Phase 3: 관리자 기능 구현
- [ ] Phase 4: UI/UX 및 성능 최적화
- [ ] 테스트 및 QA
- [ ] 프로덕션 배포

## 🎯 다음 단계 권장사항

1. **즉시 시작**: 캠핑장 목록 페이지 구현
2. **병렬 진행**: 공통 컴포넌트와 인증 시스템
3. **우선순위**: 사용자 경험 중심 기능 먼저
4. **테스트**: 각 기능 구현 후 단위/통합 테스트

---

*마지막 업데이트: 2025년 9월 29일*