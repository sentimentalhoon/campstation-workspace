# CampStation Backend

Next.js 15 프론트엔드와 연동되는 캠핑장 예약 플랫폼의 Spring Boot 백엔드입니다. 도메인 중심 모듈 구조, JWT/OAuth2 인증, Redis 캐시, MinIO 파일 저장소, 비동기 알림 파이프라인을 포함하고 있습니다.

## ✨ 핵심 기능

- JWT + OAuth2(Google, Kakao, GitHub\*) 인증과 역할 기반 권한 제어
- 캠핑장/사이트/예약/결제/리뷰 CRUD API
- Presigned URL 기반 이미지 업로드, Redis 캐시, Flyway 마이그레이션
- Micrometer/Actuator + 이메일 경고가 결합된 관측성 파이프라인
- 테스트 데이터 자동 로딩 및 WebMvc 보안 슬라이스 테스트

> `*` GitHub Provider는 Client Secret 등록 후 활성화됩니다.

## 🧱 기술 스택

| 구분                 | 사용 기술                                             |
| -------------------- | ----------------------------------------------------- |
| Language             | Java 21                                               |
| Framework            | Spring Boot 3.5.6, Spring Data JPA, Spring Security 6 |
| Build                | Gradle (Kotlin DSL)                                   |
| Database             | PostgreSQL 15 (docker), Test/H2 선택적                |
| Cache/Session        | Redis 7                                               |
| Object Storage       | MinIO (S3 호환)                                       |
| Messaging/Alert      | Spring Events, JavaMail, (옵션) Twilio, Slack         |
| Docs & Observability | SpringDoc OpenAPI 3, Micrometer, Actuator             |
| Auth                 | JWT, OAuth2 Client                                    |

## 📁 프로젝트 구조

```
src/main/java/com/campstation/camp/
├── auth/            # 인증/인가 도메인
├── campground/      # 캠핑장 및 이미지 관리
├── reservation/     # 예약/결제/영수증
├── review/          # 리뷰 및 평점
├── user/            # 회원/즐겨찾기
├── admin/           # 관리자 전용 API
└── shared/          # config, security, notification, observability
```

도메인 간 의존은 `shared` 모듈을 통해서만 허용됩니다. 전체 관계는 [`ARCHITECTURE.md`](ARCHITECTURE.md)를 참고하세요.

## 🚀 빠른 시작

### 1. 필수 도구

- Java 21 (Temurin 권장)
- Docker & Docker Compose (전체 스택 실행 권장)
- Git

### 2. 저장소 클론

```bash
# Windows PowerShell 기준
git clone https://github.com/sentimentalhoon/campstation-workspace.git
cd campstation-workspace/backend
```

### 3. 환경 변수 설정

`.env.example`이 없다면 아래 항목을 기반으로 `.env`를 작성하거나 환경 변수로 주입하세요.

| 변수                                    | 설명            | 기본값/예시                                    |
| --------------------------------------- | --------------- | ---------------------------------------------- |
| `SPRING_DATASOURCE_URL`                 | PostgreSQL 연결 | `jdbc:postgresql://localhost:5432/campstation` |
| `SPRING_DATASOURCE_USERNAME`            | DB 사용자       | `campstation`                                  |
| `SPRING_DATASOURCE_PASSWORD`            | DB 비밀번호     | `campstation`                                  |
| `REDIS_HOST`                            | Redis 주소      | `localhost`                                    |
| `REDIS_PORT`                            | Redis 포트      | `6379`                                         |
| `MINIO_ENDPOINT`                        | MinIO 주소      | `http://localhost:9000`                        |
| `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` | MinIO 인증      | `minioadmin` / `minioadmin`                    |
| `MAIL_HOST` / `MAIL_PORT`               | MailHog SMTP    | `mailhog` / `1025`                             |
| `JWT_SECRET`                            | JWT 서명 키     | (필수)                                         |
| `OAUTH2_GOOGLE_CLIENT_ID`               | Google OAuth2   | (선택)                                         |
| `OAUTH2_GOOGLE_CLIENT_SECRET`           | Google OAuth2   | (선택)                                         |
| `OAUTH2_KAKAO_CLIENT_ID`                | Kakao OAuth2    | (선택)                                         |
| `OAUTH2_KAKAO_CLIENT_SECRET`            | Kakao OAuth2    | (선택)                                         |
| `OAUTH2_GITHUB_CLIENT_ID`               | GitHub OAuth2   | (선택)                                         |
| `OAUTH2_GITHUB_CLIENT_SECRET`           | GitHub OAuth2   | (선택)                                         |

> 로컬 개발에서는 `docker-compose.yml`의 MailHog/Redis/PostgreSQL/MinIO 서비스를 그대로 활용하는 것이 가장 빠릅니다.

### 4. Docker Compose로 빠르게 실행

