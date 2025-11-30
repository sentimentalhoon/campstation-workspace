package com.campstation.camp.review.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.campstation.camp.review.dto.ReviewReplyDto.ReviewReplyResponse;
import com.campstation.camp.shared.dto.ImagePairDto;

/**
 * 리뷰 응답 DTO
 * Java 21 record를 활용한 불변 데이터 전송 객체
 *
 * @author CampStation Team
 * @version 2.0
 * @since 2024-01-01
 */
public record ReviewResponse(
    Long id,
    Long userId,
    String userName,
    String name,
    String userEmail,
    String userProfileImage,
    Long campgroundId,
    String campgroundName,
    Long campgroundOwnerId, // 캠핑장 소유자 ID (OWNER 권한 체크용)
    Integer rating,
    String comment,
    List<ImagePairDto> images,
    Long likeCount,
    Boolean isLiked,
    ReviewReplyResponse ownerReply,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
}