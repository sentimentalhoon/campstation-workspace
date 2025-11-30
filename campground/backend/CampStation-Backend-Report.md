# CampStation 백엔드 프로젝트 종합 보고서

## 📋 프로젝트 개요

**프로젝트명**: CampStation Backend
**목적**: 캠핑장 예약 플랫폼을 위한 RESTful API 서버
**버전**: 0.0.1-SNAPSHOT
**개발 현황**: 활발한 개발 진행 중

CampStation은 Next.js 15 프론트엔드와 연동되는 엔터프라이즈급 캠핑장 예약 플랫폼의 백엔드 시스템입니다. 도메인 중심의 모듈형 아키텍처를 채택하여 확장 가능하고 유지보수가 용이한 구조로 설계되었습니다.

---

## 🛠 기술 스택

### 핵심 기술
| 카테고리 | 기술 | 버전 |
|---------|------|------|
| **언어** | Java | 21 (Temurin) |
| **프레임워크** | Spring Boot | 3.5.6 |
| **빌드 도구** | Gradle | Kotlin DSL |
| **데이터베이스** | PostgreSQL | 15 |
| **캐시/세션** | Redis | 7 |
| **객체 스토리지** | MinIO | S3 호환 |

### 주요 라이브러리 및 의존성
- **Spring Ecosystem**
  - Spring Data JPA (데이터 접근)
  - Spring Security 6 (인증/인가)
  - Spring Cache (캐싱)
  - Spring Actuator (관측성)
  - Spring AOP (횡단 관심사)

- **인증 및 보안**
  - JWT (jsonwebtoken 0.12.6)
  - OAuth2 Client (Google, Kakao, GitHub)

- **데이터베이스 및 마이그레이션**
  - Flyway 10.20.1 (스키마 마이그레이션)
  - Hibernate Types 60 (JSON 지원)
  - H2 (테스트용)

- **결제 및 외부 통합**
  - 포트원(PortOne) PG 통합
  - OkHttp 4.12.0
  - Gson 2.10.1

- **문서화 및 모니터링**
  - SpringDoc OpenAPI 3 (Swagger UI)
  - Micrometer (메트릭)

- **알림 시스템**
  - JavaMail (이메일)
  - Twilio SDK 9.13.0 (SMS)

- **파일 및 문서**
  - AWS S3 SDK 2.25.11 (MinIO 호환)
  - iText PDF 8.0.2 (PDF 생성)

- **유틸리티**
  - Lombok 1.18.30
  - Caffeine 3.1.8 (로컬 캐시)
  - Bucket4j 8.10.1 (Rate Limiting)
  - Checkstyle 10.12.1 (코드 품질)

---

## 🏗 아키텍처 및 프로젝트 구조

### 도메인 중심 모듈 구조

프로젝트는 **도메인 주도 설계(DDD)** 원칙을 따르며, 각 도메인이 독립적인 모듈로 분리되어 있습니다:

```
src/main/java/com/campstation/camp/
├── admin/            # 관리자 전용 기능
├── auth/             # 인증/인가 (JWT, OAuth2)
├── banner/           # 배너 관리
├── campground/       # 캠핑장 및 이미지 관리
├── owner/            # 캠핑장 소유자 기능
├── payment/          # 결제 처리
├── pricing/          # 가격 책정 시스템
├── reservation/      # 예약 관리
├── review/           # 리뷰 및 평점
├── user/             # 회원 관리 및 즐겨찾기
└── shared/           # 공통 컴포넌트
    ├── config/       # 설정
    ├── domain/       # 공통 도메인 모델
    ├── dto/          # 공통 DTO
    ├── file/         # 파일 관리
    ├── notification/ # 알림 시스템
    ├── ratelimit/    # Rate Limiting
    └── security/     # 보안 설정
```

### 계층 구조
각 도메인 모듈은 표준 3-tier 아키텍처를 따릅니다:
- **Controller**: REST API 엔드포인트
- **Service**: 비즈니스 로직
- **Repository**: 데이터 접근 계층
- **Domain**: 엔티티 및 도메인 모델
- **DTO**: 데이터 전송 객체

### 코드 통계
- **총 Java 파일**: 207개
- **Controller**: 17개
- **Service**: 20개
- **Test**: 2개
- **DB Migration**: 19개 파일 (1,131줄)

