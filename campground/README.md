# CampStation - Campground Reservation System

캠프장 예약 및 관리 시스템

## 🏕️ 프로젝트 소개

캠프장 예약, 결제, 리뷰 관리를 위한 풀스택 웹 애플리케이션입니다.

## 🛠️ 기술 스택

### Backend

- **Framework**: Spring Boot 3.5.6
- **Language**: Java 17
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Storage**: MinIO (S3-compatible)
- **Payment**: Toss Payments

### Frontend

- **Framework**: Next.js 15
- **Language**: TypeScript
- **UI**: Tailwind CSS
- **State Management**: React Query
- **Maps**: Naver Maps API

## 📦 프로젝트 구조

```
campground/
├── backend/              # Spring Boot API
├── frontend/             # Next.js Frontend
└── docker-compose*.yml   # Docker 설정
```

## 🚀 시작하기

### 개발 환경

```bash
# Docker로 실행
docker-compose up -d

# 또는 개별 실행
cd backend
./gradlew bootRun

cd frontend
npm install
npm run dev
```

### 환경 변수 설정

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

## 🌐 배포

- **도메인**: https://mycamp.duckdns.org
- **포트**:
  - Frontend: 3000
  - Backend: 8080

## 📝 주요 기능

- 캠프장 검색 및 필터링
- 실시간 예약 및 결제
- 리뷰 작성 및 관리
- 관리자 대시보드
- 사업자 캠프장 관리

## 📄 License

Private Project
