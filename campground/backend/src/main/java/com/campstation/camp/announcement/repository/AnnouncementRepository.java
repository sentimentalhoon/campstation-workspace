package com.campstation.camp.announcement.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.campstation.camp.announcement.domain.Announcement;
import com.campstation.camp.announcement.domain.AnnouncementType;

/**
 * 공지사항 Repository
 * 공지사항 데이터 조회 및 관리를 위한 인터페이스
 */
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    /**
     * 캠핑장의 모든 공지사항 조회 (삭제되지 않은 것만, 고정된 것 먼저)
     */
    @Query("SELECT a FROM Announcement a WHERE a.campground.id = :campgroundId " +
           "AND a.deletedAt IS NULL " +
           "ORDER BY a.isPinned DESC, a.createdAt DESC")
    List<Announcement> findByCampgroundId(@Param("campgroundId") Long campgroundId);

    /**
     * 캠핑장의 특정 타입 공지사항 조회
     */
    @Query("SELECT a FROM Announcement a WHERE a.campground.id = :campgroundId " +
           "AND a.type = :type " +
           "AND a.deletedAt IS NULL " +
           "ORDER BY a.isPinned DESC, a.createdAt DESC")
    List<Announcement> findByCampgroundIdAndType(
            @Param("campgroundId") Long campgroundId,
            @Param("type") AnnouncementType type);

    /**
     * 공지사항 ID로 조회 (삭제되지 않은 것만)
     */
    @Query("SELECT a FROM Announcement a WHERE a.id = :id AND a.deletedAt IS NULL")
    Optional<Announcement> findByIdNotDeleted(@Param("id") Long id);

    /**
     * 캠핑장의 고정된 공지사항 개수 조회
     */
    @Query("SELECT COUNT(a) FROM Announcement a WHERE a.campground.id = :campgroundId " +
           "AND a.isPinned = true " +
           "AND a.deletedAt IS NULL")
    long countPinnedByCampgroundId(@Param("campgroundId") Long campgroundId);

    /**
     * 캠핑장의 공지사항 개수 조회
     */
    @Query("SELECT COUNT(a) FROM Announcement a WHERE a.campground.id = :campgroundId " +
           "AND a.deletedAt IS NULL")
    long countByCampgroundId(@Param("campgroundId") Long campgroundId);
}
