package com.campstation.camp.reservation.scheduler;

import java.time.LocalDate;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.campstation.camp.reservation.domain.Reservation;
import com.campstation.camp.reservation.domain.ReservationStatus;
import com.campstation.camp.reservation.repository.ReservationRepository;

/**
 * 예약 완료 처리 스케줄러
 * 
 * 체크아웃 날짜가 지난 CONFIRMED 예약을 자동으로 COMPLETED로 변경합니다.
 * 매일 자정(00:00)에 실행됩니다.
 * 
 * @author CampStation Team
 * @version 1.0
 * @since 2024-11-02
 */
@Component
public class ReservationCompletionScheduler {

    private static final Logger logger = LoggerFactory.getLogger(ReservationCompletionScheduler.class);
    
    private final ReservationRepository reservationRepository;
    
    public ReservationCompletionScheduler(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }
    
    /**
     * 체크아웃 날짜가 지난 예약 완료 처리
     * 
     * 매일 자정에 실행되어 체크아웃 날짜가 지난 CONFIRMED 상태의 예약을 COMPLETED로 변경합니다.
     * cron 표현식: 0 0 0 * * * = 매일 자정 실행
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void completeCheckoutReservations() {
        try {
            LocalDate today = LocalDate.now();
            
            // 체크아웃 날짜가 오늘보다 이전이고 CONFIRMED 상태인 예약 조회
            List<Reservation> completedReservations = reservationRepository
                .findByStatusAndCheckOutDateBefore(ReservationStatus.CONFIRMED, today);
            
            if (completedReservations.isEmpty()) {
                logger.debug("완료 처리할 예약이 없습니다.");
                return;
            }
            
            int completedCount = 0;
            for (Reservation reservation : completedReservations) {
                try {
                    // 예약 완료 처리
                    reservation.setStatus(ReservationStatus.COMPLETED);
                    reservationRepository.save(reservation);
                    completedCount++;
                    
                    logger.info("예약 자동 완료 처리 - 예약ID: {}, 체크아웃: {}, 캠핑장: {}",
                        reservation.getId(),
                        reservation.getCheckOutDate(),
                        reservation.getCampground().getName()
                    );
                    
                } catch (Exception e) {
                    logger.error("예약 완료 처리 실패 - 예약ID: {}, 오류: {}", 
                        reservation.getId(), e.getMessage(), e);
                }
            }
            
            logger.info("체크아웃 완료 예약 자동 처리 완료 - 총 {}건 완료", completedCount);
            
        } catch (Exception e) {
            logger.error("예약 완료 처리 스케줄러 실행 중 오류 발생", e);
        }
    }
}
