package com.campstation.camp.review.dto;

import java.util.List;

import com.campstation.camp.shared.dto.ImagePairDto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 리뷰 생성 요청 DTO
 *
 * @author CampStation Team
 * @version 1.0
 * @since 2024-01-01
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateReviewRequest {

    @NotNull(message = "캠핑장 ID는 필수입니다.")
    private Long campgroundId;

    // OWNER, ADMIN은 예약 없이도 리뷰 작성 가능 (테스트 목적)
    private Long reservationId;

    @NotNull(message = "평점은 필수입니다.")
    @Min(value = 1, message = "평점은 1점 이상이어야 합니다.")
    @Max(value = 5, message = "평점은 5점 이하여야 합니다.")
    private Integer rating;

    @Size(max = 2000, message = "리뷰 내용은 2000자 이하여야 합니다.")
    private String comment;

    // 이미지 쌍 목록 (썸네일 + 원본)
    private List<ImagePairDto> images;
}