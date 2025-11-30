package com.campstation.camp.admin.controller;

import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.campstation.camp.admin.service.AdminService;
import com.campstation.camp.reservation.dto.AdminReservationResponse;
import com.campstation.camp.reservation.dto.ReservationResponse;
import com.campstation.camp.reservation.service.ReservationService;
import com.campstation.camp.shared.dto.CommonResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 관리자 예약 관리 컨트롤러
 * 
 * @author CampStation Team
 * @version 1.0
 * @since 2024-01-01
 */
@Tag(name = "관리자 예약 관리", description = "관리자용 예약 관리 API")
@RestController
@RequestMapping("/api/v1/admin/reservations")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminReservationController {
    
    private final ReservationService reservationService;
    private final AdminService adminService;
    
    /**
     * 모든 예약 조회 (관리자용)
     * 
     * @param search 검색어 (선택)
     * @param status 상태 필터 (선택)
     * @param dateFilter 날짜 필터 (선택)
     * @param pageable 페이징 정보
     * @return 예약 목록
     */
    @Operation(summary = "모든 예약 조회", description = "관리자가 모든 예약을 조회합니다.")
    @GetMapping
    public ResponseEntity<Page<ReservationResponse>> getAllReservations(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String dateFilter,
            @PageableDefault(size = 10) Pageable pageable) {
        
        log.info("Admin fetching all reservations with search: {}, status: {}, dateFilter: {}", 
                search, status, dateFilter);
        
        Page<ReservationResponse> reservations = reservationService.getAllReservationsForAdmin(
                search, status, dateFilter, pageable);
        
        return ResponseEntity.ok(reservations);
    }
    
    /**
     * 예약 상태 업데이트 (관리자용)
     * 
     * @param reservationId 예약 ID
     * @param statusUpdate 상태 업데이트 요청
     * @return 업데이트된 예약 정보
     */
    @Operation(summary = "예약 상태 업데이트", description = "관리자가 예약 상태를 업데이트합니다.")
    @PatchMapping("/{reservationId}/status")
    public ResponseEntity<ReservationResponse> updateReservationStatus(
            @PathVariable Long reservationId,
            @RequestBody Map<String, String> statusUpdate) {
        
        String status = statusUpdate.get("status");
        log.info("Admin updating reservation {} status to: {}", reservationId, status);
        
        ReservationResponse updatedReservation = reservationService.updateReservationStatusByAdmin(
                reservationId, status);
        
        return ResponseEntity.ok(updatedReservation);
    }
    
    /**
     * 예약 삭제 (관리자용)
     * 
     * @param reservationId 예약 ID
     * @return 삭제 성공 메시지
     */
    @Operation(summary = "예약 삭제", description = "관리자가 예약을 삭제합니다.")
    @DeleteMapping("/{reservationId}")
    public ResponseEntity<Map<String, String>> deleteReservation(@PathVariable Long reservationId) {
        
        log.info("Admin deleting reservation: {}", reservationId);
        
        reservationService.deleteReservationByAdmin(reservationId);
        
        return ResponseEntity.ok(Map.of("message", "예약이 삭제되었습니다."));
    }
    
    /**
     * 예약 통계 조회 (관리자용)
     * 
     * @return 예약 통계 정보
     */
    @Operation(summary = "예약 통계 조회", description = "관리자가 예약 통계를 조회합니다.")
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getReservationStatistics() {
        
        log.info("Admin fetching reservation statistics");
        
        Map<String, Object> statistics = reservationService.getReservationStatistics();
        
        return ResponseEntity.ok(statistics);
    }
    
    /**
     * 예약 거부 (관리자용)
     * 
     * @param reservationId 예약 ID
     * @param request 거부 사유
     * @return 거부된 예약 정보
     */
    @Operation(summary = "예약 거부", description = "관리자가 예약을 거부하고 사유를 저장합니다.")
    @PatchMapping("/{reservationId}/reject")
    public ResponseEntity<CommonResponse<AdminReservationResponse>> rejectReservation(
            @PathVariable Long reservationId,
            @RequestBody Map<String, String> request) {
        
        String reason = request.get("reason");
        log.info("Admin rejecting reservation: {} with reason: {}", reservationId, reason);
        
        AdminReservationResponse reservation = adminService.rejectReservation(reservationId, reason);
        
        return ResponseEntity.ok(CommonResponse.success("예약 거부 처리 완료", reservation));
    }
}
