package com.campstation.camp.reservation.repository;

import com.campstation.camp.reservation.domain.Payment;
import com.campstation.camp.reservation.domain.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 결제 레포지토리
 * 결제 데이터 접근을 위한 Repository 인터페이스
 *
 * @author CampStation Team
 * @version 1.0
 * @since 2024-01-01
 */
@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByReservationIdOrderByCreatedAtDesc(Long reservationId);

    @Query("SELECT p FROM Payment p WHERE p.reservationId IN :reservationIds ORDER BY p.createdAt DESC")
    List<Payment> findByReservationIds(@Param("reservationIds") List<Long> reservationIds);

    Optional<Payment> findByTransactionId(String transactionId);

    List<Payment> findByStatus(PaymentStatus status);

    Page<Payment> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /**
     * 월간 매출 조회 (완료된 결제만)
     *
     * @param month 월 (1-12)
     * @param year 연도
     * @return 월간 총 매출
     */
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p " +
           "WHERE p.status = 'COMPLETED' " +
           "AND MONTH(p.createdAt) = :month " +
           "AND YEAR(p.createdAt) = :year")
    Double findMonthlyRevenue(@Param("month") int month, @Param("year") int year);
}