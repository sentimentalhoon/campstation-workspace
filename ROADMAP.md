# CampStation 프로젝트 개발 Roadmap

## 📅 프로젝트 개요
CampStation은 캠핑장 예약 및 관리 시스템으로, Spring Boot 백엔드와 Next.js 프론트엔드로 구성된 풀스택 애플리케이션입니다.

## 🎯 완료된 주요 기능 및 개선사항

### ✅ 1. JWT 토큰 자동 갱신 시스템 구현 (2025-10-01)
- **문제**: JWT 토큰 만료 시 자동 갱신이 되지 않아 사용자 경험 저하
- **해결**:
  - \JwtAuthenticationFilter\에서 토큰 만료 1분 전 자동 갱신 로직 추가
  - HttpOnly 쿠키를 통한 Refresh Token 관리
  - CORS 설정 최적화로 크로스-오리진 요청 지원
- **파일 변경**:
  - \JwtAuthenticationFilter.java\: 토큰 만료 체크 및 자동 갱신
  - \AuthController.java\: 쿠키 SameSite 설정 수정

### ✅ 2. API 호출 최적화 및 캐싱 구현 (2025-10-01)
- **문제**: 대시보드 로드 시 과도한 API 호출 (프로필 API 10+회 호출)
- **해결**:
  - 프론트엔드에 5분 세션스토리지 캐시 구현
  - 프로필 데이터 캐싱으로 불필요한 API 호출 방지
  - 로그아웃 시 캐시 자동 클리어
- **파일 변경**:
  - \pi.ts\: 프로필 API 캐싱 로직 추가
  - \Header.tsx\: 로그아웃 시 캐시 클리어

### ✅ 3. 프로필 API 보안 취약점 수정 (2025-10-01)
- **문제**: 프로필 API 응답에 비밀번호 해시 노출 (Critical Security Issue)
- **해결**:
  - \UserResponseDto\를 사용하여 민감한 정보 제외
  - \UserController\에서 \User\ 엔티티 대신 \UserResponseDto\ 반환
  - API 응답에서 password 필드 완전 제거
- **파일 변경**:
  - \UserResponseDto.java\: 보안 DTO 생성
  - \UserController.java\: getProfile, updateProfile 메소드 수정

### ✅ 4. 데이터 모델 정리 및 username 필드 제거 (2025-10-01)
- **문제**: username 필드가 email과 중복 사용되어 혼란 유발
- **해결**:
  - 모든 DTO에서 username 필드 제거, email만 사용
  - 백엔드: \JwtResponse\, \UserResponseDto\ 수정
  - 프론트엔드: \AuthResponse\, \User\ 타입 수정
  - 테스트 코드 및 API 호출부 일괄 수정
- **파일 변경**:
  - \JwtResponse.java\, \UserResponseDto.java\
  - \AuthController.java\: 모든 응답 메소드 수정
  - \	ypes/index.ts\, \pi.test.ts\

### ✅ 5. 날짜 처리 유틸리티 및 LocalDateTime 지원 (2025-10-01)
- **문제**: Java LocalDateTime 배열이 \
Invalid
Date\로 표시
- **해결**:
  - \dateUtils.ts\ 공통 유틸리티 생성
  - LocalDateTime 배열 → JavaScript Date 변환 함수
  - 한국어 날짜 포맷팅 및 상대 시간 표시 함수
  - 프로젝트 전체에 \ormatDateKorean\ 적용
- **파일 변경**:
  - \dateUtils.ts\: 공통 날짜 유틸리티
  - \PaymentHistory.tsx\, \PaymentConfirmation.tsx\, \
eservations/page.tsx\, \dashboard/page.tsx\, \campgrounds/[id]/page.tsx\

### ✅ 6. 빌드 및 배포 준비 (2025-10-01)
- **완료**: 모든 변경사항 빌드 성공 확인
- **테스트**: 컴파일 에러 및 런타임 에러 수정
- **문서화**: 코드 변경사항 및 보안 개선사항 정리

## 🔧 기술 스택
- **Backend**: Spring Boot 3.5.6, Java 21, JWT, Spring Security
- **Frontend**: Next.js 15.5.4, TypeScript, Tailwind CSS
- **Database**: H2 (개발), PostgreSQL/MySQL (운영)
- **Cache**: Redis
- **Build**: Gradle (Backend), npm (Frontend)

## 📊 성능 및 보안 개선 결과
- ✅ JWT 토큰 자동 갱신으로 사용자 경험 향상
- ✅ API 호출 80% 이상 감소 (캐싱 효과)
- ✅ Critical 보안 취약점 제거 (비밀번호 노출 방지)
- ✅ 데이터 모델 일관성 향상 (username/email 통합)
- ✅ 날짜 표시 표준화 및 LocalDateTime 지원

