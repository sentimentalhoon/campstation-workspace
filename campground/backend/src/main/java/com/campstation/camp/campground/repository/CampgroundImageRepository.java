package com.campstation.camp.campground.repository;

import java.util.List;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.campstation.camp.campground.domain.CampgroundImage;

/**
 * 캠핑장 이미지 리포지토리
 */
@Repository
public interface CampgroundImageRepository extends JpaRepository<CampgroundImage, Long> {

    /**
     * 캠핑장 ID로 이미지 목록 조회 (순서대로)
     * 30분 동안 캐시됨
     */
    @Cacheable(value = "campgroundImages", key = "'campground:' + #campgroundId", unless = "#result == null || #result.isEmpty()")
    List<CampgroundImage> findByCampgroundIdOrderByDisplayOrderAscIdAsc(Long campgroundId);

    /**
     * 캠핑장 ID로 메인 이미지 조회
     * 30분 동안 캐시됨
     */
    @Cacheable(value = "campgroundImages", key = "'mainImage:' + #campgroundId", unless = "#result == null")
    @Query("SELECT ci FROM CampgroundImage ci WHERE ci.campground.id = :campgroundId AND ci.isMain = true")
    CampgroundImage findMainImageByCampgroundId(@Param("campgroundId") Long campgroundId);

    /**
     * 캠핑장 ID로 이미지 개수 조회
     */
    long countByCampgroundId(Long campgroundId);

    /**
     * 캠핑장 ID로 모든 이미지 삭제
     */
    void deleteByCampgroundId(Long campgroundId);

    /**
     * 캠핑장 ID로 최대 display_order 값 조회
     */
    @Query("SELECT MAX(ci.displayOrder) FROM CampgroundImage ci WHERE ci.campground.id = :campgroundId")
    java.util.Optional<Integer> findMaxDisplayOrderByCampgroundId(@Param("campgroundId") Long campgroundId);

    /**
     * 캠핑장의 모든 이미지를 메인이 아닌 상태로 변경
     */
    @Query("UPDATE CampgroundImage ci SET ci.isMain = false WHERE ci.campground.id = :campgroundId")
    @org.springframework.data.jpa.repository.Modifying
    void updateAllIsMainFalseByCampgroundId(@Param("campgroundId") Long campgroundId);
}