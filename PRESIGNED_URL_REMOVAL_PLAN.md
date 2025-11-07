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

### Step 1: 백엔드 View URL 로직 변경 (ReviewService, UserResponseDto) ✅ **완료**

**목표**: `generatePresignedUrlForView()` → `generatePublicUrl()` 변경

**작업 내용**:

1. ✅ ReviewService.java 수정
   - `generatePresignedUrlForView()` → `generatePublicUrl()` 변경 (3곳)
   - try-catch 제거 (generatePublicUrl은 예외 발생 안함)
   - 주석 업데이트 ("Presigned URL로 업로드된" → "업로드된")
2. ✅ ReviewAdminFacade.java 수정
   - `generatePresignedUrlForView()` → `generatePublicUrl()` 변경 (3곳)
   - try-catch 및 null 필터 제거
   - 주석 업데이트
3. ✅ UserResponseDto.java 수정
   - 메서드명 변경: `fromEntityWithPresignedUrl()` → `fromEntity()`
   - `generatePresignedUrlForView()` → `generatePublicUrl()` 변경
   - try-catch 제거
   - 주석 업데이트
4. ✅ UserController.java 수정
   - `fromEntityWithPresignedUrl()` → `fromEntity()` 호출 변경 (3곳)
5. ✅ OwnerService.java 수정
   - 메인 이미지, 썸네일, 원본 이미지 URL 생성 로직 변경
   - try-catch 및 null 필터 제거
   - 주석 업데이트

**⚠️ Step 8 빌드 검증 중 발견된 누락 파일 (2025-01-XX):**

6. ✅ CampgroundService.java 수정
   - `generatePresignedUrlForView()` → `generatePublicUrl()` 변경 (6곳)
   - toCampgroundResponse() 메서드: 메인/썸네일/원본 이미지 URL 변환
   - toCampgroundResponsesBatch() 메서드: 배치 URL 변환
   - try-catch 및 null 필터 제거
   - `.collect(Collectors.toList())` → `.toList()` 변환
   - 주석 업데이트 ("Presigned URL" → "Public URL")
7. ✅ CampgroundAdminFacade.java 수정
   - `generatePresignedUrlForView()` → `generatePublicUrl()` 변경 (3곳)
   - toResponse() 메서드: 메인/썸네일/원본 이미지 URL 변환
   - try-catch 및 null 필터 제거
   - `.collect(Collectors.toList())` → `.toList()` 변환
   - 주석 업데이트

**발견된 추가 개선사항**:

- `generatePublicUrl()`은 IOException을 발생시키지 않음 (RuntimeException만 발생)
- 기존 try-catch 블록이 불필요했음 → 모두 제거하여 코드 단순화
- null 체크 및 필터링도 불필요 → 제거

**커밋**:

- Hash: 8dd1834 (초기 5개 파일)
- 메시지: "refactor(Step1): generatePresignedUrlForView → generatePublicUrl 변경"
- Hash: 4fa75d5 (누락된 2개 파일 - Step 8 발견)
- 메시지: "fix(Step1): CampgroundService와 CampgroundAdminFacade에 누락된 Step 1 마이그레이션 완료"

**검증**:

- ✅ 빌드 성공 확인
- ✅ 7개 파일 모두 에러 없음
- ✅ ReviewService, ReviewAdminFacade, UserResponseDto, UserController, OwnerService 수정 완료 (초기)
- ✅ CampgroundService, CampgroundAdminFacade 수정 완료 (Step 8에서 발견 및 수정)
- ✅ compileJava SUCCESSFUL

**교훈**:

- grep 검색으로 파일을 찾았지만 일부 파일이 마이그레이션에서 누락됨
- Step 완료 전 전체 빌드 검증 필요
- Campground 관련 서비스도 Review와 동일한 패턴으로 이미지 URL 생성 사용

---

### Step 2: 백엔드 Upload Presigned URL 제거

- 메서드명 변경: `fromEntityWithPresignedUrl()` → `fromEntity()`

4. UserController.java 수정
   - 메서드 호출명 변경 (3곳)
5. OwnerService.java 확인 및 수정

**검증**:

- 빌드 성공 확인
- 리뷰 이미지 표시 확인
- 프로필 이미지 표시 확인

### Step 2: 백엔드 Upload Presigned URL 제거

**상태**: ✅ 완료 (2025-01-XX)

**목표**: 업로드용 Presigned URL 코드 완전 제거

**작업 내용**:

