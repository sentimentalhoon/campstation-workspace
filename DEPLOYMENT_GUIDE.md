# 🚀 Next.js 16 & React 19 업데이트 배포 가이드

> **날짜**: 2025-11-06  
> **대상**: 테스트 서버 (Production 환경)  
> **변경 사항**: Next.js 16.0.1, React 19.2.0, useOptimistic 적용

---

## 📋 배포 전 체크리스트

### 1. 코드 변경 확인

- ✅ Next.js 15.5.4 → 16.0.1
- ✅ React 19.1.0 → 19.2.0
- ✅ 모든 async params 마이그레이션
- ✅ useOptimistic Hook 적용
- ✅ 로컬 빌드 검증 완료

### 2. Git 상태 확인

```bash
cd frontend
git status
git log --oneline -5
```

### 3. 환경 변수 확인

테스트 서버의 `.env.production` 파일 확인 필요

---

## 🔧 배포 방법

### Option 1: Docker Compose로 전체 재빌드 (권장)

#### 1-1. 작업 디렉토리 이동

```bash
cd c:\Users\say4u\WorkSpace
```

#### 1-2. 기존 컨테이너 중지 및 제거

```bash
# 현재 실행 중인 컨테이너 확인
docker ps

# 프론트엔드 컨테이너만 중지
docker-compose -f docker-compose.yml -f docker-compose.prod.yml stop frontend

# 또는 전체 중지
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
```

#### 1-3. 프론트엔드 이미지 재빌드

```bash
# 캐시 없이 새로 빌드
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache frontend
```

#### 1-4. 컨테이너 시작

```bash
# 프론트엔드만 재시작
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d frontend

# 또는 전체 재시작
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

#### 1-5. 로그 확인

```bash
# 프론트엔드 로그 확인
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f frontend

# 에러 확인
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs frontend | Select-String "error|Error"
```

---

### Option 2: Docker 직접 빌드 및 실행

#### 2-1. 프론트엔드 디렉토리로 이동

```bash
cd frontend
```

#### 2-2. Docker 이미지 빌드

```bash
# 이미지 빌드
docker build -t campstation-frontend:v2.0.0 --target runtime .

# 빌드 확인
docker images | Select-String "campstation-frontend"
```

#### 2-3. 기존 컨테이너 중지 및 제거

```bash
# 실행 중인 컨테이너 확인
docker ps | Select-String "frontend"

# 컨테이너 중지
docker stop <container-id>

# 컨테이너 제거
docker rm <container-id>
```

#### 2-4. 새 컨테이너 실행

```bash
docker run -d \
  --name campstation-frontend \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_API_URL=http://mycamp.duckdns.org/api/ \
  --restart always \
  campstation-frontend:v2.0.0
```

---

## 🔍 배포 후 검증

### 1. 컨테이너 상태 확인

```bash
# 실행 중인 컨테이너 확인
docker ps | Select-String "frontend"

# 컨테이너 리소스 사용량
docker stats campstation-frontend --no-stream
```

### 2. 헬스 체크

```bash
# 웹사이트 접속 확인
curl http://localhost:3000

# 또는 브라우저에서
# http://mycamp.duckdns.org
```

### 3. 로그 모니터링

```bash
# 실시간 로그 확인
docker logs -f campstation-frontend

# 최근 50줄 로그
docker logs --tail 50 campstation-frontend

# 에러 로그만
docker logs campstation-frontend 2>&1 | Select-String "error|Error|ERROR"
```

### 4. Next.js 빌드 정보 확인

브라우저 개발자 도구에서:

- Network 탭 → Response Headers → `x-powered-by` 확인
- Console에서 React 버전 확인: `React.version`

### 5. useOptimistic 동작 확인

- 캠핑장 카드의 하트 버튼 클릭 → 즉시 반응하는지 확인
- 대시보드 > 찜한 캠핑장 > 해제 버튼 → 즉시 사라지는지 확인

---

## ⚠️ 주의사항

### 1. 환경 변수

- `.env.production` 파일이 올바르게 설정되어 있는지 확인
- `NEXT_PUBLIC_API_URL` 등 필수 환경 변수 확인

### 2. 캐시 문제

브라우저 캐시로 인해 이전 버전이 보일 수 있음:

```bash
# 강제 새로고침: Ctrl + Shift + R (Windows)
# 또는: Cmd + Shift + R (Mac)
```

### 3. CDN/Proxy 캐시

Nginx나 CDN 사용 시 캐시 무효화 필요

### 4. 데이터베이스

- Backend는 변경사항 없음
- 데이터베이스 마이그레이션 불필요

---

## 🚨 롤백 절차 (문제 발생 시)

### 1. 이전 이미지로 롤백

```bash
# 이전 이미지 확인
docker images | Select-String "campstation-frontend"

# 컨테이너 중지
docker-compose -f docker-compose.yml -f docker-compose.prod.yml stop frontend

# 이전 이미지로 재시작 (이미지 태그를 이전 버전으로 변경)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d frontend
```

### 2. Git 롤백

```bash
cd frontend

# 이전 커밋 확인
git log --oneline -10

# 특정 커밋으로 롤백
git reset --hard <commit-hash>

# 강제 푸시 (주의!)
git push -f origin master
```

---

## 📊 배포 체크리스트

### 배포 전

- [ ] 로컬 빌드 성공 확인
- [ ] Git 커밋 및 푸시 완료
- [ ] 환경 변수 확인
- [ ] 테스트 서버 백업 (선택)

### 배포 중

- [ ] Docker 이미지 빌드 성공
- [ ] 컨테이너 시작 성공
- [ ] 로그에 에러 없음

### 배포 후

- [ ] 웹사이트 접속 확인
- [ ] 기본 기능 동작 확인
- [ ] useOptimistic 동작 확인
- [ ] 브라우저 콘솔 에러 없음
- [ ] 성능 모니터링 (5분 관찰)

---

## 📞 문제 발생 시

### 일반적인 문제 및 해결

#### 1. 빌드 실패

```bash
# node_modules 캐시 문제
docker-compose build --no-cache frontend

# Dockerfile 문법 확인
docker build --target runtime -f frontend/Dockerfile .
```

#### 2. 컨테이너 시작 실패

```bash
# 로그 확인
docker logs campstation-frontend

# 포트 충돌 확인
netstat -ano | findstr :3000
```

#### 3. 환경 변수 문제

```bash
# 컨테이너 내부 환경 변수 확인
docker exec campstation-frontend env | Select-String "NEXT_PUBLIC"
```

#### 4. 네트워크 문제

```bash
# Backend 연결 테스트
docker exec campstation-frontend curl http://campstation-backend:8080/actuator/health
```

---

## 🎯 권장 배포 시간

- **평일**: 오후 11시 ~ 새벽 2시 (사용자 적은 시간)
- **주말**: 일요일 밤 (다음 날 월요일 모니터링 가능)

---

## 📝 배포 후 모니터링

### 1시간 동안 모니터링

- [ ] 5분: 초기 에러 확인
- [ ] 15분: 메모리/CPU 사용량 확인
- [ ] 30분: 사용자 피드백 확인
- [ ] 60분: 전체 안정성 확인

---

**작성일**: 2025-11-06  
**작성자**: GitHub Copilot  
**대상 서버**: mycamp.duckdns.org  
**예상 다운타임**: 2-5분