---

## 💾 데이터베이스 스키마

### 주요 테이블 (11개)

1. **users** - 사용자 정보
   - OAuth2 통합 (Google, Kakao, GitHub)
   - 역할 기반 권한 (USER, OWNER, ADMIN)
   - Soft Delete 지원

2. **guests** - 비회원 게스트 정보
   - 비회원 예약 지원

3. **campgrounds** - 캠핑장 정보
   - 위치 정보 (위도/경도)
   - 소유자 관계
   - 운영 상태 관리

4. **campground_images** - 캠핑장 이미지
   - 썸네일/원본 URL 분리
   - 표시 순서 및 메인 이미지 설정

5. **sites** - 캠핑 사이트
   - 사이트 유형 (TENT, RV, CABIN 등)
   - 수용 인원 및 가격
   - 버전 관리 (낙관적 락)

6. **site_amenities** - 사이트 편의시설
   - Bitmask 방식으로 변경됨 (V5 마이그레이션)

7. **reservations** - 예약 정보
   - 회원/비회원 예약 모두 지원
   - 상태 관리 (PENDING, CONFIRMED, CANCELLED, COMPLETED)
   - 거부 사유 필드 (V13)

8. **payments** - 결제 정보
   - 다양한 결제 수단 지원
   - 토스페이먼츠 통합
   - 상세한 카드 정보 저장

9. **refunds** - 환불 정보
   - 부분/전체 환불 지원
   - 환불 유형 (USER, OWNER)

10. **reviews** - 리뷰
    - 평점 (1-5)
    - JSON 이미지 저장
    - 좋아요 기능 (V14)
    - 답글 기능 (V18)
    - 예약 연결 (V15)

11. **favorites** - 찜하기
    - 사용자-캠핑장 고유 제약

### 추가 테이블
- **site_pricing** - 동적 가격 책정 (V9)
- **site_images** - 사이트별 이미지 (V17)
- **review_likes** - 리뷰 좋아요 (V14)
- **review_replies** - 리뷰 답글 (V18)
- **banner** - 배너 관리 (V19)

### 마이그레이션 전략
- Flyway를 통한 버전 관리
- 19개 마이그레이션 (V1~V19)
- 주요 변경사항:
  - V5: 편의시설 Bitmask 전환
  - V9: 동적 가격 책정 시스템 도입
  - V10: price_per_night 필드 제거
  - V12: 낙관적 락 지원
  - V16: 통합 이미지 스토리지

---

## 🔑 핵심 기능

### 1. 인증 및 권한 관리
- **JWT 기반 인증**
  - Access Token + Refresh Token (쿠키, Redis)
  - 만료 1분 전 자동 갱신

- **OAuth2 소셜 로그인**
  - Google, Kakao 활성화
  - GitHub (Client Secret 등록 필요)
  - 성공 시 JWT 발급 및 프론트엔드 리다이렉트

- **역할 기반 접근 제어 (RBAC)**
  - ROLE_USER, ROLE_OWNER, ROLE_ADMIN
  - 캠핑장 관리 및 예약 승인 권한 분리

### 2. 캠핑장 관리
- 캠핑장 CRUD
- 이미지 업로드 (Presigned URL)
- 위치 기반 검색
- 사이트 관리
- 편의시설 관리

### 3. 예약 시스템
- 회원/비회원 예약
- 날짜 기반 예약 검증
- 예약 상태 관리
- 스케줄러를 통한 자동 처리
- 거부 사유 기록

### 4. 결제 및 환불
- 포트원(PortOne) PG 통합
- 다양한 결제 수단 (카드, 계좌이체, 간편결제)
- 환불 처리 (부분/전체)
- 영수증 생성 (PDF)

### 5. 동적 가격 책정
- 시즌별 가격 설정
- 할인 규칙 적용
- 일별 가격 계산
- 가격 내역 제공

### 6. 리뷰 시스템
- 평점 및 댓글
- 이미지 첨부
- 좋아요 기능
- 소유자 답글
- 예약 검증 연동

### 7. 파일 관리
- MinIO S3 호환 스토리지
- Presigned URL 기반 업로드
- 썸네일/원본 분리
- 통합 이미지 관리 (V16)

