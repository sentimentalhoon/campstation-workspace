# AWS 클라우드 배포 계획 (ECS Fargate 기반)# AWS 클라우드 배포 계획

## 🎯 배포 아키텍처 (ECS Fargate + ALB 기반)## 🎯 배포 아키텍처 (App Runner 기반)

````

┌─────────────────┐    ┌─────────────────┐┌─────────────────┐    ┌─────────────────┐

│   CloudFront    │────│   ALB (80/443)  ││   CloudFront    │────│  App Runner     │

│   (CDN)         │    └─────────────────┘│   (CDN)         │    │  (Frontend)     │

└─────────────────┘             │└─────────────────┘    └─────────────────┘

                                │                                │

            ┌───────────────────┼───────────────────┐                                ▼

            ▼                   ▼                   ▼┌─────────────────┐    ┌─────────────────┐

   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│  Route 53       │────│  App Runner     │

   │   ECS Fargate   │ │   ECS Fargate   │ │  S3 Bucket      ││  (DNS)          │    │  (Backend)      │

   │   (Frontend)    │ │   (Backend)     │ │  (File Storage) │└─────────────────┘    └─────────────────┘

   │   Next.js       │ │   Spring Boot   │ └─────────────────┘                                │

   └─────────────────┘ └─────────────────┘          │            ┌───────────────────┼───────────────────┐

            │                   │                   │            ▼                   ▼                   ▼

            └───────────────────┼───────────────────┘   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐

                                ▼   │  RDS PostgreSQL │ │ ElastiCache     │ │  S3 Bucket      │

                       ┌─────────────────┐   │  (Database)     │ │ (Redis)         │ │  (File Storage) │

                       │   NAT Gateway   │   └─────────────────┘ └─────────────────┘ └─────────────────┘

                       └─────────────────┘```

                                │

            ┌───────────────────┼───────────────────┐## 🔧 1단계: 인프라 준비

            ▼                   ▼                   ▼

   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐### RDS PostgreSQL 생성

   │  RDS PostgreSQL │ │ ElastiCache     │ │  CloudWatch     │

   │  (Database)     │ │ (Redis)         │ │  (Logs)         │```bash

   └─────────────────┘ └─────────────────┘ └─────────────────┘# AWS CLI로 RDS 인스턴스 생성

```aws rds create-db-instance \

  --db-instance-identifier campstation-prod \

## 🔧 1단계: 인프라 준비 (Terraform)  --db-instance-class db.t3.micro \

  --engine postgres \

### Terraform으로 전체 인프라 구축  --master-username campstation \

  --master-user-password "SecurePassword123!" \

```bash  --allocated-storage 20 \

cd infrastructure  --vpc-security-group-ids sg-xxxxxxxxx \

  --backup-retention-period 7 \

# Terraform 초기화  --storage-encrypted

terraform init```



# 인프라 계획 확인### ElastiCache Redis 생성

terraform plan

```bash

# 인프라 생성 (약 15-20분 소요)aws elasticache create-cache-cluster \

terraform apply  --cache-cluster-id campstation-redis \

```  --cache-node-type cache.t3.micro \

  --engine redis \

**생성되는 리소스:**  --num-cache-nodes 1

- VPC, 서브넷, 보안 그룹```

- RDS PostgreSQL (db.t3.micro)

- ElastiCache Redis (cache.t3.micro)### S3 버킷 생성 (파일 업로드용)

- ECS 클러스터 및 서비스

- ALB (Application Load Balancer)```bash

- S3 버킷 + CloudFront CDNaws s3 mb s3://campstation-uploads-prod

- ECR 리포지토리aws s3api put-bucket-cors --bucket campstation-uploads-prod --cors-configuration file://cors.json

```

## 🚀 2단계: 애플리케이션 배포 (GitHub Actions)

## 🚀 2단계: 애플리케이션 배포

### GitHub Actions CI/CD 설정

### Backend App Runner 설정

