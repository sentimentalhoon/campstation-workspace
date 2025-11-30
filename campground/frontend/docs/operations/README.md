# 운영 문서 (Operations Documentation)

> 배포, 환경 설정, 모니터링, 문제 해결, API 통합, 개발 워크플로우 가이드

## 📚 문서 목록

### [01. 배포 가이드](./01-deployment.md)

Docker 기반 배포 및 DDNS 설정 가이드

**주요 내용**:

- 로컬 개발 환경 설정
- Docker Compose를 이용한 배포
- DDNS (mycamp.duckdns.org) 설정
- 프로덕션 배포 체크리스트
- 롤백 전략

---

### [02. 환경 변수 가이드](./02-environment.md)

환경 변수 설정 및 관리 가이드

**주요 내용**:

- 환경 변수 목록 및 설명
- 개발/프로덕션 환경별 설정
- API 키 관리 (.env.keys)
- 보안 주의사항
- Docker 환경 변수 전달

---

### [03. 모니터링 & 로깅](./03-monitoring.md)

애플리케이션 모니터링 및 로그 관리

**주요 내용**:

- Docker 로그 확인 방법
- 에러 로그 분석
- 성능 모니터링 (Sprint 4 메트릭 포함)
- 헬스 체크
- 알림 설정

**Sprint 4 추가**: 빌드 성능, 번들 크기, 목표 메트릭

---

### [04. 문제 해결 가이드](./04-troubleshooting.md)

자주 발생하는 문제 및 해결 방법

**주요 내용**:

- 빌드 실패 해결
- API 연결 실패 해결
- Docker 컨테이너 문제
- 환경 변수 누락 문제
- CORS 에러 해결
- 성능 문제 디버깅

**Sprint 4 추가**: QueryStateHandler 관련 문제 해결

---

### [05. 보안 체크리스트](./05-security.md)

보안 설정 및 점검 가이드

**주요 내용**:

- 환경 변수 보안
- API 키 관리
- CORS 설정
- JWT 토큰 관리
- HTTPS 설정 (향후)
- 보안 헤더 설정

---

### [06. 운영 매뉴얼](./06-operations-manual.md) ✨ New

일일/주간/월간 운영 및 유지보수 가이드

**주요 내용**:

- Daily Operations (09:00 체크리스트)
- Weekly Maintenance (Monday 10:00)
- Monthly Checks (1st of month)
- Incident Response (P0-P3 severity levels)
- Backup & Recovery procedures
- Performance monitoring (Core Web Vitals)
- Security checklist
- Emergency contacts

---

### [07. API 통합 가이드](./07-api-integration.md) ✨ New

Frontend와 Backend API 통합 및 사용 가이드

**주요 내용**:

- API 구조 및 Base URL
- JWT 인증 시스템
- API 클라이언트 (Axios)
- React Query 통합
- 에러 처리 (ApiError 클래스)
- 캐싱 전략
- 베스트 프랙티스

---

### [08. 개발 워크플로우](./08-development-workflow.md) ✨ New

프로젝트 개발 프로세스 및 협업 가이드

**주요 내용**:

- 개발 환경 설정
- Git 워크플로우 (Conventional Commits)
- 브랜치 전략 (feature/fix/docs/hotfix)
- 코드 리뷰 체크리스트
- 테스트 프로세스
- 배포 프로세스
- 트러블슈팅

---

## 🎯 빠른 참조

### 긴급 상황 대응

**서비스가 다운된 경우** (P0):

1. [운영 매뉴얼](./06-operations-manual.md) - Incident Response 절차
2. [모니터링 가이드](./03-monitoring.md) - 로그 확인
3. [문제 해결 가이드](./04-troubleshooting.md) - 일반적인 문제 확인
4. [배포 가이드](./01-deployment.md) - 롤백 절차

**새로운 개발자 온보딩**:

1. [개발 워크플로우](./08-development-workflow.md) - 개발 환경 설정
2. [환경 변수 가이드](./02-environment.md) - .env 파일 설정
3. [API 통합 가이드](./07-api-integration.md) - API 사용법
4. [배포 가이드](./01-deployment.md) - Docker 배포

**API 개발 시작**:

1. [API 통합 가이드](./07-api-integration.md) - API 클라이언트 사용법
2. [개발 워크플로우](./08-development-workflow.md) - 브랜치 전략, 커밋 규칙
3. [문제 해결 가이드](./04-troubleshooting.md) - API 연결 문제

**성능 문제 발생**:

1. [모니터링 가이드](./03-monitoring.md) - 성능 지표 확인
2. [문제 해결 가이드](./04-troubleshooting.md) - 성능 디버깅
3. [운영 매뉴얼](./06-operations-manual.md) - Performance Monitoring

**정기 유지보수**:

1. [운영 매뉴얼](./06-operations-manual.md) - Daily/Weekly/Monthly 체크리스트
2. [보안 체크리스트](./05-security.md) - 보안 점검
3. [모니터링 가이드](./03-monitoring.md) - 헬스 체크

---

## 📌 관련 링크

- [기술 문서](../technical/README.md) - 코드 작성 가이드
- [명세 문서](../specifications/README.md) - 기능 명세
- [테스트 문서](../testing/README.md) - 테스트 가이드
