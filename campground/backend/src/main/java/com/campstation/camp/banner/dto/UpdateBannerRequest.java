package com.campstation.camp.banner.dto;

import java.time.LocalDateTime;

import com.campstation.camp.banner.domain.BannerType;
import com.campstation.camp.shared.dto.ImagePairDto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 배너 수정 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateBannerRequest {

    @Size(max = 200, message = "배너 제목은 200자를 초과할 수 없습니다")
    private String title;

    @Size(max = 1000, message = "배너 설명은 1000자를 초과할 수 없습니다")
    private String description;

    private BannerType type;

    @Valid
    private ImagePairDto image;

    @Size(max = 500, message = "링크 URL은 500자를 초과할 수 없습니다")
    private String linkUrl;

    @Size(max = 20, message = "링크 타겟은 20자를 초과할 수 없습니다")
    private String linkTarget;

    private LocalDateTime startDate;

    private LocalDateTime endDate;
}
