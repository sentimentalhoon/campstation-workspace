#!/bin/bash
# ================================
# CampStation Production Deployment Script (SSH Version)
# ================================
# SSH 키를 사용한 배포 스크립트
# 사용법: ./deploy-server-ssh.sh

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

BACKUP_DIR=~/campstation-backup-$(date +%Y%m%d-%H%M%S)

# ================================
# 0단계: SSH 키 확인
# ================================
print_step "0" "SSH 키 확인 중..."

if [ ! -f ~/.ssh/id_ed25519 ] && [ ! -f ~/.ssh/id_rsa ]; then
    print_warning "SSH 키가 없습니다. 생성합니다..."
    ssh-keygen -t ed25519 -C "campstation-server" -f ~/.ssh/id_ed25519 -N ""
    
    echo ""
    echo "=========================================="
    echo "⚠️  GitHub에 SSH 공개키를 등록해야 합니다!"
    echo "=========================================="
    echo ""
    echo "1. 아래 공개키를 복사하세요:"
    echo ""
    cat ~/.ssh/id_ed25519.pub
    echo ""
    echo "2. GitHub 설정으로 이동:"
    echo "   https://github.com/settings/ssh/new"
    echo ""
    echo "3. 공개키를 붙여넣고 저장"
    echo ""
    echo "4. 이 스크립트를 다시 실행하세요:"
    echo "   ./deploy-server-ssh.sh"
    echo "=========================================="
    exit 0
fi

# SSH 연결 테스트
if ! ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
    print_error "GitHub SSH 연결 실패"
    echo ""
    echo "SSH 공개키를 GitHub에 등록했는지 확인하세요:"
    cat ~/.ssh/id_ed25519.pub || cat ~/.ssh/id_rsa.pub
    echo ""
    echo "등록 URL: https://github.com/settings/keys"
    exit 1
fi

echo "SSH 인증 성공"

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
# 2단계: 프로젝트 클론 (SSH)
# ================================
print_step "2" "프로젝트 클론 중 (SSH)..."

cd ~
git clone --recurse-submodules git@github.com:sentimentalhoon/campstation-workspace.git

if [ $? -ne 0 ]; then
    print_error "프로젝트 클론 실패"
    exit 1
fi

echo "프로젝트 클론 완료"

# ================================
# 3단계: 서브모듈 확인
# ================================
print_step "3" "서브모듈 확인 중..."

cd ~/campstation-workspace

# 서브모듈 업데이트
git submodule update --init --recursive --remote

# 서브모듈 확인
if [ ! -d "backend/src" ] || [ ! -d "frontend/src" ]; then
    print_error "서브모듈 클론 실패"
    exit 1
fi

echo "서브모듈 확인 완료"

# ================================
# 4단계: .env.prod 복원
# ================================
print_step "4" "환경변수 파일 복원 중..."

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
# 5단계: Docker 컨테이너 중지 (기존 실행 중인 경우)
# ================================
print_step "5" "기존 Docker 컨테이너 확인 중..."

if [ -n "$(docker ps -q -f name=campstation)" ]; then
    print_warning "기존 컨테이너를 중지합니다..."
    docker compose -f docker-compose.yml -f docker-compose.prod.yml down
    echo "기존 컨테이너 중지 완료"
else
    echo "실행 중인 컨테이너 없음"
fi

# ================================
# 6단계: Docker 이미지 빌드 및 실행
# ================================
print_step "6" "Docker 컨테이너 빌드 및 실행 중..."

docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

if [ $? -ne 0 ]; then
    print_error "Docker 배포 실패"
    exit 1
fi

echo "Docker 컨테이너 실행 완료"

# ================================
# 7단계: 배포 확인
# ================================
print_step "7" "배포 상태 확인 중..."

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
