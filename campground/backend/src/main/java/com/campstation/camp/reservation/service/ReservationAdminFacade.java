package com.campstation.camp.reservation.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campstation.camp.reservation.domain.Reservation;
import com.campstation.camp.reservation.domain.ReservationStatus;
import com.campstation.camp.reservation.dto.AdminReservationResponse;
import com.campstation.camp.reservation.repository.ReservationRepository;
import com.campstation.camp.shared.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReservationAdminFacade {

    private final ReservationRepository reservationRepository;

    public Page<AdminReservationResponse> findAll(Pageable pageable) {
        return reservationRepository.findAll(pageable)
                .map(AdminReservationResponse::from);
    }

    public long countAll() {
        return reservationRepository.count();
    }

    public long countByStatus(ReservationStatus status) {
        return reservationRepository.countByStatus(status);
    }

    @Transactional
    public AdminReservationResponse updateStatus(Long reservationId, ReservationStatus status) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("예약을 찾을 수 없습니다: " + reservationId));
        
        reservation.setStatus(status);
        Reservation updated = reservationRepository.save(reservation);
        return AdminReservationResponse.from(updated);
    }

    @Transactional
    public AdminReservationResponse rejectReservation(Long reservationId, String rejectionReason) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("예약을 찾을 수 없습니다: " + reservationId));
        
        reservation.setStatus(ReservationStatus.CANCELLED);
        reservation.setRejectionReason(rejectionReason);
        Reservation updated = reservationRepository.save(reservation);
        return AdminReservationResponse.from(updated);
    }
}
