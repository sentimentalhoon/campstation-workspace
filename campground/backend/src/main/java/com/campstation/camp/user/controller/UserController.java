package com.campstation.camp.user.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campstation.camp.shared.dto.CommonResponse;
import com.campstation.camp.shared.file.S3FileService;
import com.campstation.camp.shared.security.annotation.Authenticated;
import com.campstation.camp.shared.validation.InputValidator;
import com.campstation.camp.user.domain.User;
import com.campstation.camp.user.dto.ChangePasswordRequest;
import com.campstation.camp.user.dto.ProfileUpdateRequest;
import com.campstation.camp.user.dto.RefundAccountUpdateRequest;
import com.campstation.camp.user.dto.UserResponseDto;
import com.campstation.camp.user.repository.ProfileImageRepository;
import com.campstation.camp.user.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 사용자 프로필 관리 컨트롤러
 * 
 * /users/profile (GET) - 프로필 조회
 * /users/profile (PUT) - 프로필 수정
 * /users/password (PUT) - 비밀번호 변경
 * 
 * 참고: /auth/me는 인증 후 초기 사용자 정보 조회용
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "User", description = "사용자 프로필 관리 API")
@SecurityRequirement(name = "bearer-jwt")
public class UserController {

    private final UserService userService;
    private final InputValidator inputValidator;
    private final S3FileService s3FileService;
    private final ProfileImageRepository profileImageRepository;

    /**
     * 사용자 프로필 조회
     */
    @GetMapping("/profile")
    @Authenticated
    @Operation(summary = "프로필 조회", description = "현재 로그인한 사용자의 프로필 정보를 조회합니다.")
    public ResponseEntity<CommonResponse<UserResponseDto>> getProfile(Authentication authentication) {
        String email = authentication.getName();
        log.info("Getting profile for user: {}", email);

        User user = userService.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        UserResponseDto userResponse = UserResponseDto.fromEntity(user, s3FileService, profileImageRepository);
        return ResponseEntity.ok(CommonResponse.success("프로필 조회 성공", userResponse));
    }

    /**
     * 사용자 프로필 업데이트
     */
    @PutMapping("/profile")
    @Authenticated
    @Operation(summary = "프로필 업데이트", description = "사용자의 이름, 전화번호, 프로필 이미지를 업데이트합니다.")
    public ResponseEntity<CommonResponse<UserResponseDto>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody ProfileUpdateRequest request) {

        String email = authentication.getName();
        log.info("Updating profile for user: {}", email);

        // 입력 데이터 검증
        if (!inputValidator.isValidTextLength(request.getName(), 1, 50)) {
            return ResponseEntity.badRequest()
                .body(CommonResponse.error("이름은 1-50자 사이여야 합니다."));
        }

        if (!inputValidator.isValidPhoneNumber(request.getPhone())) {
            return ResponseEntity.badRequest()
                .body(CommonResponse.error("유효하지 않은 전화번호 형식입니다."));
        }

        User updatedUser = userService.updateProfile(
            email, 
            request.getName(), 
            request.getPhone(), 
            request.getThumbnailUrl(), 
            request.getOriginalUrl()
        );
        UserResponseDto userResponse = UserResponseDto.fromEntity(updatedUser, s3FileService, profileImageRepository);
        return ResponseEntity.ok(CommonResponse.success("프로필 업데이트 성공", userResponse));
    }

    /**
     * 비밀번호 변경
     */
    @PutMapping("/password")
    @Authenticated
    @Operation(summary = "비밀번호 변경", description = "사용자의 비밀번호를 변경합니다.")
    public ResponseEntity<CommonResponse<String>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {

        String email = authentication.getName();
        log.info("Changing password for user: {}", email);

        // 입력 데이터 검증
        if (!inputValidator.isValidPassword(request.getNewPassword())) {
            return ResponseEntity.badRequest()
                .body(CommonResponse.error("새 비밀번호가 보안 요구사항을 충족하지 않습니다."));
        }

        userService.changePassword(email, request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(CommonResponse.success("비밀번호 변경 성공", null));
    }

    /**
     * 환불 계좌 정보 업데이트
     */
    @PutMapping("/refund-account")
    @Authenticated
    @Operation(summary = "환불 계좌 정보 업데이트", description = "계좌이체 환불을 위한 사용자의 계좌 정보를 업데이트합니다.")
    public ResponseEntity<CommonResponse<UserResponseDto>> updateRefundAccount(
            Authentication authentication,
            @Valid @RequestBody RefundAccountUpdateRequest request) {

        String email = authentication.getName();
        log.info("Updating refund account for user: {}", email);

        // 입력 데이터 검증
        if (request.getRefundBankName() != null && !inputValidator.isValidTextLength(request.getRefundBankName(), 1, 50)) {
            return ResponseEntity.badRequest()
                .body(CommonResponse.error("은행명은 1-50자 사이여야 합니다."));
        }

        if (request.getRefundAccountNumber() != null && !inputValidator.isValidTextLength(request.getRefundAccountNumber(), 1, 50)) {
            return ResponseEntity.badRequest()
                .body(CommonResponse.error("계좌번호는 1-50자 사이여야 합니다."));
        }

        if (request.getRefundAccountHolder() != null && !inputValidator.isValidTextLength(request.getRefundAccountHolder(), 1, 50)) {
            return ResponseEntity.badRequest()
                .body(CommonResponse.error("예금주명은 1-50자 사이여야 합니다."));
        }

        User updatedUser = userService.updateRefundAccount(
            email, 
            request.getRefundBankName(), 
            request.getRefundAccountNumber(), 
            request.getRefundAccountHolder()
        );
        UserResponseDto userResponse = UserResponseDto.fromEntity(updatedUser, s3FileService, profileImageRepository);
        return ResponseEntity.ok(CommonResponse.success("환불 계좌 정보 업데이트 성공", userResponse));
    }
}
