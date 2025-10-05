# ================================
# CampStation - 프로덕션 환경 설정
# ================================
# 프로덕션 환경에서 사용되는 환경 변수 설정
# 실제 데이터베이스, Redis, S3, 이메일 서비스 사용

# ================================
# 애플리케이션 기본 설정
# ================================
SPRING_PROFILES_ACTIVE=prod
APP_NAME=CampStation
APP_VERSION=1.0.0

# ================================
# 데이터베이스 설정 (실제 PostgreSQL)
# ================================
DB_URL=jdbc:postgresql://your-production-db-host:5432/campstation
DB_DRIVER=org.postgresql.Driver
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}
DB_POOL_SIZE=50
DB_POOL_MIN_IDLE=10
DB_CONNECTION_TIMEOUT=30000
DB_IDLE_TIMEOUT=300000
DB_MAX_LIFETIME=600000

# ================================
# Redis 캐시 설정 (실제 Redis)
# ================================
REDIS_HOST=${REDIS_HOST}
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_TIMEOUT=2000ms
REDIS_MAXMEMORY=1gb
REDIS_MAXMEMORY_POLICY=allkeys-lru

# ================================
# JWT 인증 설정 (강화된 보안)
# ================================
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRATION=1800000
JWT_REFRESH_EXPIRATION=604800000

# ================================
# CORS 크로스 오리진 설정
# ================================
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# ================================
# AWS S3 파일 저장소 설정 (실제 AWS S3)
# ================================
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET_NAME=campstation-production
AWS_S3_ENDPOINT=https://s3.ap-northeast-2.amazonaws.com
AWS_S3_EXTERNAL_ENDPOINT=https://s3.ap-northeast-2.amazonaws.com

# ================================
# 파일 업로드 설정
# ================================
FILE_UPLOAD_PATH=s3://campstation-production/
FILE_MAX_SIZE_BYTES=52428800

# ================================
# 이메일 설정 (실제 SMTP)
# ================================
MAIL_HOST=${MAIL_HOST}
MAIL_PORT=587
MAIL_USERNAME=${MAIL_USERNAME}
MAIL_PASSWORD=${MAIL_PASSWORD}

# ================================
# 로깅 설정 (프로덕션용)
# ================================
LOG_LEVEL=WARN
SECURITY_LOG_LEVEL=WARN
SQL_LOG_LEVEL=ERROR
LOG_FILE=/app/logs/campstation.log

# ================================
# 관리자 계정 설정
# ================================
ADMIN_USERNAME=${ADMIN_USERNAME}
ADMIN_PASSWORD=${ADMIN_PASSWORD}

# ================================
# 서버 설정
# ================================
SERVER_PORT=8080
SERVER_ADDRESS=0.0.0.0

# ================================
# 액추에이터 모니터링 설정 (보안 강화)
# ================================
MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE=health
MANAGEMENT_ENDPOINT_HEALTH_SHOW_DETAILS=never
MANAGEMENT_SERVER_PORT=8081
MANAGEMENT_SERVER_ADDRESS=127.0.0.1

# ================================
# Docker Compose 설정 (프로덕션용)
# ================================
COMPOSE_PROJECT_NAME=campstation-prod
COMPOSE_FILE=docker-compose.yml:docker-compose.prod.yml