# CampStation - Self Hosting 배포 가이드

AWS 없이 순수 서버 호스팅으로 배포하는 방법입니다.

## 1. 서버 준비

### 최소 요구사항

- **OS**: Ubuntu 22.04 LTS (권장) 또는 Debian 12
- **CPU**: 4 Core 이상
- **RAM**: 8GB 이상
- **SSD**: 100GB 이상
- **네트워크**: 공인 IP, 80/443 포트 개방

### 권장 VPS 제공자

- **Contabo**: 저렴 (€5/월 ~)
- **Vultr**: 안정적 ($12/월 ~)
- **DigitalOcean**: 사용 편리 ($12/월 ~)
- **Hetzner**: 가성비 (€4.5/월 ~)
- **Cafe24**: 한국 서버 (₩50,000/월 ~)

## 2. 서버 초기 설정

### 2.1. 서버 접속

```bash
ssh root@your-server-ip
```

### 2.2. 시스템 업데이트

```bash
apt update && apt upgrade -y
```

### 2.3. Docker 설치

```bash
# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Docker Compose 설치
apt install docker-compose-plugin -y

# Docker 서비스 시작
systemctl start docker
systemctl enable docker
```

### 2.4. Nginx 설치

```bash
apt install nginx certbot python3-certbot-nginx -y
```

## 3. 도메인 설정

### 3.1. DNS 레코드 추가

도메인 관리 페이지에서 A 레코드 추가:

```
Type: A
Name: @
Value: your-server-ip
TTL: 300

Type: A
Name: www
Value: your-server-ip
TTL: 300
```

### 3.2. SSL 인증서 발급 (Let's Encrypt)

```bash
# Nginx 기본 설정으로 먼저 시작
systemctl stop nginx

# Certbot으로 인증서 발급
certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Nginx 재시작
systemctl start nginx
```

## 4. 프로젝트 배포

### 4.1. 프로젝트 클론

```bash
cd /opt
git clone https://github.com/your-username/campstation.git
cd campstation
```

### 4.2. 환경 변수 설정

```bash
# 예제 파일 복사
cp .env.self-hosting.example .env

# 환경 변수 편집
nano .env
```

**필수 변경 사항:**

- `DB_PASSWORD`: 강력한 비밀번호
- `MINIO_ROOT_PASSWORD`: 강력한 비밀번호
- `JWT_SECRET`: 최소 32자 랜덤 문자열
- OAuth2 클라이언트 ID/Secret
- Kakao Map API Key
- Toss Client Key

### 4.3. Nginx 설정

```bash
# Nginx 설정 파일 복사
cp nginx-self-hosting.conf /etc/nginx/sites-available/campstation

# 도메인 수정
nano /etc/nginx/sites-available/campstation
# "your-domain.com" 을 실제 도메인으로 변경

# 심볼릭 링크 생성
ln -s /etc/nginx/sites-available/campstation /etc/nginx/sites-enabled/

# 기본 설정 제거
rm /etc/nginx/sites-enabled/default

# 설정 테스트
nginx -t

# Nginx 재시작
systemctl restart nginx
```

### 4.4. Docker Compose 실행

```bash
# 이미지 빌드 및 컨테이너 시작
docker compose -f docker-compose.self-hosting.yml up -d --build

# 로그 확인
docker compose -f docker-compose.self-hosting.yml logs -f
```

### 4.5. MinIO 버킷 생성

```bash
# MinIO 컨테이너 접속
docker exec -it campstation-minio mc alias set local http://localhost:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD

# 버킷 생성
docker exec -it campstation-minio mc mb local/campstation

# Public 읽기 권한 설정
docker exec -it campstation-minio mc anonymous set download local/campstation
```

## 5. 배포 확인

### 5.1. 서비스 상태 확인

```bash
# 모든 컨테이너 실행 중인지 확인
docker compose -f docker-compose.self-hosting.yml ps

# 로그 확인
docker compose -f docker-compose.self-hosting.yml logs backend
docker compose -f docker-compose.self-hosting.yml logs frontend
```