1. **GitHub Secrets 설정:**

   ```1. AWS Console → App Runner

   AWS_ACCESS_KEY_ID=your_access_key2. Source: GitHub 리포지토리 연결

   AWS_SECRET_ACCESS_KEY=your_secret_key3. Build settings:

   ```   ```yaml

   runtime: docker

2. **자동 배포 트리거:**   commands:

   ```bash     build:

   git add .       - echo "Building backend..."

   git commit -m "Deploy to AWS ECS"     pre-build:

   git push origin main       - echo "Pre-build phase"

   ```   dockerfile: backend/Dockerfile

   ```

**배포 과정:**

- Docker 이미지 빌드 (Frontend/Backend)### Frontend App Runner 설정

- ECR에 이미지 푸시

- ECS 작업 정의 업데이트1. AWS Console → App Runner

- 롤링 업데이트로 서비스 재배포2. Source: GitHub 리포지토리 연결

3. Build settings:

## 🔒 3단계: 환경 변수 설정   ```yaml

   runtime: docker

### Backend 환경 변수 (.env.prod)   commands:

     build:

```bash       - echo "Building frontend..."

# 서버 설정   dockerfile: frontend/Dockerfile

SERVER_URL=http://your-alb-dns-name   ```

FRONTEND_URL=http://your-alb-dns-name

## 🔒 3단계: 환경 변수 설정

# 데이터베이스

DB_HOST=campstation-db.xxxxxxxxxxxx.ap-northeast-2.rds.amazonaws.com### Backend 환경 변수

DB_PORT=5432

DB_NAME=campstation```bash

DB_USERNAME=campstation_userSPRING_PROFILES_ACTIVE=prod

DB_PASSWORD=your_secure_passwordDB_URL=jdbc:postgresql://[RDS-ENDPOINT]:5432/campstation

DB_USERNAME=campstation

# RedisDB_PASSWORD=SecurePassword123!

REDIS_HOST=campstation-redis.xxxxxx.ng.0001.apn2.cache.amazonaws.comREDIS_HOST=[ELASTICACHE-ENDPOINT]

REDIS_PORT=6379REDIS_PORT=6379

JWT_SECRET=[SECURE-JWT-SECRET]

# AWS S3AWS_S3_BUCKET=campstation-uploads-prod

AWS_S3_BUCKET_NAME=campstation-files-xxxxxxxxAWS_REGION=ap-northeast-2

AWS_S3_REGION=ap-northeast-2```

AWS_S3_ACCESS_KEY_ID=your_access_key

AWS_S3_SECRET_ACCESS_KEY=your_secret_key### Frontend 환경 변수



# JWT 및 OAuth```bash

JWT_SECRET=your_jwt_secretNEXT_PUBLIC_API_URL=https://[BACKEND-APP-RUNNER-URL]/api

GOOGLE_CLIENT_ID=your_google_client_idNEXT_PUBLIC_KAKAO_MAP_API_KEY=14274277b7b930e3289085afa313c81c

GOOGLE_CLIENT_SECRET=your_google_client_secret```

```

## 📦 4단계: Docker 이미지 최적화

### Frontend 환경 변수

### Production Dockerfile 생성 필요

```bash

NEXT_PUBLIC_API_URL=http://your-alb-dns-name:8080/api- Multi-stage build

NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_api_key- 보안 최적화

```- 크기 최소화



## 📦 4단계: Docker 이미지 최적화## 🔍 5단계: 모니터링 & 로깅



### Multi-stage Build 적용### CloudWatch 설정



**Backend Dockerfile.prod:**- 애플리케이션 로그

```dockerfile- 메트릭 대시보드

# Build stage- 알람 설정

FROM gradle:7.6-jdk17 AS build

WORKDIR /app### X-Ray 트레이싱 (선택)

COPY . .

RUN ./gradlew bootJar -x test- 성능 모니터링

- 병목 지점 분석

# Runtime stage

FROM openjdk:17-jre-slim## 💰 예상 비용 (월간)

WORKDIR /app

COPY --from=build /app/build/libs/*.jar app.jar| 서비스                | 사양            | 예상 비용 |

EXPOSE 8080| --------------------- | --------------- | --------- |

ENTRYPOINT ["java", "-jar", "app.jar"]| App Runner (Backend)  | 1 vCPU, 2GB RAM | $25-50    |

```| App Runner (Frontend) | 1 vCPU, 2GB RAM | $25-50    |

