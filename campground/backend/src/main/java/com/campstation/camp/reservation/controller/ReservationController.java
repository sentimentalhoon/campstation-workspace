package com.campstation.camp.reservation.controller;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campstation.camp.reservation.dto.CreateReservationRequest;
import com.campstation.camp.reservation.dto.GuestReservationLookupRequest;
import com.campstation.camp.reservation.dto.GuestReservationRequest;
import com.campstation.camp.reservation.dto.ReservationResponse;
import com.campstation.camp.reservation.dto.UpdateReservationRequest;
import com.campstation.camp.reservation.service.ReservationService;
import com.campstation.camp.shared.dto.CommonResponse;
import com.campstation.camp.shared.security.annotation.Authenticated;
import com.campstation.camp.shared.validation.InputValidator;
import com.campstation.camp.user.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 예약 관리 컨트롤러
 * 
 * - 회원 예약 CRUD: 인증 필요, Service에서 예약자 본인 확인
 * - 비회원 예약: Public
 * - 예약 날짜 조회: Public (캘린더용)
 * 
 * @author CampStation Team
 * @version 1.0
 * @since 2024-01-01
 */
@Tag(name = "예약 관리", description = "캠핑장 예약 관련 API")
@RestController
@RequestMapping("/api/v1/reservations")
@RequiredArgsConstructor
@Slf4j
public class ReservationController {
    
    private final ReservationService reservationService;
    private final UserService userService;
    private final InputValidator inputValidator;
    
