package com.campstation.camp.owner.controller;

import java.util.Map;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.campstation.camp.campground.dto.CampgroundResponse;
import com.campstation.camp.owner.dto.OwnerDashboardStatsResponse;
import com.campstation.camp.owner.service.OwnerService;
import com.campstation.camp.reservation.dto.RefundRequest;
import com.campstation.camp.reservation.dto.RefundResponse;
import com.campstation.camp.reservation.dto.ReservationResponse;
import com.campstation.camp.shared.dto.CommonResponse;
import com.campstation.camp.shared.security.annotation.OwnerOrAdmin;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Owner 컨트롤러
 * Owner 전용 기능을 제공하는 REST API 컨트롤러
 */
@RestController
@RequestMapping("/api/v1/owner")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Owner", description = "캠핑장 소유자 API")
public class OwnerController {

    private final OwnerService ownerService;

    /**
     * Owner의 캠핑장 목록 조회
     */
    @Operation(summary = "Owner의 캠핑장 목록 조회", description = "로그인한 Owner의 모든 캠핑장을 조회합니다.")
    @OwnerOrAdmin
    @GetMapping("/campgrounds")
    public ResponseEntity<CommonResponse<Page<CampgroundResponse>>> getOwnerCampgrounds(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        String email = authentication.getName();
        Pageable pageable = PageRequest.of(page, size);
        Page<CampgroundResponse> campgrounds = ownerService.getOwnerCampgrounds(email, pageable);
        
        return ResponseEntity.ok(CommonResponse.success("캠핑장 목록 조회 성공", campgrounds));
    }

    /**
     * Owner 대시보드 통계 조회
     */
    @Operation(summary = "Owner 대시보드 통계", description = "로그인한 Owner의 대시보드 통계를 조회합니다.")
    @OwnerOrAdmin
    @GetMapping("/dashboard/stats")
    @Cacheable(value = "ownerDashboardStats", key = "#authentication.name", unless = "#result == null")
    public ResponseEntity<CommonResponse<OwnerDashboardStatsResponse>> getOwnerDashboardStats(
            Authentication authentication) {
        
        String email = authentication.getName();
        OwnerDashboardStatsResponse stats = ownerService.getOwnerDashboardStats(email);
        
        return ResponseEntity.ok(CommonResponse.success("대시보드 통계 조회 성공", stats));
    }

    /**
     * Owner의 예약 목록 조회
     */
    @Operation(summary = "Owner의 예약 목록 조회", description = "로그인한 Owner의 캠핑장에 대한 모든 예약을 조회합니다.")
    @OwnerOrAdmin
    @GetMapping("/reservations")
    public ResponseEntity<CommonResponse<Page<ReservationResponse>>> getOwnerReservations(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        
        String email = authentication.getName();
        Pageable pageable = PageRequest.of(page, size);
        Page<ReservationResponse> reservations = ownerService.getOwnerReservations(email, pageable);
        
        return ResponseEntity.ok(CommonResponse.success("예약 목록 조회 성공", reservations));
    }

    /**
     * Owner의 예약 상세 조회
     */
    @Operation(summary = "Owner의 예약 상세 조회", description = "Owner의 캠핑장 예약 상세 정보를 조회합니다.")
    @OwnerOrAdmin
    @GetMapping("/reservations/{reservationId}")
    public ResponseEntity<CommonResponse<ReservationResponse>> getOwnerReservation(
            Authentication authentication,
            @PathVariable Long reservationId) {
        
        String email = authentication.getName();
        ReservationResponse reservation = ownerService.getOwnerReservation(email, reservationId);
        
        return ResponseEntity.ok(CommonResponse.success("예약 조회 성공", reservation));
    }

    /**
     * Owner의 예약 상태 변경
     */
    @Operation(summary = "Owner의 예약 상태 변경", description = "Owner가 자신의 캠핑장 예약 상태를 변경합니다.")
    @OwnerOrAdmin
    @PatchMapping("/reservations/{reservationId}/status")
    public ResponseEntity<CommonResponse<ReservationResponse>> updateReservationStatus(
            Authentication authentication,
            @PathVariable Long reservationId,
            @RequestBody Map<String, String> statusUpdate) {
        
        String email = authentication.getName();
        String status = statusUpdate.get("status");
        log.info("Owner {} updating reservation {} status to: {}", email, reservationId, status);
        
        ReservationResponse updatedReservation = ownerService.updateReservationStatus(email, reservationId, status);
        
        return ResponseEntity.ok(CommonResponse.success("예약 상태 변경 성공", updatedReservation));
    }

    /**
     * Owner의 환불 처리 (제한 없음)
     */
    @Operation(summary = "Owner의 환불 처리", description = "Owner가 자신의 캠핑장 예약에 대해 환불을 처리합니다. 당일 환불 및 전액 환불이 가능합니다.")
    @OwnerOrAdmin
    @PostMapping("/payments/{paymentId}/refund")
    public ResponseEntity<CommonResponse<RefundResponse>> processOwnerRefund(
            Authentication authentication,
            @PathVariable Long paymentId,
            @RequestBody RefundRequest request) {
        
        String email = authentication.getName();
        log.info("Owner {} processing refund for payment {}: amount={}", 
            email, paymentId, request.getRefundAmount());
        
        RefundResponse refundResponse = ownerService.processOwnerRefund(email, paymentId, request);
        
        return ResponseEntity.ok(CommonResponse.success("환불 처리 성공", refundResponse));
    }

    /**
     * Owner의 모든 캠핑장 리뷰 조회
     */
    @Operation(summary = "Owner의 리뷰 목록 조회", description = "로그인한 Owner의 모든 캠핑장에 대한 리뷰를 한 번에 조회합니다.")
    @OwnerOrAdmin
    @GetMapping("/reviews")
    public ResponseEntity<CommonResponse<Page<com.campstation.camp.review.dto.ReviewResponse>>> getOwnerReviews(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        
        String email = authentication.getName();
        Pageable pageable = PageRequest.of(page, size);
        Page<com.campstation.camp.review.dto.ReviewResponse> reviews = ownerService.getOwnerReviews(email, pageable);
        
        return ResponseEntity.ok(CommonResponse.success("리뷰 목록 조회 성공", reviews));
    }
}
