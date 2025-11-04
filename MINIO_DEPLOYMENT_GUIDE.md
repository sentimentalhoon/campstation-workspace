# MinIO 외부 접속 배포 가이드

## 📋 목차
1. [포트포워딩 방식 (간단)](#1-포트포워딩-방식-간단)
2. [Nginx 리버스 프록시 (권장)](#2-nginx-리버스-프록시-권장)
3. [HTTPS/SSL 설정](#3-httpsssl-설정)
4. [보안 강화](#4-보안-강화)

---

## 1️⃣ 포트포워딩 방식 (간단)

### 공유기 설정
```
서비스: MinIO API
외부 포트: 9000
내부 IP: 192.168.x.x (서버 내부 IP)
내부 포트: 9000
프로토콜: TCP

서비스: MinIO Console
외부 포트: 9001
내부 IP: 192.168.x.x
내부 포트: 9001
프로토콜: TCP
```

### 환경변수 설정 (.env)

#### 공인 IP 사용
```bash
# 공인 IP 확인: curl ifconfig.me
MINIO_DOMAIN=123.456.789.012
MINIO_SERVER_URL=http://123.456.789.012:9000
MINIO_BROWSER_REDIRECT_URL=http://123.456.789.012:9001

# Backend가 사용할 엔드포인트
AWS_S3_ENDPOINT=http://123.456.789.012:9000
```

#### DDNS 사용 (권장)
```bash
# DuckDNS, No-IP 등
MINIO_DOMAIN=mycamp.duckdns.org
MINIO_SERVER_URL=http://mycamp.duckdns.org:9000
MINIO_BROWSER_REDIRECT_URL=http://mycamp.duckdns.org:9001

AWS_S3_ENDPOINT=http://mycamp.duckdns.org:9000
```

### 재시작
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### 접속 확인
- **MinIO Console**: http://your-domain:9001
  - 계정: `campstation` / `campstation123`
- **API 테스트**: http://your-domain:9000/minio/health/live

---

## 2️⃣ Nginx 리버스 프록시 (권장) ⭐

### 장점
- ✅ 포트 번호 없이 접속 가능
- ✅ SSL 인증서 적용 용이
- ✅ 보안 강화 (내부 포트 숨김)
- ✅ 캐싱 및 압축 가능

### Nginx 설정

#### /etc/nginx/sites-available/campstation-minio
```nginx
# MinIO API (S3 호환)
upstream minio_api {
    server localhost:9000;
}

# MinIO Console (웹 UI)
upstream minio_console {
    server localhost:9001;
}

# MinIO API 서버
server {
    listen 80;
    server_name storage.mycamp.duckdns.org;  # API 전용 서브도메인
    
    # 파일 업로드 크기 제한
    client_max_body_size 100M;
    
    location / {
        proxy_pass http://minio_api;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # S3 호환을 위한 헤더
        proxy_connect_timeout 300;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        chunked_transfer_encoding off;
        
        # CORS 헤더 (필요한 경우)
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Authorization, Content-Type";
    }
}

# MinIO Console 서버
server {
    listen 80;
    server_name console.mycamp.duckdns.org;  # Console 전용 서브도메인
    
    location / {
        proxy_pass http://minio_console;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket 지원
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

#### 또는 경로 기반 (단일 도메인)
```nginx
server {
    listen 80;
    server_name mycamp.duckdns.org;
    
    client_max_body_size 100M;
    
    # MinIO API
    location /storage/ {
        proxy_pass http://localhost:9000/;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        chunked_transfer_encoding off;
    }
    
    # MinIO Console
    location /minio-console/ {
        proxy_pass http://localhost:9001/;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Nginx 활성화
```bash
# 설정 파일 링크
sudo ln -s /etc/nginx/sites-available/campstation-minio /etc/nginx/sites-enabled/

# 설정 테스트
sudo nginx -t

# 재시작
sudo systemctl restart nginx
```

### 환경변수 설정 (.env)

#### 서브도메인 방식
```bash
MINIO_DOMAIN=storage.mycamp.duckdns.org
MINIO_SERVER_URL=http://storage.mycamp.duckdns.org
MINIO_BROWSER_REDIRECT_URL=http://console.mycamp.duckdns.org

AWS_S3_ENDPOINT=http://storage.mycamp.duckdns.org
```

#### 경로 기반 방식
```bash
MINIO_DOMAIN=mycamp.duckdns.org
MINIO_SERVER_URL=http://mycamp.duckdns.org/storage
MINIO_BROWSER_REDIRECT_URL=http://mycamp.duckdns.org/minio-console

AWS_S3_ENDPOINT=http://mycamp.duckdns.org/storage
```

### 포트포워딩 (Nginx 사용 시)
```
외부 포트 80 → 내부 IP:80 (Nginx만)
```

---

## 3️⃣ HTTPS/SSL 설정

### Let's Encrypt (무료)

#### Certbot 설치
```bash
sudo apt install certbot python3-certbot-nginx -y
```

#### 서브도메인 방식 인증서 발급
```bash
sudo certbot --nginx -d storage.mycamp.duckdns.org -d console.mycamp.duckdns.org
```

#### 경로 기반 방식 인증서 발급
```bash
sudo certbot --nginx -d mycamp.duckdns.org
```

#### 자동 갱신 설정
```bash
# 테스트
sudo certbot renew --dry-run

# 크론탭 (자동 설정됨)
sudo crontab -l | grep certbot
```

### HTTPS 환경변수 (.env)
```bash
# 서브도메인 방식
MINIO_DOMAIN=storage.mycamp.duckdns.org
MINIO_SERVER_URL=https://storage.mycamp.duckdns.org
MINIO_BROWSER_REDIRECT_URL=https://console.mycamp.duckdns.org
AWS_S3_ENDPOINT=https://storage.mycamp.duckdns.org

# 경로 기반 방식
MINIO_SERVER_URL=https://mycamp.duckdns.org/storage
MINIO_BROWSER_REDIRECT_URL=https://mycamp.duckdns.org/minio-console
AWS_S3_ENDPOINT=https://mycamp.duckdns.org/storage
```

---

## 4️⃣ 보안 강화

### 강력한 비밀번호 변경

#### docker-compose.dev.yml
```yaml
environment:
  - MINIO_ROOT_USER=campstation_admin_2025
  - MINIO_ROOT_PASSWORD=VeryStr0ng!P@ssw0rd#2025_MinIO
```

#### .env
```bash
AWS_S3_ACCESS_KEY_ID=campstation_admin_2025
AWS_S3_SECRET_ACCESS_KEY=VeryStr0ng!P@ssw0rd#2025_MinIO
```

### 방화벽 설정 (Nginx 사용 시)
```bash
# MinIO 포트는 외부에서 직접 접근 차단
sudo ufw deny 9000/tcp
sudo ufw deny 9001/tcp

# Nginx만 허용
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### 버킷 권한 설정

#### Public 버킷 (누구나 읽기 가능)
```bash
docker exec -it campstation-minio mc anonymous set public campstation/campstation-dev
```

#### Private 버킷 (인증된 사용자만)
```bash
docker exec -it campstation-minio mc anonymous set none campstation/campstation-dev
```

#### Download only (읽기만 가능)
```bash
docker exec -it campstation-minio mc anonymous set download campstation/campstation-dev
```

### Nginx Rate Limiting
```nginx
# /etc/nginx/nginx.conf
http {
    # 업로드 속도 제한 (Zone 정의)
    limit_req_zone $binary_remote_addr zone=minio_upload:10m rate=10r/s;
    
    # sites-available/campstation-minio
    location / {
        limit_req zone=minio_upload burst=20 nodelay;
        # ... 기존 설정
    }
}
```

---

## 5️⃣ 트러블슈팅

### MinIO 접속 안 됨
```bash
# MinIO 컨테이너 상태 확인
docker ps | grep minio

# 로그 확인
docker logs campstation-minio

# 헬스체크
curl http://localhost:9000/minio/health/live

# 포트 확인
netstat -tlnp | grep 9000
```

### 파일 업로드 실패
```bash
# Nginx 파일 크기 제한 확인
sudo vi /etc/nginx/nginx.conf
# client_max_body_size 100M;

# MinIO 로그 확인
docker logs campstation-minio -f
```

### CORS 에러
```nginx
# Nginx에 CORS 헤더 추가
location /storage/ {
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
    add_header Access-Control-Allow-Headers "Authorization, Content-Type";
    
    if ($request_method = 'OPTIONS') {
        return 204;
    }
    # ... 기존 설정
}
```

### SSL 인증서 문제
```bash
# 인증서 상태 확인
sudo certbot certificates

# 강제 갱신
sudo certbot renew --force-renewal

# Nginx 설정 재확인
sudo nginx -t
```

---

## 6️⃣ 최종 체크리스트

### 배포 전
- [ ] DDNS 설정 완료
- [ ] .env 파일 생성 및 URL 설정
- [ ] 강력한 비밀번호로 변경
- [ ] docker-compose.dev.yml 환경변수 확인

### 배포 후
- [ ] MinIO Console 접속 확인
- [ ] 파일 업로드 테스트
- [ ] Backend에서 S3 연동 테스트
- [ ] SSL 인증서 적용 (프로덕션)
- [ ] 방화벽 설정 확인

### 권장 구성
```
프로덕션 환경 권장:
✅ DDNS (DuckDNS, No-IP)
✅ Nginx 리버스 프록시
✅ SSL 인증서 (Let's Encrypt)
✅ 서브도메인 분리
   - storage.mycamp.duckdns.org (API)
   - console.mycamp.duckdns.org (Console)
✅ 방화벽으로 내부 포트 차단
```

---

## 📚 참고 자료
- [MinIO 공식 문서](https://min.io/docs/minio/linux/index.html)
- [MinIO Nginx 설정](https://min.io/docs/minio/linux/integrations/setup-nginx-proxy-with-minio.html)
- [DuckDNS 가이드](https://www.duckdns.org/install.jsp)
- [Let's Encrypt Certbot](https://certbot.eff.org/)
