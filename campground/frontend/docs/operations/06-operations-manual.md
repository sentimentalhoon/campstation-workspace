# 운영 매뉴얼

> CampStation Frontend 운영 및 유지보수 가이드

## 📋 목차

1. [일일 운영 체크리스트](#일일-운영-체크리스트)
2. [주간 유지보수](#주간-유지보수)
3. [월간 점검](#월간-점검)
4. [장애 대응](#장애-대응)
5. [백업 및 복구](#백업-및-복구)
6. [성능 모니터링](#성능-모니터링)
7. [보안 체크리스트](#보안-체크리스트)

---

## ✅ 일일 운영 체크리스트

### 아침 점검 (09:00)

```bash
# 1. 서비스 상태 확인
curl -I https://your-domain.com/api/health

# 2. 서버 리소스 확인
docker stats --no-stream

# 3. 최근 에러 로그 확인
docker-compose logs --tail=100 frontend | grep -i error

# 4. 빌드 상태 확인 (CI/CD 사용 시)
# GitHub Actions, Jenkins 등에서 확인
```

### 체크 항목

- [ ] 웹사이트 접속 가능 확인
- [ ] 주요 페이지 정상 동작 (홈, 검색, 예약)
- [ ] API 응답 시간 (< 500ms)
- [ ] 에러 로그 없음 또는 처리 완료
- [ ] SSL 인증서 유효 (만료일 체크)
- [ ] CDN 캐시 정상 동작
- [ ] 디스크 사용량 < 80%
- [ ] 메모리 사용량 < 80%

---

## 🔄 주간 유지보수

### 매주 월요일 (10:00)

#### 1. 의존성 보안 업데이트

```bash
# 보안 취약점 확인
npm audit

# 자동 수정 가능한 취약점 패치
npm audit fix

# 주요 취약점 수동 검토
npm audit --production
```

#### 2. 성능 리포트 생성

```bash
# Lighthouse 점수 측정
npm run build
npm run start

# Chrome DevTools > Lighthouse
# 주요 페이지: 홈, 검색, 상세, 예약
# 목표: Performance 90+, Accessibility 90+
```

#### 3. 에러 트래킹 리뷰

- Sentry/LogRocket 등 에러 모니터링 도구 확인
- 주간 에러 발생 빈도 분석
- 반복되는 에러 패턴 수정 계획

#### 4. 번들 크기 모니터링

```bash
# 번들 크기 분석
npm run build:analyze

# First Load JS 크기 추이 기록
# 목표: < 350KB 유지
```

---

## 📅 월간 점검

### 매월 1일

#### 1. 의존성 업데이트

```bash
# 업데이트 가능한 패키지 확인
npm outdated

# minor/patch 버전 업데이트
npm update

# major 버전 업데이트 (신중하게)
# package.json 수동 수정 후
npm install

# 테스트 실행
npm run test
npm run type-check
npm run build
```

#### 2. Lighthouse 종합 리포트

- 모든 주요 페이지 Lighthouse 측정
- 점수 추이 그래프 작성
- 개선 필요 항목 이슈 등록

#### 3. 성능 벤치마크

- 페이지 로딩 시간 측정
- API 응답 시간 측정
- Core Web Vitals 점검
  - LCP (Largest Contentful Paint) < 2.5s
  - FID (First Input Delay) < 100ms
  - CLS (Cumulative Layout Shift) < 0.1

#### 4. 보안 점검

- [ ] SSL 인증서 만료일 확인 (최소 30일 이상 남음)
- [ ] API 키 만료일 확인
- [ ] CORS 설정 검토
- [ ] CSP (Content Security Policy) 검토
- [ ] 환경 변수 노출 여부 확인

#### 5. 백업 검증

- 환경 변수 백업
- 데이터베이스 백업 (Backend)
- 코드 저장소 백업

---

## 🚨 장애 대응

### 장애 레벨 정의

| 레벨      | 설명               | 대응 시간        | 예시                 |
| --------- | ------------------ | ---------------- | -------------------- |
| P0 (긴급) | 서비스 완전 중단   | 즉시 (15분 이내) | 서버 다운, 404 에러  |
| P1 (높음) | 주요 기능 장애     | 1시간 이내       | 결제 불가, 예약 불가 |
| P2 (중간) | 일부 기능 장애     | 4시간 이내       | 이미지 업로드 실패   |
| P3 (낮음) | UI 버그, 성능 저하 | 1일 이내         | 스타일 깨짐          |

### P0 긴급 장애 대응

#### 1. 즉시 조치 (5분 이내)

```bash
# 서비스 상태 확인
docker ps

# 컨테이너 재시작
docker-compose restart frontend

# 에러 로그 확인
docker-compose logs --tail=200 frontend
```

#### 2. 원인 파악 (10분 이내)

- 최근 배포 이력 확인
- 에러 로그 분석
- 서버 리소스 확인 (CPU, 메모리, 디스크)
- 외부 서비스 상태 확인 (API, CDN)

#### 3. 롤백 결정 (15분 이내)

```bash
# 이전 버전으로 롤백
git checkout [previous-tag]
docker-compose down
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 또는 Docker 이미지 롤백
docker-compose down
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --force-recreate
```

#### 4. 사후 조치

- 장애 리포트 작성
- 재발 방지 계획 수립
- 모니터링 강화

### 일반적인 장애 시나리오

#### 1. 빌드 실패

```bash
# 원인: 의존성 문제
rm -rf node_modules package-lock.json
npm install
npm run build

# 원인: 타입 에러
npm run type-check
# 에러 수정 후 재빌드
```

#### 2. 메모리 부족

```bash
# 메모리 사용량 확인
docker stats

# Node.js 메모리 증가
# next.config.ts
experimental: {
  workerThreads: false,
  memoryBasedWorkersCount: true
}

# Docker Compose에서 메모리 제한 증가
# docker-compose.yml
services:
  frontend:
    mem_limit: 2g
```

#### 3. API 연결 실패

```bash
# 환경 변수 확인
docker-compose exec frontend env | grep API_URL

# 네트워크 연결 확인
docker network ls
docker network inspect [network-name]

# Backend 컨테이너 상태 확인
docker-compose ps backend
```

---

## 💾 백업 및 복구

### 백업 대상

#### 1. 환경 변수

```bash
# .env 파일 백업 (매일)
cp .env .env.backup.$(date +%Y%m%d)

# 안전한 위치에 저장 (Git에 포함하지 않음)
# 예: AWS S3, Google Drive
```

#### 2. 빌드 아티팩트

```bash
# .next 폴더 백업 (배포 시)
tar -czf .next.backup.$(date +%Y%m%d).tar.gz .next/

# Docker 이미지 백업
docker save campstation-frontend:latest > frontend-backup.tar
```

#### 3. 소스 코드

```bash
# Git 태그 생성 (릴리즈 시)
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0

# GitHub/GitLab 미러 백업
git remote add backup [backup-repo-url]
git push backup main --tags
```

### 복구 절차

#### 1. 환경 변수 복구

```bash
# 백업에서 복구
cp .env.backup.[date] .env

# 재시작
docker-compose restart frontend
```

#### 2. 이전 버전으로 롤백

```bash
# Git 태그로 복구
git checkout v1.0.0

# 재빌드 및 배포
npm install
npm run build
docker-compose down
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 📊 성능 모니터링

### 주요 지표

#### 1. Core Web Vitals

| 지표 | 목표    | 측정 방법                      |
| ---- | ------- | ------------------------------ |
| LCP  | < 2.5s  | Lighthouse, PageSpeed Insights |
| FID  | < 100ms | Real User Monitoring           |
| CLS  | < 0.1   | Lighthouse                     |

#### 2. 번들 크기

```bash
# First Load JS
# 현재: 409.49KB
# 목표: < 350KB

# 주간 측정
npm run build
# .next/build-manifest.json 확인
```

#### 3. API 응답 시간

- 평균 응답 시간 < 500ms
- 95 percentile < 1s
- 에러율 < 1%

### 모니터링 도구

#### 1. Lighthouse CI

```bash
# 설치
npm install -g @lhci/cli

# 설정 (lighthouserc.json)
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}]
      }
    }
  }
}

# 실행
lhci autorun
```

#### 2. 로그 모니터링

```bash
# 실시간 로그 모니터링
docker-compose logs -f frontend

# 에러 필터링
docker-compose logs frontend | grep -i error

# 경고 필터링
docker-compose logs frontend | grep -i warn
```

---

## 🔒 보안 체크리스트

### 월간 보안 점검

- [ ] **의존성 취약점 검사**: `npm audit`
- [ ] **환경 변수 노출 확인**: 클라이언트 번들에 비밀키 포함 여부
- [ ] **HTTPS 강제**: HTTP → HTTPS 리다이렉트 확인
- [ ] **보안 헤더 확인**:
  - [ ] Strict-Transport-Security
  - [ ] X-Frame-Options
  - [ ] X-Content-Type-Options
  - [ ] Content-Security-Policy
- [ ] **CORS 설정 검토**: 허용된 도메인만 접근
- [ ] **API 인증 토큰 관리**: 만료일, 권한 범위
- [ ] **XSS 방어**: React의 기본 이스케이핑 확인
- [ ] **CSRF 방어**: 토큰 검증 확인

### 보안 사고 대응

#### 1. 탐지

- 비정상적인 트래픽 패턴
- 대량의 404/500 에러
- API 호출 급증

#### 2. 즉시 조치

```bash
# 서비스 격리
docker-compose down frontend

# 로그 백업
docker-compose logs frontend > security-incident-$(date +%Y%m%d-%H%M%S).log

# 문제 분석
# - 공격 유형 파악
# - 영향 범위 확인
# - 데이터 유출 여부
```

#### 3. 복구

- 취약점 패치
- 환경 변수 재발급 (노출된 경우)
- 서비스 재시작
- 모니터링 강화

---

## 📞 연락처

### 긴급 연락망

| 역할          | 담당자 | 연락처   |
| ------------- | ------ | -------- |
| Frontend Lead | [이름] | [연락처] |
| Backend Lead  | [이름] | [연락처] |
| DevOps        | [이름] | [연락처] |
| PM            | [이름] | [연락처] |

### 외부 서비스 지원

| 서비스        | 용도     | 지원 채널                              |
| ------------- | -------- | -------------------------------------- |
| Vercel        | 호스팅   | https://vercel.com/support             |
| AWS           | 인프라   | https://console.aws.amazon.com/support |
| Naver Maps    | 지도 API | https://www.ncloud.com/support         |
| Toss Payments | 결제     | https://docs.tosspayments.com          |

---

## 📚 참고 문서

- [배포 가이드](./01-deployment.md)
- [환경 변수](./02-environment.md)
- [트러블슈팅](./04-troubleshooting.md)
- [보안 가이드](./05-security.md)
- [Lighthouse 테스팅 가이드](../technical/lighthouse-testing-guide.md)

---

## ✅ 운영 체크리스트 요약

### 일일

- [ ] 서비스 상태 확인
- [ ] 에러 로그 확인
- [ ] 리소스 사용량 확인

### 주간

- [ ] 보안 취약점 스캔
- [ ] Lighthouse 성능 측정
- [ ] 에러 트래킹 리뷰

### 월간

- [ ] 의존성 업데이트
- [ ] 종합 성능 리포트
- [ ] 보안 점검
- [ ] 백업 검증

### 분기별

- [ ] 주요 버전 업그레이드 검토
- [ ] 아키텍처 리뷰
- [ ] 비용 최적화 검토
- [ ] 재해 복구 훈련
