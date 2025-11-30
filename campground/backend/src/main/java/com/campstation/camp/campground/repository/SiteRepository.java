package com.campstation.camp.campground.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.campstation.camp.campground.domain.Site;

/**
 * Site Repository
 * 비트마스크 기반 편의시설 검색 지원 + Fetch Join으로 LazyInitializationException 방지
 */
public interface SiteRepository extends JpaRepository<Site, Long> {
    
    /**
     * Site 상세 조회 (Images Fetch Join)
     * LazyInitializationException 방지를 위한 필수 쿼리
     */
    @Query("SELECT s FROM Site s " +
           "LEFT JOIN FETCH s.images " +
           "WHERE s.id = :id")
    Optional<Site> findByIdWithDetails(@Param("id") Long id);

    /**
     * Site 조회 (Campground, Owner Fetch Join) - 권한 체크용
     * Controller에서 권한 체크 시 사용
     */
    @Query("SELECT s FROM Site s " +
           "JOIN FETCH s.campground c " +
           "JOIN FETCH c.owner " +
           "WHERE s.id = :id")
    Optional<Site> findByIdWithCampgroundAndOwner(@Param("id") Long id);
    
    /**
     * Campground별 Site 목록 조회 (Images Fetch Join)
     */
    @Query("SELECT DISTINCT s FROM Site s " +
           "LEFT JOIN FETCH s.images " +
           "WHERE s.campgroundId = :campgroundId")
    List<Site> findAllByCampgroundIdWithImages(@Param("campgroundId") Long campgroundId);
    
    /**
     * 기본 Campground별 조회 (페이징용)
     */
    Page<Site> findByCampgroundId(Long campgroundId, Pageable pageable);
    
    /**
     * 지정된 모든 편의시설을 보유한 사이트 검색 (AND 조건)
     * @param amenitiesFlags 편의시설 비트마스크
     * @return 조건을 만족하는 사이트 목록
     */
    @Query(value = "SELECT * FROM sites WHERE (amenities_flags & :flags) = :flags", nativeQuery = true)
    List<Site> findByAllAmenities(@Param("flags") Long amenitiesFlags);
    
    /**
     * 지정된 편의시설 중 하나라도 보유한 사이트 검색 (OR 조건)
     * @param amenitiesFlags 편의시설 비트마스크
     * @return 조건을 만족하는 사이트 목록
     */
    @Query(value = "SELECT * FROM sites WHERE (amenities_flags & :flags) > 0", nativeQuery = true)
    List<Site> findByAnyAmenities(@Param("flags") Long amenitiesFlags);
    
    /**
     * 캠핑장 ID와 편의시설로 사이트 검색 (페이징)
     * @param campgroundId 캠핑장 ID
     * @param amenitiesFlags 편의시설 비트마스크
     * @param pageable 페이징 정보
     * @return 페이징된 사이트 목록
     */
    @Query(value = "SELECT * FROM sites WHERE campground_id = :campgroundId AND (amenities_flags & :flags) = :flags",
           countQuery = "SELECT COUNT(*) FROM sites WHERE campground_id = :campgroundId AND (amenities_flags & :flags) = :flags",
           nativeQuery = true)
    Page<Site> findByCampgroundIdAndAmenities(
        @Param("campgroundId") Long campgroundId,
        @Param("flags") Long amenitiesFlags,
        Pageable pageable
    );
}
