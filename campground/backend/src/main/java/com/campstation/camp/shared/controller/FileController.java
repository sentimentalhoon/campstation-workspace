package com.campstation.camp.shared.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.campstation.camp.shared.dto.CommonResponse;
import com.campstation.camp.shared.file.S3FileService;
import com.campstation.camp.shared.security.annotation.Authenticated;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

/**
 * 파일 업로드 관련 API 컨트롤러
 * 
 * - 파일 직접 업로드: 인증된 사용자만 가능
 * - 이미지 쌍 업로드: 원본 + 썸네일 자동 생성 (단일/다중)
 */
@RestController
@RequestMapping("/api/v1/files")
@Slf4j
@Tag(name = "File Upload", description = "파일 업로드 관련 API")
public class FileController {

    private final S3FileService s3FileService;

    public FileController(S3FileService s3FileService) {
        this.s3FileService = s3FileService;
        log.info("FileController initialized with S3 service");
    }

    // ================================
    // 통합 이미지 업로드 API
    // ================================
    
    /**
     * 이미지 쌍 업로드 (원본 하나만 받아서 썸네일 자동 생성)
     *
     * @param file 원본 이미지 (썸네일은 서버에서 자동 생성됨)
     * @param type 파일 타입 (campground, site, review, profile, banner)
     * @return 업로드된 이미지 쌍 정보
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Authenticated
    @Operation(summary = "이미지 업로드", description = "원본 이미지를 업로드하면 썸네일이 자동 생성됩니다")
    public ResponseEntity<CommonResponse<ImagePairResponse>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type
    ) {
        try {
            log.info("Image upload - file: {}, type: {}", file.getOriginalFilename(), type);

            // 이미지 쌍 업로드 (썸네일 자동 생성)
            S3FileService.ImagePairResult result = s3FileService.uploadImagePair(file, type);

            ImagePairResponse response = new ImagePairResponse(
                result.thumbnailPath(),
                result.thumbnailUrl(),
                result.originalPath(),
                result.originalUrl()
            );

            log.info("Image uploaded successfully - type: {}, thumbnail: {}, original: {}",
                    type, result.thumbnailUrl(), result.originalUrl());

            return ResponseEntity.ok(CommonResponse.success(response));

        } catch (IllegalArgumentException e) {
            log.error("Invalid image upload request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(CommonResponse.error(e.getMessage()));
        } catch (IOException e) {
            log.error("Image upload failed - type: {}, file: {}",
                    type, file.getOriginalFilename(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CommonResponse.error("이미지 업로드에 실패했습니다."));
        }
    }
    
    /**
     * 여러 이미지 일괄 업로드 (썸네일 자동 생성)
     *
     * @param files 원본 이미지 파일 배열
     * @param type 파일 타입 (campground, site, review, profile, banner)
     * @return DB 저장용 이미지 정보 배열 (thumbnailUrl, originalUrl)
     */
    @PostMapping(value = "/upload/multiple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Authenticated
    @Operation(summary = "여러 이미지 업로드", description = "여러 이미지를 업로드하면 썸네일이 자동 생성됩니다")
    public ResponseEntity<CommonResponse<List<ImagePairResponse>>> uploadMultipleImages(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam("type") String type
    ) {
        try {
            log.info("Multiple images upload - type: {}, count: {}", type, files.size());

            // 타입별 최대 개수 제한
            int maxFiles = switch (type.toLowerCase()) {
                case "review" -> 5;
                case "announcement" -> 5;
                case "campground" -> 10;
                case "site" -> 10;
                default -> 5;
            };

            if (files.size() > maxFiles) {
                return ResponseEntity.badRequest()
                        .body(CommonResponse.error(type + " 이미지는 최대 " + maxFiles + "개까지 업로드 가능합니다."));
            }

            List<ImagePairResponse> responses = files.stream()
                    .map(file -> {
                        try {
                            S3FileService.ImagePairResult result = s3FileService.uploadImagePair(file, type);
                            return new ImagePairResponse(
                                    result.thumbnailPath(),
                                    result.thumbnailUrl(),
                                    result.originalPath(),
                                    result.originalUrl()
                            );
                        } catch (IOException e) {
                            throw new RuntimeException("이미지 업로드 실패: " + file.getOriginalFilename(), e);
                        }
                    })
                    .toList();

            log.info("All images uploaded successfully - type: {}, count: {}", type, responses.size());

            return ResponseEntity.ok(CommonResponse.success(responses));

        } catch (RuntimeException e) {
            log.error("Multiple images upload failed - type: {}", type, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CommonResponse.error("이미지 업로드에 실패했습니다."));
        }
    }
    
    /**
     * 여러 파일 삭제
     * 
     * @param request 삭제할 파일 경로 목록
     * @return 삭제 결과
     */
    @DeleteMapping
    @Authenticated
    @Operation(summary = "파일 삭제", description = "지정된 경로의 파일들을 삭제합니다")
    public ResponseEntity<CommonResponse<Void>> deleteFiles(@RequestBody FileDeleteRequest request) {
        if (request == null || request.getFilePaths() == null || request.getFilePaths().isEmpty()) {
            log.warn("Delete request with empty paths");
            return ResponseEntity.badRequest()
                    .body(CommonResponse.error("파일 경로 목록이 비어 있습니다."));
        }
        
        try {
            log.info("File delete request - count: {}", request.getFilePaths().size());
            s3FileService.deleteFiles(request.getFilePaths());
            log.info("Files deleted successfully - count: {}", request.getFilePaths().size());
            
            return ResponseEntity.ok(CommonResponse.success(null));
            
        } catch (Exception e) {
            log.error("File deletion failed - paths: {}", request.getFilePaths(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CommonResponse.error("파일 삭제에 실패했습니다."));
        }
    }
    
    /**
     * 이미지 쌍 업로드 응답 DTO
     */
    public record ImagePairResponse(
        String thumbnailPath,
        String thumbnailUrl,
        String originalPath,
        String originalUrl
    ) {}
    
    /**
     * 파일 삭제 요청 DTO
     */
    public static class FileDeleteRequest {
        private List<String> filePaths;
        
        public List<String> getFilePaths() { return filePaths; }
        public void setFilePaths(List<String> filePaths) { this.filePaths = filePaths; }
    }
}
