package com.campstation.camp.banner.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.campstation.camp.banner.domain.Banner;
import com.campstation.camp.banner.domain.BannerStatus;
import com.campstation.camp.banner.domain.BannerType;

/**
 * 배너 Repository
 * 배너 데이터 조회 및 관리를 위한 인터페이스
 */
public interface BannerRepository extends JpaRepository<Banner, Long> {

    /**
     * 활성 배너 조회 (타입 필터 없음)
     */
    @Query("SELECT b FROM Banner b WHERE b.status = 'ACTIVE' " +
           "AND (b.startDate IS NULL OR b.startDate <= :now) " +
           "AND (b.endDate IS NULL OR b.endDate > :now) " +
           "AND b.deletedAt IS NULL " +
           "ORDER BY b.displayOrder ASC, b.createdAt DESC")
    List<Banner> findActiveBanners(@Param("now") LocalDateTime now, Pageable pageable);

    /**
     * 활성 배너 조회 (타입 필터 있음)
     */
    @Query("SELECT b FROM Banner b WHERE b.status = 'ACTIVE' " +
           "AND b.type = :type " +
           "AND (b.startDate IS NULL OR b.startDate <= :now) " +
           "AND (b.endDate IS NULL OR b.endDate > :now) " +
           "AND b.deletedAt IS NULL " +
           "ORDER BY b.displayOrder ASC, b.createdAt DESC")
    List<Banner> findActiveBannersByType(
            @Param("type") BannerType type, 
            @Param("now") LocalDateTime now, 
            Pageable pageable);

    /**
     * 관리자용 배너 목록 조회 (삭제되지 않은 배너)
     */
    @Query("SELECT b FROM Banner b WHERE b.deletedAt IS NULL " +
           "ORDER BY b.displayOrder ASC, b.createdAt DESC")
    Page<Banner> findAllNotDeleted(Pageable pageable);

    /**
     * 관리자용 배너 검색 (제목)
     */
    @Query("SELECT b FROM Banner b WHERE b.deletedAt IS NULL " +
           "AND b.title LIKE %:title% " +
           "ORDER BY b.displayOrder ASC, b.createdAt DESC")
    Page<Banner> findByTitleContaining(@Param("title") String title, Pageable pageable);

    /**
     * 관리자용 배너 필터 (타입)
     */
    @Query("SELECT b FROM Banner b WHERE b.deletedAt IS NULL " +
           "AND b.type = :type " +
           "ORDER BY b.displayOrder ASC, b.createdAt DESC")
    Page<Banner> findByType(@Param("type") BannerType type, Pageable pageable);

    /**
     * 관리자용 배너 필터 (상태)
     */
    @Query("SELECT b FROM Banner b WHERE b.deletedAt IS NULL " +
           "AND b.status = :status " +
           "ORDER BY b.displayOrder ASC, b.createdAt DESC")
    Page<Banner> findByStatus(@Param("status") BannerStatus status, Pageable pageable);

    /**
     * 관리자용 배너 필터 (제목 + 타입)
     */
    @Query("SELECT b FROM Banner b WHERE b.deletedAt IS NULL " +
           "AND b.title LIKE %:title% " +
           "AND b.type = :type " +
           "ORDER BY b.displayOrder ASC, b.createdAt DESC")
    Page<Banner> findByTitleAndType(
            @Param("title") String title,
            @Param("type") BannerType type,
            Pageable pageable);

    /**
     * 관리자용 배너 필터 (제목 + 상태)
     */
    @Query("SELECT b FROM Banner b WHERE b.deletedAt IS NULL " +
           "AND b.title LIKE %:title% " +
           "AND b.status = :status " +
           "ORDER BY b.displayOrder ASC, b.createdAt DESC")
    Page<Banner> findByTitleAndStatus(
            @Param("title") String title,
            @Param("status") BannerStatus status,
            Pageable pageable);

    /**
     * 관리자용 배너 필터 (타입 + 상태)
     */
    @Query("SELECT b FROM Banner b WHERE b.deletedAt IS NULL " +
           "AND b.type = :type " +
           "AND b.status = :status " +
           "ORDER BY b.displayOrder ASC, b.createdAt DESC")
    Page<Banner> findByTypeAndStatus(
            @Param("type") BannerType type,
            @Param("status") BannerStatus status,
            Pageable pageable);

    /**
     * 관리자용 배너 필터 (제목 + 타입 + 상태)
     */
    @Query("SELECT b FROM Banner b WHERE b.deletedAt IS NULL " +
           "AND b.title LIKE %:title% " +
           "AND b.type = :type " +
           "AND b.status = :status " +
           "ORDER BY b.displayOrder ASC, b.createdAt DESC")
    Page<Banner> findByTitleAndTypeAndStatus(
            @Param("title") String title,
            @Param("type") BannerType type,
            @Param("status") BannerStatus status,
            Pageable pageable);

    /**
     * 활성 배너 개수 조회
     */
    @Query("SELECT COUNT(b) FROM Banner b WHERE b.status = 'ACTIVE' " +
           "AND (b.startDate IS NULL OR b.startDate <= :now) " +
           "AND (b.endDate IS NULL OR b.endDate > :now) " +
           "AND b.deletedAt IS NULL")
    long countActiveBanners(@Param("now") LocalDateTime now);

    /**
     * 총 조회수 조회
     */
    @Query("SELECT COALESCE(SUM(b.viewCount), 0) FROM Banner b WHERE b.deletedAt IS NULL")
    long sumViewCount();

    /**
     * 총 클릭수 조회
     */
    @Query("SELECT COALESCE(SUM(b.clickCount), 0) FROM Banner b WHERE b.deletedAt IS NULL")
    long sumClickCount();
}
