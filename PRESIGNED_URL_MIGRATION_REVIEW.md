# Presigned URL → Single Entry Point 마이그레이션 검토 보고서

## 📋 개요
`STORAGE_INTEGRATION_PLAN.md`와 `PRESIGNED_URL_REMOVAL_PLAN.md` 문서를 검토한 결과, 전반적으로 잘 작성되었으나 몇 가지 보완이 필요한 부분을 발견했습니다.

---

## ✅ 잘 작성된 부분

### 1. 명확한 문제 정의
- Presigned URL 방식의 문제점을 구체적으로 분석
- URL 형식 불일치, CORS 문제, 트랜잭션 부재 등 핵심 이슈 파악
- 4가지 URL 형식 혼재 문제를 명확히 문서화

### 2. 체계적인 단계별 계획
- 7단계로 나눈 단계적 제거 계획
- 각 Step별 작업 내용과 검증 방법 명시
- 롤백 계획 포함

### 3. 최신 기술 스택 활용
- Spring Boot 3.5 + Java 21 (Virtual Threads, Record Patterns)
- React 19 (useOptimistic, useActionState)
- Next.js 16 (Server Actions, Server Components)
- 최신 베스트 프랙티스 반영

### 4. 구체적인 코드 예시
- 백엔드 FileController, S3FileService 구현 예시
- 프론트엔드 useImageUpload Hook 예시
- Nginx 설정 예시

---

## ⚠️ 부족한 부분 및 개선 제안

### 1. 보안 관련 고려사항 부족

#### 문제점
현재 문서에는 보안 검증 로직이 명시되어 있지 않습니다.

#### 추가 필요 사항

**파일 업로드 보안 검증**
```java
@Service
public class FileValidationService {

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final List<String> ALLOWED_TYPES = List.of("image/jpeg", "image/png", "image/webp");

    // 1. 파일 타입 검증 (Magic Bytes 확인)
    public void validateFileType(MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        byte[] fileBytes = file.getBytes();

        // Magic Bytes로 실제 파일 타입 검증
        String actualType = detectFileType(fileBytes);

        if (!ALLOWED_TYPES.contains(actualType)) {
            throw new InvalidFileTypeException("허용되지 않는 파일 형식");
        }
    }

    // 2. 파일 크기 제한
    public void validateFileSize(MultipartFile file) {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new FileSizeExceededException("파일 크기 제한 초과: " + file.getSize());
        }
    }

    // 3. 파일명 검증 (경로 순회 공격 방지)
    public void validateFileName(String fileName) {
        if (fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) {
            throw new InvalidFileNameException("잘못된 파일명");
        }
    }

    // 4. Magic Bytes 검증
    private String detectFileType(byte[] bytes) {
        if (bytes.length < 4) return "unknown";

        // JPEG
        if (bytes[0] == (byte)0xFF && bytes[1] == (byte)0xD8) {
            return "image/jpeg";
        }
        // PNG
        if (bytes[0] == (byte)0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47) {
            return "image/png";
        }
        // WebP
        if (bytes[8] == 0x57 && bytes[9] == 0x45 && bytes[10] == 0x42 && bytes[11] == 0x50) {
            return "image/webp";
        }

        return "unknown";
    }
}
```

**사용자 권한 검증**
```java
@PostMapping("/upload")
@PreAuthorize("hasRole('USER')")  // 인증된 사용자만 업로드 가능
public ResponseEntity<FileUploadResponse> uploadFile(
    @RequestParam("file") MultipartFile file,
    @RequestParam("type") String type,
    @AuthenticationPrincipal UserDetails userDetails
) {
    // 파일 검증
    fileValidationService.validateFileType(file);
    fileValidationService.validateFileSize(file);
    fileValidationService.validateFileName(file.getOriginalFilename());

    // 업로드 처리
    return uploadService.upload(file, type, userDetails);
}
```

**삭제 권한 검증**
```java
@DeleteMapping
@PreAuthorize("hasRole('USER')")
public ResponseEntity<Void> deleteFiles(
    @RequestBody List<String> paths,
    @AuthenticationPrincipal UserDetails userDetails
) {
    // 소유권 검증 - 본인이 업로드한 파일만 삭제 가능
    for (String path : paths) {
        if (!fileOwnershipService.isOwner(path, userDetails.getUsername())) {
            throw new ForbiddenException("파일 삭제 권한 없음");
        }
    }

    fileService.deleteFiles(paths);
    return ResponseEntity.noContent().build();
}
```

---

### 2. Rate Limiting 및 업로드 제한 누락

