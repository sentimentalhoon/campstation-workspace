package com.campstation.camp.stats.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 실시간 조회수 응답 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ViewCountResponse {

    private Long campgroundId;

    /**
     * 최근 24시간 내 고유 방문자 수
     */
    private Long viewCount;
}