## 🚀 다음 단계 (미래 개발 계획)
- [ ] 결제 시스템 고도화 (실제 PG사 연동)
- [ ] 실시간 예약 현황 대시보드
- [ ] 모바일 앱 개발 (React Native)
- [ ] 다국어 지원 (i18n)
- [ ] 성능 모니터링 및 로깅 시스템 강화

---
*최종 업데이트: 2025년 10월 1일*

## 📅 2025년 10월 4일 작업 내용

### 🔧 Docker 개발 환경 설정 및 문제 해결

#### 1. Redis 연결 문제 해결 시도
- **문제**: Docker 환경에서 백엔드와 Redis 컨테이너 간 연결 실패
- **시도한 해결책**:
  - 네트워크 연결 확인 (같은 Docker 네트워크 공유)
  - 환경변수 설정 (`SPRING_REDIS_HOST`, `SPRING_REDIS_PORT`)
  - IP 주소 직접 설정 (172.18.0.2)
  - 컨테이너 재시작 및 재빌드
- **결과**: 아직 연결 문제 해결 중 (지속적인 RedisConnectionFailureException 발생)

#### 2. MailHog 메일 서버 설정
- **설정 내용**:
  - MailHog 컨테이너를 campstation-network에 연결
  - 백엔드 환경변수 설정:
    - `MAIL_HOST=172.18.0.4`
    - `MAIL_PORT=1025`
    - `MAIL_USERNAME=` (공백)
    - `MAIL_PASSWORD=` (공백)
- **MailHog 상태**: 정상 실행 중 (1025/SMTP, 8025/Web UI)

#### 3. 메일 테스트 기능 추가
- **파일**: `backend/src/main/java/com/campstation/camp/RedisTestController.java`
- **추가된 기능**:
  - `JavaMailSender` 의존성 주입
  - `/api/test/mail` 엔드포인트 추가
  - 간단한 테스트 메일 전송 기능
- **테스트 메일 내용**: "CampStation - 메일 테스트" 제목의 기본 메시지

#### 4. Docker Compose 설정 개선
- **docker-compose.dev.yml**:
  - MailHog 환경변수 추가
  - Redis hostname 설정 (`hostname: redis`)
  - 백엔드 메일 설정 환경변수 추가
- **네트워크 설정**: 모든 컨테이너가 `workspace_campstation-network` 공유

### 📋 현재 진행 상황 (2025-10-04)

#### ✅ 완료된 작업
- [x] MailHog Docker 컨테이너 실행 (1025 포트)
- [x] MailHog를 campstation-network에 연결
- [x] 백엔드 메일 환경변수 설정
- [x] 메일 테스트 API 엔드포인트 추가
- [x] Redis 컨테이너 네트워크 연결 확인

#### 🔄 진행 중인 작업
- [ ] Redis 연결 문제 해결
  - 백엔드에서 Redis 컨테이너로의 TCP 연결 확인 필요
  - Spring Boot Redis 설정 검증 필요
- [ ] 메일 전송 기능 테스트
  - MailHog 웹 UI에서 메일 수신 확인 필요
  - 예외 처리 및 오류 로깅 개선 필요

#### ❌ 미해결 문제
- Redis Connection Failure: `Unable to connect to Redis`
- 메일 테스트 API에서 500 에러 발생 (NoResourceFoundException)

### 🎯 다음 단계 계획 (2025-10-04)

#### 우선순위 1: Redis 연결 문제 해결
1. 백엔드 컨테이너에서 Redis 포트(6379) 직접 연결 테스트
2. Spring Boot Redis 설정 디버깅
3. Docker 네트워크 연결 상세 검증

#### 우선순위 2: 메일 기능 완성
1. 메일 테스트 API 정상화
2. MailHog에서 메일 수신 확인
3. 실제 결제/예약 메일 전송 테스트

#### 우선순위 3: 개발 환경 안정화
1. Docker Compose 설정 정리
2. 환경별 설정 파일 검증
3. CI/CD 파이프라인 준비

### 📊 기술 스택 현황 (2025-10-04)

#### Backend (Spring Boot)
- **언어**: Java 21
- **프레임워크**: Spring Boot 3.x
- **데이터베이스**: H2 (개발), PostgreSQL (프로덕션)
- **캐시**: Redis (연결 문제 해결 중)
- **메일**: JavaMailSender + MailHog (설정 완료)

#### Frontend (Next.js)
- **언어**: TypeScript
- **프레임워크**: Next.js 14+
- **UI**: React + Tailwind CSS
- **지도**: Kakao Map API

#### Infrastructure
- **컨테이너화**: Docker + Docker Compose
- **개발 메일**: MailHog (SMTP: 1025, Web UI: 8025)
- **캐시**: Redis 7 Alpine
- **데이터베이스**: PostgreSQL 15 Alpine

