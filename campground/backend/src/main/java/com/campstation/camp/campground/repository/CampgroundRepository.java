package com.campstation.camp.campground.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.campstation.camp.campground.domain.Campground;
import com.campstation.camp.campground.domain.CampgroundStatus;

/**
 * 캠핑장 데이터 접근을 위한 Repository
 */
@Repository
public interface CampgroundRepository extends JpaRepository<Campground, Long> {

    /**
     * 삭제되지 않은 캠핑장 조회
     */
    @Query("SELECT c FROM Campground c WHERE c.deletedAt IS NULL AND c.id = :id")
    Optional<Campground> findByIdAndNotDeleted(@Param("id") Long id);
    
    /**
     * 삭제되지 않은 캠핑장 조회 (이미지 포함 - N+1 방지)
     * 캠핑장 상세 조회 시 이미지를 함께 fetch
     */
    @EntityGraph(attributePaths = {"images"})
    @Query("SELECT c FROM Campground c WHERE c.deletedAt IS NULL AND c.id = :id")
    Optional<Campground> findByIdWithImages(@Param("id") Long id);

    /**
     * 삭제되지 않은 모든 캠핑장 조회
     */
    @Query("SELECT c FROM Campground c WHERE c.deletedAt IS NULL")
    List<Campground> findAllNotDeleted();

    /**
     * 삭제되지 않은 모든 캠핑장 조회 (이미지, 소유자 포함 - N+1 방지)
     */
    @Query("SELECT DISTINCT c FROM Campground c " +
           "LEFT JOIN FETCH c.images " +
           "LEFT JOIN FETCH c.owner " +
           "WHERE c.deletedAt IS NULL")
    List<Campground> findAllNotDeletedWithImagesAndOwner();

    /**
     * 상태별 캠핑장 조회
     */
    @Query("SELECT c FROM Campground c WHERE c.deletedAt IS NULL AND c.status = :status")
    List<Campground> findByStatusAndNotDeleted(@Param("status") CampgroundStatus status);

    /**
     * 이름으로 캠핑장 검색 (부분 일치)
     */
    @Query("SELECT c FROM Campground c WHERE c.deletedAt IS NULL AND c.name LIKE %:name%")
    List<Campground> findByNameContainingAndNotDeleted(@Param("name") String name);

    /**
     * 주소로 캠핑장 검색 (부분 일치)
     */
    @Query("SELECT c FROM Campground c WHERE c.deletedAt IS NULL AND c.address LIKE %:address%")
    List<Campground> findByAddressContainingAndNotDeleted(@Param("address") String address);

    /**
     * 위치 기반 캠핑장 검색 (반경 내)
     */
    @Query("""
        SELECT c FROM Campground c 
        WHERE c.deletedAt IS NULL 
        AND c.latitude IS NOT NULL 
        AND c.longitude IS NOT NULL
        AND (6371 * ACOS(
            COS(RADIANS(:latitude)) * COS(RADIANS(c.latitude)) * 
            COS(RADIANS(c.longitude) - RADIANS(:longitude)) + 
            SIN(RADIANS(:latitude)) * SIN(RADIANS(c.latitude))
        )) <= :radiusKm
        ORDER BY (6371 * ACOS(
            COS(RADIANS(:latitude)) * COS(RADIANS(c.latitude)) * 
            COS(RADIANS(c.longitude) - RADIANS(:longitude)) + 
            SIN(RADIANS(:latitude)) * SIN(RADIANS(c.latitude))
        ))
    """)
    List<Campground> findNearbyNotDeleted(
            @Param("latitude") BigDecimal latitude,
            @Param("longitude") BigDecimal longitude,
            @Param("radiusKm") Double radiusKm
    );