#### 추가 필요 사항

**Nginx Level Rate Limiting**
```nginx
# nginx-self-hosting.conf에 추가
http {
    # Rate Limiting Zone 정의
    limit_req_zone $binary_remote_addr zone=upload_limit:10m rate=10r/m;

    server {
        # 업로드 API Rate Limiting
        location /api/v1/files/upload {
            limit_req zone=upload_limit burst=5 nodelay;
            limit_req_status 429;
            proxy_pass http://backend:8080;
        }
    }
}
```

**Spring Boot 설정 (application.yml)**
```yaml
spring:
  servlet:
    multipart:
      enabled: true
      max-file-size: 10MB        # 단일 파일 최대 크기
      max-request-size: 50MB     # 전체 요청 최대 크기
      file-size-threshold: 1MB   # 메모리에 저장할 임계값
      location: /tmp/uploads     # 임시 파일 저장 위치
```

---

### 3. 에러 처리 및 복구 전략 부족

#### 추가 필요 사항

**트랜잭션 실패 시 복구 (보상 트랜잭션)**
```java
@Service
@Transactional
public class ImageUploadService {

    private final S3FileService s3FileService;
    private final CampgroundRepository campgroundRepository;

    public ImagePairResult uploadImagePair(
        MultipartFile thumbnail,
        MultipartFile original,
        Long campgroundId
    ) {
        List<String> uploadedPaths = new ArrayList<>();

        try {
            // 1. 썸네일 업로드
            FileUploadResult thumbResult = s3FileService.uploadFile(thumbnail, "campgrounds/thumbnail");
            uploadedPaths.add(thumbResult.getPath());

            // 2. 원본 업로드
            FileUploadResult origResult = s3FileService.uploadFile(original, "campgrounds/original");
            uploadedPaths.add(origResult.getPath());

            // 3. DB 저장
            Campground campground = campgroundRepository.findById(campgroundId)
                .orElseThrow(() -> new EntityNotFoundException("캠핑장 없음"));

            campground.addImages(thumbResult.getPath(), origResult.getPath());
            campgroundRepository.save(campground);

            return new ImagePairResult(thumbResult, origResult);

        } catch (Exception e) {
            // 실패 시 업로드된 파일 삭제 (보상 트랜잭션)
            cleanupUploadedFiles(uploadedPaths);
            throw new ImageUploadException("이미지 업로드 실패", e);
        }
    }

    private void cleanupUploadedFiles(List<String> paths) {
        for (String path : paths) {
            try {
                s3FileService.deleteFile(path);
                log.info("Cleaned up file: {}", path);
            } catch (Exception e) {
                log.error("Failed to cleanup file: {}", path, e);
            }
        }
    }
}
```

**프론트엔드 재시도 로직 (Exponential Backoff)**
```typescript
// useImageUpload.ts
export function useImageUpload() {
  const uploadFileWithRetry = async (
    file: File,
    type: string,
    maxRetries = 3
  ): Promise<string> => {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);

        const response = await fetch("/api/v1/files/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status}`);
        }

        const result = await response.json();
        return result.publicUrl;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error");

        if (attempt < maxRetries) {
          // 지수 백오프 (1초, 2초, 4초)
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          console.warn(`Retry ${attempt}/${maxRetries} after ${delay}ms`);
        }
      }
    }

    throw new Error(`Upload failed after ${maxRetries} attempts: ${lastError?.message}`);
  };

  return { uploadFileWithRetry };
}
```

---

### 4. 데이터 마이그레이션 스크립트 부족

#### 추가 필요 사항

**기존 Presigned URL → Public URL 변환 SQL**
```sql
-- 1. campgrounds 테이블의 이미지 URL 정규화
UPDATE campgrounds
SET
    thumbnail_url = REGEXP_REPLACE(
        thumbnail_url,
        'http://minio:9000/campstation/(.*)\?.*',
        '/\1'
    ),
    image_url = REGEXP_REPLACE(
        image_url,
        'http://minio:9000/campstation/(.*)\?.*',
        '/\1'
    )
WHERE
    thumbnail_url LIKE '%?X-Amz-%' OR
    image_url LIKE '%?X-Amz-%';

-- 2. reviews 테이블의 이미지 URL 정규화
UPDATE reviews
SET
    image_urls = ARRAY(
        SELECT REGEXP_REPLACE(url, 'http://minio:9000/campstation/(.*)\?.*', '/\1')
        FROM unnest(image_urls) AS url
    )
WHERE
    EXISTS (
        SELECT 1 FROM unnest(image_urls) AS url
        WHERE url LIKE '%?X-Amz-%'
    );