| RDS PostgreSQL        | db.t3.micro     | $15-25    |

**Frontend Dockerfile.prod:**| ElastiCache Redis     | cache.t3.micro  | $15-20    |

```dockerfile| CloudFront            | CDN             | $5-10     |

# Build stage| S3                    | 파일 저장소     | $5-10     |

FROM node:18-alpine AS build| **총 예상 비용**      | **$90-165/월**  |

WORKDIR /app

COPY package*.json ./## 🎯 단계별 실행 순서

RUN npm ci

COPY . .1. **인프라 생성** (RDS, ElastiCache, S3)

RUN npm run build2. **GitHub 리포지토리 준비** (Dockerfile 최적화)

3. **App Runner 서비스 생성** (Backend → Frontend)

# Runtime stage4. **도메인 연결** (Route 53 + 사용자 도메인)

FROM node:18-alpine AS runtime5. **SSL 인증서** (Certificate Manager)

WORKDIR /app6. **모니터링 설정** (CloudWatch)

COPY --from=build /app/package*.json ./

COPY --from=build /app/.next ./.next## 🔄 CI/CD 파이프라인

COPY --from=build /app/public ./public

RUN npm ci --only=production```yaml

EXPOSE 3000# GitHub Actions 워크플로우

CMD ["npm", "start"]name: Deploy to AWS

```on:

  push:

## 🔍 5단계: 모니터링 & 로깅    branches: [main]



### CloudWatch 설정jobs:

  deploy:

**로그 그룹:**    runs-on: ubuntu-latest

- `/aws/ecs/campstation-frontend`    steps:

- `/aws/ecs/campstation-backend`      - uses: actions/checkout@v3

      - name: Deploy to App Runner

**모니터링 대시보드:**        # App Runner는 자동으로 GitHub과 연동되어 배포됨

- ECS 서비스 메트릭```

- ALB 요청 수/응답 시간

- RDS 연결 수/CPU 사용률## 🚨 보안 고려사항

- Redis 메모리 사용률

1. **IAM 역할** 최소 권한 원칙

### 헬스 체크 엔드포인트2. **VPC** 네트워크 분리

3. **보안 그룹** 포트 제한

- Frontend: `GET /` (Next.js 기본)4. **SSL/TLS** 암호화

- Backend: `GET /actuator/health` (Spring Boot Actuator)5. **환경 변수** 암호화 저장


## 💰 예상 비용 (월간) - 프리 티어 최적화

| 서비스              | 사양                  | 프리 티어    | 예상 비용 |
| ------------------- | --------------------- | ------------ | --------- |
| ECS Fargate         | Frontend: 0.25vCPU/0.5GB<br>Backend: 0.5vCPU/1GB | 2개월 무료   | $10-20    |
| RDS PostgreSQL      | db.t3.micro           | 750시간 무료 | $15       |
| ElastiCache Redis   | cache.t3.micro        | 750시간 무료 | $10       |
| ALB                 | Application Load Balancer | -          | $20       |
| CloudFront          | CDN                   | 1TB 전송 무료| $1-3      |
| S3                  | 파일 저장소           | 5GB 무료     | $1-5      |
| **총 예상 비용**    | **프리 티어 2개월 후** | **$60-80/월** |           |

**💡 비용 절감 팁:**
- Fargate Spot 사용으로 70% 비용 절감
- RDS/Redis 예약 인스턴스로 추가 절감
- CloudFront로 데이터 전송 비용 최적화

## 🎯 단계별 실행 순서

### Phase 1: 인프라 구축 (1-2시간)
1. **AWS 계정 준비** (CLI, IAM 권한 설정)
2. **Terraform 실행** (VPC, RDS, ECS 등 생성)
3. **GitHub Secrets 설정** (AWS 자격 증명)

