package com.campstation.camp.announcement.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.campstation.camp.announcement.domain.Announcement;
import com.campstation.camp.announcement.domain.AnnouncementType;
import com.campstation.camp.shared.dto.ImagePairDto;
import com.campstation.camp.shared.file.S3FileService;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 공지사항 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "공지사항 응답")
public class AnnouncementResponse {

    @Schema(description = "공지사항 ID", example = "1")
    private Long id;

    @Schema(description = "캠핑장 ID", example = "1")
    private Long campgroundId;

    @Schema(description = "공지사항 제목", example = "겨울 캠핑 이용 안내")
    private String title;

    @Schema(description = "공지사항 내용", example = "겨울철 캠핑장 이용 시 안전 수칙을 안내드립니다...")
    private String content;

    @Schema(description = "공지사항 타입", example = "NOTICE")
    private AnnouncementType type;

    @Schema(description = "상단 고정 여부", example = "false")
    private Boolean isPinned;

    @Schema(description = "조회수", example = "42")
    private Long viewCount;

    @Schema(description = "생성 일시", example = "2025-01-15T10:30:00")
    private LocalDateTime createdAt;

    @Schema(description = "수정 일시", example = "2025-01-15T10:30:00")
    private LocalDateTime updatedAt;

    @Schema(description = "공지사항 이미지 목록")
    private List<ImagePairDto> images;

    @Schema(description = "작성자 ID (Owner)")
    private Long authorId;

    @Schema(description = "작성자 이름")
    private String authorName;

    /**
     * Entity를 Response DTO로 변환 (S3FileService 주입 필요)
     */
    public static AnnouncementResponse from(Announcement announcement, S3FileService s3FileService) {
        List<ImagePairDto> imageDtos = announcement.getImages().stream()
                .sorted((i1, i2) -> i1.getDisplayOrder().compareTo(i2.getDisplayOrder()))
                .map(image -> ImagePairDto.builder()
                        .id(image.getId())
                        .thumbnailUrl(s3FileService.generatePublicUrl(image.getThumbnailUrl()))
                        .originalUrl(s3FileService.generatePublicUrl(image.getOriginalUrl()))
                        .build())
                .toList();

        return AnnouncementResponse.builder()
                .id(announcement.getId())
                .campgroundId(announcement.getCampground().getId())
                .title(announcement.getTitle())
                .content(announcement.getContent())
                .type(announcement.getType())
                .isPinned(announcement.getIsPinned())
                .viewCount(announcement.getViewCount())
                .createdAt(announcement.getCreatedAt())
                .updatedAt(announcement.getUpdatedAt())
                .images(imageDtos)
                .authorId(announcement.getCampground().getOwner().getId())
                .authorName(announcement.getCampground().getOwner().getName())
                .build();
    }
}