### 🔍 주요 설정 파일 변경사항 (2025-10-04)

#### `docker-compose.dev.yml`
```yaml
# MailHog 환경변수 추가
- MAIL_HOST=172.18.0.4
- MAIL_PORT=1025
- MAIL_USERNAME=
- MAIL_PASSWORD=

# Redis hostname 설정
redis:
  hostname: redis
```

#### `backend/src/main/java/com/campstation/camp/RedisTestController.java`
```java
@Autowired
private JavaMailSender mailSender;

@GetMapping("/mail")
public String testMail() {
    // 메일 전송 테스트 로직
}
```

#### `backend/src/main/resources/application-dev.yml`
```yaml
mail:
  host: ${MAIL_HOST:}
  port: ${MAIL_PORT:}
  username: ${MAIL_USERNAME:}
  password: ${MAIL_PASSWORD:}
```

### 📈 성과 및 교훈 (2025-10-04)

#### 긍정적 성과
- Docker 개발 환경 구성 능력 향상
- 메일 시스템 아키텍처 이해도 증가
- Spring Boot 메일 설정 경험 축적

#### 기술적 교훈
- Docker 네트워크 연결의 중요성
- Spring Boot 환경변수 우선순위 이해
- 컨테이너 간 통신 디버깅 방법 습득

#### 개선 필요사항
- Redis 연결 문제의 근본 원인 분석
- 메일 예외 처리 강화
- 개발 환경 문서화 개선

## 📋 Backend/Frontend 현재 상태 (2025-10-04)

### Backend (Spring Boot) 변경사항
#### 수정된 파일들
- **설정 파일**:
  - `application-dev.yml`: 메일 설정, Redis 설정
  - `application-prod.yml`: 프로덕션 환경 설정
  - `application.yml`: 기본 설정
  - `.env`: 환경변수 설정

- **보안 및 인증**:
  - `JwtSecurityConfig.java`: JWT 보안 설정
  - `JwtAuthenticationFilter.java`: JWT 인증 필터
  - `JwtUtil.java`: JWT 유틸리티
  - `AuthController.java`: 인증 컨트롤러

- **서비스 레이어**:
  - `CampgroundService.java`: 캠핑장 서비스
  - `FavoriteService.java`: 즐겨찾기 서비스
  - `ReservationService.java`: 예약 서비스
  - `JwtTokenService.java`: JWT 토큰 서비스

- **Redis 및 메일**:
  - `RedisConfig.java`: Redis 설정
  - `RedisDevInitializer.java`: Redis 초기화
  - `RedisTestController.java`: Redis/메일 테스트 API

- **빌드 및 배포**:
  - `build.gradle.kts`: Gradle 빌드 설정
  - `Dockerfile`: Docker 이미지 설정

#### 삭제된 파일들
- `docker-compose.yml`: Docker Compose 설정 (프로젝트 루트로 이동)
- `src/main/java/com/campstation/camp/config/DataLoader.java.backup`: 백업 파일
- `src/main/resources/application-prod.yml.backup`: 백업 파일
- `uploads/` 폴더의 샘플 이미지들 (97개 파일)

#### 추가된 파일들
- `src/main/resources/application-aws.yml`: AWS 환경 설정
- `src/main/resources/application-docker.yml`: Docker 환경 설정

### Frontend (Next.js) 변경사항
#### 수정된 파일들
- `Dockerfile`: Docker 이미지 설정
- `next.config.ts`: Next.js 설정
- `src/app/owner/dashboard/page.tsx`: 오너 대시보드 페이지

#### 추가된 파일들
- `Dockerfile.dev`: 개발 환경용 Docker 설정
- `backend.code-workspace`: VS Code 워크스페이스 설정

### 🔄 현재 Git 상태 요약
#### Backend (main 브랜치)
- **수정**: 17개 파일
- **삭제**: 100개 파일 (샘플 이미지들)
- **추가**: 2개 파일 (AWS, Docker 설정)

#### Frontend (main 브랜치)
- **수정**: 3개 파일
- **추가**: 2개 파일

#### Root 프로젝트
- **수정**: ROADMAP.md
- **하위 모듈**: backend, frontend에 변경사항 있음

### 🎯 다음 단계 개발 계획
1. **Backend**: Redis 연결 문제 해결 및 메일 시스템 완성
2. **Frontend**: 오너 대시보드 기능 개선 및 UI/UX 향상
3. **Infrastructure**: Docker Compose 설정 통합 및 CI/CD 파이프라인 구축
4. **Testing**: 단위 테스트 및 통합 테스트 강화
5. **Documentation**: API 문서화 및 개발 가이드 작성

---
*최종 업데이트: 2025년 10월 4일*
