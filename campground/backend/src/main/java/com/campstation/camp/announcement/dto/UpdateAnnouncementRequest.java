package com.campstation.camp.announcement.dto;

import java.util.List;

import com.campstation.camp.announcement.domain.AnnouncementType;
import com.campstation.camp.shared.dto.ImagePairDto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 공지사항 수정 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "공지사항 수정 요청")
public class UpdateAnnouncementRequest {

    @Size(max = 200, message = "제목은 200자를 초과할 수 없습니다")
    @Schema(description = "공지사항 제목", example = "겨울 캠핑 이용 안내")
    private String title;

    @Schema(description = "공지사항 내용", example = "겨울철 캠핑장 이용 시 안전 수칙을 안내드립니다...")
    private String content;

    @Schema(description = "공지사항 타입", example = "NOTICE")
    private AnnouncementType type;

    @Schema(description = "상단 고정 여부", example = "false")
    private Boolean isPinned;

    @Schema(description = "삭제할 이미지 ID 목록")
    private List<Long> imageIdsToDelete;

    @Valid
    @Schema(description = "추가할 이미지 목록 (최대 5개)")
    private List<ImagePairDto> images;
}
