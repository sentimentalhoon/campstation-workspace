package com.campstation.camp.banner.dto;

import com.campstation.camp.banner.domain.BannerStatus;
import com.campstation.camp.banner.domain.BannerType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 배너 검색 파라미터 DTO
 * 관리자 배너 목록 조회 시 필터링에 사용
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BannerSearchParams {
    private String title;
    private BannerType type;
    private BannerStatus status;
    private String sort;
    private String direction;
}