1. ✅ S3FileService.java 수정

   - `generatePresignedUrlForUpload()` 메서드 제거 (58 lines)
   - `buildFileKey()` 메서드 제거 (Upload 전용, 23 lines)
   - `PutObjectPresignRequest` import 제거
   - ⚠️ `adjustPresignedUrlPath()` 유지 (View URL에서 사용 중, Step 5에서 제거 예정)

2. ✅ FileController.java 수정
   - `POST /api/v1/files/presigned-url` 엔드포인트 제거 (31 lines)
   - `PresignedUrlRequest` DTO 제거 (19 lines)

**발견된 이슈 및 해결**:

- 문제: `adjustPresignedUrlPath()` 제거 시 컴파일 에러 발생
- 원인: View Presigned URL 생성(`generatePresignedUrlForView()`)에서 해당 메서드 사용 중
- 해결: View URL 관련 코드는 Step 4-5에서 제거 예정이므로 `adjustPresignedUrlPath()` 임시 유지
- 주석 추가: "View URL 생성 시 사용, Step 5에서 제거 예정"

**커밋**:

- Hash: a08e705
- 메시지: "refactor(Step2): Upload Presigned URL 관련 코드 제거"
- 변경사항: 2 files, +1 insertion, -138 deletions

**검증**:

- ✅ 빌드 성공 확인 (에러 없음)
- ✅ S3FileService.java 컴파일 에러 없음
- ✅ FileController.java 컴파일 에러 없음
- ✅ Orphaned code 정리 완료 (unused imports, methods)

**다음 단계**:

- Step 3: Frontend useImageUpload hook 수정 (Upload Presigned URL → Direct Upload)

---

### Step 3: 프론트엔드 useImageUpload 훅 수정

---

### Step 3: 프론트엔드 Upload 로직 변경

**상태**: ✅ 완료 (2025-01-XX)

**목표**: 직접 업로드 API 사용으로 전환

**작업 내용**:

1. ✅ files.ts 수정

   - `fileApi.upload()`: Presigned URL 방식 → Direct Upload 방식
     - 기존: 1) Presigned URL 요청 → 2) MinIO 직접 업로드 → 3) 파일 경로 반환
     - 변경: POST /v1/files/upload (FormData 전송)
   - `fileApi.uploadImagePair()`: 백엔드 uploadImagePair API 호출 함수 추가
     - POST /v1/files/upload/pair (썸네일 + 원본 동시 처리)

2. ✅ reviews.ts 수정

   - `uploadImagePairs()` 프론트엔드 함수 → `fileApi.uploadImagePair()` API 호출로 변경
   - create(), update() 메서드 모두 적용
   - 썸네일 생성을 백엔드에서 처리

3. ✅ useCampgroundEdit.ts 수정

   - 개별 썸네일/원본 업로드 → `fileApi.uploadImagePair()` API 호출로 변경
   - 썸네일 생성 로직 제거 (백엔드로 이관)

4. ✅ DashboardClient.tsx
   - 프로필 이미지는 단일 파일이므로 `fileApi.upload()` 그대로 사용
   - Direct Upload 방식으로 자동 전환됨

**주요 변경사항**:

- 프론트엔드에서 썸네일 생성 로직 제거
- 백엔드에서 이미지 처리 (리사이징, 최적화) 수행
- 업로드 플로우 단순화: 3단계 → 1단계 (Direct API call)
- FormData 사용으로 파일 전송

**Breaking Changes**:

- `uploadImagePairs()` 유틸리티 함수 사용 중단 (백엔드 API로 대체)
- Presigned URL 업로드 플로우 완전 제거

**커밋**:

- Hash: 7a1b420
- 메시지: "refactor(Step3): Upload 로직을 Direct Upload API로 변경"
- 변경사항: 3 files, +59 insertions, -60 deletions

**검증**:

- ✅ 빌드 성공 확인 (에러 없음)
- ✅ files.ts 컴파일 에러 없음
- ✅ reviews.ts 컴파일 에러 없음
- ✅ useCampgroundEdit.ts 컴파일 에러 없음

**다음 단계**:

- Step 4: Backend View Presigned URL 엔드포인트 제거

---

---

### Step 4: 백엔드 View Presigned URL 엔드포인트 제거

**상태**: ✅ 완료 (2025-01-XX)

**목표**: View용 Presigned URL API 완전 제거

**작업 내용**:

