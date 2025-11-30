package com.campstation.camp.review.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.campstation.camp.review.domain.ReviewReply;

/**
 * 리뷰 답글 레포지토리
 */
@Repository
public interface ReviewReplyRepository extends JpaRepository<ReviewReply, Long> {

    /**
     * 리뷰 ID로 답글 조회
     */
    Optional<ReviewReply> findByReviewId(Long reviewId);

    /**
     * 리뷰 ID로 답글 존재 여부 확인
     */
    boolean existsByReviewId(Long reviewId);

    /**
     * 리뷰 ID로 답글 삭제
     */
    void deleteByReviewId(Long reviewId);
}
