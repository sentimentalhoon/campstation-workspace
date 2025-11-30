package com.campstation.camp.review.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.campstation.camp.review.domain.ReviewLike;

/**
 * 리뷰 좋아요 리포지토리
 * 
 * @author CampStation Team
 * @version 1.0
 * @since 2025-01-01
 */
@Repository
public interface ReviewLikeRepository extends JpaRepository<ReviewLike, Long> {
    
    /**
     * 리뷰와 사용자로 좋아요 조회
     * 
     * @param reviewId 리뷰 ID
     * @param userId 사용자 ID
     * @return 리뷰 좋아요
     */
    @Query("SELECT rl FROM ReviewLike rl WHERE rl.review.id = :reviewId AND rl.user.id = :userId")
    Optional<ReviewLike> findByReviewIdAndUserId(
            @Param("reviewId") Long reviewId, 
            @Param("userId") Long userId);
    
    /**
     * 리뷰의 좋아요 개수 조회
     * 
     * @param reviewId 리뷰 ID
     * @return 좋아요 개수
     */
    @Query("SELECT COUNT(rl) FROM ReviewLike rl WHERE rl.review.id = :reviewId")
    long countByReviewId(@Param("reviewId") Long reviewId);
    
    /**
     * 리뷰와 사용자로 좋아요 존재 여부 확인
     * 
     * @param reviewId 리뷰 ID
     * @param userId 사용자 ID
     * @return 존재 여부
     */
    @Query("SELECT CASE WHEN COUNT(rl) > 0 THEN true ELSE false END " +
           "FROM ReviewLike rl WHERE rl.review.id = :reviewId AND rl.user.id = :userId")
    boolean existsByReviewIdAndUserId(
            @Param("reviewId") Long reviewId, 
            @Param("userId") Long userId);
}
