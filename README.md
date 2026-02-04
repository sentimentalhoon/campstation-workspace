# 🏕️ CampStation (캠프스테이션)

> **Modern Camping Site Reservation & Management Platform**
>
> **최신 기술 스택으로 구축된 캠핑장 예약 및 관리 올인원 플랫폼**

CampStation은 캠핑장 운영자와 캠퍼를 연결하는 종합 예약 플랫폼입니다.
캠퍼에게는 편리한 검색과 예약 경험을, 운영자에게는 강력한 관리 도구와 매출 분석 기능을 제공합니다.

---

## 🌟 Key Features (주요 기능)

### 👤 For Campers (캠퍼)

- **Campground Search**: 지도 및 필터 기반의 캠핑장 검색 (`/map`)
- **Real-time Reservation**: 실시간 예약 가능 여부 확인 및 결제 (`/reservations`)
- **Social Login**: Google, Kakao, Naver 소셜 로그인 지원
- **User Dashboard**: 예약 내역 관리, 즐겨찾기, 리뷰 작성 (`/dashboard/user`)
- **Payment**: 토스페이먼츠(Toss Payments) 연동을 통한 간편 결제

### 🏢 For Owners (캠핑장 사장님)

- **Owner Dashboard**: 직관적인 예약 현황 및 매출 통계 (`/dashboard/owner`)
- **Site Management**: 캠핑장 및 사이트 정보, 요금 설정 (`/dashboard/owner/campgrounds`)
- **Reservation Management**: 예약 승인/거절, 체크인/아웃 관리
- **Analytics**: 기간별 매출 분석 및 방문자 통계

### 🛠️ For Admin (관리자)

- **System Management**: 회원 및 콘텐츠 관리, 시스템 설정

---

## 🏗️ Technology Stack (기술 스택)

### Frontend

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/), TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), Shadcn UI
- **State/Data**: React Query, Zustand
- **Tools**: Vitest, Playwright

### Backend

- **Framework**: [Spring Boot 3.5.6](https://spring.io/projects/spring-boot)
- **Language**: Java 21
- **Security**: Spring Security (JWT, OAuth2 Client)
- **Database**: JPA (Hibernate), PostgreSQL
- **Build**: Gradle

### Infrastructure & Data

- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Storage**: MinIO (S3 Compatible Object Storage)
- **Gateway**: Nginx (Reverse Proxy, SSL termination)
- **Container**: Docker, Docker Compose

---

## 🚀 Getting Started (시작하기)

### Prerequisites (준비물)

- [Docker](https://www.docker.com/) & Docker Compose
- [Git](https://git-scm.com/)

### Installation (설치 및 실행)

#### 1. Repository Clone

```bash
git clone https://github.com/your-repo/campstation-workspace.git
cd campstation-workspace
```

#### 2. Environment Setup (환경 설정)

자동 설정 스크립트를 사용하여 환경 변수(`.env`)와 보안 키를 생성합니다.

**Infrastructure (Nginx & SSL)**

```bash
cd infrastructure
./setup-env.sh  # 도메인 및 이메일 입력
./init-ssl.sh   # SSL 인증서 발급 (최초 1회)
```

**Application (Backend & Frontend)**

```bash
cd ../campground
./setup-env.sh  # DB 비밀번호, JWT 시크릿 키 자동 생성
```

#### 3. Run Application (실행)

```bash
# Production Mode Run
docker compose -f docker-compose.prod.yml up -d --build
```

#### 4. Access (접속)

- **Main Service**: `https://your-domain.com`
- **MinIO Console**: `https://your-domain.com/minio-console` (Port 9003)
- **Portainer (Optional)**: If configured

---

## 📂 Project Structure (프로젝트 구조)

```
campstation-workspace/
├── 📁 campground/              # Main Application Code
│   ├── 📁 backend/             # Spring Boot Server
│   │   └── src/main/java/com/campstation/camp/
│   │       ├── auth/           # Authentication (Login/Signup)
│   │       ├── campground/     # Campground Domain
│   │       ├── reservation/    # Reservation Domain
│   │       ├── payment/        # Payment Integration
│   │       └── ...
│   ├── 📁 frontend/            # Next.js Client
│   │   └── app/                # App Router Pages
│   │       ├── dashboard/      # User/Owner Dashboards
│   │       ├── map/            # Map Search
│   │       ├── reservations/   # Booking Flow
│   │       └── ...
│   ├── docker-compose.prod.yml # Production Orchestration
│   └── setup-env.sh            # Environment Generator
│
└── 📁 infrastructure/          # Server Infrastructure
    ├── 📁 nginx/               # Nginx Configuration
    ├── docker-compose.yml      # Infra Services (Nginx, Certbot)
    ├── init-ssl.sh             # SSL Certificate Manager
    └── apply-nginx-config.sh   # Config Generator
```

---

## 🔒 Security (보안)

- **SSL/TLS**: Let's Encrypt를 통한 전 구간 HTTPS 적용
- **Authentication**: JWT Access/Refresh Token 기반 인증
- **Password**: Bcrypt 암호화 저장
- **Network**: Docker Network 격리 (`web-proxy-net`, `campstation-network`)

---

## � License

This project is licensed under the MIT License.