    /**
     * 예약 생성
     * 
     * @param request 예약 생성 요청
     * @param authentication 인증 정보
     * @return 생성된 예약 정보
     */
    @Operation(summary = "예약 생성", description = "새로운 캠핑장 예약을 생성합니다.")
    @PostMapping
    @Authenticated
    public ResponseEntity<ReservationResponse> createReservation(
            @Valid @RequestBody CreateReservationRequest request,
            Authentication authentication) {
        
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Long userId = getUserIdFromUsername(userDetails.getUsername());
        
        log.info("Creating reservation for user: {}, campground: {}", 
                userId, request.getCampgroundId());
        
        ReservationResponse response = reservationService.createReservation(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * 예약 조회
     * 
     * @param reservationId 예약 ID
     * @param authentication 인증 정보
     * @return 예약 정보
     */
    @Operation(summary = "예약 조회", description = "예약 ID로 예약 정보를 조회합니다.")
    @GetMapping("/{reservationId}")
    @Authenticated
    public ResponseEntity<ReservationResponse> getReservation(
            @Parameter(description = "예약 ID") @PathVariable Long reservationId,
            Authentication authentication) {
        
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Long userId = getUserIdFromUsername(userDetails.getUsername());
        
        ReservationResponse response = reservationService.getReservation(reservationId, userId);
        return ResponseEntity.ok(response);
    }
    
        /**
     * 내 예약 목록 조회
     *
     * @param authentication 인증 정보
     * @param pageable 페이징 정보
     * @return 예약 목록
     */
    @Operation(summary = "내 예약 목록 조회", description = "현재 사용자의 모든 예약 목록을 조회합니다.")
    @GetMapping("/my")
    @Authenticated
    public ResponseEntity<CommonResponse<Page<ReservationResponse>>> getMyReservations(
            Authentication authentication,
            @PageableDefault(size = 10) Pageable pageable) {

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Long userId = getUserIdFromUsername(userDetails.getUsername());

        Page<ReservationResponse> reservations = reservationService.getUserReservations(userId, pageable);

        return ResponseEntity.ok(
                CommonResponse.success("예약 목록 조회가 완료되었습니다.", reservations)
        );
    }

    /**
     * 예약 수정
     * 
     * @param reservationId 예약 ID
     * @param request 예약 수정 요청
     * @param authentication 인증 정보
     * @return 수정된 예약 정보
     */
    @Operation(summary = "예약 수정", description = "기존 예약 정보를 수정합니다.")
    @PutMapping("/{reservationId}")
    @Authenticated
    public ResponseEntity<ReservationResponse> updateReservation(
            @Parameter(description = "예약 ID") @PathVariable Long reservationId,
            @Valid @RequestBody UpdateReservationRequest request,
            Authentication authentication) {
        
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Long userId = getUserIdFromUsername(userDetails.getUsername());
        
        log.info("Updating reservation: {} for user: {}", reservationId, userId);
        
        ReservationResponse response = reservationService.updateReservation(reservationId, request, userId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 예약 취소
     * 
     * @param reservationId 예약 ID
     * @param authentication 인증 정보
     * @return 성공 응답
     */
    @Operation(summary = "예약 취소", description = "예약을 취소합니다.")
    @DeleteMapping("/{reservationId}")
    @Authenticated
    public ResponseEntity<Void> cancelReservation(
            @Parameter(description = "예약 ID") @PathVariable Long reservationId,
            Authentication authentication) {
        
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Long userId = getUserIdFromUsername(userDetails.getUsername());
        
        log.info("Cancelling reservation: {} for user: {}", reservationId, userId);
        
        reservationService.cancelReservation(reservationId, userId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * 사용자 예약 삭제 (soft delete)
     * 
     * @param reservationId 예약 ID
     * @param authentication 인증 정보
     * @return 성공 응답
     */
    @Operation(summary = "예약 삭제", description = "사용자가 보기 싫은 예약을 삭제합니다 (실제로는 숨김 처리).")
    @DeleteMapping("/{reservationId}/soft-delete")
    @Authenticated
    public ResponseEntity<Void> deleteReservationByUser(
            @Parameter(description = "예약 ID") @PathVariable Long reservationId,
            Authentication authentication) {
        
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Long userId = getUserIdFromUsername(userDetails.getUsername());
        
        log.info("User {} soft-deleting reservation: {}", userId, reservationId);
        
        reservationService.deleteReservationByUser(reservationId, userId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * 비회원 예약 생성
     * 
     * @param request 비회원 예약 생성 요청
     * @return 생성된 예약 정보
     */
    @Operation(summary = "비회원 예약 생성", description = "로그인하지 않은 사용자의 캠핑장 예약을 생성합니다.")
    @PostMapping("/guest")
    public ResponseEntity<CommonResponse<ReservationResponse>> createGuestReservation(
            @Valid @RequestBody GuestReservationRequest request) {
        
        log.info("Creating guest reservation for campground: {}, guest: {}", 
                request.campgroundId(), request.guestName());

        // 입력 데이터 검증
        if (!inputValidator.isValidTextLength(request.guestName(), 1, 50)) {
            return ResponseEntity.badRequest()
                .body(CommonResponse.error("게스트 이름은 1-50자 사이여야 합니다."));
        }

        if (!inputValidator.isValidPhoneNumber(request.guestPhone())) {
            return ResponseEntity.badRequest()
                .body(CommonResponse.error("유효하지 않은 전화번호 형식입니다."));
        }

        if (!inputValidator.isValidEmail(request.guestEmail())) {
            return ResponseEntity.badRequest()
                .body(CommonResponse.error("유효하지 않은 이메일 형식입니다."));
        }

        try {
            ReservationResponse response = reservationService.createGuestReservation(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(CommonResponse.success("비회원 예약이 성공적으로 생성되었습니다.", response));
        } catch (Exception e) {
            log.error("Failed to create guest reservation", e);
            return ResponseEntity.badRequest()
                    .body(CommonResponse.error(e.getMessage()));
        }
    }

    /**
     * 비회원 예약 조회
     * 
     * @param request 비회원 예약 조회 요청
     * @return 예약 정보 목록
     */
    @Operation(summary = "비회원 예약 조회", description = "연락처, 이메일, 비밀번호로 비회원 예약을 조회합니다.")
    @PostMapping("/guest/lookup")
    public ResponseEntity<CommonResponse<java.util.List<ReservationResponse>>> getGuestReservations(
            @Valid @RequestBody GuestReservationLookupRequest request) {

        log.info("Looking up guest reservations for phone: {}, email: {}, password: {}",
                request.getGuestPhone(), request.getGuestEmail(), request.getGuestPassword());

        try {
            java.util.List<ReservationResponse> reservations = reservationService.getGuestReservations(request);
            return ResponseEntity.ok(CommonResponse.success("비회원 예약 조회가 완료되었습니다.", reservations));
        } catch (Exception e) {
            log.error("Failed to lookup guest reservations", e);
            return ResponseEntity.badRequest()
                    .body(CommonResponse.error(e.getMessage()));
        }
    }

    /**
     * 특정 사이트의 예약된 날짜 범위 조회
     *
     * @param siteId 사이트 ID
     * @return 예약된 날짜 범위 목록
     */
    @Operation(summary = "사이트 예약 날짜 조회", description = "특정 사이트의 예약된 날짜 범위를 조회합니다.")
    @GetMapping("/sites/{siteId}/reserved-dates")
    public ResponseEntity<CommonResponse<java.util.List<java.util.Map<String, LocalDate>>>> getReservedDatesForSite(
            @Parameter(description = "사이트 ID") @PathVariable Long siteId) {

        log.info("Getting reserved dates for site: {}", siteId);

        try {
            java.util.List<java.util.Map<String, LocalDate>> reservedDates =
                reservationService.getReservedDateRangesForSite(siteId);
            return ResponseEntity.ok(CommonResponse.success("예약된 날짜 조회가 완료되었습니다.", reservedDates));
        } catch (Exception e) {
            log.error("Failed to get reserved dates for site: {}", siteId, e);
            return ResponseEntity.badRequest()
                    .body(CommonResponse.error("예약된 날짜 조회에 실패했습니다."));
        }
    }

    /**
     * 캠핑장의 모든 사이트 예약 날짜 조회 (일괄 조회)
     *
     * @param campgroundId 캠핑장 ID
     * @return 사이트별 예약된 날짜 범위 맵 (key: siteId, value: 예약 날짜 범위 목록)
     */
    @Operation(summary = "캠핑장 사이트 예약 날짜 일괄 조회", description = "캠핑장의 모든 사이트 예약 날짜를 한 번에 조회합니다.")
    @GetMapping("/campgrounds/{campgroundId}/reserved-dates")
    public ResponseEntity<CommonResponse<java.util.Map<Long, java.util.List<java.util.Map<String, LocalDate>>>>> getReservedDatesForCampground(
            @Parameter(description = "캠핑장 ID") @PathVariable Long campgroundId) {

        log.info("Getting reserved dates for all sites in campground: {}", campgroundId);

        try {
            java.util.Map<Long, java.util.List<java.util.Map<String, LocalDate>>> reservedDatesBySite =
                reservationService.getReservedDateRangesForCampground(campgroundId);
            return ResponseEntity.ok(CommonResponse.success("캠핑장 예약 날짜 조회가 완료되었습니다.", reservedDatesBySite));
        } catch (Exception e) {
            log.error("Failed to get reserved dates for campground: {}", campgroundId, e);
            return ResponseEntity.badRequest()
                    .body(CommonResponse.error("캠핑장 예약 날짜 조회에 실패했습니다."));
        }
    }

    /**
     * 사용자명(이메일)으로부터 사용자 ID 조회
     * - User 엔티티 대신 UserResponseDto 캐싱을 활용
     */
    private Long getUserIdFromUsername(String username) {
        return userService.getUserIdByEmail(username);
    }
}
