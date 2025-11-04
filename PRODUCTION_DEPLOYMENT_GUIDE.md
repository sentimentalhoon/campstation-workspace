# CampStation DDNS 프로덕션 배포 가이드

## 📋 목차

1. [사전 준비](#1-사전-준비)
2. [서버 초기 설정](#2-서버-초기-설정)
3. [DDNS 설정](#3-ddns-설정)
4. [환경변수 설정](#4-환경변수-설정)
5. [Nginx 설정](#5-nginx-설정)
6. [SSL 인증서 발급](#6-ssl-인증서-발급)
7. [배포 실행](#7-배포-실행)
8. [배포 후 검증](#8-배포-후-검증)
9. [트러블슈팅](#9-트러블슈팅)

---

## 1️⃣ 사전 준비

### 필요한 것

- [ ] 리눅스 서버 (Ubuntu 20.04/22.04 LTS 권장)
- [ ] 최소 사양: CPU 2코어, RAM 4GB, 디스크 40GB
- [ ] 공유기 관리자 권한 (포트포워딩용)
- [ ] DDNS 계정 (DuckDNS, No-IP 등)
- [ ] 도메인 (선택사항)

### 서버 접속

```bash
ssh user@server-ip
```

---

## 2️⃣ 서버 초기 설정

### 시스템 업데이트

```bash
sudo apt update && sudo apt upgrade -y
```

### Docker 설치

```bash
# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER
newgrp docker

# Docker Compose 설치
sudo apt install docker-compose-plugin -y

# 설치 확인
docker --version
docker compose version
```

### 방화벽 설정

```bash
# UFW 설치 (Ubuntu)
sudo apt install ufw -y

# 기본 정책
sudo ufw default deny incoming
sudo ufw default allow outgoing

# SSH 허용 (중요!)
sudo ufw allow 22/tcp

# HTTP/HTTPS 허용
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 방화벽 활성화
sudo ufw enable

# 상태 확인
sudo ufw status verbose
```

### Git 설치

```bash
sudo apt install git -y
```

---

## 3️⃣ DDNS 설정

### DuckDNS (추천 - 가장 간단)

#### 1. DuckDNS 가입

https://www.duckdns.org/ 접속 → Google/GitHub 계정으로 로그인

#### 2. 도메인 생성

- 도메인 입력: `mycamp` (예시)
- 생성된 도메인: `mycamp.duckdns.org`
- Token 복사 (중요!)

#### 3. DuckDNS 클라이언트 설치

```bash
# DuckDNS 디렉토리 생성
mkdir -p ~/duckdns
cd ~/duckdns

# 업데이트 스크립트 생성
cat > duck.sh << 'EOF'
#!/bin/bash
echo url="https://www.duckdns.org/update?domains=mycamp&token=YOUR_TOKEN_HERE&ip=" | curl -k -o ~/duckdns/duck.log -K -
EOF

# YOUR_TOKEN_HERE를 실제 토큰으로 교체
nano duck.sh

# 실행 권한 부여
chmod 700 duck.sh

# 테스트 실행
./duck.sh

# 로그 확인
cat duck.log
# "OK" 출력되면 성공
```

#### 4. 크론탭 등록 (자동 업데이트)

```bash
# 크론탭 편집
crontab -e

# 5분마다 IP 업데이트 (맨 아래 추가)
*/5 * * * * ~/duckdns/duck.sh >/dev/null 2>&1

# 크론탭 확인
crontab -l
```

#### 5. 서브도메인 설정 (Cloudflare 무료)

DuckDNS는 서브도메인을 지원하지 않으므로, Cloudflare를 추가로 사용:

1. Cloudflare 가입: https://www.cloudflare.com/
2. 도메인 추가 (무료 플랜)
3. DNS 레코드 추가:
   ```
   A     @              mycamp.duckdns.org (Proxied)
   CNAME api            mycamp.duckdns.org (Proxied)
   CNAME storage        mycamp.duckdns.org (Proxied)
   CNAME console        mycamp.duckdns.org (Proxied)
   ```

---

## 4️⃣ 환경변수 설정

### 프로젝트 클론

```bash
cd ~
git clone https://github.com/sentimentalhoon/campstation-workspace.git
cd campstation-workspace
```

### 환경변수 파일 생성

```bash
# .env.prod 파일 생성
cp .env.prod.example .env.prod

# 편집
nano .env.prod
```

### 필수 설정 항목

```bash
# 1. 도메인 설정 (실제 DDNS 도메인으로 변경)
DOMAIN=mycamp.duckdns.org

# 2. 강력한 비밀번호 생성 및 설정
# DB 비밀번호
DB_PASSWORD=$(openssl rand -base64 32)

# Redis 비밀번호
REDIS_PASSWORD=$(openssl rand -base64 32)

# JWT Secret
JWT_SECRET=$(openssl rand -base64 64)

# MinIO 비밀번호
MINIO_ROOT_USER=campstation_minio_admin_2025
MINIO_ROOT_PASSWORD=$(openssl rand -base64 32)

# Admin 비밀번호
ADMIN_PASSWORD=$(openssl rand -base64 32)

# 3. API 키 설정
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_key_here
TOSS_SECRET_KEY=your_toss_secret_key_here
TOSS_CLIENT_KEY=your_toss_client_key_here

# 4. OAuth 설정 (선택)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# 5. 이메일 설정 (선택)
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_gmail_app_password
```

### 비밀번호 출력 및 저장

```bash
# 생성된 비밀번호 출력 (안전한 곳에 저장!)
echo "DB Password: $DB_PASSWORD"
echo "Redis Password: $REDIS_PASSWORD"
echo "JWT Secret: $JWT_SECRET"
echo "MinIO Password: $MINIO_ROOT_PASSWORD"
echo "Admin Password: $ADMIN_PASSWORD"

# 또는 파일로 저장
cat > ~/passwords.txt << EOF
DB Password: $DB_PASSWORD
Redis Password: $REDIS_PASSWORD
JWT Secret: $JWT_SECRET
MinIO Password: $MINIO_ROOT_PASSWORD
Admin Password: $ADMIN_PASSWORD
EOF

# 권한 설정
chmod 600 ~/passwords.txt
```

---

## 5️⃣ Nginx 설정

### Nginx 설치

```bash
sudo apt install nginx -y
```

### 설정 파일 복사

```bash
# Nginx 설정 복사
sudo cp infrastructure/nginx/campstation-prod.conf /etc/nginx/sites-available/campstation

# 도메인 교체 (mycamp.duckdns.org → 실제 도메인)
sudo sed -i 's/mycamp.duckdns.org/YOUR_DOMAIN_HERE/g' /etc/nginx/sites-available/campstation

# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/campstation /etc/nginx/sites-enabled/

# 기본 설정 제거
sudo rm /etc/nginx/sites-enabled/default

# 설정 테스트
sudo nginx -t
```

### Nginx 시작 (SSL 전에는 주석 처리)

```bash
# SSL 인증서 발급 전에는 HTTP만 허용하도록 수정
sudo nano /etc/nginx/sites-available/campstation
# SSL 관련 server 블록을 주석 처리

# Nginx 시작
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 6️⃣ SSL 인증서 발급

### Certbot 설치

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 인증서 발급 (와일드카드)

```bash
# 모든 서브도메인 포함 인증서 발급
sudo certbot --nginx \
  -d mycamp.duckdns.org \
  -d www.mycamp.duckdns.org \
  -d api.mycamp.duckdns.org \
  -d storage.mycamp.duckdns.org \
  -d console.mycamp.duckdns.org \
  --agree-tos \
  --no-eff-email \
  --email your_email@example.com

# 자동 갱신 테스트
sudo certbot renew --dry-run
```

### 자동 갱신 설정 (크론탭)

```bash
# 크론탭 편집
sudo crontab -e

# 매일 새벽 2시에 갱신 확인 (맨 아래 추가)
0 2 * * * certbot renew --quiet --post-hook "systemctl reload nginx"
```

### Nginx 설정 활성화

```bash
# SSL 블록 주석 해제
sudo nano /etc/nginx/sites-available/campstation

# 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

---

## 7️⃣ 배포 실행

### Docker 이미지 빌드 및 실행

```bash
cd ~/campstation-workspace

# .env.prod 로드
export $(cat .env.prod | grep -v '^#' | xargs)

# 프로덕션 배포
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# 로그 확인
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Ctrl+C로 로그 종료
```

### 컨테이너 상태 확인

```bash
# 실행 중인 컨테이너 확인
docker ps

# 헬스체크 확인
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
```

---

## 8️⃣ 배포 후 검증

### 서비스 접속 테스트

```bash
# Frontend
curl -I https://mycamp.duckdns.org

# Backend API
curl -I https://api.mycamp.duckdns.org/api/actuator/health

# MinIO Storage
curl -I https://storage.mycamp.duckdns.org

# MinIO Console
curl -I https://console.mycamp.duckdns.org
```

### 브라우저 접속

1. **Frontend**: https://mycamp.duckdns.org
2. **MinIO Console**: https://console.mycamp.duckdns.org
   - ID: `campstation_minio_admin_2025`
   - PW: (생성한 비밀번호)
3. **Admin**: https://mycamp.duckdns.org/login
   - ID: `admin`
   - PW: (생성한 비밀번호)

### SSL 인증서 확인

```bash
# 인증서 정보
sudo certbot certificates

# SSL Labs 테스트
https://www.ssllabs.com/ssltest/analyze.html?d=mycamp.duckdns.org
```

---

## 9️⃣ 트러블슈팅

### 컨테이너가 시작되지 않음

```bash
# 로그 확인
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs backend

# 환경변수 확인
docker compose -f docker-compose.yml -f docker-compose.prod.yml config

# 재시작
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart
```

### 502 Bad Gateway

```bash
# Backend 상태 확인
docker logs campstation-backend

# Nginx 로그
sudo tail -f /var/log/nginx/campstation-api-error.log

# Backend 재시작
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart backend
```

### SSL 인증서 갱신 실패

```bash
# 수동 갱신
sudo certbot renew --force-renewal

# Nginx 설정 확인
sudo nginx -t

# Certbot 로그
sudo cat /var/log/letsencrypt/letsencrypt.log
```

### 데이터베이스 연결 실패

```bash
# DB 컨테이너 로그
docker logs campstation-db

# DB 접속 테스트
docker exec -it campstation-db psql -U campstation_admin -d campstation

# 비밀번호 확인
cat .env.prod | grep DB_PASSWORD
```

### MinIO 접속 불가

```bash
# MinIO 로그
docker logs campstation-minio

# MinIO 헬스체크
curl http://localhost:9000/minio/health/live

# 버킷 확인
docker exec -it campstation-minio mc ls campstation
```

---

## 🔄 업데이트 방법

### 코드 업데이트

```bash
cd ~/campstation-workspace

# Git pull
git pull origin main

# 이미지 재빌드 및 재배포
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# 이전 이미지 정리
docker image prune -f
```

### 환경변수 변경

```bash
# .env.prod 수정
nano .env.prod

# 재시작 (빌드 불필요)
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart
```

---

## 🗄️ 백업 방법

### 데이터베이스 백업

```bash
# 백업 디렉토리 생성
mkdir -p ~/backups

# DB 백업
docker exec campstation-db pg_dump -U campstation_admin campstation > ~/backups/db_$(date +%Y%m%d_%H%M%S).sql

# 자동 백업 (크론탭)
crontab -e
# 매일 새벽 3시 백업
0 3 * * * docker exec campstation-db pg_dump -U campstation_admin campstation > ~/backups/db_$(date +\%Y\%m\%d).sql

# 7일 이상 된 백업 삭제
0 4 * * * find ~/backups -name "db_*.sql" -mtime +7 -delete
```

### MinIO 데이터 백업

```bash
# MinIO 볼륨 백업
docker run --rm -v campstation_minio_data_prod:/data -v ~/backups:/backup ubuntu tar czf /backup/minio_$(date +%Y%m%d).tar.gz /data
```

---

## 📊 모니터링

### 로그 확인

```bash
# 모든 서비스 로그
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# 특정 서비스 로그
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f backend

# Nginx 로그
sudo tail -f /var/log/nginx/campstation-*-access.log
sudo tail -f /var/log/nginx/campstation-*-error.log
```

### 리소스 모니터링

```bash
# 컨테이너 리소스 사용량
docker stats

# 디스크 사용량
df -h

# 메모리 사용량
free -h
```

---

## 🔒 보안 체크리스트

- [ ] 강력한 비밀번호 사용 (32자 이상)
- [ ] SSH 키 기반 인증 설정
- [ ] 방화벽 설정 (UFW)
- [ ] SSL/TLS 인증서 적용
- [ ] DB/Redis 외부 포트 차단
- [ ] MinIO Console IP 화이트리스트
- [ ] Nginx Rate Limiting 설정
- [ ] 정기 백업 자동화
- [ ] 로그 모니터링 설정
- [ ] .env.prod 파일 권한 설정 (600)

---

## 📚 참고 자료

- [Docker 공식 문서](https://docs.docker.com/)
- [Nginx 공식 문서](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [DuckDNS](https://www.duckdns.org/)
- [MinIO 문서](https://min.io/docs/minio/linux/index.html)
