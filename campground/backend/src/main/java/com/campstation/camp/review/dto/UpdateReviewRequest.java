package com.campstation.camp.review.dto;

import java.util.List;

import com.campstation.camp.shared.dto.ImagePairDto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 리뷰 수정 요청 DTO
 * 
 * @author CampStation Team
 * @version 1.0
 * @since 2024-01-01
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateReviewRequest {
    
    @Min(value = 1, message = "평점은 1점 이상이어야 합니다.")
    @Max(value = 5, message = "평점은 5점 이하여야 합니다.")
    private Integer rating;
    
    @Size(max = 2000, message = "리뷰 내용은 2000자 이하여야 합니다.")
    private String comment;
    
    /**
     * 새로 추가할 이미지 목록 (썸네일 + 원본)
     */
    private List<ImagePairDto> images;
    
    /**
     * 삭제할 이미지 ID 목록
     */
    private List<Long> imageIdsToDelete;
}