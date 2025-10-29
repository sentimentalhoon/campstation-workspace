# AWS 배포 가이드

이 가이드는 CampStation 프로젝트를 AWS에 배포하는 방법을 설명합니다.

## 사전 준비사항

1. **AWS 계정 및 CLI 설정**

   - AWS 계정 생성 및 IAM 사용자 설정
   - AWS CLI 설치 및 구성
   - GitHub 리포지토리 생성

2. **필요한 도구들**
   - Terraform (v1.0 이상)
   - AWS CLI
   - Docker
   - Git

## 배포 단계

### 1. GitHub Secrets 설정

GitHub 리포지토리의 Settings > Secrets and variables > Actions에서 다음 시크릿들을 추가하세요:

```
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
```

### 2. Terraform으로 인프라 구축

```bash
cd infrastructure

# Terraform 초기화
terraform init

# 계획 확인
terraform plan

# 인프라 생성
terraform apply
```

### 3. 데이터베이스 초기화

Terraform apply 완료 후, 출력된 RDS 엔드포인트를 사용하여 데이터베이스를 초기화하세요:

```bash
# 로컬에서 데이터베이스 마이그레이션 실행
./backend/gradlew bootRun --args='--spring.profiles.active=prod'
```

### 4. GitHub Actions으로 배포

main 브랜치에 푸시하면 자동으로 배포가 시작됩니다:

```bash
git add .
git commit -m "Deploy to AWS"
git push origin main
```

## 인프라 구성

### 네트워킹

- **VPC**: 10.0.0.0/16 CIDR
- **서브넷**: 퍼블릭/프라이빗 서브넷 3개씩 (가용영역별)
- **NAT Gateway**: 프라이빗 서브넷 인터넷 접근용

### 컴퓨팅

- **ECS Fargate**: 서버리스 컨테이너 실행
- **프론트엔드**: 256 CPU, 512MB 메모리
- **백엔드**: 512 CPU, 1024MB 메모리

### 데이터베이스

- **RDS PostgreSQL**: db.t3.micro (프리 티어)
- **ElastiCache Redis**: cache.t3.micro (프리 티어)

### 스토리지

- **S3**: 파일 저장용 (프리 티어: 5GB)
- **CloudFront**: CDN으로 정적 파일 최적화

### 로드 밸런싱

- **ALB**: 애플리케이션 로드 밸런서
- **대상 그룹**: 프론트엔드(포트 80), 백엔드(포트 8080)

## 비용 최적화

### AWS 프리 티어 활용

- **EC2**: t3.micro 인스턴스 사용
- **RDS**: db.t3.micro (750시간 무료)
- **ElastiCache**: cache.t3.micro (750시간 무료)
- **S3**: 5GB 저장, 20,000 GET 요청, 100GB 전송 무료

### 예상 월 비용 (프리 티어 이후)

- **ECS Fargate**: 약 $10-20/월
- **RDS**: 약 $15/월
- **ElastiCache**: 약 $10/월
- **S3**: 약 $1-5/월
- **CloudFront**: 약 $1-3/월
- **ALB**: 약 $20/월

**총 예상 비용**: 약 $60-80/월 (트래픽에 따라 변동)

## 모니터링 및 관리

### 로그 확인

```bash
# CloudWatch 로그 그룹
/aws/ecs/campstation-frontend
/aws/ecs/campstation-backend
```

### 서비스 상태 확인

```bash
# ECS 서비스 상태
aws ecs describe-services --cluster campstation-cluster --services campstation-frontend-service campstation-backend-service
```

### 배포 롤백

GitHub Actions에서 이전 커밋으로 롤백하거나, ECS 콘솔에서 이전 작업 정의로 업데이트하세요.

## 보안 고려사항

1. **환경 변수**: 실제 배포 시 terraform.tfvars의 데이터베이스 비밀번호를 강력한 값으로 변경
2. **SSL/TLS**: 프로덕션 환경에서는 ACM 인증서와 HTTPS 설정 권장
3. **IAM**: 최소 권한 원칙 적용
4. **네트워크**: 보안 그룹으로 불필요한 포트 차단

## 문제 해결

### 일반적인 문제들

1. **ECR 푸시 실패**: AWS 자격 증명 확인
2. **컨테이너 시작 실패**: CloudWatch 로그 확인
3. **데이터베이스 연결 실패**: 보안 그룹과 VPC 설정 확인
4. **헬스 체크 실패**: 애플리케이션 엔드포인트 확인

### 로그 확인 명령어

```bash
# ECS 작업 로그
aws logs tail /aws/ecs/campstation-frontend --follow
aws logs tail /aws/ecs/campstation-backend --follow
```

## 다음 단계

1. **도메인 연결**: Route 53으로 커스텀 도메인 설정
2. **SSL 인증서**: AWS ACM으로 HTTPS 설정
3. **CI/CD 개선**: 테스트 단계 추가, 블루-그린 배포 구현
4. **모니터링**: CloudWatch 대시보드 설정
5. **백업**: RDS 자동 백업 설정
