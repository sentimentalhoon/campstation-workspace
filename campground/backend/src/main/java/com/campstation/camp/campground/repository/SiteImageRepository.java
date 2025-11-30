package com.campstation.camp.campground.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.campstation.camp.campground.domain.SiteImage;

/**
 * 사이트 이미지 리포지토리
 */
@Repository
public interface SiteImageRepository extends JpaRepository<SiteImage, Long> {

    /**
     * 사이트 ID로 이미지 목록 조회 (순서대로)
     */
    List<SiteImage> findBySiteIdOrderByDisplayOrderAscIdAsc(Long siteId);

    /**
     * 사이트 ID로 이미지 삭제
     */
    void deleteBySiteId(Long siteId);

    /**
     * 사이트 ID로 이미지 개수 조회
     */
    long countBySiteId(Long siteId);

    /**
     * 사이트 ID 목록으로 모든 이미지 조회 (배치 조회 최적화)
     */
    @Query("SELECT si FROM SiteImage si WHERE si.site.id IN :siteIds ORDER BY si.site.id, si.displayOrder, si.id")
    List<SiteImage> findBySiteIdIn(@Param("siteIds") List<Long> siteIds);
}
