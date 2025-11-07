# Presigned URL 제거 계획

## 📋 목차
1. [제거 이유](#제거-이유)
2. [영향 범위 분석](#영향-범위-분석)
3. [제거 대상](#제거-대상)
4. [제거 순서](#제거-순서)
5. [검증 방법](#검증-방법)

---

## 제거 이유

### 기존 Presigned URL 방식의 문제점
1. **복잡한 업로드 플로우**
   - 프론트엔드에서 Presigned URL 요청
   - 백엔드에서 임시 URL 생성
   - 프론트엔드에서 MinIO로 직접 업로드
   - 3단계 프로세스로 인한 복잡도 증가

2. **CORS 문제**
   - 프론트엔드 → MinIO 직접 접근 시 CORS 설정 필요
   - 프로덕션/개발 환경마다 다른 설정

3. **에러 처리 어려움**
   - 업로드 실패 시 정리 로직 부재
   - 트랜잭션 처리 불가능

4. **URL 형식 불일치**
   - Presigned URL: `http://minio:9000/bucket/path?X-Amz-...`
   - Public URL: `https://mycamp.duckdns.org/storage/path`
   - 4가지 URL 형식 혼재

### 새로운 직접 업로드 방식의 장점
1. **단순한 플로우**
   - 프론트엔드 → 백엔드 (MultipartFile)
   - 백엔드 → MinIO 업로드
   - 2단계 프로세스로 단순화

2. **통일된 접근 방식**
   - 모든 스토리지 접근은 백엔드를 통해서만
   - 일관된 URL 형식: `https://domain.com/storage/path`

3. **트랜잭션 지원**
   - `@Transactional` 어노테이션으로 원자성 보장
   - 실패 시 자동 롤백

4. **범용성**
   - campground, review, profile 모두 동일한 API 사용
   - type 파라미터로 폴더 자동 구분

---

## 영향 범위 분석

### 백엔드 파일 (5개)
1. **S3FileService.java** - 핵심 서비스
   - `generatePresignedUrlForUpload()` 메서드 제거
   - `generatePresignedUrlForView()` 메서드 제거 (⚠️ 주의: 현재 사용 중)
   - `generatePresignedUrlsForView()` 메서드 제거 (⚠️ 주의: 현재 사용 중)
   - `adjustPresignedUrlPath()` 메서드 제거
   - `PresignedUrlResponse` 레코드 제거
   - `@Value` 설정 제거 (presigned.upload.duration-minutes, presigned.view.duration-days)

2. **FileController.java** - API 컨트롤러
   - `POST /api/v1/files/presigned-url` 엔드포인트 제거
   - `GET /api/v1/files/presigned-url` 엔드포인트 제거
   - `POST /api/v1/files/presigned-urls/view` 엔드포인트 제거
   - `PresignedUrlRequest` DTO 제거
   - `PresignedUrlBatchRequest` DTO 제거

3. **JwtSecurityConfig.java** - 보안 설정
   - `.requestMatchers(HttpMethod.POST, "/api/v1/files/presigned-urls/view").permitAll()` 제거

4. **ReviewService.java** - 리뷰 서비스 (⚠️ 주의: 현재 generatePresignedUrlForView 사용 중)
   - Line 89: 주석 수정
   - Line 482-494: Presigned URL 변환 로직 → Public URL 생성으로 변경
   - Line 505-511: 프로필 이미지 Presigned URL → Public URL 변경

5. **ReviewAdminFacade.java** - 리뷰 관리 서비스 (⚠️ 주의: 현재 generatePresignedUrlForView 사용 중)
   - Line 45-57: Presigned URL 변환 로직 → Public URL 생성으로 변경
   - Line 68-74: 프로필 이미지 Presigned URL → Public URL 변경

6. **UserResponseDto.java** - 사용자 응답 DTO (⚠️ 주의: 현재 generatePresignedUrlForView 사용 중)
   - `fromEntityWithPresignedUrl()` 메서드명 변경 또는 제거
   - Line 69-74: Presigned URL 생성 → Public URL 생성으로 변경

7. **UserController.java** - 사용자 컨트롤러
   - `fromEntityWithPresignedUrl()` 호출 → 새로운 메서드명으로 변경

8. **OwnerService.java** - 오너 서비스 (검색 결과에 나타남)
   - Presigned URL 관련 로직 확인 필요

### 프론트엔드 파일 (7개)
1. **files.ts** - 파일 API
   - `fetchBatchPresignedUrls()` 함수 제거
   - `upload()` 메서드의 Presigned URL 로직 제거 (Step 1, 2)
   - `getBatchUrls()` 메서드 제거
   - `getFileUrl()` 메서드 제거

2. **urlUtils.ts** - URL 유틸리티
   - `extractFilePath()` 주석 수정 (Presigned URL → Public URL)

3. **campgroundMedia.tsx** - 캠핑장 미디어 유틸
   - `presignedImageLoader` 이름 변경 또는 제거

4. **FeaturedCampgroundSection.tsx** - 홈페이지 섹션
   - Line 449: 주석 수정

5. **ReviewsTab.tsx** - 리뷰 탭
   - Line 170: 주석 수정

6. **HomeLandingShell.tsx** - 홈페이지 셸
   - Line 98: 주석 수정

7. **ImageWithFallback.tsx** - 이미지 폴백
   - Line 5, 37: 주석 수정

8. **ReviewModal.tsx** - 리뷰 모달
   - Line 120: 주석 수정

9. **CampgroundEditClient.tsx** - 캠핑장 수정
   - Line 180: 주석 수정

---

## 제거 대상

### ⚠️ 즉시 제거 가능한 코드

#### 백엔드
1. **S3FileService.java**
   - ✅ `generatePresignedUrlForUpload()` - 업로드용 (더 이상 사용 안 함)
   - ✅ `adjustPresignedUrlPath()` - URL 경로 변환 (더 이상 필요 없음)
   - ✅ `PresignedUrlResponse` 레코드 (더 이상 필요 없음)
   - ✅ `@Value` presigned.upload.duration-minutes 설정

2. **FileController.java**
   - ✅ `POST /api/v1/files/presigned-url` - 업로드용 Presigned URL 생성
   - ✅ `PresignedUrlRequest` DTO

#### 프론트엔드
1. **files.ts**
   - ✅ `upload()` 메서드의 Presigned URL 로직 (직접 업로드로 대체)

### ⚠️ 단계적 제거 필요 (현재 사용 중)

#### Phase 1: 백엔드 View URL 생성 로직 변경
**현재 문제**: `generatePresignedUrlForView()` 메서드가 ReviewService, UserResponseDto 등에서 사용 중

**해결 방법**:
1. `generatePublicUrl()` 메서드가 이미 존재
2. ReviewService, UserResponseDto에서 `generatePresignedUrlForView()` → `generatePublicUrl()` 변경
3. 기존 `generatePresignedUrlForView()` 메서드 제거

**영향받는 파일**:
- ReviewService.java (Line 487, 490, 509)
- ReviewAdminFacade.java (Line 50, 53, 72)
- UserResponseDto.java (Line 72)

#### Phase 2: 프론트엔드 Batch URL 로직 제거
**현재 문제**: `fetchBatchPresignedUrls()`, `getBatchUrls()`, `getFileUrl()` 사용 중

**해결 방법**:
1. 프론트엔드에서 Public URL 직접 사용
2. 백엔드에서 이미 Public URL로 변환된 데이터 전송
3. Batch URL 요청 로직 제거

**영향받는 파일**:
- files.ts (fetchBatchPresignedUrls, getBatchUrls, getFileUrl)

#### Phase 3: 백엔드 View Presigned URL 엔드포인트 제거
**영향받는 파일**:
- FileController.java
  - `GET /api/v1/files/presigned-url`
  - `POST /api/v1/files/presigned-urls/view`
  - `PresignedUrlBatchRequest` DTO
  - `FileUrlResponse` DTO
- JwtSecurityConfig.java
  - `.requestMatchers(HttpMethod.POST, "/api/v1/files/presigned-urls/view").permitAll()`

#### Phase 4: S3FileService 정리
**영향받는 파일**:
- S3FileService.java
  - `generatePresignedUrlForView()` 메서드
  - `generatePresignedUrlsForView()` 메서드
  - `@Value` presigned.view.duration-days 설정
  - `@Cacheable` presignedUrls 캐시 설정

---

## 제거 순서

### Step 1: 백엔드 View URL 로직 변경 (ReviewService, UserResponseDto)
**목표**: `generatePresignedUrlForView()` → `generatePublicUrl()` 변경

**작업 내용**:
1. ReviewService.java 수정
   - `generatePresignedUrlForView()` → `generatePublicUrl()` 변경 (3곳)
2. ReviewAdminFacade.java 수정
   - `generatePresignedUrlForView()` → `generatePublicUrl()` 변경 (3곳)
3. UserResponseDto.java 수정
   - `generatePresignedUrlForView()` → `generatePublicUrl()` 변경 (1곳)
   - 메서드명 변경: `fromEntityWithPresignedUrl()` → `fromEntity()`
4. UserController.java 수정
   - 메서드 호출명 변경 (3곳)
5. OwnerService.java 확인 및 수정

**검증**:
- 빌드 성공 확인
- 리뷰 이미지 표시 확인
- 프로필 이미지 표시 확인

### Step 2: 백엔드 Upload Presigned URL 제거
**목표**: 업로드용 Presigned URL 코드 완전 제거

**작업 내용**:
1. S3FileService.java
   - `generatePresignedUrlForUpload()` 메서드 제거
   - `adjustPresignedUrlPath()` 메서드 제거
   - `PresignedUrlResponse` 레코드 제거
   - `@Value` presigned.upload.duration-minutes 제거

2. FileController.java
   - `POST /api/v1/files/presigned-url` 엔드포인트 제거
   - `PresignedUrlRequest` DTO 제거

**검증**:
- 빌드 성공 확인
- 직접 업로드 API 정상 작동 확인

### Step 3: 프론트엔드 Upload 로직 변경
**목표**: 직접 업로드 API 사용으로 전환

**작업 내용**:
1. files.ts
   - `upload()` 메서드의 Presigned URL 로직 제거
   - 직접 업로드 로직으로 교체

2. useImageUpload.ts (새로 작성)
   - 직접 업로드 Hook 구현
   - React 19 useOptimistic 활용

**검증**:
- Campground 이미지 업로드 테스트
- Review 이미지 업로드 테스트
- Profile 이미지 업로드 테스트

### Step 4: 백엔드 View Presigned URL 엔드포인트 제거
**목표**: View용 Presigned URL API 완전 제거

**작업 내용**:
1. FileController.java
   - `GET /api/v1/files/presigned-url` 엔드포인트 제거
   - `POST /api/v1/files/presigned-urls/view` 엔드포인트 제거
   - `PresignedUrlBatchRequest` DTO 제거
   - `FileUrlResponse` DTO 제거

2. JwtSecurityConfig.java
   - Presigned URL 엔드포인트 허용 설정 제거

**검증**:
- 빌드 성공 확인
- API 엔드포인트 제거 확인

### Step 5: S3FileService View URL 메서드 제거
**목표**: Presigned URL 관련 모든 메서드 제거

**작업 내용**:
1. S3FileService.java
   - `generatePresignedUrlForView()` 메서드 제거
   - `generatePresignedUrlsForView()` 메서드 제거
   - `@Value` presigned.view.duration-days 제거
   - `@Cacheable` presignedUrls 캐시 설정 제거

**검증**:
- 빌드 성공 확인
- Presigned URL 관련 코드 완전 제거 확인

### Step 6: 프론트엔드 Batch URL 로직 제거
**목표**: Presigned URL 관련 프론트엔드 코드 정리

**작업 내용**:
1. files.ts
   - `fetchBatchPresignedUrls()` 함수 제거
   - `getBatchUrls()` 메서드 제거
   - `getFileUrl()` 메서드 제거

2. 주석 정리
   - urlUtils.ts
   - campgroundMedia.tsx
   - FeaturedCampgroundSection.tsx
   - ReviewsTab.tsx
   - HomeLandingShell.tsx
   - ImageWithFallback.tsx
   - ReviewModal.tsx
   - CampgroundEditClient.tsx

**검증**:
- 빌드 성공 확인
- 모든 이미지 정상 표시 확인

### Step 7: 최종 정리 및 문서화
**목표**: 불필요한 코드 제거 및 문서 업데이트

**작업 내용**:
1. application.yml
   - `cloud.aws.s3.presigned.*` 설정 제거

2. 문서 업데이트
   - STORAGE_INTEGRATION_PLAN.md 업데이트
   - README.md 업데이트
   - API 문서 업데이트

**검증**:
- 전체 기능 테스트
- 문서 일관성 확인

---

## 검증 방법

### 백엔드 검증
```bash
# 1. 빌드 성공 확인
cd backend
./gradlew clean build

# 2. Presigned URL 문자열 검색 (남아있으면 안 됨)
grep -r "presigned" src/
grep -r "Presigned" src/
grep -r "PRESIGNED" src/

# 3. 직접 업로드 API 테스트
curl -X POST http://localhost:8080/api/v1/files/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.jpg" \
  -F "type=campground"
```

### 프론트엔드 검증
```bash
# 1. 빌드 성공 확인
cd frontend
npm run build

# 2. Presigned URL 문자열 검색 (주석 제외하고 남아있으면 안 됨)
grep -r "presigned" src/
grep -r "Presigned" src/
grep -r "PRESIGNED" src/

# 3. 런타임 테스트
npm run dev
# - 캠핑장 이미지 업로드
# - 리뷰 이미지 업로드
# - 프로필 이미지 업로드
```

### E2E 테스트
1. **캠핑장 관리**
   - 캠핑장 생성 시 이미지 업로드
   - 캠핑장 수정 시 이미지 추가/삭제
   - 이미지 정상 표시 확인

2. **리뷰 관리**
   - 리뷰 작성 시 이미지 업로드
   - 리뷰 수정 시 이미지 추가/삭제
   - 이미지 정상 표시 확인

3. **프로필 관리**
   - 프로필 이미지 업로드
   - 프로필 이미지 변경
   - 이미지 정상 표시 확인

---

## 롤백 계획

### Git 커밋 단위
각 Step마다 별도 커밋으로 관리:
```bash
# Step 1 커밋
git commit -m "refactor: ReviewService/UserResponseDto Presigned URL → Public URL 변경"

# Step 2 커밋
git commit -m "remove: 백엔드 Upload Presigned URL 관련 코드 제거"

# Step 3 커밋
git commit -m "refactor: 프론트엔드 직접 업로드 방식으로 전환"

# ... 각 Step마다 커밋
```

### 롤백 방법
```bash
# 특정 Step 롤백
git revert <commit-hash>

# 전체 롤백
git reset --hard <이전-커밋-hash>
```

---

## 예상 소요 시간

| Step | 작업 | 예상 시간 |
|------|------|-----------|
| 1 | 백엔드 View URL 로직 변경 | 30분 |
| 2 | 백엔드 Upload Presigned URL 제거 | 15분 |
| 3 | 프론트엔드 Upload 로직 변경 | 1시간 |
| 4 | 백엔드 View Presigned URL 엔드포인트 제거 | 20분 |
| 5 | S3FileService View URL 메서드 제거 | 15분 |
| 6 | 프론트엔드 Batch URL 로직 제거 | 30분 |
| 7 | 최종 정리 및 문서화 | 30분 |
| **합계** | | **약 3-4시간** |

---

## 체크리스트

### 백엔드
- [ ] Step 1: ReviewService Presigned URL → Public URL 변경
- [ ] Step 1: ReviewAdminFacade Presigned URL → Public URL 변경
- [ ] Step 1: UserResponseDto Presigned URL → Public URL 변경
- [ ] Step 1: UserController 메서드명 변경
- [ ] Step 1: OwnerService 확인 및 수정
- [ ] Step 2: S3FileService Upload Presigned URL 제거
- [ ] Step 2: FileController Upload Presigned URL 엔드포인트 제거
- [ ] Step 4: FileController View Presigned URL 엔드포인트 제거
- [ ] Step 4: JwtSecurityConfig 설정 제거
- [ ] Step 5: S3FileService View Presigned URL 제거
- [ ] Step 7: application.yml 설정 제거

### 프론트엔드
- [ ] Step 3: files.ts Upload 로직 변경
- [ ] Step 3: useImageUpload Hook 작성
- [ ] Step 6: files.ts Batch URL 로직 제거
- [ ] Step 6: 주석 정리 (8개 파일)

### 테스트
- [ ] 백엔드 빌드 성공
- [ ] 프론트엔드 빌드 성공
- [ ] 캠핑장 이미지 업로드/표시
- [ ] 리뷰 이미지 업로드/표시
- [ ] 프로필 이미지 업로드/표시
- [ ] E2E 테스트 통과

### 문서
- [ ] STORAGE_INTEGRATION_PLAN.md 업데이트
- [ ] README.md 업데이트
- [ ] API 문서 업데이트
- [ ] CHANGELOG.md 작성

---

## 참고

### 직접 업로드 API
```
POST /api/v1/files/upload
POST /api/v1/files/upload/pair
DELETE /api/v1/files
```

### Public URL 형식
```
https://mycamp.duckdns.org/storage/campgrounds/thumbnail/uuid.jpg
https://mycamp.duckdns.org/storage/reviews/original/uuid.jpg
https://mycamp.duckdns.org/storage/profiles/thumbnail/uuid.jpg
```

### 기존 Presigned URL 형식 (제거 예정)
```
http://minio:9000/campstation/campgrounds/thumbnail/uuid.jpg?X-Amz-Algorithm=...
```