### 8. 관측성 및 알림
- **Micrometer + Actuator**
  - Prometheus 메트릭
  - Health Check (Database, Redis)

- **알림 파이프라인**
  - 500ms 이상 지연 시 이메일 알림
  - MailHog 통합 (개발)
  - Twilio SMS (옵션)
  - Slack Webhook (옵션)

- **감사 로깅**
  - RequestLoggingInterceptor
  - 사용자/URI/소요시간 MDC 기록

### 9. 보안
- CORS 설정
- Rate Limiting (Bucket4j + Redis)
- SQL Injection 방지 (JPA)
- XSS 방지
- 카드 정보 마스킹

---

## 🔒 보안 아키텍처

### 인증 플로우
1. 일반 로그인: username/password → JWT 발급
2. OAuth2 로그인: 소셜 로그인 → JWT 발급 → 리다이렉트
3. Refresh Token: Redis 저장, 자동 갱신

### 권한 계층
```
ROLE_ADMIN (관리자)
    ↓
ROLE_OWNER (캠핑장 소유자)
    ↓
ROLE_USER (일반 사용자)
```

### 보안 강화
- AOP 기반 보안 어노테이션
- SecurityUtils를 통한 컨텍스트 접근
- 느린 요청 감지 및 경고

---

## 🧪 테스트 및 품질 관리

### 현재 테스트 커버리지
- **단위 테스트**: SecurityUtilsTest
- **통합 테스트**: SecurityAnnotationIntegrationTest
- **테스트 프레임워크**: JUnit 5, Spring Security Test

### 품질 도구
- **Checkstyle**: 코드 스타일 검증 (maxWarnings=0)
- **DataLoader**: 샘플 데이터 자동 주입
- **H2 Database**: 테스트용 인메모리 DB

### 향후 계획
- Testcontainers 통합 테스트 (reservation 도메인부터)
- CI/CD 파이프라인 (GitHub Actions)
- 코드 커버리지 측정

---

## 🚀 배포 및 인프라

### 컨테이너화
- **Dockerfile**: 멀티 스테이지 빌드
- **Dockerfile.dev**: 개발용 경량 이미지
- **Docker Compose**: 전체 스택 오케스트레이션

### 서비스 구성
```
- Backend API: localhost:8080
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- MinIO: localhost:9000 (Console: 8900)
- MailHog: localhost:1025 (Web: 8025)
```

### 환경 변수
- .env 파일 기반 설정
- JWT Secret, OAuth2 Credentials
- 데이터베이스 연결 정보
- 외부 서비스 API 키

---

## 📊 최근 작업 현황

최근 5개 커밋 분석:

1. **이미지 업로드/삭제 개선**
   - S3 스토리지 동기화 문제 해결
   - 삭제/수정 시 스토리지 정리 로직 추가

2. **통합 이미지 프로세스**
   - 모든 이미지 업로드 프로세스 통일
   - 일관성 있는 처리 플로우 구축

3. **Admin Dashboard API 구조 변경**
   - 프론트엔드 에러 해결
   - API 응답 구조 개선

4. **프론트엔드 호환성 개선**
   - banner.ts 필드 조정
   - createdBy 옵션 필드 변경

5. **데이터베이스 마이그레이션**
   - AUTO_INCREMENT → BIGSERIAL 전환
   - PostgreSQL 호환성 향상

---

## 📈 프로젝트 성숙도 평가

| 항목 | 상태 | 평가 |
|------|------|------|
| **아키텍처** | ⭐⭐⭐⭐⭐ | 도메인 중심, 모듈화 우수 |
| **기술 스택** | ⭐⭐⭐⭐⭐ | 최신 기술, 검증된 라이브러리 |
| **보안** | ⭐⭐⭐⭐☆ | JWT/OAuth2, RBAC 완비 |
| **데이터베이스** | ⭐⭐⭐⭐⭐ | 체계적 마이그레이션, 정규화 |
| **API 설계** | ⭐⭐⭐⭐⭐ | RESTful, Swagger 문서화 |
| **테스트** | ⭐⭐☆☆☆ | 기본 테스트만 존재 (개선 필요) |
| **문서화** | ⭐⭐⭐⭐⭐ | README, OpenAPI 완비 |
| **관측성** | ⭐⭐⭐⭐☆ | Actuator, 알림 시스템 |
| **확장성** | ⭐⭐⭐⭐⭐ | 모듈형, Redis 캐싱 |