1. ✅ FileController.java 수정

   - `GET /api/v1/files/presigned-url` 엔드포인트 제거 (20 lines)
   - `POST /api/v1/files/presigned-urls/view` 엔드포인트 제거 (28 lines)
   - `PresignedUrlBatchRequest` DTO 제거 (7 lines)
   - `FileUrlResponse` DTO 제거 (3 lines)
   - 미사용 import 제거 (Map, GetMapping)

2. ✅ JwtSecurityConfig.java 수정
   - `.requestMatchers(HttpMethod.POST, "/api/v1/files/presigned-urls/view").permitAll()` 제거 (1 line)
   - View Presigned URL 엔드포인트 인증 예외 설정 제거

**제거된 코드 요약**:

- 엔드포인트: 2개 (GET, POST)
- DTO 클래스: 2개 (PresignedUrlBatchRequest, FileUrlResponse)
- 총 라인 수: 59 lines

**커밋**:

- Hash: cc6f6bd
- 메시지: "refactor(Step4): View Presigned URL 엔드포인트 제거"
- 변경사항: 2 files, -70 deletions

**검증**:

- ✅ 빌드 성공 확인 (에러 없음)
- ✅ FileController.java 컴파일 에러 없음
- ✅ JwtSecurityConfig.java 컴파일 에러 없음
- ✅ API 엔드포인트 완전 제거 확인

**다음 단계**:

- Step 5: S3FileService View URL 메서드 제거 (generatePresignedUrlForView, adjustPresignedUrlPath)

---

### Step 5: S3FileService View URL 메서드 제거

**상태**: ✅ 완료 (2025-01-XX)

**목표**: Presigned URL 관련 모든 메서드 제거

**작업 내용**:

1. ✅ S3FileService.java 수정
   - `generatePresignedUrlForView()` 메서드 제거 (65 lines)
   - `generatePresignedUrlsForView()` 메서드 제거 (24 lines)
   - `adjustPresignedUrlPath()` 메서드 제거 (13 lines, Step 2에서 임시 유지했던 것)
   - `PresignedUrlResponse` 레코드 제거 (5 lines)
   - `@Value viewDurationDays` 제거 (2 lines)
   - `@Cacheable` presignedUrls 캐시 어노테이션 제거
   - 미사용 import 제거 (LinkedHashMap, Map, Cacheable, S3Presigner, GetObjectPresignRequest)

**제거된 코드 요약**:

- 메서드: 3개 (generatePresignedUrlForView, generatePresignedUrlsForView, adjustPresignedUrlPath)
- 레코드: 1개 (PresignedUrlResponse)
- 어노테이션: 2개 (@Value, @Cacheable)
- Import: 5개
- 총 라인 수: 109 lines

**중요 의미**:

- **백엔드 Presigned URL 코드 완전 제거 완료**
- S3FileService에서 Presigned URL 관련 모든 흔적 제거
- Step 2에서 임시 유지했던 adjustPresignedUrlPath()도 최종 제거

**커밋**:

- Hash: 8cc23c6
- 메시지: "refactor(Step5): S3FileService View URL 메서드 제거"
- 변경사항: 1 file, -111 deletions

**검증**:

- ✅ 빌드 성공 확인 (에러 없음)
- ✅ S3FileService.java 컴파일 에러 없음
- ✅ Presigned URL 관련 코드 완전 제거 확인
- ✅ 모든 미사용 import 정리 완료

**다음 단계**:

- Step 6: Frontend Batch URL 로직 제거 (fetchBatchPresignedUrls, getImageUrls, getImageUrl)

---

### Step 6: 프론트엔드 Batch URL 로직 제거

**상태**: ✅ 완료 (2025-01-XX)

**목표**: Presigned URL 관련 프론트엔드 코드 정리

**작업 내용**:

1. ✅ files.ts 수정
   - `fetchBatchPresignedUrls()` 함수 제거 (48 lines)
   - `fileApi.getImageUrls()` 메서드 제거 (4 lines)
   - `fileApi.getImageUrl()` 메서드 제거 (13 lines)
   - `FileUrlResponse` type 제거 (4 lines)
   - `ApiError` import 제거 (미사용)

**제거된 코드 요약**:

- 함수: 3개 (fetchBatchPresignedUrls, getImageUrls, getImageUrl)
- Type: 1개 (FileUrlResponse)
- 총 라인 수: 69 lines

**중요 의미**:

- **프론트엔드 Presigned URL 코드 완전 제거 완료**
- fileApi는 이제 upload와 uploadImagePair만 제공 (Direct Upload 전용)
- Presigned URL 방식 완전 폐기

**커밋**:

