# PC방 블랙리스트 커뮤니티

PC방 업주들을 위한 블랙리스트 공유 커뮤니티 플랫폼입니다.

## 기술 스택

### Backend

- **Ktor 2.3.8** - Kotlin 웹 프레임워크
- **PostgreSQL 16** - 관계형 데이터베이스
- **Redis 7** - 캐싱 및 세션 저장소
- **MinIO** - S3 호환 객체 스토리지
- **Exposed ORM** - Kotlin SQL 프레임워크
- **Flyway** - 데이터베이스 마이그레이션

### Frontend

- **Vue 3** - 프로그레시브 JavaScript 프레임워크
- **Vite** - 빌드 도구
- **Lucide Icons** - 아이콘 라이브러리

## 주요 기능

- 블랙리스트 등록 및 조회
- 이미지 업로드 (썸네일 자동 생성)
  - 원본 이미지: 최대 1920x1080 (Full HD)
  - 썸네일: 400x300
  - WebP 변환 지원 (80% 품질)
  - Progressive JPEG
  - EXIF 메타데이터 자동 제거
- 지역별 필터링
- 위험도별 분류 (위험/경고/주의)
- 조회수 추적

## 개발 환경 설정

### 1. 환경 변수 설정

```bash
cp .env.example .env
# .env 파일을 열어 필요한 값 수정
```

### 2. Docker Compose로 실행

```bash
docker-compose up -d
```

### 3. 접속

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:8081
- **MinIO Console**: http://localhost:9003

## 프로젝트 구조

```
community/
├── backend/                 # Ktor 백엔드
│   ├── src/
│   │   ├── main/
│   │   │   ├── kotlin/
│   │   │   │   └── com/campstation/community/
│   │   │   │       ├── config/        # 설정 (S3, Database 등)
│   │   │   │       ├── database/      # DB 연결 및 Flyway
│   │   │   │       ├── models/        # 데이터 모델
│   │   │   │       ├── routes/        # API 라우트
│   │   │   │       ├── services/      # 비즈니스 로직
│   │   │   │       └── Application.kt
│   │   │   └── resources/
│   │   │       └── db/migration/      # Flyway 마이그레이션
│   │   └── test/
│   ├── build.gradle.kts
│   └── Dockerfile
├── frontend/                # Vue 프론트엔드
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── services/        # API 호출
│   │   ├── types/           # 유틸리티
│   │   └── main.js
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## 이미지 최적화 기능

### 자동 최적화

- **파일 크기 검증**: 최대 10MB
- **최소 크기 검증**: 100x100px
- **원본 이미지**: Full HD (1920x1080) 리사이즈
- **썸네일**: 400x300 자동 생성
- **WebP 변환**: 더 나은 압축률 (기본 활성화)
- **JPEG 품질**: 85% (Progressive JPEG)
- **EXIF 제거**: 프라이버시 보호

### 설정 변경

`backend/src/main/kotlin/com/campstation/community/services/S3ImageService.kt`:

```kotlin
const val ENABLE_WEBP_CONVERSION = true   // WebP 변환 on/off
const val WEBP_QUALITY = 0.80f           // WebP 품질 (0.0-1.0)
const val JPEG_QUALITY = 0.85f           // JPEG 품질 (0.0-1.0)
const val REMOVE_EXIF = true             // EXIF 제거 on/off
```

## API 엔드포인트

### 블랙리스트

- `GET /api/blacklists` - 목록 조회
- `GET /api/blacklists/:id` - 상세 조회
- `POST /api/blacklists` - 등록
- `PUT /api/blacklists/:id` - 수정
- `DELETE /api/blacklists/:id` - 삭제

### 이미지

- `POST /api/community/upload/image` - 이미지 업로드
- `DELETE /api/community/upload/image` - 이미지 삭제

## 데이터베이스 마이그레이션

Flyway를 사용하여 자동 마이그레이션됩니다.

### 마이그레이션 파일

- `V1__Initial_schema.sql` - 초기 스키마
- `V2__Add_image_type_column.sql` - 이미지 타입 구분

## 배포

### Production 환경 변수 설정

```bash
# .env 파일 수정
DB_PASSWORD=강력한_비밀번호
AWS_S3_BUCKET_NAME=community-prod
CLOUD_AWS_S3_PUBLIC_ENDPOINT=https://yourdomain.com/storage
VITE_API_URL=https://yourdomain.com/api/community
```

### Docker Compose로 배포

```bash
docker-compose -f docker-compose.yml up -d --build
```

## 라이선스

Private Project
