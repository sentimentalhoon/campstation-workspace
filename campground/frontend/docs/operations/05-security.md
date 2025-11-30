# 보안 체크리스트

> 프로덕션 배포 전 보안 점검 가이드

## 📋 목차

1. [환경 변수 보안](#환경-변수-보안)
2. [API 키 관리](#api-키-관리)
3. [인증/인가 보안](#인증인가-보안)
4. [CORS 설정](#cors-설정)
5. [데이터베이스 보안](#데이터베이스-보안)
6. [파일 업로드 보안](#파일-업로드-보안)
7. [HTTPS 설정](#https-설정-향후)
8. [보안 헤더](#보안-헤더)

---

## 🔐 환경 변수 보안

### ✅ 체크리스트

**Git 보안**:

- [ ] `.env.local`, `.env.production`, `.env.keys` 가 `.gitignore`에 포함됨
- [ ] `.env.example`에 실제 키가 없음 (템플릿만)
- [ ] Git 히스토리에 실제 키가 커밋되지 않음

**확인 방법**:

```bash
# .gitignore 확인
cat .gitignore | grep .env

# Git 히스토리에서 민감 정보 검색
git log -p | grep -i "password\|secret\|key" | head -20

# 실수로 커밋된 경우 제거
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.production" \
  --prune-empty --tag-name-filter cat -- --all
```

---

### 🔑 NEXT*PUBLIC* 접두사 주의

**위험한 예시**:

```bash
# ❌ 클라이언트에 노출됨!
NEXT_PUBLIC_JWT_SECRET=my_secret_key
NEXT_PUBLIC_DB_PASSWORD=password123
NEXT_PUBLIC_TOSS_SECRET_KEY=secret_key
```

**안전한 예시**:

```bash
# ✅ 클라이언트에 노출 가능
NEXT_PUBLIC_API_URL=http://mycamp.duckdns.org/api
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=jq20atlff0
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_xxx

# ✅ 서버에서만 접근 (NEXT_PUBLIC_ 없음)
JWT_SECRET=strong_secret_key
DB_PASSWORD=secure_password
TOSS_SECRET_KEY=secret_sk_xxx
```

**확인 방법**:

```bash
# 브라우저에서 노출되는 환경 변수 확인
# DevTools → Console
console.log(process.env)
```

---

### 🔒 강력한 시크릿 생성

**JWT Secret**:

```bash
# 최소 32자 이상 랜덤 문자열
# OpenSSL 사용
openssl rand -base64 32

# Node.js 사용
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 예시 (실제 사용 금지!)
JWT_SECRET=8K9mP2qL5vN7jH4fT6wR3sY1uZ0aB8cD9eF7gH5iJ3k
```

**Database Password**:

```bash
# 대소문자, 숫자, 특수문자 포함 16자 이상
# 예시
DB_PASSWORD=Xk9#mP2qL5vN$jH4fT@wR3sY

# 자동 생성
openssl rand -base64 24
```

---

## 🗝️ API 키 관리

### ✅ 체크리스트

**키 보관**:

- [ ] `.env.keys` 파일 생성 (Git 무시)
- [ ] 팀 공유: 1Password, Vault 등 사용
- [ ] Slack, 이메일에 키 전송 금지

**키 순환**:

- [ ] 6개월마다 키 교체
- [ ] 유출 의심 시 즉시 재발급
- [ ] 퇴사자 발생 시 키 교체

---

### 🔐 API 키별 보안 수준

#### Naver Map API

**보안 수준**: 중간

```bash
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=jq20atlff0
```

**주의사항**:

- Client ID는 브라우저에 노출됨 (불가피)
- Naver Cloud 콘솔에서 **허용 도메인** 설정 필수

**Naver Cloud 설정**:

1. [Naver Cloud Console](https://console.ncloud.com/) 로그인
2. Application 선택
3. **Web 서비스 URL** 설정:
   - `http://localhost:3000` (개발)
   - `http://mycamp.duckdns.org` (프로덕션)

---

#### OAuth2 (Kakao, Naver)

**보안 수준**: 높음

```bash
# ✅ 클라이언트 (브라우저 노출 가능)
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=14274277b7b930e3289085afa313c81c
NEXT_PUBLIC_NAVER_CLIENT_ID=NvwJHLtK_ttnE3wDTFZj

# ❌ 서버 전용 (절대 브라우저 노출 금지)
KAKAO_CLIENT_SECRET=your_secret
NAVER_CLIENT_SECRET=S_QEyzOOGg
```

**주의사항**:

- **Redirect URI** 검증 필수
- **Client Secret**은 백엔드에서만 사용
- HTTPS 사용 권장 (프로덕션)

**Kakao 설정**:

1. [Kakao Developers](https://developers.kakao.com/) 로그인
2. 내 애플리케이션 → 앱 설정
3. **Redirect URI** 등록:
   - `http://localhost:8080/api/v1/auth/kakao/callback`
   - `http://mycamp.duckdns.org/api/v1/auth/kakao/callback`

---

#### Toss Payments

**보안 수준**: 매우 높음

```bash
# ✅ 클라이언트 (결제 위젯 초기화)
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_Ba5PzR0ArnWxBomvJB1z8vmYnNeD

# ❌ 서버 전용 (결제 승인)
TOSS_SECRET_KEY=test_sk_ALnQvDd2VJ6GD4DevYvaVMj7X41m
```

**주의사항**:

- **Secret Key**는 절대 클라이언트 노출 금지
- 결제 승인은 반드시 백엔드에서 수행
- 테스트/실제 키 분리
- IP 화이트리스트 설정 권장

---

## 🔑 인증/인가 보안

### JWT 토큰 보안

**✅ 체크리스트**:

- [ ] JWT Secret이 32자 이상인가?
- [ ] Access Token 만료 시간이 적절한가? (1시간 권장)
- [ ] Refresh Token 만료 시간이 적절한가? (7일 권장)
- [ ] Refresh Token은 HttpOnly Cookie로 저장하는가?
- [ ] JWT에 민감 정보 저장하지 않는가?

**JWT Payload 예시**:

```json
// ✅ 안전한 Payload
{
  "sub": "user123",
  "email": "user@example.com",
  "roles": ["USER"],
  "exp": 1735689600
}

// ❌ 위험한 Payload (민감 정보 포함)
{
  "sub": "user123",
  "password": "hashed_password", // 절대 포함 금지
  "ssn": "123-45-6789",          // 주민번호 등 민감 정보
  "creditCard": "1234-5678"      // 결제 정보
}
```

---

### HttpOnly Cookie 설정

**Backend 설정 확인**:

```java
// TokenService.java
Cookie cookie = new Cookie("refreshToken", refreshToken);
cookie.setHttpOnly(true);  // ✅ JavaScript 접근 차단
cookie.setSecure(true);    // ✅ HTTPS만 전송 (프로덕션)
cookie.setPath("/");
cookie.setMaxAge(7 * 24 * 60 * 60); // 7일
```

**Frontend 확인**:

```typescript
// ❌ 나쁜 예: LocalStorage에 토큰 저장
localStorage.setItem("accessToken", token);

// ✅ 좋은 예: HttpOnly Cookie (Backend에서 자동 설정)
// Frontend에서는 토큰 직접 다루지 않음
```

---

### 비밀번호 보안

**Backend 체크리스트**:

- [ ] BCrypt 등 단방향 해시 사용
- [ ] Salt 적용
- [ ] 비밀번호 최소 길이 8자
- [ ] 대소문자, 숫자, 특수문자 포함 권장

**비밀번호 정책 예시**:

```java
// UserService.java
private static final Pattern PASSWORD_PATTERN =
    Pattern.compile("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$");

public void validatePassword(String password) {
    if (!PASSWORD_PATTERN.matcher(password).matches()) {
        throw new InvalidPasswordException("비밀번호는 8자 이상, 대소문자/숫자/특수문자 포함");
    }
}
```

---

## 🌐 CORS 설정

### ✅ 체크리스트

**프로덕션 설정**:

- [ ] `CORS_ALLOWED_ORIGINS`에 실제 도메인만 포함
- [ ] `*` (와일드카드) 사용 금지
- [ ] `credentials: true` 사용 시 Origin 명시

**올바른 설정**:

```bash
# ✅ 프로덕션
CORS_ALLOWED_ORIGINS=http://mycamp.duckdns.org,https://mycamp.duckdns.org

# ✅ 개발 (로컬만)
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# ❌ 위험 (모든 Origin 허용)
CORS_ALLOWED_ORIGINS=*
```

**Backend 설정 확인**:

```java
// SecurityConfig.java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();

    // ✅ 명시적 Origin 설정
    configuration.setAllowedOrigins(Arrays.asList(
        "http://mycamp.duckdns.org",
        "https://mycamp.duckdns.org"
    ));

    // ❌ 위험한 설정
    // configuration.setAllowedOrigins(Arrays.asList("*"));

    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH"));
    configuration.setAllowCredentials(true); // Cookie 전송 허용

    return source;
}
```

---

## 💾 데이터베이스 보안

### ✅ 체크리스트

**연결 보안**:

- [ ] 강력한 DB 비밀번호 사용
- [ ] 프로덕션 DB는 외부 접속 차단
- [ ] SSL/TLS 연결 사용 (프로덕션)
- [ ] 최소 권한 원칙 적용

**PostgreSQL 설정**:

```bash
# .env.prod
DB_URL=jdbc:postgresql://postgres:5432/campstation?sslmode=require
DB_USERNAME=campstation_user  # ❌ postgres 같은 슈퍼유저 사용 금지
DB_PASSWORD=Xk9#mP2qL5vN$jH4fT@wR3sY  # 강력한 비밀번호
```

---

### SQL Injection 방지

**✅ 체크리스트**:

- [ ] 모든 쿼리에 Prepared Statement 사용
- [ ] ORM (JPA) 사용
- [ ] 사용자 입력 검증

**안전한 쿼리**:

```java
// ✅ Prepared Statement (안전)
String query = "SELECT * FROM campgrounds WHERE region = ?";
PreparedStatement pstmt = connection.prepareStatement(query);
pstmt.setString(1, userInput);

// ✅ JPA (안전)
@Query("SELECT c FROM Campground c WHERE c.region = :region")
List<Campground> findByRegion(@Param("region") String region);

// ❌ String Concatenation (위험!)
String query = "SELECT * FROM campgrounds WHERE region = '" + userInput + "'";
```

---

### 백업 및 복구

```bash
# 정기 백업 (cron 작업)
0 2 * * * docker exec campstation-postgres pg_dump -U campstation campstation > /backup/db_$(date +\%Y\%m\%d).sql

# 백업 암호화
gpg --encrypt --recipient admin@campstation.com db_backup.sql

# 30일 이상 백업 삭제
find /backup -name "*.sql" -mtime +30 -delete
```

---

## 📁 파일 업로드 보안

### ✅ 체크리스트

**파일 검증**:

- [ ] 파일 확장자 화이트리스트
- [ ] MIME 타입 검증
- [ ] 파일 크기 제한
- [ ] 파일 이름 검증 (경로 탐색 공격 방지)

**Backend 검증 예시**:

```java
// FileUploadService.java
private static final List<String> ALLOWED_EXTENSIONS =
    Arrays.asList("jpg", "jpeg", "png", "gif", "webp");
private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

public void validateFile(MultipartFile file) {
    // 1. 파일 크기 검증
    if (file.getSize() > MAX_FILE_SIZE) {
        throw new FileTooLargeException("파일 크기는 5MB 이하여야 합니다");
    }

    // 2. 확장자 검증
    String extension = getExtension(file.getOriginalFilename());
    if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
        throw new InvalidFileTypeException("허용되지 않는 파일 형식입니다");
    }

    // 3. MIME 타입 검증
    String mimeType = file.getContentType();
    if (!mimeType.startsWith("image/")) {
        throw new InvalidFileTypeException("이미지 파일만 업로드 가능합니다");
    }

    // 4. 파일 이름 검증 (경로 탐색 공격 방지)
    String filename = file.getOriginalFilename();
    if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
        throw new InvalidFileNameException("잘못된 파일 이름입니다");
    }
}
```

---

### MinIO 보안

```bash
# .env.prod
MINIO_ACCESS_KEY=random_access_key_20chars  # ❌ minioadmin 사용 금지
MINIO_SECRET_KEY=random_secret_key_40chars   # 강력한 키 사용
```

---

## 🔒 HTTPS 설정 (향후)

### Let's Encrypt SSL 인증서

**Nginx 설정 예시**:

```nginx
server {
    listen 443 ssl;
    server_name mycamp.duckdns.org;

    ssl_certificate /etc/letsencrypt/live/mycamp.duckdns.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mycamp.duckdns.org/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://frontend:3000;
    }
}

# HTTP → HTTPS 리디렉션
server {
    listen 80;
    server_name mycamp.duckdns.org;
    return 301 https://$server_name$request_uri;
}
```

---

## 🛡️ 보안 헤더

### Next.js 보안 헤더 설정

**next.config.ts**:

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // XSS 방지
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Clickjacking 방지
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // XSS 필터 활성화
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // HTTPS 강제 (프로덕션)
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tosspayments.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' http://mycamp.duckdns.org https://api.tosspayments.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};
```

---

## 📋 프로덕션 배포 전 보안 체크리스트

### 필수 점검 항목

**환경 변수**:

- [ ] 모든 `.env` 파일이 `.gitignore`에 포함됨
- [ ] `JWT_SECRET`이 32자 이상 랜덤 문자열
- [ ] `DB_PASSWORD`가 강력함
- [ ] `CORS_ALLOWED_ORIGINS`에 실제 도메인만 포함
- [ ] Toss Payments 실제 키로 변경 (테스트 키 → 실제 키)

**인증/인가**:

- [ ] Refresh Token이 HttpOnly Cookie로 저장됨
- [ ] Access Token 만료 시간 적절 (1시간)
- [ ] 비밀번호 해시 사용 (BCrypt)

**API 보안**:

- [ ] CORS 설정 확인
- [ ] API Rate Limiting 설정 (향후)
- [ ] SQL Injection 방지 (Prepared Statement)

**파일 업로드**:

- [ ] 파일 확장자 화이트리스트
- [ ] 파일 크기 제한
- [ ] MinIO 강력한 패스워드 설정

**네트워크**:

- [ ] HTTPS 설정 (Let's Encrypt)
- [ ] 보안 헤더 설정
- [ ] Database 외부 접속 차단

---

## 🔍 보안 취약점 스캔

### npm audit

```bash
# 의존성 취약점 스캔
npm audit

# 자동 수정
npm audit fix

# 강제 수정 (breaking changes 가능)
npm audit fix --force
```

### Docker 이미지 스캔

```bash
# Trivy 설치 (보안 스캐너)
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image campstation-frontend:latest

# 취약점 리포트 생성
trivy image --severity HIGH,CRITICAL campstation-frontend > security-report.txt
```

---

## 📌 정기 보안 점검

### 월간 점검

- [ ] npm audit 실행 및 취약점 수정
- [ ] API 키 만료일 확인
- [ ] 로그 검토 (의심스러운 활동)
- [ ] 백업 정상 작동 확인

### 분기별 점검

- [ ] API 키 교체
- [ ] 비밀번호 정책 검토
- [ ] OWASP Top 10 점검
- [ ] 침투 테스트 (가능하면)

---

## 📌 보안 사고 대응

### 1. API 키 유출 시

```bash
# 1. 즉시 키 비활성화
# - Naver Cloud Console
# - Kakao Developers
# - Toss Payments Dashboard

# 2. 새 키 발급

# 3. .env 파일 업데이트

# 4. 서비스 재배포
docker-compose down
docker-compose up -d --build

# 5. 로그 검토
docker-compose logs | grep "suspicious activity"
```

### 2. 데이터 유출 의심 시

```bash
# 1. 즉시 서비스 중단
docker-compose down

# 2. 데이터베이스 백업
docker exec campstation-postgres pg_dump -U campstation > emergency_backup.sql

# 3. 로그 분석
docker-compose logs > incident_logs.txt

# 4. 관련 기관 신고 (필요 시)
```

---

## 📌 다음 단계

- [배포 가이드](./01-deployment.md) - 보안 설정 적용하여 배포
- [환경 변수 가이드](./02-environment.md) - 환경 변수 보안 설정
- [모니터링 가이드](./03-monitoring.md) - 보안 로그 모니터링
