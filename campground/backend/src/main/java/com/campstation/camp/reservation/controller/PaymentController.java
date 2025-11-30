package com.campstation.camp.reservation.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.campstation.camp.reservation.dto.PaymentResponse;
import com.campstation.camp.reservation.dto.ProcessPaymentRequest;
import com.campstation.camp.reservation.dto.ProcessPaymentResponse;
import com.campstation.camp.reservation.dto.RefundRequest;
import com.campstation.camp.reservation.dto.RefundResponse;
import com.campstation.camp.reservation.service.PaymentService;
import com.campstation.camp.shared.dto.CommonResponse;
import com.campstation.camp.shared.security.annotation.Authenticated;
import com.campstation.camp.shared.security.annotation.OwnerOrAdmin;
import com.campstation.camp.user.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * 결제 컨트롤러
 * 결제 처리 및 환불 관련 REST API를 제공하는 컨트롤러
 *
 * @author CampStation Team
 * @version 1.0
 * @since 2024-01-01
 */
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "결제 API", description = "결제 관련 API")
public class PaymentController {

    private final PaymentService paymentService;
    private final UserService userService;

    @PostMapping("/process")
    @Authenticated
    @Operation(summary = "결제 처리", description = "예약 결제를 처리합니다.")
    public ResponseEntity<CommonResponse<ProcessPaymentResponse>> processPayment(
            @RequestBody ProcessPaymentRequest request) {

        // 현재 인증된 사용자 정보 가져오기
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        // 사용자 정보 조회
        var user = userService.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + username));

        Long userId = user.getId();

        ProcessPaymentResponse response = paymentService.processPayment(userId, request);
        return ResponseEntity.ok(CommonResponse.success(response));
    }

    @GetMapping("/history")
    @Authenticated
    @Operation(summary = "결제 내역 조회", description = "사용자의 결제 내역을 조회합니다.")
    public ResponseEntity<CommonResponse<Page<PaymentResponse>>> getPaymentHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        // 현재 인증된 사용자 정보 가져오기
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        // 사용자 정보 조회
        var user = userService.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + username));

        Long userId = user.getId();

        Pageable pageable = PageRequest.of(page, size);
        Page<PaymentResponse> payments = paymentService.getPaymentHistory(userId, pageable);
        return ResponseEntity.ok(CommonResponse.success(payments));
    }

    @GetMapping("/{id}")
    @Authenticated
    @Operation(summary = "결제 상세 조회", description = "특정 결제의 상세 정보를 조회합니다.")
    public ResponseEntity<CommonResponse<PaymentResponse>> getPaymentById(
            @PathVariable Long id) {

        PaymentResponse payment = paymentService.getPaymentById(id);
        return ResponseEntity.ok(CommonResponse.success(payment));
    }

    @PostMapping("/refund")
    @Authenticated
    @Operation(summary = "결제 환불", description = "완료된 결제를 환불합니다.")
    public ResponseEntity<CommonResponse<RefundResponse>> processRefund(
            @RequestBody RefundRequest request) {

        // 현재 인증된 사용자 정보 가져오기
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        // 사용자 정보 조회
        var user = userService.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + username));

        Long userId = user.getId();

        RefundResponse response = paymentService.processRefund(userId, request);
        return ResponseEntity.ok(CommonResponse.success(response));
    }

    @PostMapping("/{paymentId}/request-confirmation")
    @Authenticated
    @Operation(summary = "입금 확인 요청", description = "사용자가 계좌이체 입금 완료 후 오너에게 확인을 요청합니다.")
    public ResponseEntity<CommonResponse<String>> requestDepositConfirmation(
            @PathVariable Long paymentId) {

        // 현재 인증된 사용자 정보 가져오기
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        // 사용자 정보 조회
        var user = userService.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + username));

        Long userId = user.getId();

        paymentService.requestDepositConfirmation(paymentId, userId);
        return ResponseEntity.ok(CommonResponse.success("입금 확인 요청이 전송되었습니다."));
    }

    @PostMapping("/{paymentId}/confirm-deposit")
    @OwnerOrAdmin
    @Operation(summary = "입금 확인", description = "계좌이체 결제의 입금을 확인하고 완료 처리합니다.")
    public ResponseEntity<CommonResponse<PaymentResponse>> confirmDeposit(
            @PathVariable Long paymentId) {

        PaymentResponse response = paymentService.confirmBankTransferDeposit(paymentId);
        return ResponseEntity.ok(CommonResponse.success(response));
    }

    @PostMapping("/{paymentId}/confirm")
    @Authenticated
    @Operation(summary = "결제 승인", description = "토스페이먼츠 결제를 승인하고 완료 처리합니다. (프론트엔드에서 결제 완료 후 호출)")
    public ResponseEntity<CommonResponse<PaymentResponse>> confirmPayment(
            @PathVariable Long paymentId,
            @RequestParam String paymentKey,
            @RequestParam String orderId,
            @RequestParam int amount) {

        PaymentResponse response = paymentService.verifyAndCompletePayment(paymentKey, paymentId, orderId, amount);
        return ResponseEntity.ok(CommonResponse.success(response));
    }

    @PostMapping("/refunds/{refundId}/confirm")
    @OwnerOrAdmin
    @Operation(summary = "수동 환불 완료 확인", description = "계좌이체 환불을 수동으로 처리한 후 완료 확인합니다. (오너/관리자 전용)")
    public ResponseEntity<CommonResponse<RefundResponse>> confirmManualRefund(
            @PathVariable Long refundId) {

        RefundResponse response = paymentService.confirmManualRefund(refundId);
        return ResponseEntity.ok(CommonResponse.success(response));
    }
}