    /**
     * 지도 영역 내의 캠핑장 검색 (경계 박스)
     * 
     * @param swLat 남서쪽 위도 (South-West Latitude)
     * @param swLng 남서쪽 경도 (South-West Longitude)
     * @param neLat 북동쪽 위도 (North-East Latitude)
     * @param neLng 북동쪽 경도 (North-East Longitude)
     * @return 지도 영역 내의 캠핑장 목록
     */
    @Query("""
        SELECT c FROM Campground c 
        WHERE c.deletedAt IS NULL 
        AND c.latitude IS NOT NULL 
        AND c.longitude IS NOT NULL
        AND c.latitude BETWEEN :swLat AND :neLat
        AND c.longitude BETWEEN :swLng AND :neLng
        AND c.status = 'ACTIVE'
    """)
    List<Campground> findByMapBoundsAndNotDeleted(
            @Param("swLat") BigDecimal swLat,
            @Param("swLng") BigDecimal swLng,
            @Param("neLat") BigDecimal neLat,
            @Param("neLng") BigDecimal neLng
    );

    /**
     * 평점 이상의 캠핑장 조회
     */
    // @Query("SELECT c FROM Campground c WHERE c.deletedAt IS NULL AND " +
    //        "(SELECT COUNT(r) FROM Review r WHERE r.campground.id = c.id) > 0 AND " +
    //        "(SELECT AVG(r.rating) FROM Review r WHERE r.campground.id = c.id) >= :minRating " +
    //        "ORDER BY (SELECT AVG(r.rating) FROM Review r WHERE r.campground.id = c.id) DESC")
    // List<Campground> findByRatingGreaterThanEqualAndNotDeleted(@Param("minRating") BigDecimal minRating);

    /**
     * 인기 캠핑장 조회 (즐겨찾기 수 기준)
     * favoriteCount 컬럼을 사용하여 성능 최적화 (COUNT 서브쿼리 제거)
     */
    @Query("""
        SELECT c FROM Campground c WHERE c.deletedAt IS NULL
        ORDER BY c.favoriteCount DESC, c.createdAt DESC
    """)
    List<Campground> findPopularNotDeleted();

    /**
     * 상태별 캠핑장 수 조회
     */
    @Query("SELECT COUNT(c) FROM Campground c WHERE c.deletedAt IS NULL AND c.status = :status")
    Long countByStatus(@Param("status") CampgroundStatus status);

    /**
     * 최근 등록된 캠핑장 조회
     */
    @Query("SELECT c FROM Campground c WHERE c.deletedAt IS NULL ORDER BY c.createdAt DESC")
    List<Campground> findTop5ByOrderByCreatedAtDesc();

    /**
     * Owner의 캠핑장 목록 조회 (페이징)
     */
    @Query("SELECT c FROM Campground c WHERE c.deletedAt IS NULL AND c.owner.id = :ownerId")
    org.springframework.data.domain.Page<Campground> findByOwnerId(@Param("ownerId") Long ownerId, org.springframework.data.domain.Pageable pageable);

    /**
     * Owner의 모든 캠핑장 조회
     */
    @Query("SELECT c FROM Campground c WHERE c.deletedAt IS NULL AND c.owner.id = :ownerId")
    List<Campground> findAllByOwnerId(@Param("ownerId") Long ownerId);

    /**
     * 캠핑장 통계 정보 일괄 조회 (N+1 쿼리 방지)
     * 평균 평점, 리뷰 수, 좋아요 수를 한 번의 쿼리로 조회
     * favoriteCount, reviewCount 컬럼을 사용하여 성능 최적화 (Favorite, Review JOIN 제거)
     */
    @Query("""
        SELECT c.id as campgroundId,
               COALESCE(AVG(r.rating), 0.0) as averageRating,
               c.reviewCount as reviewCount,
               c.favoriteCount as favoriteCount
        FROM Campground c
        LEFT JOIN Review r ON r.campground.id = c.id AND r.deletedAt IS NULL
        WHERE c.id IN :campgroundIds
        GROUP BY c.id, c.reviewCount, c.favoriteCount
    """)
    List<com.campstation.camp.campground.dto.CampgroundWithStatsProjection> findStatsByCampgroundIds(
            @Param("campgroundIds") List<Long> campgroundIds
    );
}