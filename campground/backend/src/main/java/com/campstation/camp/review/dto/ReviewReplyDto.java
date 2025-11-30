package com.campstation.camp.review.dto;

import com.campstation.camp.review.domain.ReviewReply;

import jakarta.validation.constraints.NotBlank;

/**
 * 리뷰 답글 DTO
 */
public class ReviewReplyDto {

    /**
     * 답글 생성 요청 DTO
     */
    public record CreateReviewReplyRequest(
            @NotBlank(message = "답글 내용은 필수입니다.")
            String comment
    ) {
    }

    /**
     * 답글 수정 요청 DTO
     */
    public record UpdateReviewReplyRequest(
            @NotBlank(message = "답글 내용은 필수입니다.")
            String comment
    ) {
    }

    /**
     * 답글 응답 DTO
     */
    public record ReviewReplyResponse(
            Long id,
            Long reviewId,
            String comment,
            String createdAt,
            String updatedAt
    ) {
        public static ReviewReplyResponse from(ReviewReply reply) {
            return new ReviewReplyResponse(
                    reply.getId(),
                    reply.getReview().getId(),
                    reply.getComment(),
                    reply.getCreatedAt().toString(),
                    reply.getUpdatedAt().toString()
            );
        }
    }
}
