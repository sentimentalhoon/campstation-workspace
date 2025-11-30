package com.campstation.camp.user.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.campstation.camp.campground.domain.Campground;
import com.campstation.camp.user.domain.Favorite;
import com.campstation.camp.user.domain.User;

/**
 * 찜하기 리포지토리
 */
@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    /**
     * 사용자의 특정 캠핑장 찜하기 여부 확인
     */
    boolean existsByUserAndCampground(User user, Campground campground);

    /**
     * 사용자의 찜하기 목록 조회 (페이징 지원)
     */
    Page<Favorite> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    /**
     * 사용자의 찜하기 목록 조회 (페이징 미지원)
     */
    List<Favorite> findByUserOrderByCreatedAtDesc(User user);

    /**
     * 사용자의 찜하기 목록 조회 (Campground fetch join으로 N+1 문제 해결)
     */
    @Query("SELECT f FROM Favorite f JOIN FETCH f.campground WHERE f.user = :user ORDER BY f.createdAt DESC")
    List<Favorite> findByUserWithCampground(@Param("user") User user);

    /**
     * 특정 캠핑장을 찜한 사용자 수 조회
     *
     * @deprecated favoriteCount 컬럼 사용으로 대체됨.
     *             대신 Campground.getFavoriteCount()를 사용하세요.
     */
    @Deprecated(since = "2.0", forRemoval = true)
    long countByCampground(Campground campground);

    /**
     * 사용자의 찜하기 삭제
     */
    void deleteByUserAndCampground(User user, Campground campground);

    /**
     * 사용자의 찜하기한 캠핑장 ID 목록 조회
     */
    @Query("SELECT f.campground.id FROM Favorite f WHERE f.user = :user")
    List<Long> findCampgroundIdsByUser(@Param("user") User user);
}