# 테스트 문서 (Testing Documentation)

> 테스트 전략 및 QA 가이드

## 📚 문서 목록

### [E2E 테스트 가이드](./e2e-testing-guide.md) ✨ New (Sprint 4)

Playwright를 이용한 End-to-End 테스트 작성 가이드

**주요 내용**:

- Playwright 환경 설정
- 기본 테스트 작성법
- 페이지 객체 모델 (POM)
- 테스트 시나리오 (인증, 검색, 예약, 리뷰)
- 베스트 프랙티스
- CI/CD 통합
- 디버깅 방법

---

### [01. 테스트 전략](./01-test-strategy.md)

전체 테스트 전략 및 접근 방법

**주요 내용**:

- 테스트 피라미드
- 테스트 유형별 목표
- 테스트 도구 및 프레임워크
- CI/CD 통합
- 테스트 커버리지 목표

---

### [02. E2E 테스트 시나리오](./02-e2e-scenarios.md)

End-to-End 테스트 시나리오

**주요 내용**:

- 주요 사용자 플로우 테스트
- 회원가입 & 로그인 시나리오
- 예약 플로우 시나리오
- 결제 시나리오
- 에러 처리 시나리오

---

### [03. 테스트 데이터 가이드](./03-test-data.md)

테스트 데이터 생성 및 관리

**주요 내용**:

- 테스트 데이터 생성 방법
- Seed 데이터 관리
- Mock API 데이터
- 테스트 계정 관리
- 데이터 클린업 전략

---

### [04. QA 체크리스트](./04-qa-checklist.md)

배포 전 QA 점검 사항

**주요 내용**:

- 기능 테스트 체크리스트
- UI/UX 테스트
- 성능 테스트
- 보안 테스트
- 크로스 브라우저 테스트
- 모바일 테스트

---

## 🎯 빠른 참조

### 테스트 실행

```bash
# 단위 테스트 (Frontend)
cd frontend
npm test

# E2E 테스트 (Playwright)
npm run test:e2e

# 백엔드 테스트
cd backend
./gradlew test

# 전체 테스트 (CI 환경)
npm run test:ci
```

---

### 테스트 작성 순서

**새 기능 개발 시**:

1. [테스트 전략](./01-test-strategy.md) - 어떤 테스트가 필요한지 확인
2. [E2E 시나리오](./02-e2e-scenarios.md) - 사용자 플로우 테스트 작성
3. [테스트 데이터](./03-test-data.md) - 필요한 데이터 준비
4. [QA 체크리스트](./04-qa-checklist.md) - 배포 전 점검

---

### Sprint별 테스트 가이드

**Sprint 1 (Campground Detail + Reservation)**:

- [ ] 캠핑장 상세 페이지 렌더링 테스트
- [ ] 예약 폼 유효성 검사 테스트
- [ ] 달력 선택 테스트

**Sprint 2 (Payment + Reservation Management)**:

- [ ] 결제 플로우 E2E 테스트
- [ ] 예약 목록 조회 테스트
- [ ] 예약 취소 테스트

**Sprint 3 (Navigation + My Page)**:

- [ ] 탭 네비게이션 테스트
- [ ] 마이페이지 정보 수정 테스트

**Sprint 4 (Testing & Optimization)**:

- [ ] 전체 E2E 시나리오 테스트
- [ ] 성능 테스트
- [ ] 보안 테스트
- [ ] 최종 QA 체크리스트

---

## 📌 관련 링크

- [명세 문서 - User Flows](../specifications/02-USER-FLOWS.md) - 테스트 시나리오 기반
- [운영 문서 - Monitoring](../operations/03-monitoring.md) - 프로덕션 테스트
- [기술 문서](../technical/README.md) - 코드 작성 가이드
