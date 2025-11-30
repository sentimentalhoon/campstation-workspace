package com.campstation.camp.review.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 리뷰 이미지 경로 DTO
 * 원본과 썸네일 경로를 함께 저장합니다.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewImagePath {

    @NotBlank(message = "원본 이미지 경로는 필수입니다.")
    private String originalPath;

    @NotBlank(message = "썸네일 이미지 경로는 필수입니다.")
    private String thumbnailPath;
}
