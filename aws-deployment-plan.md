# AWS 클라우드 배포 계획

## 🎯 배포 아키텍처 (App Runner 기반)

```
┌─────────────────┐    ┌─────────────────┐
│   CloudFront    │────│  App Runner     │
│   (CDN)         │    │  (Frontend)     │
└─────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌─────────────────┐
│  Route 53       │────│  App Runner     │
│  (DNS)          │    │  (Backend)      │
└─────────────────┘    └─────────────────┘
                                │
            ┌───────────────────┼───────────────────┐
            ▼                   ▼                   ▼
   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
   │  RDS PostgreSQL │ │ ElastiCache     │ │  S3 Bucket      │
   │  (Database)     │ │ (Redis)         │ │  (File Storage) │
   └─────────────────┘ └─────────────────┘ └─────────────────┘
```

## 🔧 1단계: 인프라 준비

### RDS PostgreSQL 생성

```bash
# AWS CLI로 RDS 인스턴스 생성
aws rds create-db-instance \
  --db-instance-identifier campstation-prod \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username campstation \
  --master-user-password "SecurePassword123!" \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --backup-retention-period 7 \
  --storage-encrypted
```

### ElastiCache Redis 생성

```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id campstation-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1
```

### S3 버킷 생성 (파일 업로드용)

```bash
aws s3 mb s3://campstation-uploads-prod
aws s3api put-bucket-cors --bucket campstation-uploads-prod --cors-configuration file://cors.json
```

## 🚀 2단계: 애플리케이션 배포

### Backend App Runner 설정

1. AWS Console → App Runner
2. Source: GitHub 리포지토리 연결
3. Build settings:
   ```yaml
   runtime: docker
   commands:
     build:
       - echo "Building backend..."
     pre-build:
       - echo "Pre-build phase"
   dockerfile: backend/Dockerfile
   ```

### Frontend App Runner 설정

1. AWS Console → App Runner
2. Source: GitHub 리포지토리 연결
3. Build settings:
   ```yaml
   runtime: docker
   commands:
     build:
       - echo "Building frontend..."
   dockerfile: frontend/Dockerfile
   ```

## 🔒 3단계: 환경 변수 설정

### Backend 환경 변수

```bash
SPRING_PROFILES_ACTIVE=prod
DB_URL=jdbc:postgresql://[RDS-ENDPOINT]:5432/campstation
DB_USERNAME=campstation
DB_PASSWORD=SecurePassword123!
REDIS_HOST=[ELASTICACHE-ENDPOINT]
REDIS_PORT=6379
JWT_SECRET=[SECURE-JWT-SECRET]
AWS_S3_BUCKET=campstation-uploads-prod
AWS_REGION=ap-northeast-2
```

### Frontend 환경 변수

```bash
NEXT_PUBLIC_API_URL=https://[BACKEND-APP-RUNNER-URL]/api
NEXT_PUBLIC_KAKAO_MAP_API_KEY=14274277b7b930e3289085afa313c81c
```

## 📦 4단계: Docker 이미지 최적화

### Production Dockerfile 생성 필요

- Multi-stage build
- 보안 최적화
- 크기 최소화

## 🔍 5단계: 모니터링 & 로깅

### CloudWatch 설정

- 애플리케이션 로그
- 메트릭 대시보드
- 알람 설정

### X-Ray 트레이싱 (선택)

- 성능 모니터링
- 병목 지점 분석

## 💰 예상 비용 (월간)

| 서비스                | 사양            | 예상 비용 |
| --------------------- | --------------- | --------- |
| App Runner (Backend)  | 1 vCPU, 2GB RAM | $25-50    |
| App Runner (Frontend) | 1 vCPU, 2GB RAM | $25-50    |
| RDS PostgreSQL        | db.t3.micro     | $15-25    |
| ElastiCache Redis     | cache.t3.micro  | $15-20    |
| CloudFront            | CDN             | $5-10     |
| S3                    | 파일 저장소     | $5-10     |
| **총 예상 비용**      | **$90-165/월**  |

## 🎯 단계별 실행 순서

1. **인프라 생성** (RDS, ElastiCache, S3)
2. **GitHub 리포지토리 준비** (Dockerfile 최적화)
3. **App Runner 서비스 생성** (Backend → Frontend)
4. **도메인 연결** (Route 53 + 사용자 도메인)
5. **SSL 인증서** (Certificate Manager)
6. **모니터링 설정** (CloudWatch)

## 🔄 CI/CD 파이프라인

```yaml
# GitHub Actions 워크플로우
name: Deploy to AWS
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to App Runner
        # App Runner는 자동으로 GitHub과 연동되어 배포됨
```

## 🚨 보안 고려사항

1. **IAM 역할** 최소 권한 원칙
2. **VPC** 네트워크 분리
3. **보안 그룹** 포트 제한
4. **SSL/TLS** 암호화
5. **환경 변수** 암호화 저장
