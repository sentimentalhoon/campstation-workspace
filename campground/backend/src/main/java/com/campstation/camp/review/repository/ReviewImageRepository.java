package com.campstation.camp.review.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.campstation.camp.review.domain.ReviewImage;

/**
 * 리뷰 이미지 Repository
 */
public interface ReviewImageRepository extends JpaRepository<ReviewImage, Long> {

    /**
     * 리뷰 ID로 이미지 목록 조회 (표시 순서대로)
     */
    @Query("SELECT ri FROM ReviewImage ri WHERE ri.review.id = :reviewId ORDER BY ri.displayOrder ASC")
    List<ReviewImage> findByReviewIdOrderByDisplayOrder(@Param("reviewId") Long reviewId);

    /**
     * 리뷰 ID로 이미지 삭제
     */
    @Modifying
    @Query("DELETE FROM ReviewImage ri WHERE ri.review.id = :reviewId")
    void deleteByReviewId(@Param("reviewId") Long reviewId);

    /**
     * 리뷰 ID 목록으로 이미지 삭제
     */
    @Modifying
    @Query("DELETE FROM ReviewImage ri WHERE ri.review.id IN :reviewIds")
    void deleteByReviewIds(@Param("reviewIds") List<Long> reviewIds);
}
