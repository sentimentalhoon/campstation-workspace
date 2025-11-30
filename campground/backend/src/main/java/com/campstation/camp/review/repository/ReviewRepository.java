package com.campstation.camp.review.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.campstation.camp.review.domain.Review;

/**
 * 리뷰 레포지토리
 * 
 * @author CampStation Team
 * @version 1.0
 * @since 2024-01-01
 */
@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    /**
     * 캠핑장의 모든 리뷰 조회 (페이징)
     * 
     * @param campgroundId 캠핑장 ID
     * @param pageable 페이징 정보
     * @return 리뷰 목록
     */
    Page<Review> findByCampgroundIdOrderByCreatedAtDesc(Long campgroundId, Pageable pageable);
    
    /**
     * 캠핑장의 모든 리뷰 조회 (페이징 없음)
     * 
     * @param campgroundId 캠핑장 ID
     * @return 리뷰 목록
     */
    List<Review> findByCampgroundIdOrderByCreatedAtDesc(Long campgroundId);
    
    /**
     * 최근 리뷰 조회 (Top 10)
     * 
     * @return 최근 리뷰 목록
     */
    List<Review> findTop10ByOrderByCreatedAtDesc();
    
    /**
     * 사용자의 모든 리뷰 조회 (페이징)
     * 
     * @param userId 사용자 ID
     * @param pageable 페이징 정보
     * @return 리뷰 목록
     */
    Page<Review> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    /**
     * 사용자의 특정 캠핑장에 대한 리뷰 조회
     * 
     * @param userId 사용자 ID
     * @param campgroundId 캠핑장 ID
     * @return 리뷰 정보
     * @deprecated 예약별 리뷰 작성으로 변경됨. findByUserIdAndReservationId 사용 권장
     */
    @Deprecated
    Optional<Review> findByUserIdAndCampgroundId(Long userId, Long campgroundId);
    
    /**
     * 사용자의 특정 예약에 대한 리뷰 조회
     * 
     * @param userId 사용자 ID
     * @param reservationId 예약 ID
     * @return 리뷰 정보
     */
    Optional<Review> findByUserIdAndReservationId(Long userId, Long reservationId);
    
    /**
     * 사용자의 특정 리뷰 조회 (본인 리뷰만)
     * 
     * @param id 리뷰 ID
     * @param userId 사용자 ID
     * @return 리뷰 정보
     */
    Optional<Review> findByIdAndUserId(Long id, Long userId);
    
    /**
     * 캠핑장의 평균 평점 계산
     *
     * @param campgroundId 캠핑장 ID
     * @return 평균 평점
     */
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.campground.id = :campgroundId AND r.deletedAt IS NULL")
    Double findAverageRatingByCampgroundId(@Param("campgroundId") Long campgroundId);

    /**
     * 전체 캠핑장의 평균 평점 계산
     *
     * @return 전체 평균 평점
     */
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.deletedAt IS NULL")
    Double findAverageRating();
    
    /**
     * 캠핑장의 리뷰 수 조회
     *
     * @param campgroundId 캠핑장 ID
     * @return 리뷰 수
     * @deprecated reviewCount 컬럼 사용으로 대체됨.
     *             대신 Campground.getReviewCount()를 사용하세요.
     */
    @Deprecated(since = "2.0", forRemoval = true)
    long countByCampgroundId(Long campgroundId);
    
    /**
     * 사용자의 리뷰 수 조회
     * 
     * @param userId 사용자 ID
     * @return 리뷰 수
     */
    long countByUserId(Long userId);
    
    /**
     * 평점별 리뷰 수 조회
     * 
     * @param campgroundId 캠핑장 ID
     * @param rating 평점
     * @return 해당 평점의 리뷰 수
     */
    long countByCampgroundIdAndRating(Long campgroundId, Integer rating);

    /**
     * Owner의 리뷰 목록 조회 (페이징)
     * 
     * @param username Owner의 username
     * @param pageable 페이징 정보
     * @return 리뷰 목록
     */
    @Query("SELECT r FROM Review r WHERE r.campground.owner.username = :username ORDER BY r.createdAt DESC")
    Page<Review> findByOwnerUsername(@Param("username") String username, Pageable pageable);

    /**
     * 캠핑장 ID 목록으로 리뷰 조회 (페이지네이션)
     * 
     * @param campgroundIds 캠핑장 ID 목록
     * @param pageable 페이지 정보
     * @return 리뷰 페이지
     */
    @Query("SELECT r FROM Review r WHERE r.campground.id IN :campgroundIds ORDER BY r.createdAt DESC")
    Page<Review> findByCampgroundIdIn(@Param("campgroundIds") List<Long> campgroundIds, Pageable pageable);

    /**
     * 캠핑장 ID 목록으로 리뷰 조회 (리스트)
     * 
     * @param campgroundIds 캠핑장 ID 목록
     * @return 리뷰 목록
     */
    @Query("SELECT r FROM Review r WHERE r.campground.id IN :campgroundIds ORDER BY r.createdAt DESC")
    List<Review> findByCampgroundIdIn(@Param("campgroundIds") List<Long> campgroundIds);
}