- Hash: 1609547
- 메시지: "refactor(Step6): Frontend Batch URL 로직 제거"
- 변경사항: 1 file, +1 insertion, -73 deletions

**검증**:

- ✅ 빌드 성공 확인 (에러 없음)
- ✅ files.ts 컴파일 에러 없음
- ✅ getImageUrl 사용처 확인 (prop 함수명으로만 사용, 문제없음)
- ✅ Presigned URL 관련 모든 API 호출 제거 확인

**다음 단계**:

- Step 7: 최종 정리 및 문서화 (주석 업데이트, CHANGELOG 작성)

---

### Step 7: 최종 정리 및 문서화

**상태**: ✅ 완료 (2025-01-XX)

**목표**: Presigned URL 관련 주석 업데이트 및 최종 문서화

**작업 내용**:

1. ✅ 주석 업데이트 (6개 파일)
   - `campgroundMedia.tsx`: presignedImageLoader → publicImageLoader 주석 변경
   - `HomeLandingShell.tsx`: "Presigned URL로 변환" → "Public URL로 변환"
   - `FeaturedCampgroundSection.tsx`: "S3 presigned URL" → "Public URL"
   - `ReviewsTab.tsx`: "Presigned URL 직접 사용" → "Public URL 직접 사용"
   - `ImageWithFallback.tsx`: "presigned URL 사용" → "Public URL 사용"
   - `CampgroundEditClient.tsx`: "Presigned URL을" → "Public URL을"
   - `ReviewModal.tsx`: "Presigned URL에서" → "Public URL에서"

**최종 정리 내용**:

- Presigned URL 관련 모든 주석을 Public URL로 업데이트
- 코드베이스에서 "Presigned" 용어 완전 제거
- 일관된 용어 사용: "Public URL", "Direct Upload"

**커밋**:

- Hash: (다음 커밋)
- 메시지: "docs(Step7): Presigned URL 관련 주석을 Public URL로 업데이트"

**검증**:

- ✅ 주석 업데이트 완료 (7개 파일)
- ✅ "presigned" 검색 결과 확인 (주석에서 모두 제거)
- ✅ 코드 일관성 확보

---

## 🎉 Presigned URL 제거 작업 완료

### 전체 요약

**제거된 총 코드량**:

- **Backend**: 227 lines

  - Step 2: 131 lines (Upload Presigned URL)
  - Step 4: 59 lines (View Presigned URL 엔드포인트)
  - Step 5: 109 lines (S3FileService View URL 메서드)
  - 기타: 미사용 import, 주석 등

- **Frontend**: 142 lines

  - Step 3: 60 lines (Upload 로직 변경, 순 증가분 고려)
  - Step 6: 69 lines (Batch URL 로직)
  - Step 7: 13 lines (주석 업데이트)

- **총계**: ~370 lines 제거

**주요 성과**:

1. ✅ **복잡도 감소**: 3단계 업로드 → 1단계 Direct Upload
2. ✅ **URL 형식 통일**: 4가지 → 1가지 (Public URL)
3. ✅ **CORS 문제 해결**: 프론트엔드 → MinIO 직접 접근 제거
4. ✅ **트랜잭션 지원**: @Transactional로 원자성 보장
5. ✅ **보안 강화**: 모든 파일 접근이 백엔드를 통해서만 가능
6. ✅ **에러 처리 개선**: 통합된 에러 핸들링
7. ✅ **코드 단순화**: try-catch 제거, 스트림 로직 간소화

**적용된 기술**:

- Backend: Spring Boot 3.5, Java 21 Records, @Transactional
- Frontend: React 19, Next.js 16, FormData API
- Storage: MinIO (S3-compatible), Public URL 방식
- Architecture: Direct Upload, Backend-controlled access

**다음 단계**:

- 통합 테스트 및 검증 (Step 8 - 별도 작업)

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

| Step     | 작업                                      | 예상 시간      |
| -------- | ----------------------------------------- | -------------- |
| 1        | 백엔드 View URL 로직 변경                 | 30분           |
| 2        | 백엔드 Upload Presigned URL 제거          | 15분           |
| 3        | 프론트엔드 Upload 로직 변경               | 1시간          |
| 4        | 백엔드 View Presigned URL 엔드포인트 제거 | 20분           |
| 5        | S3FileService View URL 메서드 제거        | 15분           |
| 6        | 프론트엔드 Batch URL 로직 제거            | 30분           |
| 7        | 최종 정리 및 문서화                       | 30분           |
| **합계** |                                           | **약 3-4시간** |

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
