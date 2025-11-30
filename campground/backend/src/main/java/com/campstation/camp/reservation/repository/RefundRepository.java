package com.campstation.camp.reservation.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.campstation.camp.reservation.domain.Refund;
import com.campstation.camp.reservation.domain.RefundStatus;

/**
 * 환불 내역 Repository
 */
@Repository
public interface RefundRepository extends JpaRepository<Refund, Long> {

    /**
     * 결제 ID로 환불 내역 조회
     */
    List<Refund> findByPaymentId(Long paymentId);

    /**
     * 예약 ID로 환불 내역 조회
     */
    List<Refund> findByReservationId(Long reservationId);

    /**
     * 사용자 ID로 환불 내역 조회
     */
    List<Refund> findByUserId(Long userId);

    /**
     * 결제 ID와 상태로 환불 내역 조회
     */
    Optional<Refund> findByPaymentIdAndStatus(Long paymentId, RefundStatus status);

    /**
     * 특정 사용자의 환불 내역 조회 (페이징)
     */
    @Query("SELECT r FROM Refund r WHERE r.userId = :userId ORDER BY r.createdAt DESC")
    List<Refund> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    /**
     * 특정 오너가 처리한 환불 내역 조회
     */
    @Query("SELECT r FROM Refund r WHERE r.processedBy = :ownerId ORDER BY r.createdAt DESC")
    List<Refund> findByProcessedByOrderByCreatedAtDesc(@Param("ownerId") Long ownerId);
}
