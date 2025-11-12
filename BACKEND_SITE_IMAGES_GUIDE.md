# 사이트(Site) 이미지 업로드 기능 - 백엔드 구현 가이드

## 개요

캠핑장 사이트(구역)에 이미지를 업로드할 수 있도록 프론트엔드가 준비되었습니다.
백엔드에서 다음과 같은 구현이 필요합니다.

## 데이터베이스 변경사항

### 1. site_images 테이블 생성

```sql
CREATE TABLE site_images (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    site_id BIGINT NOT NULL,
    original_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    INDEX idx_site_id (site_id),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2. Site 엔티티 수정

```java
@Entity
@Table(name = "sites")
public class Site {
    // 기존 필드들...

    @OneToMany(mappedBy = "site", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<SiteImage> images = new ArrayList<>();

    // Getter/Setter
    public List<String> getThumbnailUrls() {
        return images.stream()
            .map(SiteImage::getThumbnailUrl)
            .collect(Collectors.toList());
    }

    public List<String> getOriginalImageUrls() {
        return images.stream()
            .map(SiteImage::getOriginalUrl)
            .collect(Collectors.toList());
    }
}
```

### 3. SiteImage 엔티티 생성

```java
@Entity
@Table(name = "site_images")
@Getter
@Setter
@NoArgsConstructor
public class SiteImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;

    @Column(name = "original_url", nullable = false, length = 500)
    private String originalUrl;

    @Column(name = "thumbnail_url", nullable = false, length = 500)
    private String thumbnailUrl;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
```

## API 엔드포인트 수정

### 1. POST /api/v1/sites (사이트 생성)

**Request (FormData):**

```
campgroundId: 1
siteNumber: "A-01"
siteType: "CARAVAN"
capacity: 4
description: "넓은 카라반 구역"
basePrice: 50000
status: "AVAILABLE"
amenities: ["ELECTRICITY", "WATER", "WIFI"]
latitude: 37.5665
longitude: 126.9780
imageFiles: [File, File, File]  // 최대 5개
```

**Controller:**

```java
@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<SiteResponse> createSite(
    @ModelAttribute SiteCreateRequest request,
    @RequestPart(value = "imageFiles", required = false) List<MultipartFile> imageFiles
) {
    Site site = siteService.createSite(request, imageFiles);
    return ResponseEntity.ok(SiteResponse.from(site));
}
```

### 2. PUT /api/v1/sites/{siteId} (사이트 수정)

**Request (FormData):**

```
siteNumber: "A-01"
siteType: "GLAMP"
capacity: 2
description: "업그레이드된 글램핑"
basePrice: 80000
status: "AVAILABLE"
amenities: ["ELECTRICITY", "WATER", "WIFI", "HEATING"]
imageFiles: [File, File]  // 새로 추가할 이미지
```

**Controller:**

```java
@PutMapping(value = "/{siteId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<SiteResponse> updateSite(
    @PathVariable Long siteId,
    @ModelAttribute SiteUpdateRequest request,
    @RequestPart(value = "imageFiles", required = false) List<MultipartFile> imageFiles
) {
    Site site = siteService.updateSite(siteId, request, imageFiles);
    return ResponseEntity.ok(SiteResponse.from(site));
}
```

## 서비스 로직

### SiteService 구현

```java
@Service
@Transactional
public class SiteService {

    @Autowired
    private S3FileService s3FileService;

    @Autowired
    private SiteRepository siteRepository;

    public Site createSite(SiteCreateRequest request, List<MultipartFile> imageFiles) {
        // 1. Site 엔티티 생성
        Site site = Site.builder()
            .campground(campgroundRepository.findById(request.getCampgroundId())
                .orElseThrow(() -> new NotFoundException("캠핑장을 찾을 수 없습니다")))
            .siteNumber(request.getSiteNumber())
            .siteType(request.getSiteType())
            .capacity(request.getCapacity())
            .description(request.getDescription())
            .basePrice(request.getBasePrice())
            .status(request.getStatus())
            .amenities(request.getAmenities())
            .latitude(request.getLatitude())
            .longitude(request.getLongitude())
            .build();

        // 2. 이미지 업로드 및 저장
        if (imageFiles != null && !imageFiles.isEmpty()) {
            uploadSiteImages(site, imageFiles);
        }

        return siteRepository.save(site);
    }

