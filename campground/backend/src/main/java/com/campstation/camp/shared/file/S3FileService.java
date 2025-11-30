package com.campstation.camp.shared.file;

import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.UUID;

import javax.imageio.ImageIO;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

/**
 * AWS S3 파일 업로드 서비스
 * MinIO와 호환되는 S3 API를 사용합니다.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class S3FileService {

    private final S3Client s3Client;

    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;

    @Value("${cloud.aws.s3.external-endpoint}")
    private String externalEndpoint;

    @Value("${cloud.aws.s3.public-endpoint}")
    private String publicEndpoint;

    @Value("${cloud.aws.credentials.access-key}")
    private String accessKey;

    @Value("${cloud.aws.credentials.secret-key}")
    private String secretKey;

    /**
     * 파일 확장자 추출
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf('.') == -1) {
            return ".jpg"; // 기본 확장자
        }
        return filename.substring(filename.lastIndexOf('.')).toLowerCase();
    }

    /**
     * UUID 기반 고유 파일명을 생성합니다.
     */
    private String generateUniqueFilename(String originalFilename) {
        var extension = getFileExtension(originalFilename);
        return UUID.randomUUID() + extension;
    }

    /**
     * S3에서 파일을 다운로드합니다.
     *
     * @param filename 다운로드할 파일명
     * @return 파일 데이터와 콘텐츠 타입
     * @throws IOException 다운로드 실패 시
     */
    public FileData downloadFile(String filename) throws IOException {
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(filename)
                    .build();

            ResponseInputStream<GetObjectResponse> s3Object = s3Client.getObject(getObjectRequest);
            byte[] fileContent = s3Object.readAllBytes();
            String contentType = s3Object.response().contentType();

            log.info("File downloaded from S3: {}", filename);
            return new FileData(fileContent, contentType);

        } catch (S3Exception e) {
            log.error("S3 download failed: {}", e.getMessage(), e);
            throw new IOException("파일 다운로드 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    /**
     * S3에서 파일을 삭제합니다.
     *
     * @param filePath 삭제할 파일 경로 (예: "campgrounds/thumbnail/uuid.jpg")
     * @throws IOException 삭제 실패 시
     */
    public void deleteFile(String filePath) throws IOException {
        if (filePath == null || filePath.isBlank()) {
            log.warn("Invalid file path provided for deletion: {}", filePath);
            return;
        }

        try {
            // 경로 정규화 적용 - 모든 형식 처리
            String normalizedKey = normalizePath(filePath);

            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(normalizedKey)
                    .build();

            s3Client.deleteObject(deleteRequest);
            log.info("File deleted from S3 successfully: {}", normalizedKey);

        } catch (IllegalArgumentException e) {
            log.error("Invalid file path for deletion: {}", filePath, e);
            throw new IOException("잘못된 파일 경로: " + e.getMessage(), e);
        } catch (S3Exception e) {
            log.error("S3 delete failed for {}: {}", filePath, e.getMessage(), e);
            throw new IOException("파일 삭제 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    /**
     * 이미지 쌍(썸네일 + 원본) 삭제
     * 
     * @param thumbnailPath 썸네일 경로
     * @param originalPath 원본 경로
     */
    public void deleteImagePair(String thumbnailPath, String originalPath) {
        try {
            deleteFile(thumbnailPath);
        } catch (IOException e) {
            log.error("Failed to delete thumbnail: {}", thumbnailPath, e);
        }
        
        try {
            deleteFile(originalPath);
        } catch (IOException e) {
            log.error("Failed to delete original: {}", originalPath, e);
        }
    }

    /**
     * 여러 파일 배치 삭제
     * 
     * @param filePaths 삭제할 파일 경로 목록
     */
    public void deleteFiles(List<String> filePaths) {
        if (filePaths == null || filePaths.isEmpty()) {
            return;
        }

        for (String filePath : filePaths) {
            try {
                deleteFile(filePath);
            } catch (IOException e) {
                log.error("Failed to delete file: {}", filePath, e);
            }
        }
    }

    /**
     * 파일 업로드 (직접 업로드 방식)
     * 
     * @param file 업로드할 파일
     * @param folder 저장 폴더 (예: "campgrounds/thumbnail")
     * @return 업로드 결과 (경로, Public URL)
     * @throws IOException 업로드 실패 시
     */
    public FileUploadResult uploadFile(MultipartFile file, String folder) throws IOException {
        // 1. 파일 검증
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is null or empty");
        }
        
        // 2. 파일 크기 검증 (50MB)
        long maxSize = 50 * 1024 * 1024; // 50MB
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("File size exceeds maximum allowed size (50MB)");
        }
        
        // 3. 콘텐츠 타입 검증
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }
        
        // 4. 고유 파일명 생성
        String originalFilename = file.getOriginalFilename();
        String uniqueFilename = generateUniqueFilename(originalFilename);
        String filePath = folder + "/" + uniqueFilename;
        
        try {
            // 5. MinIO에 업로드
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(filePath)
                    .contentType(contentType)
                    .build();
            
            s3Client.putObject(putRequest, RequestBody.fromBytes(file.getBytes()));
            
            // 6. Public URL 생성
            String publicUrl = generatePublicUrl(filePath);
            
            log.info("File uploaded successfully: {} -> {}", originalFilename, publicUrl);
            
            return new FileUploadResult(filePath, publicUrl);
            
        } catch (S3Exception e) {
            log.error("S3 upload failed for file: {}", originalFilename, e);
            throw new IOException("파일 업로드 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }
    
    /**
     * 썸네일 이미지 생성 (원본 이미지를 리사이징)
     *
     * @param original 원본 이미지 파일
     * @return 썸네일 MultipartFile
     * @throws IOException 썸네일 생성 실패 시
     */
    private MultipartFile createThumbnail(MultipartFile original) throws IOException {
        try {
            // 1. 원본 이미지 읽기
            BufferedImage originalImage = ImageIO.read(new ByteArrayInputStream(original.getBytes()));
            if (originalImage == null) {
                throw new IOException("Failed to read original image");
            }

            // 2. 썸네일 크기 계산 (최대 800x600, 비율 유지)
            int maxWidth = 800;
            int maxHeight = 600;
            int originalWidth = originalImage.getWidth();
            int originalHeight = originalImage.getHeight();

            double widthRatio = (double) maxWidth / originalWidth;
            double heightRatio = (double) maxHeight / originalHeight;
            double ratio = Math.min(widthRatio, heightRatio);

            // 이미 작은 이미지는 리사이징하지 않음
            if (ratio >= 1.0) {
                return original;
            }

            int targetWidth = (int) (originalWidth * ratio);
            int targetHeight = (int) (originalHeight * ratio);

            // 3. 썸네일 이미지 생성
            BufferedImage thumbnailImage = new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_RGB);
            Graphics2D graphics = thumbnailImage.createGraphics();
            graphics.drawImage(originalImage.getScaledInstance(targetWidth, targetHeight, Image.SCALE_SMOOTH), 0, 0, null);
            graphics.dispose();

            // 4. 이미지를 바이트 배열로 변환
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            String formatName = getImageFormatName(original.getOriginalFilename());
            ImageIO.write(thumbnailImage, formatName, outputStream);
            byte[] thumbnailBytes = outputStream.toByteArray();

            // 5. ByteArrayMultipartFile로 변환
            String thumbnailFilename = "thumbnail_" + original.getOriginalFilename();
            return new ByteArrayMultipartFile(
                thumbnailFilename,
                original.getContentType(),
                thumbnailBytes
            );

        } catch (IOException e) {
            log.error("Failed to create thumbnail for: {}", original.getOriginalFilename(), e);
            throw new IOException("썸네일 생성 실패: " + e.getMessage(), e);
        }
    }

    /**
     * 파일 확장자로부터 이미지 포맷 이름 추출
     * WebP는 Java 기본 ImageIO에서 지원하지 않으므로 JPEG로 변환
     */
    private String getImageFormatName(String filename) {
        String extension = getFileExtension(filename).toLowerCase();
        return switch (extension) {
            case ".jpg", ".jpeg" -> "jpg";
            case ".png" -> "png";
            case ".gif" -> "gif";
            case ".webp" -> "jpg";  // WebP는 JPEG로 변환
            default -> "jpg";
        };
    }

    /**
     * 이미지 쌍 업로드 (원본 하나만 받아서 썸네일 자동 생성)
     * 트랜잭션으로 처리하여 둘 다 성공하거나 둘 다 실패하도록 보장
     *
     * @param original 원본 이미지 파일 (썸네일은 자동 생성됨)
     * @param type 파일 타입 (campground, review, profile 등)
     * @return ImagePairResult (경로와 URL)
     * @throws IOException 업로드 실패 시
     */
    @Transactional
    public ImagePairResult uploadImagePair(MultipartFile original, String type) throws IOException {
        // 타입 검증
        if (type == null || type.isBlank()) {
            throw new IllegalArgumentException("Type cannot be null or empty");
        }

        if (original == null || original.isEmpty()) {
            throw new IllegalArgumentException("Original image cannot be null or empty");
        }

        // 복수형 변환 (campground → campgrounds, review → reviews, profile → profiles)
        String pluralType = type.endsWith("s") ? type : type + "s";

        FileUploadResult thumbnailResult = null;
        FileUploadResult originalResult = null;

        try {
            // 1. 원본 업로드
            originalResult = uploadFile(original, pluralType + "/original");
            log.info("[{}] Original uploaded: {}", type, originalResult.path());

            // 2. 썸네일 생성 및 업로드
            MultipartFile thumbnailFile = createThumbnail(original);
            thumbnailResult = uploadFile(thumbnailFile, pluralType + "/thumbnail");
            log.info("[{}] Thumbnail generated and uploaded: {}", type, thumbnailResult.path());

            // 3. 결과 반환
            return new ImagePairResult(
                thumbnailResult.path(),
                thumbnailResult.publicUrl(),
                originalResult.path(),
                originalResult.publicUrl()
            );

        } catch (Exception e) {
            // 실패 시 업로드된 파일 정리
            log.error("[{}] Image pair upload failed, rolling back...", type, e);
            rollbackUploads(thumbnailResult, originalResult);
            throw new IOException("이미지 쌍 업로드 실패: " + e.getMessage(), e);
        }
    }
    
    /**
     * 업로드 롤백 - 실패 시 이미 업로드된 파일 삭제
     * 
     * @param thumbnailResult 썸네일 업로드 결과 (null 가능)
     * @param originalResult 원본 업로드 결과 (null 가능)
     */
    private void rollbackUploads(FileUploadResult thumbnailResult, FileUploadResult originalResult) {
        if (thumbnailResult != null) {
            try {
                deleteFile(thumbnailResult.path());
                log.info("Rolled back thumbnail: {}", thumbnailResult.path());
            } catch (IOException e) {
                log.error("Failed to rollback thumbnail: {}", thumbnailResult.path(), e);
            }
        }
        
        if (originalResult != null) {
            try {
                deleteFile(originalResult.path());
                log.info("Rolled back original: {}", originalResult.path());
            } catch (IOException e) {
                log.error("Failed to rollback original: {}", originalResult.path(), e);
            }
        }
    }
    
    /**
     * 경로 정규화 - 모든 경로 형식을 일관되게 처리
     * URL에서 경로만 추출하거나 이미 경로 형식이면 그대로 반환
     *
     * 예시:
     * - http://localhost:9000/campstation-dev/reviews/thumbnail/xxx.png → reviews/thumbnail/xxx.png
     * - reviews/thumbnail/xxx.png → reviews/thumbnail/xxx.png
     *
     * @param path 원본 경로 (URL 또는 상대 경로)
     * @return 정규화된 경로 (예: "campgrounds/thumbnail/uuid.jpg")
     */
    public String normalizePath(String path) {
        if (path == null || path.isBlank()) {
            throw new IllegalArgumentException("Invalid path: path cannot be null or empty");
        }
        
        String normalized = path;
        
        // 1. URL에서 경로 추출
        if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
            // 쿼리 파라미터 제거
            if (normalized.contains("?")) {
                normalized = normalized.substring(0, normalized.indexOf("?"));
            }
            
            // 도메인 제거
            if (normalized.contains("://")) {
                int pathStart = normalized.indexOf("/", normalized.indexOf("://") + 3);
                if (pathStart != -1) {
                    normalized = normalized.substring(pathStart + 1);
                }
            }
        }
        
        // 2. /storage prefix 제거
        if (normalized.startsWith("/storage/")) {
            normalized = normalized.substring("/storage/".length());
        } else if (normalized.startsWith("storage/")) {
            normalized = normalized.substring("storage/".length());
        }
        
        // 3. 버킷명 제거 (있는 경우)
        if (normalized.startsWith(bucketName + "/")) {
            normalized = normalized.substring((bucketName + "/").length());
        }
        
        // 4. 앞의 / 제거
        while (normalized.startsWith("/")) {
            normalized = normalized.substring(1);
        }
        
        return normalized;
    }
    
    /**
     * Public URL 생성 - 통일된 방식으로 생성
     * 
     * @param path 파일 경로 (예: "campgrounds/thumbnail/uuid.jpg")
     * @return Public URL (예: "https://mycamp.duckdns.org/storage/campgrounds/thumbnail/uuid.jpg")
     */
    public String generatePublicUrl(String path) {
        String normalizedPath = normalizePath(path);
        return publicEndpoint + "/" + normalizedPath;
    }

    /**
     * 파일 데이터와 콘텐츠 타입을 담는 레코드
     */
    public record FileData(byte[] data, String contentType) {
    }
    
    /**
     * 파일 업로드 결과 레코드
     */
    public record FileUploadResult(String path, String publicUrl) {
    }
    
    /**
     * 이미지 쌍 업로드 결과 레코드
     */
    public record ImagePairResult(
        String thumbnailPath,
        String thumbnailUrl,
        String originalPath,
        String originalUrl
    ) {
    }

    /**
     * ByteArray 기반 MultipartFile 구현체
     * 썸네일 생성 시 사용
     */
    private static class ByteArrayMultipartFile implements MultipartFile {
        private final String name;
        private final String contentType;
        private final byte[] content;

        public ByteArrayMultipartFile(String name, String contentType, byte[] content) {
            this.name = name;
            this.contentType = contentType;
            this.content = content;
        }

        @Override
        public @NonNull String getName() {
            return "file";
        }

        @Override
        public String getOriginalFilename() {
            return name;
        }

        @Override
        public String getContentType() {
            return contentType;
        }

        @Override
        public boolean isEmpty() {
            return content == null || content.length == 0;
        }

        @Override
        public long getSize() {
            return content.length;
        }

        @Override
        public byte[] getBytes() throws IOException {
            return content != null ? content : new byte[0];
        }

        @Override
        public InputStream getInputStream() throws IOException {
            return new ByteArrayInputStream(content != null ? content : new byte[0]);
        }

        @Override
        public void transferTo(File dest) throws IOException, IllegalStateException {
            throw new UnsupportedOperationException("transferTo is not supported");
        }
    }
}