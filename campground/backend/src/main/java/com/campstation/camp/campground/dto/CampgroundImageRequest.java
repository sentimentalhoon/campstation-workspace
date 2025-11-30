package com.campstation.camp.campground.dto;

import java.util.List;

/**
 * 캠핑장 이미지 관리 요청 DTO
 */
public record CampgroundImageRequest(
        // 추가할 이미지 URL 목록
        List<String> addImageUrls,
        
        // 삭제할 이미지 URL 목록
        List<String> removeImageUrls
) {
}