### 5.2. 웹 브라우저 접속

- **메인 사이트**: https://your-domain.com
- **API 문서**: https://your-domain.com/api/swagger-ui.html
- **MinIO 콘솔**: https://your-domain.com/minio-console

## 6. 모니터링 및 유지보수

### 6.1. 로그 확인

```bash
# 실시간 로그
docker compose -f docker-compose.self-hosting.yml logs -f

# 특정 서비스 로그
docker compose -f docker-compose.self-hosting.yml logs -f backend
```

### 6.2. 디스크 용량 확인

```bash
df -h
docker system df
```

### 6.3. 백업

```bash
# PostgreSQL 백업
docker exec campstation-postgres pg_dump -U campstation campstation > backup_$(date +%Y%m%d).sql

# MinIO 데이터 백업
docker run --rm -v minio_data:/data -v $(pwd):/backup ubuntu tar czf /backup/minio_backup_$(date +%Y%m%d).tar.gz /data
```

### 6.4. 업데이트

```bash
cd /opt/campstation
git pull origin main
docker compose -f docker-compose.self-hosting.yml up -d --build
```

## 7. 방화벽 설정

### UFW 방화벽 (권장)

```bash
# UFW 설치 및 활성화
apt install ufw -y

# SSH 포트 허용 (중요!)
ufw allow 22/tcp

# HTTP/HTTPS 허용
ufw allow 80/tcp
ufw allow 443/tcp

# 방화벽 활성화
ufw enable

# 상태 확인
ufw status
```

## 8. 성능 최적화

### 8.1. Nginx 캐싱

```bash
# Nginx 설정에 캐시 디렉토리 추가
mkdir -p /var/cache/nginx/campstation
chown www-data:www-data /var/cache/nginx/campstation
```

### 8.2. Docker 리소스 제한 (선택사항)

`docker-compose.self-hosting.yml`에 추가:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: "2"
          memory: 4G
```

## 9. 보안 설정

### 9.1. SSH 보안 강화

```bash
# SSH 설정 편집
nano /etc/ssh/sshd_config

# 다음 설정 변경:
# PermitRootLogin no
# PasswordAuthentication no (SSH 키 사용 시)

# SSH 재시작
systemctl restart sshd
```

### 9.2. Fail2ban 설치

```bash
apt install fail2ban -y
systemctl enable fail2ban
systemctl start fail2ban
```

## 10. 트러블슈팅

### 컨테이너가 시작되지 않을 때

```bash
docker compose -f docker-compose.self-hosting.yml down
docker compose -f docker-compose.self-hosting.yml up -d
docker compose -f docker-compose.self-hosting.yml logs
```

### Nginx 502 에러

```bash
# Backend 컨테이너 상태 확인
docker compose -f docker-compose.self-hosting.yml ps backend

# Backend 로그 확인
docker compose -f docker-compose.self-hosting.yml logs backend
```

### SSL 인증서 갱신

```bash
# Let's Encrypt 인증서는 90일마다 갱신 필요
certbot renew --dry-run  # 테스트
certbot renew  # 실제 갱신
```

## 11. 비용 예상

### 월간 비용 (예상)

- **VPS**: $12/월 (Vultr, DigitalOcean 기준)
- **도메인**: $10/년 ($0.83/월)
- **Let's Encrypt SSL**: 무료
- **MinIO 스토리지**: 무료 (서버 디스크 사용)
- **데이터베이스**: 무료 (자체 호스팅)
- **Redis**: 무료 (자체 호스팅)

**총 예상 비용: 약 $13/월 (₩17,000/월)**

## 12. 추가 리소스

- **Docker 문서**: https://docs.docker.com/
- **Nginx 문서**: https://nginx.org/en/docs/
- **MinIO 문서**: https://min.io/docs/
- **Let's Encrypt**: https://letsencrypt.org/

## 문의

문제가 발생하면 GitHub Issues에 문의하세요.