-- 3. users 테이블의 프로필 이미지 URL 정규화
UPDATE users
SET
    profile_image_url = REGEXP_REPLACE(
        profile_image_url,
        'http://minio:9000/campstation/(.*)\?.*',
        '/\1'
    )
WHERE
    profile_image_url LIKE '%?X-Amz-%';

-- 4. 변환 결과 검증
SELECT
    'campgrounds' AS table_name,
    COUNT(*) AS remaining_presigned_urls
FROM campgrounds
WHERE thumbnail_url LIKE '%?X-Amz-%' OR image_url LIKE '%?X-Amz-%'
UNION ALL
SELECT 'reviews', COUNT(*)
FROM reviews
WHERE EXISTS (SELECT 1 FROM unnest(image_urls) AS url WHERE url LIKE '%?X-Amz-%')
UNION ALL
SELECT 'users', COUNT(*)
FROM users
WHERE profile_image_url LIKE '%?X-Amz-%';
```

---

### 5. 성능 최적화 전략 부족

#### 추가 필요 사항

**썸네일 자동 생성 (이미지 최적화)**
```java
@Service
public class ImageOptimizationService {

    /**
     * 원본 이미지를 업로드하면 자동으로 썸네일 생성
     */
    public ImagePairResult uploadAndOptimize(MultipartFile originalFile) throws IOException {
        // 1. 원본 업로드
        FileUploadResult originalResult = s3FileService.uploadFile(
            originalFile,
            "campgrounds/original"
        );

        // 2. 썸네일 생성
        MultipartFile thumbnailFile = createThumbnail(originalFile, 400, 300);

        // 3. 썸네일 업로드
        FileUploadResult thumbnailResult = s3FileService.uploadFile(
            thumbnailFile,
            "campgrounds/thumbnail"
        );

        return new ImagePairResult(thumbnailResult, originalResult);
    }

    private MultipartFile createThumbnail(MultipartFile original, int width, int height)
        throws IOException {
        BufferedImage img = ImageIO.read(original.getInputStream());

        // Aspect ratio 유지하면서 리사이징
        int targetWidth = width;
        int targetHeight = height;
        double aspectRatio = (double) img.getWidth() / img.getHeight();

        if (aspectRatio > 1) {
            targetHeight = (int) (width / aspectRatio);
        } else {
            targetWidth = (int) (height * aspectRatio);
        }

        BufferedImage thumbnail = new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = thumbnail.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.drawImage(img, 0, 0, targetWidth, targetHeight, null);
        g.dispose();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(thumbnail, "jpg", baos);

        return new MockMultipartFile(
            "thumbnail",
            "thumbnail.jpg",
            "image/jpeg",
            baos.toByteArray()
        );
    }
}
```

**Nginx 캐싱 최적화**
```nginx
# nginx-self-hosting.conf
http {
    # 이미지 캐시 Zone 정의
    proxy_cache_path /var/cache/nginx/images
                     levels=1:2
                     keys_zone=image_cache:100m
                     max_size=10g
                     inactive=30d
                     use_temp_path=off;

    server {
        location /storage/ {
            proxy_pass http://minio:9000/campstation/;

            # 캐싱 설정
            proxy_cache image_cache;
            proxy_cache_valid 200 30d;
            proxy_cache_valid 404 1m;
            proxy_cache_use_stale error timeout updating;
            proxy_cache_lock on;

            # 캐시 헤더
            add_header X-Cache-Status $upstream_cache_status;
            add_header Cache-Control "public, max-age=2592000, immutable";

            # Gzip 압축
            gzip on;
            gzip_types image/jpeg image/png image/webp;
            gzip_vary on;
        }
    }
}
```

---

### 6. 모니터링 및 로깅 전략 누락

#### 추가 필요 사항

**구조화된 로깅 (Structured Logging)**
```java
@Service
@Slf4j
public class S3FileService {

    private final MeterRegistry meterRegistry;