### Phase 2: 애플리케이션 배포 (30분-1시간)
4. **환경 변수 설정** (.env.prod 파일 생성)
5. **GitHub Actions 트리거** (main 브랜치 푸시)
6. **배포 완료 대기** (ECS 서비스 안정화까지)

### Phase 3: 검증 및 최적화 (1-2시간)
7. **접속 테스트** (ALB DNS로 애플리케이션 확인)
8. **모니터링 설정** (CloudWatch 알람)
9. **성능 최적화** (오토 스케일링 설정)

## 🔄 CI/CD 파이프라인 상세

### GitHub Actions 워크플로우 (.github/workflows/deploy.yml)

```yaml
name: Deploy to AWS ECS
on:
  push:
    branches: [main, master]

env:
  AWS_REGION: ap-northeast-2
  ECR_REPOSITORY_FRONTEND: campstation-frontend
  ECR_REPOSITORY_BACKEND: campstation-backend
  ECS_CLUSTER: campstation-cluster
  ECS_SERVICE_FRONTEND: campstation-frontend-service
  ECS_SERVICE_BACKEND: campstation-backend-service

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Build and push Docker images
        run: |
          # ECR 로그인 및 이미지 빌드/푸시
          aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

          # Frontend 빌드
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY_FRONTEND:$GITHUB_SHA ./frontend
          docker push $ECR_REGISTRY/$ECR_REPOSITORY_FRONTEND:$GITHUB_SHA

          # Backend 빌드
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY_BACKEND:$GITHUB_SHA ./backend
          docker push $ECR_REGISTRY/$ECR_REPOSITORY_BACKEND:$GITHUB_SHA

      - name: Update ECS services
        run: |
          # 작업 정의 업데이트 및 서비스 재배포
          aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_SERVICE_FRONTEND --force-new-deployment
          aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_SERVICE_BACKEND --force-new-deployment
```

## 🚨 보안 고려사항

### 네트워크 보안
- **VPC 분리:** 퍼블릭/프라이빗 서브넷 분리
- **보안 그룹:** 최소 포트만 개방 (80, 443, 5432, 6379)
- **NAT Gateway:** 프라이빗 서브넷 인터넷 접근

### 애플리케이션 보안
- **환경 변수:** 민감 정보 암호화 저장
- **IAM 역할:** 최소 권한 원칙 적용
- **SSL/TLS:** HTTPS 강제 (추후 ACM 인증서 적용)

### 데이터 보안
- **RDS 암호화:** 저장 데이터 암호화
- **S3 암호화:** 서버 사이드 암호화
- **백업:** 자동 백업 설정

## 🔧 문제 해결 가이드

### 일반적인 문제들

1. **Terraform apply 실패**
   - AWS 권한 확인
   - 리전 설정 확인
   - 기존 리소스 충돌 확인

2. **ECS 배포 실패**
   - CloudWatch 로그 확인
   - 작업 정의 검증
   - 보안 그룹 설정 확인

3. **데이터베이스 연결 실패**
   - VPC/보안 그룹 설정 확인
   - 연결 문자열 검증
   - RDS 엔드포인트 확인

### 모니터링 명령어

```bash
# ECS 서비스 상태 확인
aws ecs describe-services --cluster campstation-cluster --services campstation-frontend-service

# CloudWatch 로그 조회
aws logs tail /aws/ecs/campstation-backend --follow

# ALB 타겟 헬스 상태
aws elbv2 describe-target-health --target-group-arn your-target-group-arn
```

## 🎉 다음 단계 (프로덕션 준비)

1. **커스텀 도메인:** Route 53으로 도메인 연결
2. **SSL 인증서:** AWS ACM으로 HTTPS 설정
3. **오토 스케일링:** CPU/메모리 기반 자동 확장
4. **백업 전략:** RDS 자동 백업 및 크로스 리전 복제
5. **재해 복구:** 다중 AZ 배포 고려
````
