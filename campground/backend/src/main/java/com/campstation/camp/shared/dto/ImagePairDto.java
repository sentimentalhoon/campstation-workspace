package com.campstation.camp.shared.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 이미지 쌍 DTO (원본 + 썸네일)
 * 모든 이미지 업로드/응답에 공통으로 사용
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImagePairDto {

    /**
     * 이미지 ID (기존 이미지인 경우에만 존재)
     */
    private Long id;

    @NotBlank(message = "썸네일 URL은 필수입니다")
    @Size(max = 500, message = "썸네일 URL은 500자를 초과할 수 없습니다")
    private String thumbnailUrl;

    @NotBlank(message = "원본 이미지 URL은 필수입니다")
    @Size(max = 500, message = "원본 이미지 URL은 500자를 초과할 수 없습니다")
    private String originalUrl;
}
