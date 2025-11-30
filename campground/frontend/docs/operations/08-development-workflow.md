# 개발 워크플로우 가이드

> CampStation 프로젝트 개발 프로세스 및 협업 가이드

## 📋 목차

1. [개발 환경 설정](#개발-환경-설정)
2. [Git 워크플로우](#git-워크플로우)
3. [브랜치 전략](#브랜치-전략)
4. [코드 리뷰](#코드-리뷰)
5. [테스트 프로세스](#테스트-프로세스)
6. [배포 프로세스](#배포-프로세스)
7. [트러블슈팅](#트러블슈팅)

---

## 🛠️ 개발 환경 설정

### 1. 필수 요구사항

```bash
# Node.js (v20.x LTS)
node -v  # v20.18.3

# npm (v10.x)
npm -v  # 10.9.2

# Java (백엔드 개발시)
java -version  # OpenJDK 17+

# Git
git --version  # 2.x+
```

### 2. 프로젝트 클론 및 설치

```bash
# 저장소 클론
git clone https://github.com/your-org/campstation.git
cd campstation

# 의존성 설치
cd frontend
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 필요한 값 설정
```

### 3. 개발 서버 실행

```bash
# Frontend 개발 서버
npm run dev
# → http://localhost:3000

# Backend 개발 서버 (별도 터미널)
cd ../backend
./gradlew bootRun
# → http://localhost:8080
```

### 4. IDE 설정

**VS Code 권장 확장**:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "unifiedjs.vscode-mdx"
  ]
}
```

---

## 🌿 Git 워크플로우

### 브랜치 생성 및 작업

```bash
# 최신 main 브랜치로 업데이트
git checkout main
git pull origin main

# 새 기능 브랜치 생성
git checkout -b feature/캠핑장-검색-필터

# 작업 진행...
# 코드 작성, 테스트, 커밋

# 변경사항 커밋
git add .
git commit -m "feat: 캠핑장 검색 필터 컴포넌트 추가"

# 원격 저장소에 푸시
git push origin feature/캠핑장-검색-필터
```

### 커밋 메시지 컨벤션

**Conventional Commits** 형식 사용:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 종류**:

- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅 (기능 변경 없음)
- `refactor`: 코드 리팩토링
- `test`: 테스트 코드 추가/수정
- `chore`: 빌드 설정, 패키지 매니저 등
- `perf`: 성능 개선

**예시**:

```bash
feat(search): 캠핑장 검색 필터 기능 추가

- 지역별 필터 컴포넌트 구현
- 가격 범위 슬라이더 추가
- 편의시설 체크박스 그룹 구현

Closes #123
```

```bash
fix(reservation): 예약 날짜 검증 오류 수정

예약 시작일이 종료일보다 늦은 경우 에러 메시지가
표시되지 않던 문제 해결

Fixes #456
```

---

## 🎋 브랜치 전략

### 브랜치 유형

```
main (production)
  ↑
develop (development)
  ↑
  ├── feature/기능명          # 새 기능 개발
  ├── fix/버그명               # 버그 수정
  ├── refactor/리팩토링명      # 코드 개선
  ├── docs/문서명              # 문서 작업
  └── hotfix/긴급수정명        # 긴급 수정
```

### 브랜치 네이밍

```bash
# 기능 개발
feature/캠핑장-검색-필터
feature/결제-시스템-통합

# 버그 수정
fix/로그인-토큰-만료
fix/이미지-업로드-실패

# 리팩토링
refactor/query-state-handler
refactor/api-client-구조

# 문서
docs/api-가이드-업데이트
docs/스프린트-4-정리

# 긴급 수정 (production)
hotfix/예약-취소-오류
```

### 병합 프로세스

```bash
# 1. 로컬에서 develop 최신화
git checkout develop
git pull origin develop

# 2. feature 브랜치에 develop 병합 (충돌 해결)
git checkout feature/캠핑장-검색-필터
git merge develop

# 3. 충돌 해결 후 테스트
npm run test
npm run lint
npm run build

# 4. Pull Request 생성 (GitHub)
# → develop 브랜치로 PR 생성
# → 코드 리뷰 요청

# 5. 승인 후 병합
# → Squash and merge (권장)
# → Delete branch after merge
```

---

## 👥 코드 리뷰

### Pull Request 체크리스트

**작성자**:

- [ ] 기능이 정상 작동하는지 테스트 완료
- [ ] 단위 테스트 작성/수정 완료
- [ ] 린트 및 타입 체크 통과
- [ ] 관련 문서 업데이트 (필요시)
- [ ] 스크린샷/GIF 첨부 (UI 변경시)
- [ ] Breaking change 여부 명시
- [ ] 관련 이슈 번호 연결

**리뷰어**:

- [ ] 코드가 프로젝트 컨벤션을 따르는가?
- [ ] 불필요한 코드나 주석이 없는가?
- [ ] 성능 이슈가 없는가?
- [ ] 보안 취약점이 없는가?
- [ ] 테스트 커버리지가 충분한가?
- [ ] 에러 처리가 적절한가?
- [ ] 접근성(a11y)을 고려했는가?
- [ ] 재사용 가능한 컴포넌트인가?

### 리뷰 코멘트 가이드

```markdown
# 🚨 필수 수정 (Blocking)

**Issue**: 예약 날짜 검증 로직 누락
**Suggestion**:
\`\`\`typescript
if (startDate >= endDate) {
throw new Error('시작일은 종료일보다 앞서야 합니다');
}
\`\`\`

# 💡 제안 (Non-blocking)

**Suggestion**: 코드가 명확하고 잘 작성되었습니다. React 19 Compiler가 자동으로 최적화하므로 수동 메모이제이션은 불필요합니다.
\`\`\`typescript
// ✅ React Compiler가 자동 최적화
const filteredCampgrounds = campgrounds.filter(c => c.region === selectedRegion);
\`\`\`

**참고**: useMemo/useCallback은 React Compiler 사용 시 대부분 불필요합니다.

# ❓ 질문

이 컴포넌트가 여러 곳에서 사용될 예정인가요?
그렇다면 `components/common`으로 이동하는 것이 좋을 것 같습니다.

# 👍 칭찬

타입 정의가 매우 명확하고 재사용성이 높습니다!
```

---

## 🧪 테스트 프로세스

### 테스트 실행

```bash
# 전체 테스트 실행
npm run test

# Watch 모드 (개발 중)
npm run test:watch

# UI 모드 (Vitest UI)
npm run test:ui

# 커버리지 리포트
npm run test:coverage
```

### 테스트 작성 가이드

```typescript
// __tests__/components/CampgroundCard.test.tsx
import { render, screen } from '@testing-library/react';
import { CampgroundCard } from '@/components/campgrounds/CampgroundCard';

describe('CampgroundCard', () => {
  const mockCampground = {
    id: 1,
    name: '테스트 캠핑장',
    address: '서울시 강남구',
    pricePerNight: 50000,
  };

  it('캠핑장 정보를 올바르게 렌더링한다', () => {
    render(<CampgroundCard campground={mockCampground} />);

    expect(screen.getByText('테스트 캠핑장')).toBeInTheDocument();
    expect(screen.getByText(/50,000원/)).toBeInTheDocument();
  });

  it('찜하기 버튼 클릭 시 API를 호출한다', async () => {
    const { user } = render(<CampgroundCard campground={mockCampground} />);

    const favoriteButton = screen.getByLabelText('찜하기');
    await user.click(favoriteButton);

    expect(mockToggleFavorite).toHaveBeenCalledWith(1);
  });
});
```

### 테스트 커버리지 목표

| 항목       | 목표 | 현재 |
| ---------- | ---- | ---- |
| Statements | 80%  | 65%  |
| Branches   | 75%  | 60%  |
| Functions  | 80%  | 70%  |
| Lines      | 80%  | 65%  |

---

## 🚀 배포 프로세스

### 1. 개발 환경 배포 (자동)

```bash
# develop 브랜치에 병합 시 자동 배포
git push origin develop

# GitHub Actions 워크플로우 실행
# → 테스트 → 빌드 → Docker 이미지 생성 → 개발 서버 배포
```

### 2. 프로덕션 배포 (수동 승인)

```bash
# main 브랜치로 병합
git checkout main
git merge develop
git push origin main

# GitHub Actions에서 승인 대기
# → 승인 후 프로덕션 배포
```

### 3. 배포 전 체크리스트

- [ ] 모든 테스트 통과
- [ ] Lighthouse 점수 90+ 유지
- [ ] 번들 사이즈 450KB 이하
- [ ] Breaking change 문서화
- [ ] 데이터베이스 마이그레이션 확인
- [ ] 환경 변수 설정 확인
- [ ] 롤백 계획 수립

### 4. 배포 후 모니터링

```bash
# 애플리케이션 로그 확인
docker logs -f campstation-frontend

# 헬스 체크
curl https://campstation.com/api/health

# 에러 모니터링 (Sentry, LogRocket 등)
# → 실시간 에러 알림 확인
```

---

## 🔧 트러블슈팅

### 일반적인 문제 해결

#### 1. 의존성 설치 실패

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install

# npm 캐시 정리
npm cache clean --force
```

#### 2. 빌드 실패

```bash
# TypeScript 오류 확인
npm run type-check

# ESLint 오류 수정
npm run lint:fix

# 캐시 삭제 후 재빌드
rm -rf .next
npm run build
```

#### 3. 테스트 실패

```bash
# 특정 테스트만 실행
npm run test -- CampgroundCard

# 업데이트된 스냅샷 적용
npm run test -- -u

# 디버그 모드
npm run test -- --inspect-brk
```

#### 4. Docker 관련 문제

```bash
# 컨테이너 재시작
docker-compose restart frontend

# 볼륨 제거 후 재빌드
docker-compose down -v
docker-compose up --build

# 로그 확인
docker-compose logs -f frontend
```

### 성능 문제 디버깅

```bash
# 번들 분석
npm run build
npm run analyze

# React DevTools Profiler 사용
# → Chrome Extension 설치 → Profiler 탭

# Lighthouse 로컬 실행
npm run build
npm run start
# → Chrome DevTools → Lighthouse
```

---

## 📊 개발 메트릭

### 주간 리뷰 항목

- **코드 품질**
  - TypeScript 타입 커버리지
  - ESLint 위반 개수
  - 코드 중복률

- **테스트**
  - 테스트 커버리지 변화
  - 실패한 테스트 개수
  - 테스트 실행 시간

- **성능**
  - 빌드 시간 추이
  - 번들 사이즈 변화
  - Lighthouse 점수

- **생산성**
  - PR 평균 머지 시간
  - 리뷰 사이클 시간
  - 버그 발견 → 수정 시간

---

## 📚 참고 문서

- [코딩 컨벤션](../02-CODING-CONVENTIONS.md)
- [컴포넌트 패턴](../03-COMPONENT-PATTERNS.md)
- [API 가이드](./07-api-integration.md)
- [배포 가이드](./01-deployment.md)
- [트러블슈팅](./04-troubleshooting.md)

---

## 🔗 유용한 링크

- [GitHub 저장소](https://github.com/your-org/campstation)
- [프로젝트 위키](https://github.com/your-org/campstation/wiki)
- [이슈 트래커](https://github.com/your-org/campstation/issues)
- [Slack 채널](https://campstation.slack.com)
- [Figma 디자인](https://figma.com/campstation)

---

**마지막 업데이트**: 2025-01-27  
**담당자**: CampStation 개발팀
