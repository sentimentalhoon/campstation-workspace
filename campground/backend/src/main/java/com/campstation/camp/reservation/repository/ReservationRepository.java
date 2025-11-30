package com.campstation.camp.reservation.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.campstation.camp.reservation.domain.Reservation;
import com.campstation.camp.reservation.domain.ReservationStatus;

import jakarta.persistence.LockModeType;

/**
 * 예약 레포지토리
 * 
 * @author CampStation Team
 * @version 1.0
 * @since 2024-01-01
 */
@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    
    /**
     * 사용자의 모든 예약 조회 (페이징) - DELETED 상태 제외
     * 
     * @param userId 사용자 ID
     * @param pageable 페이징 정보
     * @return 예약 목록
     */
    @Query("SELECT r FROM Reservation r WHERE r.user.id = :userId AND r.status != 'DELETED' ORDER BY r.createdAt DESC")
    Page<Reservation> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId, Pageable pageable);
    
    /**
     * 캠핑장의 모든 예약 조회 (페이징)
     * 
     * @param campgroundId 캠핑장 ID
     * @param pageable 페이징 정보
     * @return 예약 목록
     */
    Page<Reservation> findByCampgroundIdOrderByCreatedAtDesc(Long campgroundId, Pageable pageable);
    
    /**
     * 사용자의 특정 상태 예약 조회
     * 
     * @param userId 사용자 ID
     * @param status 예약 상태
     * @return 예약 목록
     */
    List<Reservation> findByUserIdAndStatus(Long userId, ReservationStatus status);
    
    /**
     * 캠핑장의 특정 날짜 범위 예약 조회
     *
     * @param campgroundId 캠핑장 ID
     * @param startDate 시작 날짜
     * @param endDate 종료 날짜
     * @return 예약 목록
     */
    @Query("SELECT r FROM Reservation r WHERE r.campground.id = :campgroundId " +
           "AND r.status IN ('CONFIRMED', 'PENDING') " +
           "AND ((r.checkInDate <= :endDate AND r.checkOutDate > :startDate))")
    List<Reservation> findConflictingReservations(
            @Param("campgroundId") Long campgroundId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /**
     * 사이트의 특정 날짜 범위 예약 조회 (Pessimistic Write Lock)
     * 동시성 제어를 위해 해당 행을 잠급니다.
     *
     * @param siteId 사이트 ID
     * @param startDate 시작 날짜 (체크인)
     * @param endDate 종료 날짜 (체크아웃)
     * @return 예약 목록
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Reservation r WHERE r.site.id = :siteId " +
           "AND r.status IN ('CONFIRMED', 'PENDING') " +
           "AND r.checkInDate < :endDate " +
           "AND r.checkOutDate > :startDate")
    List<Reservation> findConflictingReservationsForSiteWithLock(
            @Param("siteId") Long siteId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
    
    /**
     * 사용자의 특정 예약 조회 (본인 예약만)
     * 
     * @param id 예약 ID
     * @param userId 사용자 ID
     * @return 예약 정보
     */
    Optional<Reservation> findByIdAndUserId(Long id, Long userId);
    
    /**
     * 예약 통계 - 캠핑장별 예약 수
     * 
     * @param campgroundId 캠핑장 ID
     * @param status 예약 상태
     * @return 예약 수
     */
    long countByCampgroundIdAndStatus(Long campgroundId, ReservationStatus status);
    
    /**
     * 예약 통계 - 사용자별 예약 수
     * 
     * @param userId 사용자 ID
     * @param status 예약 상태
     * @return 예약 수
     */
    long countByUserIdAndStatus(Long userId, ReservationStatus status);
    
    /**
     * 상태별 예약 수 조회
     *
     * @param status 예약 상태
     * @return 예약 수
     */
    long countByStatus(ReservationStatus status);

    /**
     * 오늘 체크인하는 예약 수 조회
     *
     * @param today 오늘 날짜
     * @return 오늘 체크인 예약 수
     */
    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.checkInDate = :today AND r.status IN ('PENDING', 'CONFIRMED')")
    Long countTodayCheckIns(@Param("today") LocalDate today);

    /**
     * 오늘 체크아웃하는 예약 수 조회
     *
     * @param today 오늘 날짜
     * @return 오늘 체크아웃 예약 수
     */
    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.checkOutDate = :today AND r.status IN ('PENDING', 'CONFIRMED')")
    Long countTodayCheckOuts(@Param("today") LocalDate today);

    /**
     * 날짜 범위에서 캠핑장 예약 충돌 검사
     * 
     * @param campgroundId 캠핑장 ID
     * @param checkInDate 체크인 날짜
     * @param checkOutDate 체크아웃 날짜
     * @return 충돌되는 예약 목록
     */
    @Query("SELECT r FROM Reservation r WHERE r.campground.id = :campgroundId " +
           "AND r.status != 'CANCELLED' " +
           "AND ((r.checkInDate <= :checkOutDate AND r.checkOutDate >= :checkInDate))")
    List<Reservation> findByCampgroundIdAndDateRange(
        @Param("campgroundId") Long campgroundId,
        @Param("checkInDate") LocalDate checkInDate,
        @Param("checkOutDate") LocalDate checkOutDate
    );

    /**
     * 비회원 예약 조회
     *
     * @param guestPhone 비회원 연락처
     * @param guestEmail 비회원 이메일
     * @return 비회원 예약 목록
     */
    @Query("SELECT r FROM Reservation r LEFT JOIN r.guest g WHERE r.guest IS NOT NULL " +
           "AND g.phone = :guestPhone AND g.email = :guestEmail " +
           "ORDER BY r.createdAt DESC")
    List<Reservation> findGuestReservations(
        @Param("guestPhone") String guestPhone,
        @Param("guestEmail") String guestEmail
    );

    /**
     * 기간별 상태별 매출 합계 조회 (대시보드용)
     * 
     * @param status 예약 상태
     * @param startDate 시작 날짜
     * @param endDate 종료 날짜
     * @return 매출 합계
     */
    @Query("SELECT SUM(r.totalAmount) FROM Reservation r WHERE r.status = :status " +
           "AND r.createdAt BETWEEN :startDate AND :endDate")
    Double sumTotalAmountByStatusAndCreatedAtBetween(
        @Param("status") ReservationStatus status,
        @Param("startDate") java.time.LocalDateTime startDate,
        @Param("endDate") java.time.LocalDateTime endDate
    );

    /**
     * 최근 예약 조회 (대시보드용)
     * 
     * @return 최근 예약 목록
     */
    @Query("SELECT r FROM Reservation r ORDER BY r.createdAt DESC")
    List<Reservation> findTop5ByOrderByCreatedAtDesc();

    /**
     * 모든 예약 조회 (User와 함께 로딩)
     * 
     * @return 예약 목록 (User 포함)
     */
    @Query("SELECT r FROM Reservation r JOIN FETCH r.user")
    List<Reservation> findAllWithUser();

    /**
     * 캠핑장 ID와 상태 목록으로 예약 조회
     *
     * @param campgroundId 캠핑장 ID
     * @param statuses 상태 목록
     * @return 예약 목록
     */
    List<Reservation> findByCampgroundIdAndStatusIn(Long campgroundId, List<ReservationStatus> statuses);

    /**
     * 사이트 ID와 상태 목록으로 예약 조회
     *
     * @param siteId 사이트 ID
     * @param statuses 상태 목록
     * @return 예약 목록
     */
    List<Reservation> findBySiteIdAndStatusIn(Long siteId, List<ReservationStatus> statuses);

    /**
     * 캠핑장의 모든 사이트에 대한 예약 조회 (상태 필터링)
     *
     * @param campgroundId 캠핑장 ID
     * @param statuses 상태 목록
     * @return 예약 목록
     */
    List<Reservation> findBySite_Campground_IdAndStatusIn(Long campgroundId, List<ReservationStatus> statuses);

    /**
     * 특정 상태이면서 생성 시간이 특정 시간 이전인 예약 조회 (자동 취소용)
     *
     * @param status 예약 상태
     * @param createdAt 생성 시간 기준
     * @return 예약 목록
     */
    List<Reservation> findByStatusAndCreatedAtBefore(ReservationStatus status, LocalDateTime createdAt);

    /**
     * Owner의 예약 목록 조회 (페이징)
     *
     * @param username Owner의 username
     * @param pageable 페이징 정보
     * @return 예약 목록
     */
    @Query("SELECT r FROM Reservation r WHERE r.campground.owner.username = :username ORDER BY r.createdAt DESC")
    Page<Reservation> findByOwnerUsername(@Param("username") String username, Pageable pageable);

    /**
     * 캠핑장 ID 목록으로 예약 조회
     *
     * @param campgroundIds 캠핑장 ID 목록
     * @return 예약 목록
     */
    @Query("SELECT r FROM Reservation r WHERE r.campground.id IN :campgroundIds")
    List<Reservation> findByCampgroundIdIn(@Param("campgroundIds") List<Long> campgroundIds);

    /**
     * 캠핑장 ID 목록으로 예약 조회 (페이징)
     *
     * @param campgroundIds 캠핑장 ID 목록
     * @param pageable 페이징 정보
     * @return 예약 목록
     */
    @Query("SELECT r FROM Reservation r WHERE r.campground.id IN :campgroundIds ORDER BY r.createdAt DESC")
    Page<Reservation> findByCampgroundIdIn(@Param("campgroundIds") List<Long> campgroundIds, Pageable pageable);

    /**
     * 특정 상태이고 체크아웃 날짜가 특정 날짜 이전인 예약 조회
     *
     * @param status 예약 상태
     * @param checkOutDate 체크아웃 날짜 기준
     * @return 예약 목록
     */
    List<Reservation> findByStatusAndCheckOutDateBefore(ReservationStatus status, LocalDate checkOutDate);
}