---

## 🎯 개선 제안

### 1. 테스트 커버리지 확대 (우선순위: 높음)
- Testcontainers 도입
- 도메인별 통합 테스트 작성
- 코드 커버리지 80% 이상 목표
- E2E 테스트 시나리오 작성

### 2. CI/CD 파이프라인 강화
- GitHub Actions 워크플로우 확장
- 자동 배포 스크립트
- Slack 알림 통합 완료
- 성능 테스트 자동화

### 3. 성능 최적화
- 쿼리 성능 분석 (N+1 문제 검증)
- 캐싱 전략 고도화
- 데이터베이스 인덱스 최적화
- API 응답 시간 모니터링

### 4. 보안 강화
- 보안 취약점 스캔 (OWASP ZAP)
- API Rate Limiting 세밀화
- 민감 정보 암호화 강화
- 보안 헤더 설정 (HSTS, CSP)

### 5. 모니터링 및 로깅
- ELK Stack 통합
- 분산 추적 (Zipkin/Jaeger)
- 사용자 행동 분석
- 에러 추적 시스템 (Sentry)

### 6. 문서화
- API 사용 가이드 작성
- 아키텍처 다이어그램 추가
- 배포 가이드 상세화
- 개발자 온보딩 문서

### 7. 기능 확장
- 쿠폰 시스템
- 포인트/리워드 프로그램
- 실시간 채팅 (WebSocket)
- 위치 기반 추천 알고리즘
- 다국어 지원 (i18n)

---

## 🏆 강점

1. **체계적인 아키텍처**: 도메인 중심 설계로 확장성과 유지보수성 확보
2. **최신 기술 스택**: Java 21, Spring Boot 3.5.6 등 최신 기술 활용
3. **완벽한 인증 시스템**: JWT + OAuth2 + RBAC
4. **동적 가격 책정**: 유연한 비즈니스 로직
5. **관측성**: Micrometer + 알림 시스템
6. **데이터베이스 관리**: Flyway를 통한 체계적 마이그레이션
7. **API 문서화**: Swagger UI 자동 생성
8. **보안**: 다층 보안 구조

---

## ⚠️ 개선 영역

1. **테스트 부족**: 단 2개의 테스트 파일 (비즈니스 로직 테스트 필요)
2. **문서 불일치 가능성**: README에서 ARCHITECTURE.md 참조하지만 파일 없음
3. **모니터링 부족**: 프로덕션 레벨 APM 필요
4. **에러 처리**: 전역 예외 처리 핸들러 검증 필요

---

## 📝 결론

CampStation 백엔드는 **엔터프라이즈급 캠핑장 예약 플랫폼**을 위한 견고한 기반을 갖춘 프로젝트입니다. 도메인 중심 설계, 최신 기술 스택, 체계적인 데이터베이스 관리, 완벽한 인증 시스템 등 많은 강점을 보유하고 있습니다.

다만, **테스트 커버리지 확대**와 **프로덕션 모니터링 강화**가 시급한 과제입니다. 현재 207개의 Java 파일 중 단 2개의 테스트 파일만 존재하므로, Testcontainers를 활용한 통합 테스트 작성이 필요합니다.

전반적으로 프로젝트는 **프로덕션 준비 단계에 근접**해 있으며, 위에서 제안한 개선 사항들을 단계적으로 적용한다면 **안정적이고 확장 가능한 서비스**로 발전할 수 있을 것으로 판단됩니다.

**추천 다음 단계**:
1. 핵심 도메인(reservation, payment) 통합 테스트 작성
2. CI/CD 파이프라인 완성
3. 프로덕션 모니터링 시스템 구축
4. 성능 테스트 및 최적화

---

**보고서 작성일**: 2025-11-16
**분석 기준**: 프로젝트 소스 코드, Git 히스토리, 문서
**총 분석 파일**: 207개 Java 파일, 19개 마이그레이션 스크립트
**작성자**: Claude AI Assistant
