#!/bin/bash
# ================================
# CampStation Production Deployment Script
# ================================
# 서버에 프로젝트를 배포하는 자동화 스크립트
# 사용법: ./deploy-server.sh YOUR_GITHUB_TOKEN

set -e  # 에러 발생 시 스크립트 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 함수 정의
print_step() {
    echo -e "${GREEN}[단계 $1]${NC} $2"
}

print_error() {
    echo -e "${RED}[에러]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[경고]${NC} $1"
}

# GitHub 토큰 확인
if [ -z "$1" ]; then
    print_error "GitHub Personal Access Token이 필요합니다."
    echo "사용법: ./deploy-server.sh YOUR_GITHUB_TOKEN"
    exit 1
fi

GITHUB_TOKEN=$1
BACKUP_DIR=~/campstation-backup-$(date +%Y%m%d-%H%M%S)

# ================================
# 1단계: 백업
# ================================
print_step "1" "기존 프로젝트 백업 중..."

if [ -d ~/campstation-workspace ]; then
    # .env.prod 백업
    if [ -f ~/campstation-workspace/.env.prod ]; then
        mkdir -p $BACKUP_DIR
        cp ~/campstation-workspace/.env.prod $BACKUP_DIR/.env.prod
        print_warning ".env.prod 파일 백업 완료: $BACKUP_DIR/.env.prod"
    fi
    
    # 기존 프로젝트 삭제
    rm -rf ~/campstation-workspace
    echo "기존 프로젝트 삭제 완료"
else
    echo "기존 프로젝트 없음 (신규 배포)"
fi

# ================================
# 2단계: Git Credential 설정
# ================================
print_step "2" "Git Credential Helper 설정 중..."

# Git credential helper 설정 (영구 저장)
git config --global credential.helper store

# 토큰을 credential에 저장 (정확한 형식)
mkdir -p ~/.config/git
echo "https://sentimentalhoon:${GITHUB_TOKEN}@github.com" > ~/.git-credentials
chmod 600 ~/.git-credentials

# Git 전역 설정
git config --global url."https://sentimentalhoon:${GITHUB_TOKEN}@github.com/".insteadOf "https://github.com/"

echo "Git Credential 설정 완료"

# ================================
# 3단계: 프로젝트 클론
# ================================
print_step "3" "프로젝트 클론 중..."

cd ~
git clone --recurse-submodules https://${GITHUB_TOKEN}@github.com/sentimentalhoon/campstation-workspace.git

if [ $? -ne 0 ]; then
    print_error "프로젝트 클론 실패"
    exit 1
fi

echo "프로젝트 클론 완료"

# ================================
# 4단계: 서브모듈 업데이트
# ================================
print_step "4" "서브모듈 업데이트 중..."

cd ~/campstation-workspace

# .gitmodules 파일의 URL을 사용자명:토큰 형식으로 변경
sed -i "s|https://github.com/sentimentalhoon/|https://sentimentalhoon:${GITHUB_TOKEN}@github.com/sentimentalhoon/|g" .gitmodules

# 서브모듈 URL을 git config에도 설정
git config submodule.backend.url https://sentimentalhoon:${GITHUB_TOKEN}@github.com/sentimentalhoon/campstation-backend.git
git config submodule.frontend.url https://sentimentalhoon:${GITHUB_TOKEN}@github.com/sentimentalhoon/campstation-frontend.git

# 서브모듈 동기화 및 업데이트
git submodule sync
git submodule update --init --recursive --remote

# 서브모듈 확인
if [ ! -d "backend/src" ] || [ ! -d "frontend/src" ]; then
    print_error "서브모듈 클론 실패"
    exit 1
fi

echo "서브모듈 업데이트 완료"

# ================================
# 5단계: .env.prod 복원
# ================================
print_step "5" "환경변수 파일 복원 중..."

if [ -f $BACKUP_DIR/.env.prod ]; then
    cp $BACKUP_DIR/.env.prod ~/campstation-workspace/.env.prod
    echo ".env.prod 파일 복원 완료"
else
    if [ ! -f .env.prod ]; then
        print_warning ".env.prod 파일이 없습니다. .env.prod.example을 복사합니다."
        cp .env.prod.example .env.prod
        echo ""
        echo "=========================================="
        echo "⚠️  .env.prod 파일을 수정해야 합니다!"
        echo "=========================================="
        echo "다음 명령어로 편집하세요:"
        echo "  nano ~/campstation-workspace/.env.prod"
        echo ""
        echo "수정 후 다음 명령어로 배포를 계속하세요:"
        echo "  cd ~/campstation-workspace"
        echo "  docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build"
        echo "=========================================="
        exit 0
    fi
fi

# ================================
# 6단계: Docker 컨테이너 중지 (기존 실행 중인 경우)
# ================================
print_step "6" "기존 Docker 컨테이너 확인 중..."

if [ -n "$(docker ps -q -f name=campstation)" ]; then
    print_warning "기존 컨테이너를 중지합니다..."
    docker compose -f docker-compose.yml -f docker-compose.prod.yml down
    echo "기존 컨테이너 중지 완료"
else
    echo "실행 중인 컨테이너 없음"
fi

# ================================
# 7단계: Docker 이미지 빌드 및 실행
# ================================
print_step "7" "Docker 컨테이너 빌드 및 실행 중..."

docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

if [ $? -ne 0 ]; then
    print_error "Docker 배포 실패"
    exit 1
fi

echo "Docker 컨테이너 실행 완료"

# ================================
# 8단계: 배포 확인
# ================================
print_step "8" "배포 상태 확인 중..."

sleep 5

echo ""
echo "=========================================="
echo "✅ 배포가 시작되었습니다!"
echo "=========================================="
echo ""
echo "📊 컨테이너 상태:"
docker ps --filter name=campstation --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "📝 로그 확인:"
echo "  docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f"
echo ""
echo "🔍 서비스 확인:"
echo "  Frontend:  curl -I http://localhost:3000"
echo "  Backend:   curl -I http://localhost:8080/actuator/health"
echo "  MinIO:     curl -I http://localhost:9000"
echo ""
echo "🌐 외부 접속:"
echo "  http://mycamp.duckdns.org"
echo ""
echo "💾 백업 위치:"
echo "  $BACKUP_DIR"
echo ""
echo "=========================================="

# ================================
# 완료
# ================================
print_step "✓" "배포 스크립트 실행 완료!"