    public Site updateSite(Long siteId, SiteUpdateRequest request, List<MultipartFile> imageFiles) {
        Site site = siteRepository.findById(siteId)
            .orElseThrow(() -> new NotFoundException("사이트를 찾을 수 없습니다"));

        // 1. 기본 정보 업데이트
        if (request.getSiteNumber() != null) {
            site.setSiteNumber(request.getSiteNumber());
        }
        // ... 다른 필드들

        // 2. 새 이미지 추가
        if (imageFiles != null && !imageFiles.isEmpty()) {
            uploadSiteImages(site, imageFiles);
        }

        return siteRepository.save(site);
    }

    private void uploadSiteImages(Site site, List<MultipartFile> imageFiles) {
        int displayOrder = site.getImages().size();

        for (MultipartFile file : imageFiles) {
            try {
                // S3에 원본 이미지 업로드
                String originalUrl = s3FileService.uploadFile(file, "sites");

                // 썸네일 생성 및 업로드
                String thumbnailUrl = s3FileService.uploadThumbnail(file, "sites");

                // SiteImage 엔티티 생성
                SiteImage siteImage = SiteImage.builder()
                    .site(site)
                    .originalUrl(originalUrl)
                    .thumbnailUrl(thumbnailUrl)
                    .fileName(file.getOriginalFilename())
                    .fileSize(file.getSize())
                    .contentType(file.getContentType())
                    .displayOrder(displayOrder++)
                    .build();

                site.getImages().add(siteImage);
            } catch (IOException e) {
                throw new RuntimeException("이미지 업로드 실패: " + e.getMessage());
            }
        }
    }
}
```

## DTO 수정

### SiteResponse

```java
@Getter
@Builder
public class SiteResponse {
    private Long id;
    private String siteNumber;
    private String siteType;
    private Integer capacity;
    private String description;
    private List<String> amenities;
    private BigDecimal basePrice;
    private Double latitude;
    private Double longitude;
    private String status;
    private Long campgroundId;
    private List<String> thumbnailUrls;      // 추가
    private List<String> originalImageUrls;  // 추가

    public static SiteResponse from(Site site) {
        return SiteResponse.builder()
            .id(site.getId())
            .siteNumber(site.getSiteNumber())
            .siteType(site.getSiteType().name())
            .capacity(site.getCapacity())
            .description(site.getDescription())
            .amenities(site.getAmenities().stream()
                .map(Enum::name)
                .collect(Collectors.toList()))
            .basePrice(site.getBasePrice())
            .latitude(site.getLatitude())
            .longitude(site.getLongitude())
            .status(site.getStatus().name())
            .campgroundId(site.getCampground().getId())
            .thumbnailUrls(site.getThumbnailUrls())          // 추가
            .originalImageUrls(site.getOriginalImageUrls())  // 추가
            .build();
    }
}
```

## S3FileService 활용

기존 `S3FileService`의 `uploadFile()` 및 `uploadThumbnail()` 메서드를 재사용합니다.

```java
// 원본 이미지 업로드
String originalUrl = s3FileService.uploadFile(file, "sites");

// 썸네일 생성 및 업로드 (800x600)
String thumbnailUrl = s3FileService.uploadThumbnail(file, "sites");
```

## 프론트엔드 이미지 최적화

프론트엔드에서 이미 다음과 같이 최적화된 이미지를 전송합니다:

- **형식**: JPEG (Java ImageIO 호환)
- **최대 크기**: 1920x1080
- **품질**: 85%
- **목표 파일 크기**: 500KB
- **최대 개수**: 5개 (사이트당)

따라서 백엔드에서는 추가 최적화 없이 받은 이미지를 그대로 S3에 업로드하고 썸네일만 생성하면 됩니다.

## 구현 순서

1. ✅ site_images 테이블 생성
2. ✅ SiteImage 엔티티 생성
3. ✅ Site 엔티티에 images 관계 추가
4. ✅ SiteController 수정 (FormData 지원)
5. ✅ SiteService에 이미지 업로드 로직 추가
6. ✅ SiteResponse에 이미지 URL 필드 추가
7. ✅ 테스트 및 검증

## 참고사항

- 캠핑장 이미지 업로드와 동일한 패턴 사용
- 기존 S3FileService 재사용
- 이미지는 선택사항 (imageFiles가 null일 수 있음)
- 수정 시 기존 이미지는 유지하고 새 이미지만 추가
- 이미지 삭제 기능은 추후 추가 가능
