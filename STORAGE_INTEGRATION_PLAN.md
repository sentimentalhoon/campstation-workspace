# Storage 통합 및 문제 해결 계획

## �️ 기술 스택

이 프로젝트는 최신 기술 스택을 사용합니다:

### Frontend

- **Next.js 16**: App Router, Server Components, Server Actions
- **React 19**: useOptimistic, useActionState, useFormStatus
- **TypeScript 5.7**: 최신 타입 시스템

### Backend

- **Spring Boot 3.5**: Virtual Threads, Spring Security 6
- **Java 21**: Record Patterns, Virtual Threads, Pattern Matching
- **Spring Data JPA**: 최신 JPA 3.2

### Infrastructure

- **Docker**: Multi-stage builds
- **MinIO**: S3-compatible storage
- **PostgreSQL 16**: 최신 데이터베이스
- **Redis 7**: 캐싱

**개발 원칙**: 최신 기법과 베스트 프랙티스를 적용하여 모던하고 유지보수 가능한 코드 작성

---

## �📋 목차

1. [현재 문제 분석](#1-현재-문제-분석)
2. [목표 아키텍처](#2-목표-아키텍처)
3. [통합 계획](#3-통합-계획)
4. [단계별 작업](#4-단계별-작업)
5. [테스트 계획](#5-테스트-계획)
6. [롤백 계획](#6-롤백-계획)

---

## 1. 현재 문제 분석

### 1.1 발생 중인 문제들

#### ❌ 이미지 업로드

- Presigned URL 생성 복잡
- 프론트엔드에서 직접 MinIO 업로드 (CORS 이슈)
- 업로드 실패 시 정리 로직 부재
- 썸네일/원본 이미지 쌍 관리 복잡

#### ❌ 이미지 삭제

- **SSL 에러** (HTTP MinIO에 HTTPS 연결 시도)
- URL 경로 추출 불일치
- `/storage` prefix 중복 문제
- 썸네일과 원본 동시 삭제 실패

#### ❌ 이미지 수정

- 기존 이미지 URL 형식 불일치
- 삭제할 이미지 목록 관리 복잡
- 트랜잭션 처리 부재 (일부만 성공/실패)

#### ❌ URL 관리

- Presigned URL (쿼리 파라미터 포함)
- Public URL (도메인 변경 시 문제)
- 내부 URL (Docker 네트워크)
- 외부 URL (사용자 접근)
- **4가지 URL 형식 혼재**

### 1.2 근본 원인

```
🔴 핵심 문제: URL 형식과 접근 방식이 통일되지 않음

현재 상황:
- 백엔드 → MinIO: http://minio:9000 (내부)
- 사용자 → MinIO: https://mycamp.duckdns.org/storage (외부)
- Presigned URL: http://minio:9000/bucket/path?X-Amz-...
- DB 저장: /campgrounds/thumbnail/xxx.jpg (상대 경로)

문제:
1. 경로 변환 로직이 여러 곳에 분산
2. 각 컴포넌트마다 다른 URL 생성
3. 삭제/수정 시 경로 불일치
4. SSL/HTTPS 설정 혼란
```

---

## 2. 목표 아키텍처

### 2.1 통합 접근 방식

```
┌─────────────────────────────────────────────┐
│          Single Entry Point                 │
│                                              │
│  모든 스토리지 접근은 백엔드를 통해서만     │
└─────────────────────────────────────────────┘

[사용자] → [백엔드] → [MinIO]
            ↑
       단일 진입점
```

### 2.2 새로운 흐름

#### 업로드 플로우

```
1. 프론트엔드: 파일 선택
2. 프론트엔드 → 백엔드: multipart/form-data
3. 백엔드: 파일 수신 → MinIO 업로드
4. 백엔드: DB에 경로 저장 (/campgrounds/thumbnail/xxx.jpg)
5. 백엔드 → 프론트엔드: Public URL 반환
```

#### 조회 플로우

```
1. 프론트엔드: 이미지 URL 요청
2. 백엔드: DB에서 경로 조회
3. 백엔드: Public URL 생성 (https://domain.com/storage/path)
4. 프론트엔드: Public URL로 이미지 표시
```

#### 삭제 플로우

```
1. 프론트엔드: 삭제 요청 (경로만 전송)
2. 백엔드: DB에서 경로 검증
3. 백엔드: MinIO에서 파일 삭제
4. 백엔드: DB에서 레코드 삭제
5. 백엔드 → 프론트엔드: 성공 응답
```

### 2.3 URL 표준화

```yaml
저장 형식 (DB):
  - /campgrounds/thumbnail/uuid.jpg
  - /campgrounds/original/uuid.jpg
  - /reviews/uuid.jpg

내부 접근 (백엔드 → MinIO):
  - http://minio:9000/campstation/campgrounds/thumbnail/uuid.jpg

외부 접근 (사용자):
  - https://mycamp.duckdns.org/storage/campgrounds/thumbnail/uuid.jpg

규칙: 1. DB에는 항상 상대 경로만 저장
  2. 백엔드에서만 절대 URL 생성
  3. 프론트엔드는 Public URL만 사용
  4. Presigned URL 제거 (직접 업로드 중단)
```

---

## 3. 통합 계획

### 3.1 Phase 1: 백엔드 API 통합 (우선순위: 높음)

#### 목표

- 모든 스토리지 작업을 백엔드로 집중
- 일관된 URL 생성/관리

#### 작업

1. **FileController 통합**

   - 업로드 API: `POST /api/v1/files/upload`
   - 삭제 API: `DELETE /api/v1/files`
   - 다운로드 프록시: `GET /api/v1/files/{path}`

2. **S3FileService 개선**

   - URL 생성 로직 단일화
   - 에러 처리 강화
   - 트랜잭션 지원

3. **응답 형식 표준화**
   ```json
   {
     "thumbnailUrl": "https://mycamp.duckdns.org/storage/campgrounds/thumbnail/xxx.jpg",
     "originalUrl": "https://mycamp.duckdns.org/storage/campgrounds/original/xxx.jpg",
     "path": "/campgrounds/thumbnail/xxx.jpg"
   }
   ```

### 3.2 Phase 2: 프론트엔드 리팩토링 (우선순위: 높음)

#### 목표

- Presigned URL 사용 중단
- 백엔드 API만 사용

#### 작업

1. **업로드 로직 변경**

   - `useImageUpload` 훅 수정
   - FormData로 백엔드에 직접 업로드
   - Presigned URL 로직 제거

2. **URL 처리 단순화**

   - `urlUtils.ts` 단순화 또는 제거
   - 백엔드에서 받은 URL 그대로 사용

3. **에러 처리 개선**
   - 업로드 실패 시 재시도
   - 사용자 친화적 에러 메시지

### 3.3 Phase 3: Nginx 설정 최적화 (우선순위: 중간)

#### 목표

- `/storage` 경로를 MinIO로 올바르게 프록시
- 캐싱 및 성능 최적화

#### 작업

1. **Nginx 설정 수정**

   ```nginx
   location /storage/ {
       proxy_pass http://minio:9000/campstation/;
       proxy_cache_valid 200 30d;
       add_header Cache-Control "public, max-age=2592000";
   }
   ```

2. **HTTPS/SSL 설정**
   - MinIO HTTP 연결 확인
   - Let's Encrypt 인증서 설정

### 3.4 Phase 4: 데이터 마이그레이션 (우선순위: 낮음)

#### 목표

- 기존 이미지 URL 정규화
- DB 경로 일관성 확보

#### 작업

1. **마이그레이션 스크립트**
   - 기존 URL → 표준 경로 변환
   - Presigned URL → 상대 경로

---

## 4. 단계별 작업

### Step 1: 백엔드 FileController 생성 ⏱️ 1-2시간

#### 파일 생성

```java
// backend/src/main/java/com/campstation/camp/shared/file/FileController.java
```

#### 구현 내용

```java
// 최신 Spring Boot 3.5 + Java 21 기법 사용
@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor  // Lombok final 필드 생성자
public class FileController {

    private final S3FileService s3FileService;  // @Autowired 대신 final + 생성자 주입

    // 1. 단일 파일 업로드
    @PostMapping("/upload")
    public ResponseEntity<FileUploadResponse> uploadFile(
        @RequestParam("file") MultipartFile file,
        @RequestParam("type") String type // thumbnail, original, review
    ) {
        // 파일 검증
        // MinIO 업로드
        // URL 생성
        // 응답 반환
    }

    // 2. 다중 파일 업로드 (썸네일 + 원본)
    @PostMapping("/upload/pair")
    public ResponseEntity<ImagePairResponse> uploadImagePair(
        @RequestParam("thumbnail") MultipartFile thumbnail,
        @RequestParam("original") MultipartFile original
    ) {
        // 트랜잭션으로 처리
        // 실패 시 둘 다 롤백
    }

    // 3. 파일 삭제
    @DeleteMapping
    public ResponseEntity<Void> deleteFiles(
        @RequestBody List<String> paths
    ) {
        // 경로 검증
        // MinIO 삭제
        // 에러 처리
    }
}
```

### Step 2: S3FileService 개선 ⏱️ 2-3시간

#### 수정 파일

```java
// backend/src/main/java/com/campstation/camp/shared/file/S3FileService.java
```

#### 구현 내용

```java
// Java 21 Virtual Threads 활용 (Spring Boot 3.5)
@Service
@RequiredArgsConstructor  // Lombok
@Slf4j
public class S3FileService {

    @Value("${cloud.aws.s3.public-endpoint}")
    private String publicEndpoint; // https://mycamp.duckdns.org/storage

    private final S3Client s3Client;  // final 필드 + 생성자 주입

    /**
     * 파일 업로드 (단일 진입점)
     * Java 21 Virtual Threads로 비동기 처리 가능
     */
    public FileUploadResult uploadFile(
        MultipartFile file,
        String folder
    ) throws IOException {
        // 1. 파일 검증 (Java 21 Pattern Matching 활용 가능)
        validateFile(file);

        // 2. 고유 파일명 생성
        String fileName = generateUniqueFileName(file);
        String path = folder + "/" + fileName;

        // 3. MinIO 업로드
        uploadToS3(path, file);

        // 4. Public URL 생성
        String publicUrl = generatePublicUrl(path);

        return new FileUploadResult(path, publicUrl);
    }

    /**
     * Public URL 생성 (통일된 방식)
     */
    private String generatePublicUrl(String path) {
        // https://mycamp.duckdns.org/storage + /campgrounds/thumbnail/xxx.jpg
        return publicEndpoint + path;
    }

    /**
     * 파일 삭제 (개선된 에러 처리)
     */
    public void deleteFile(String path) throws IOException {
        try {
            // 경로 정규화
            String normalizedPath = normalizePath(path);

            // MinIO 삭제
            DeleteObjectRequest request = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(normalizedPath)
                .build();

            s3Client.deleteObject(request);
            log.info("File deleted successfully: {}", normalizedPath);

        } catch (S3Exception e) {
            log.error("Failed to delete file: {}", path, e);
            throw new IOException("파일 삭제 실패: " + e.getMessage(), e);
        }
    }

    /**
     * 경로 정규화 (통일된 형식)
     */
    private String normalizePath(String path) {
        if (path == null || path.isBlank()) {
            throw new IllegalArgumentException("Invalid path");
        }

        // URL에서 경로 추출
        if (path.startsWith("http://") || path.startsWith("https://")) {
            path = extractPathFromUrl(path);
        }

        // /storage prefix 제거
        if (path.startsWith("/storage/")) {
            path = path.substring("/storage/".length());
        } else if (path.startsWith("storage/")) {
            path = path.substring("storage/".length());
        }

        // 앞의 / 제거
        if (path.startsWith("/")) {
            path = path.substring(1);
        }

        return path;
    }

    /**
     * 이미지 쌍 업로드 (트랜잭션)
     */
    @Transactional
    public ImagePairResult uploadImagePair(
        MultipartFile thumbnail,
        MultipartFile original
    ) throws IOException {
        try {
            // 썸네일 업로드
            FileUploadResult thumbResult = uploadFile(
                thumbnail,
                "campgrounds/thumbnail"
            );

            // 원본 업로드
            FileUploadResult origResult = uploadFile(
                original,
                "campgrounds/original"
            );

            return new ImagePairResult(thumbResult, origResult);

        } catch (Exception e) {
            // 실패 시 업로드된 파일 정리
            rollbackUploads(thumbResult, origResult);
            throw e;
        }
    }
}
```

### Step 3: 프론트엔드 useImageUpload 수정 ⏱️ 1-2시간

#### 수정 파일

```typescript
// frontend/src/hooks/useImageUpload.ts
```

#### 구현 내용

```typescript
// 최신 React 19 + Next.js 16 기법 사용
"use client"; // Client Component

import { useActionState, useOptimistic } from "react"; // React 19 hooks

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 단일 파일 업로드
   */
  const uploadFile = async (
    file: File,
    type: "thumbnail" | "original" | "review"
  ): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const response = await fetch("/api/v1/files/upload", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("파일 업로드 실패");
    }

    const result = await response.json();
    return result.publicUrl; // https://mycamp.duckdns.org/storage/...
  };

  /**
   * 이미지 쌍 업로드 (썸네일 + 원본)
   */
  const uploadImagePair = async (
    thumbnailFile: File,
    originalFile: File
  ): Promise<{ thumbnailUrl: string; originalUrl: string }> => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("thumbnail", thumbnailFile);
      formData.append("original", originalFile);

      const response = await fetch("/api/v1/files/upload/pair", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("이미지 업로드 실패");
      }

      const result = await response.json();
      return {
        thumbnailUrl: result.thumbnailUrl,
        originalUrl: result.originalUrl,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드 실패");
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * 파일 삭제
   */
  const deleteFiles = async (paths: string[]): Promise<void> => {
    const response = await fetch("/api/v1/files", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paths),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("파일 삭제 실패");
    }
  };

  return {
    uploadFile,
    uploadImagePair,
    deleteFiles,
    isUploading,
    error,
  };
}
```

### Step 4: CampgroundEditClient 수정 ⏱️ 1시간

#### 수정 파일

```typescript
// frontend/src/app/campgrounds/[id]/edit/CampgroundEditClient.tsx
```

#### 변경 사항

```typescript
// React 19의 useOptimistic 활용 (낙관적 UI 업데이트)
const { uploadImagePair, deleteFiles } = useImageUpload();
const [optimisticImages, addOptimisticImage] = useOptimistic(
  existingImages,
  (state, newImage) => [...state, newImage]
);

// 기존 복잡한 로직 제거
// - extractFilePath 제거
// - Presigned URL 로직 제거
// - URL 변환 로직 제거

const onSave = async () => {
  // 1. 새 이미지 업로드
  for (const newImage of newImages) {
    const result = await uploadImagePair(
      newImage.thumbnailFile,
      newImage.originalFile
    );

    uploadedImages.push({
      thumbnailUrl: result.thumbnailUrl,
      originalUrl: result.originalUrl,
    });
  }

  // 2. 삭제할 이미지 처리
  if (imagesToDelete.length > 0) {
    await deleteFiles(imagesToDelete);
  }

  // 3. 캠핑장 업데이트
  await updateCampground({
    ...campgroundData,
    images: [...existingImages, ...uploadedImages],
  });
};
```

### Step 5: urlUtils.ts 단순화 또는 제거 ⏱️ 30분

#### 옵션 1: 완전 제거

```typescript
// urlUtils.ts 삭제
// 모든 URL은 백엔드에서 받은 그대로 사용
```

#### 옵션 2: 최소화

```typescript
/**
 * 백엔드 API에서 받은 URL을 그대로 사용하는 유틸
 */
export function isValidImageUrl(url: string): boolean {
  return url.startsWith("https://") && url.includes("/storage/");
}
```

### Step 6: Nginx 설정 최적화 ⏱️ 30분

#### 수정 파일

```nginx
# nginx-self-hosting.conf
```

#### 변경 사항

```nginx
# MinIO 스토리지 (Public 접근)
location /storage/ {
    # campstation 버킷 제거 (백엔드에서 이미 포함)
    proxy_pass http://minio:9000/campstation/;

    # HTTP 프로토콜 명시
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # 캐싱 설정 (이미지 최적화)
    proxy_cache_valid 200 30d;
    proxy_cache_valid 404 1m;
    add_header X-Cache-Status $upstream_cache_status;
    add_header Cache-Control "public, max-age=2592000, immutable";

    # CORS 허용
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, HEAD, OPTIONS' always;

    # 보안 헤더
    add_header X-Content-Type-Options "nosniff" always;
}
```

### Step 7: 테스트 ⏱️ 2-3시간

#### 테스트 시나리오

1. **업로드 테스트**

   ```
   ✅ 단일 이미지 업로드
   ✅ 이미지 쌍 업로드 (썸네일 + 원본)
   ✅ 대용량 파일 (50MB) 업로드
   ✅ 잘못된 파일 형식 거부
   ✅ 동시 여러 파일 업로드
   ```

2. **조회 테스트**

   ```
   ✅ 업로드한 이미지 표시
   ✅ 썸네일/원본 이미지 전환
   ✅ 캐싱 동작 확인
   ✅ 404 에러 처리
   ```

3. **삭제 테스트**

   ```
   ✅ 단일 이미지 삭제
   ✅ 이미지 쌍 삭제
   ✅ 존재하지 않는 파일 삭제 시도
   ✅ 권한 없는 삭제 시도
   ```

4. **수정 테스트**
   ```
   ✅ 이미지 추가
   ✅ 이미지 삭제
   ✅ 이미지 교체
   ✅ 트랜잭션 롤백 (일부 실패 시)
   ```

---

## 5. 테스트 계획

### 5.1 단위 테스트

#### 백엔드

```java
// S3FileServiceTest.java
@Test
void testUploadFile() {
    MultipartFile file = createMockFile();
    FileUploadResult result = s3FileService.uploadFile(file, "test");

    assertNotNull(result.getPath());
    assertTrue(result.getPublicUrl().startsWith("https://"));
}

@Test
void testDeleteFile() {
    String path = "/campgrounds/thumbnail/test.jpg";
    assertDoesNotThrow(() -> s3FileService.deleteFile(path));
}

@Test
void testNormalizePath() {
    String url = "https://domain.com/storage/campgrounds/test.jpg?X-Amz=...";
    String normalized = s3FileService.normalizePath(url);

    assertEquals("campgrounds/test.jpg", normalized);
}
```

#### 프론트엔드

```typescript
// useImageUpload.test.ts
describe("useImageUpload", () => {
  it("should upload image successfully", async () => {
    const { uploadFile } = useImageUpload();
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

    const url = await uploadFile(file, "thumbnail");

    expect(url).toMatch(/^https:\/\/.+\/storage\/.+/);
  });

  it("should delete files successfully", async () => {
    const { deleteFiles } = useImageUpload();
    const paths = ["/campgrounds/thumbnail/test.jpg"];

    await expect(deleteFiles(paths)).resolves.not.toThrow();
  });
});
```

### 5.2 통합 테스트

```typescript
// E2E Test (Playwright or Cypress)
test("캠핑장 이미지 업로드 및 삭제", async ({ page }) => {
  // 1. 캠핑장 생성 페이지 접속
  await page.goto("/campgrounds/new");

  // 2. 이미지 업로드
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles("test-image.jpg");

  // 3. 업로드 완료 확인
  await page.waitForSelector('img[src*="/storage/"]');

  // 4. 저장
  await page.click('button:has-text("저장")');

  // 5. 상세 페이지에서 이미지 확인
  await expect(page.locator('img[src*="/storage/"]')).toBeVisible();

  // 6. 수정 페이지 접속
  await page.click('button:has-text("수정")');

  // 7. 이미지 삭제
  await page.click('button[aria-label="이미지 삭제"]');

  // 8. 저장
  await page.click('button:has-text("저장")');

  // 9. 이미지 제거 확인
  await expect(page.locator('img[src*="/storage/"]')).not.toBeVisible();
});
```

---

## 6. 롤백 계획

### 6.1 롤백 트리거

다음 상황 발생 시 즉시 롤백:

- ✅ 업로드 성공률 < 95%
- ✅ 삭제 실패율 > 5%
- ✅ 응답 시간 > 3초
- ✅ 500 에러 > 10건/시간

### 6.2 롤백 절차

```bash
# 1. 이전 커밋으로 복원
git revert HEAD~5..HEAD

# 2. Docker 재배포
docker-compose down
docker-compose up -d --build

# 3. Nginx 설정 복원
cp nginx.conf.backup /etc/nginx/sites-available/campstation
systemctl restart nginx

# 4. 데이터베이스 복원 (필요 시)
psql -U campstation < backup_before_migration.sql
```

### 6.3 모니터링

```bash
# 업로드 성공률 모니터링
tail -f /var/log/nginx/access.log | grep "POST /api/v1/files"

# 에러 로그 확인
docker-compose logs -f backend | grep ERROR

# MinIO 연결 상태
curl -I http://localhost:9000/minio/health/live
```

---

## 7. 예상 소요 시간

| Phase    | 작업                           | 예상 시간    |
| -------- | ------------------------------ | ------------ |
| 1        | 백엔드 FileController 생성     | 1-2시간      |
| 1        | S3FileService 개선             | 2-3시간      |
| 2        | 프론트엔드 useImageUpload 수정 | 1-2시간      |
| 2        | CampgroundEditClient 수정      | 1시간        |
| 2        | urlUtils.ts 단순화             | 30분         |
| 3        | Nginx 설정 최적화              | 30분         |
| -        | 테스트 및 디버깅               | 2-3시간      |
| -        | 문서화                         | 1시간        |
| **총계** |                                | **9-13시간** |

---

## 8. 체크리스트

### Phase 1: 백엔드

- [ ] FileController.java 생성
- [ ] uploadFile() 구현
- [ ] uploadImagePair() 구현
- [ ] deleteFiles() 구현
- [ ] S3FileService.normalizePath() 구현
- [ ] S3FileService.generatePublicUrl() 구현
- [ ] 단위 테스트 작성
- [ ] API 문서 업데이트 (Swagger)

### Phase 2: 프론트엔드

- [ ] useImageUpload.ts 수정
- [ ] uploadFile() 구현
- [ ] uploadImagePair() 구현
- [ ] deleteFiles() 구현
- [ ] CampgroundEditClient.tsx 수정
- [ ] ReviewModal.tsx 수정 (선택)
- [ ] urlUtils.ts 단순화 또는 제거
- [ ] 타입 정의 업데이트

### Phase 3: 인프라

- [ ] nginx-self-hosting.conf 수정
- [ ] S3Config.java HTTP 설정 확인
- [ ] docker-compose.yml 환경 변수 확인
- [ ] MinIO 버킷 권한 설정

### Phase 4: 테스트

- [ ] 업로드 기능 테스트
- [ ] 조회 기능 테스트
- [ ] 삭제 기능 테스트
- [ ] 수정 기능 테스트
- [ ] E2E 테스트 작성
- [ ] 성능 테스트 (부하 테스트)

### Phase 5: 배포

- [ ] 개발 환경 테스트
- [ ] 스테이징 환경 테스트
- [ ] 프로덕션 배포
- [ ] 모니터링 설정
- [ ] 롤백 계획 준비

---

## 9. 다음 단계

이 문서를 따라 작업을 진행하세요:

1. **먼저 읽기**: 전체 문서를 읽고 이해
2. **계획 확인**: 팀과 계획 검토 및 승인
3. **브랜치 생성**: `git checkout -b feature/storage-integration`
4. **Phase 1 시작**: 백엔드 작업부터 시작
5. **테스트**: 각 단계마다 테스트
6. **코드 리뷰**: PR 생성 및 리뷰
7. **배포**: 단계별로 신중하게 배포

---

## 10. 참고 자료

- [AWS S3 Best Practices](https://docs.aws.amazon.com/s3/index.html)
- [MinIO Documentation](https://min.io/docs/)
- [Nginx Proxy Configuration](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
- [Spring MultipartFile](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/multipart/MultipartFile.html)

---

**작성일**: 2025-11-07  
**작성자**: GitHub Copilot  
**버전**: 1.0