    public FileUploadResult uploadFile(MultipartFile file, String folder) throws IOException {
        long startTime = System.currentTimeMillis();

        // 구조화된 로그
        log.info("File upload started: fileName={}, size={}, folder={}",
            file.getOriginalFilename(),
            file.getSize(),
            folder
        );

        try {
            FileUploadResult result = performUpload(file, folder);

            long duration = System.currentTimeMillis() - startTime;
            log.info("File upload completed: fileName={}, duration={}ms, path={}",
                file.getOriginalFilename(),
                duration,
                result.getPath()
            );

            // Prometheus 메트릭 수집
            meterRegistry.counter("file.upload.success",
                "folder", folder,
                "fileType", file.getContentType()
            ).increment();

            meterRegistry.timer("file.upload.duration",
                "folder", folder
            ).record(duration, TimeUnit.MILLISECONDS);

            return result;

        } catch (Exception e) {
            log.error("File upload failed: fileName={}, folder={}, error={}",
                file.getOriginalFilename(),
                folder,
                e.getMessage(),
                e
            );

            meterRegistry.counter("file.upload.failure",
                "folder", folder,
                "errorType", e.getClass().getSimpleName()
            ).increment();

            throw e;
        }
    }
}
```

---

### 7. 백업 및 복구 전략 부족

#### 추가 필요 사항

**MinIO 자동 백업 스크립트**
```bash
#!/bin/bash
# backup-minio.sh

MINIO_ALIAS="mycamp"
BACKUP_DIR="/backup/minio/$(date +%Y%m%d)"
S3_BUCKET="campstation"

# MinIO 데이터 백업
mc mirror --preserve "$MINIO_ALIAS/$S3_BUCKET" "$BACKUP_DIR"

# 7일 이상 오래된 백업 삭제
find /backup/minio -type d -mtime +7 -exec rm -rf {} \;

echo "Backup completed: $BACKUP_DIR"
```

**Cron 설정**
```bash
# 매일 새벽 3시 백업 실행
0 3 * * * /scripts/backup-minio.sh >> /var/log/minio-backup.log 2>&1
```

---

### 8. 테스트 커버리지 부족

#### 추가 필요 사항

**통합 테스트 (TestContainers)**
```java
@SpringBootTest
@Testcontainers
class FileUploadIntegrationTest {

    @Container
    static MinIOContainer minioContainer = new MinIOContainer("minio/minio:latest");

    @Autowired
    private S3FileService s3FileService;

    @Test
    void testUploadAndDelete() throws IOException {
        // 1. 파일 업로드
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "test.jpg",
            "image/jpeg",
            "test content".getBytes()
        );

        FileUploadResult result = s3FileService.uploadFile(file, "test");

        // 2. 검증
        assertNotNull(result.getPath());
        assertTrue(result.getPublicUrl().contains("/storage/"));

        // 3. 삭제
        s3FileService.deleteFile(result.getPath());
    }
}
```

---

## 📊 우선순위별 구현 순서 제안

### Phase 1: 핵심 보안 및 검증 (필수)
1. ✅ 파일 타입 검증 (Magic Bytes)
2. ✅ 파일 크기 제한
3. ✅ 사용자 권한 검증
4. ✅ Rate Limiting

### Phase 2: 에러 처리 및 복구 (필수)
5. ✅ 트랜잭션 실패 시 보상 트랜잭션
6. ✅ 프론트엔드 재시도 로직
7. ✅ 구조화된 로깅

### Phase 3: 데이터 마이그레이션 (필수)
8. ✅ Presigned URL → Public URL 변환 스크립트

### Phase 4: 성능 최적화 (권장)
9. ⭐ 썸네일 자동 생성
10. ⭐ CDN 캐싱 최적화
11. ⭐ Nginx 압축

### Phase 5: 운영 안정성 (권장)
12. ⭐ 자동 백업
13. ⭐ 모니터링 및 메트릭

### Phase 6: 품질 보증 (선택)
14. ⚡ 통합 테스트 (TestContainers)
15. ⚡ E2E 테스트

---

## 🎯 결론

### 문서의 강점
1. ✅ 명확한 문제 정의 및 해결 방향
2. ✅ 단계별 구현 계획
3. ✅ 최신 기술 스택 활용
4. ✅ 구체적인 코드 예시

### 보완 필요 사항
1. ⚠️ **보안 검증 로직 추가 (필수)**
2. ⚠️ **Rate Limiting 추가 (필수)**
3. ⚠️ **에러 처리 및 복구 전략 (필수)**
4. ⚠️ **데이터 마이그레이션 스크립트 (필수)**
5. ⭐ 성능 최적화 전략 (권장)
6. ⭐ 모니터링 및 로깅 (권장)
7. ⭐ 백업 및 복구 전략 (권장)
8. ⚡ 테스트 커버리지 강화 (선택)

### 권장 사항
기존 문서에 이 보고서의 **Phase 1, 2, 3 (필수)** 항목을 추가하여 보안과 안정성을 강화한 후 마이그레이션을 진행하는 것을 권장합니다.

---

**작성일**: 2025-11-07
**검토자**: Claude Code
**문서 버전**: 1.0
