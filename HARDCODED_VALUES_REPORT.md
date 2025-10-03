# 하드 코딩된 값 점검 및 개선 가이드

## 🚨 **긴급 개선 필요**

### 1. 보안 관련 하드코딩 값

#### JWT 시크릿 키

**파일**: `backend/src/main/java/com/campstation/camp/security/JwtUtil.java`
**현재 상태**:

```java
@Value("${jwt.secret:campstation-super-secret-key-for-jwt-token-generation-and-validation-must-be-at-least-64-bytes-long-for-hs512-algorithm-security}")
```

**개선 방안**:

- 운영 환경에서는 반드시 `JWT_SECRET` 환경변수 설정
- 기본값을 더 안전한 형태로 변경 또는 제거
- 개발환경용 별도 시크릿 키 사용

#### 카카오 API 키

**파일**: `frontend/.env.example`
**현재 상태**: 실제 API 키가 노출됨
**개선 방안**:

- `.env.example`에서 실제 키 제거
- `your-kakao-api-key-here` 같은 플레이스홀더로 변경

#### 데이터베이스 비밀번호

**파일**: `backend/src/main/resources/application-prod.yml`
**현재 상태**:

```yaml
password: ${DB_PASSWORD:campstation2024}
```

**개선 방안**:

- 기본값 제거 또는 더 강력한 임시 비밀번호로 변경
- 운영 환경에서는 환경변수 필수 설정

### 2. 네트워크 설정 하드코딩

#### CORS 설정

**파일**: `backend/src/main/java/com/campstation/camp/config/JwtSecurityConfig.java`
**현재 상태**:

```java
configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:3000", "http://localhost:3001"));
```

**개선 방안**:

```java
@Value("${cors.allowed-origins:http://localhost:3000,http://localhost:3001}")
private String allowedOrigins;

// 설정 파일에서 관리
// application-dev.yml
cors:
  allowed-origins: "http://localhost:3000,http://localhost:3001"

// application-prod.yml
cors:
  allowed-origins: "${CORS_ALLOWED_ORIGINS:https://yourdomain.com}"
```

#### 프록시 설정

**파일**: `frontend/next.config.ts`
**현재 상태**:

```javascript
destination: "http://localhost:8080/api/:path*";
```

**개선 방안**:

```javascript
destination: `${process.env.BACKEND_URL || "http://localhost:8080"}/api/:path*`;
```

### 3. 타임아웃 및 제한값

#### 사용자 위치 타임아웃

**파일**: `frontend/src/hooks/campground-detail/useUserLocation.ts`
**현재 상태**:

```javascript
maximumAge: 300000, // 5 minutes
```

**개선 방안**:

```javascript
const LOCATION_CACHE_TIME = process.env.NEXT_PUBLIC_LOCATION_CACHE_TIME || 300000;
maximumAge: LOCATION_CACHE_TIME,
```

#### Redis 타임아웃

**현재 상태**: 설정 파일에 2000ms로 하드코딩
**개선 방안**:

```yaml
redis:
  timeout: ${REDIS_TIMEOUT:2000ms}
```

#### 파일 업로드 제한

**파일**: `backend/src/main/java/com/campstation/camp/controller/FileController.java`
**현재 상태**: 잘 구현됨 (환경변수 사용)

```java
@Value("${file.max-size:10485760}") // 10MB
```

## ✅ **잘 구현된 부분**

### 환경변수 활용

- JWT 만료 시간: `${jwt.expiration:7200000}`
- 데이터베이스 연결: `${DB_URL:...}`
- Redis 설정: `${REDIS_HOST:redis}`
- 파일 업로드 경로: `${file.upload.path:uploads}`
- Twilio 설정: `${twilio.account-sid:}` (빈 기본값으로 안전)

### 프로필별 설정

- 개발/운영 환경별 다른 설정 파일
- 캐시 타입 분리 (dev: simple, prod: redis)
- 데이터베이스 분리 (dev: H2, prod: PostgreSQL)

## 🔧 **권장 개선 작업**

### 1. 환경변수 추가 정의

```bash
# .env.local 또는 .env.production
JWT_SECRET=your-super-secure-jwt-secret-key-here
KAKAO_MAP_API_KEY=your-kakao-api-key
DB_PASSWORD=your-secure-database-password
CORS_ALLOWED_ORIGINS=https://yourdomain.com
REDIS_TIMEOUT=2000ms
LOCATION_CACHE_TIME=300000
```

### 2. 설정 파일 개선

각 환경별 설정 파일에 새로운 환경변수들 추가

### 3. 문서화

- 필요한 환경변수들을 README.md에 명시
- 각 환경변수의 용도와 기본값 설명
- 보안 관련 주의사항 추가

## 📋 **TODO 항목들**

### Owner Dashboard 미완성 기능

**파일**: `frontend/src/app/owner/dashboard/page.tsx`

- 리뷰 수 조회 API 구현
- 수익 계산 로직 구현
- 평균 평점 계산 로직 구현

### 개발 예정 기능

- Owner 전용 API 엔드포인트
- 실시간 알림 시스템
- 고급 분석 기능

## 🚀 **우선순위**

1. **High Priority**: 보안 관련 하드코딩 값 (JWT 시크릿, API 키, 비밀번호)
2. **Medium Priority**: 네트워크 설정 (CORS, 프록시)
3. **Low Priority**: 타임아웃 값들, TODO 항목들

## 📝 **결론**

전반적으로 프로젝트는 환경변수와 프로필별 설정을 잘 활용하고 있습니다.
다만 보안에 민감한 몇 가지 값들의 기본값 처리와 네트워크 설정의 유연성을 개선하면 더욱 견고한 애플리케이션이 될 것입니다.