```bash
# 프로젝트 루트(campstation-workspace)에서 실행
pwsh ./scripts/up-dev.ps1   # 또는 docker-compose up -d --build
```

- 백엔드 API: <http://localhost:8080>
- Swagger UI: <http://localhost:8080/swagger-ui/index.html>
- Actuator Health: <http://localhost:8080/actuator/health>
- MailHog UI: <http://localhost:8025>
- MinIO Console: <http://localhost:8900>

### 5. 로컬에서 직접 실행

```bash
# 의존 서비스는 docker-compose.dev.yml로 띄우고 백엔드는 IDE 또는 CLI로 실행
./gradlew clean build
./gradlew bootRun
```

빌드가 끝나면 `DataLoader`가 샘플 데이터(관리자/소유자/일반 사용자 계정, 캠핑장, 예약)를 자동으로 주입합니다.

## 🔐 보안 개요

| 항목      | 요약                                                                                                 |
| --------- | ---------------------------------------------------------------------------------------------------- |
| JWT       | Access + Refresh(쿠키, Redis) 조합. 만료 1분 전 자동 갱신.                                           |
| OAuth2    | Google/Kakao 기본 활성, GitHub는 Secret 등록 필요. 성공 시 JWT 발급 후 프론트 URL로 리다이렉트.      |
| Roles     | `ROLE_USER`, `ROLE_OWNER`, `ROLE_ADMIN` 구분. 캠핑장 관리/예약 승인 등은 Owner/관리자에게 제한.      |
| 감사 로깅 | `RequestLoggingInterceptor`가 사용자/URI/소요시간을 MDC에 기록하고, 느린 요청은 Alert 이벤트로 승격. |

자세한 내용은 [`ARCHITECTURE.md`](ARCHITECTURE.md#-보안--신원-계층)를 참고하세요.

## 📡 관측성 & 알림

- Micrometer + Actuator → Prometheus 스크랩을 전제.
- 500ms 이상 지연되는 요청은 `AlertPublisher`를 통해 이메일 알림 (MailHog) 전송.
- `DatabaseHealthIndicator`, `RedisHealthIndicator` 실패 시 HEALTH 경고 발행.
- Twilio SMS, Slack Webhook은 자격 증명 추가 시 자동 활성화됩니다.

## 📚 문서

| 문서                                 | 설명                                                        |
| ------------------------------------ | ----------------------------------------------------------- |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | 전체 시스템 구조, 모듈 관계, 관측성 파이프라인, 테스트 전략 |
| [`ROADMAP.md`](ROADMAP.md)           | 최신 작업 현황, 향후 일정, 리스크 및 의존성                 |
| Swagger UI                           | `/swagger-ui/index.html`                                    |
| OpenAPI JSON                         | `/v3/api-docs`                                              |

## 🧪 테스트 & 품질 게이트

```bash
# 단위 + WebMvc 슬라이스 테스트
./gradlew test

# (계획) Testcontainers 통합 테스트는 reservation 도메인부터 단계적으로 도입 예정
```

GitHub Actions에서 PR마다 `./gradlew test`와 프론트엔드 ESLint/TS 빌드가 실행되며, Slack 알림 연동은 진행 중입니다.

## 🗃️ 데이터 마이그레이션

- Flyway 마이그레이션 파일은 `src/main/resources/db/migration`에 위치합니다.
- V5~V9에서 BaseEntity 필드, 리뷰 이미지 JSON 컬럼, 캠핑장 이미지 부분 유니크 인덱스 등을 도입했습니다.
- 새로운 엔티티/컬럼 추가 시 마이그레이션 스크립트를 반드시 작성하세요.

## 🧾 빌드 산출물

```bash
# fat JAR 생성
./gradlew bootJar
java -jar build/libs/campstation-*.jar

# Docker 이미지 빌드
docker build -t campstation/backend:latest .
```

`Dockerfile`은 멀티 스테이지 빌드를 사용하며, `Dockerfile.dev`는 개발자용 경량 이미지입니다.

## 🤝 기여 가이드

1. 이슈 또는 제안은 GitHub Issues에 등록합니다.
2. 브랜치 네이밍 예: `feature/{issue-number}-short-description`.
3. PR에는 변경 요약, 테스트 결과(`./gradlew test`), 스크린샷(필요 시)을 포함합니다.
4. 문서 변경 시 `ROADMAP.md`의 "문서 & 지식 공유" 항목을 업데이트해 주세요.

## 📄 라이선스 & 문의

- 라이선스: MIT
- Maintainer: sentimentalhoon ([@GitHub](https://github.com/sentimentalhoon))
- 백엔드 이슈: <https://github.com/sentimentalhoon/campstation-workspace/issues>

---

> 문서가 실제 코드와 어긋나는 경우, PR로 수정하거나 `ROADMAP.md`의 문서 업데이트 작업에 체크해 주세요.
