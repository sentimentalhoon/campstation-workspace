package com.campstation.camp.auth.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campstation.camp.auth.dto.JwtResponse;
import com.campstation.camp.auth.dto.LoginRequest;
import com.campstation.camp.auth.dto.SignupRequest;
import com.campstation.camp.auth.service.JwtTokenService;
import com.campstation.camp.shared.JwtUtil;
import com.campstation.camp.shared.MetricsService;
import com.campstation.camp.shared.config.CookieConfig;
import com.campstation.camp.shared.dto.CommonResponse;
import com.campstation.camp.shared.file.S3FileService;
import com.campstation.camp.shared.validation.InputValidator;
import com.campstation.camp.user.domain.ProfileImage;
import com.campstation.camp.user.domain.User;
import com.campstation.camp.user.domain.UserRole;
import com.campstation.camp.user.domain.UserStatus;
import com.campstation.camp.user.repository.ProfileImageRepository;
import com.campstation.camp.user.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * CampStation 인증 관련 API 컨트롤러
 *
 * 이 컨트롤러는 사용자 인증, 회원가입, 토큰 갱신 등의 기능을 제공합니다.
 * JWT 토큰 기반 인증과 OAuth2 소셜 로그인을 지원합니다.
 * Java 21 현대적인 구문과 패턴 매칭을 활용한 완벽한 구현
 *
 * @author CampStation Development Team
 * @version 2.0
 * @since 2025-01-01
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication", description = "인증 관련 API")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final JwtTokenService jwtTokenService;
    private final MetricsService metricsService;
    private final InputValidator inputValidator;
    private final CookieConfig cookieConfig;
    private final S3FileService s3FileService;
    private final ProfileImageRepository profileImageRepository;

    /**
     * 로그아웃 (JWT + Redis: 토큰 삭제)
     */
    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "로그아웃", description = "JWT 기반 로그아웃. 서버에서 토큰을 삭제하고 블랙리스트에 등록합니다.")
    public ResponseEntity<CommonResponse<String>> logout(
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            // Authorization 헤더가 없으면 로그아웃만 처리
            if (token == null || token.isEmpty()) {
                log.info("Logout request without token - clearing cookies only");

                metricsService.recordLogout();

                return ResponseEntity.ok()
                        .header(HttpHeaders.SET_COOKIE, cookieConfig.deleteAccessTokenCookie().toString())
                        .header(HttpHeaders.SET_COOKIE, cookieConfig.deleteRefreshTokenCookie().toString())
                        .body(CommonResponse.success("로그아웃되었습니다.", "Logged out successfully"));
            }
            
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            log.info("Logout request received for token: {}", token.substring(0, Math.min(20, token.length())) + "...");
            
            // 토큰에서 username 추출
            String username = jwtUtil.extractUsername(token);
            log.info("Extracted username from token: {}", username);
            
            // Redis에서 토큰 삭제 (username을 키로 사용)
            jwtTokenService.deleteToken(username);
            log.info("Token deleted from Redis for user: {}", username);
            
            // 블랙리스트 등록 (만료시간: 24시간)
            jwtTokenService.blacklistToken(token, 86400_000L);
            log.info("Token blacklisted for user: {}", username);
            
            metricsService.recordLogout();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookieConfig.deleteAccessTokenCookie().toString())
                    .header(HttpHeaders.SET_COOKIE, cookieConfig.deleteRefreshTokenCookie().toString())
                    .body(CommonResponse.success("로그아웃 성공 (토큰 삭제 및 무효화)", null));
        } catch (Exception e) {
            log.error("Logout failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(CommonResponse.error("로그아웃에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * JWT 토큰 유효성 및 Redis 저장 여부 검증
     */
    @GetMapping("/validate")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "토큰 검증", description = "JWT 토큰이 유효하고 Redis에 저장되어 있으며 블랙리스트에 없는지 실시간 검증합니다.")
    public ResponseEntity<CommonResponse<Boolean>> validateToken(@RequestHeader("Authorization") String token) {
        try {
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            if (!jwtUtil.isTokenValid(token)) {
                return ResponseEntity.ok(CommonResponse.success("유효하지 않은 토큰", false));
            }
            String username = jwtUtil.extractUsername(token);
            boolean valid = jwtTokenService.isTokenValid(username, token);
            return ResponseEntity.ok(CommonResponse.success("토큰 검증 결과", valid));
        } catch (Exception e) {
            log.error("Token validation failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(CommonResponse.error("토큰 검증에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 현재 로그인한 사용자 정보 조회
     */
    @GetMapping("/me")
    @Operation(summary = "내 정보 조회", description = "현재 로그인한 사용자의 정보를 반환합니다.")
    public ResponseEntity<CommonResponse<JwtResponse>> getCurrentUser(
            Authentication authentication,
            HttpServletRequest request) {
        try {
            // 인증되지 않은 경우 401 반환
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(CommonResponse.error("인증이 필요합니다."));
            }

            String email = authentication.getName();
            User user = userService.findByEmail(email)
                    .orElseThrow(() -> new IllegalStateException("사용자를 찾을 수 없습니다."));

            // ProfileImage 조회 및 URL 변환
            String thumbnailUrl = null;
            String originalUrl = null;
            ProfileImage profileImage = profileImageRepository.findByUserId(user.getId()).orElse(null);
            if (profileImage != null) {
                thumbnailUrl = s3FileService.generatePublicUrl(profileImage.getThumbnailUrl());
                originalUrl = s3FileService.generatePublicUrl(profileImage.getOriginalUrl());
            }

            // 쿠키에서 accessToken 추출하여 만료 시간 계산
            Long expiresAt = null;
            Long expiresIn = null;
            if (request.getCookies() != null) {
                for (Cookie cookie : request.getCookies()) {
                    if ("accessToken".equals(cookie.getName())) {
                        try {
                            String accessToken = cookie.getValue();
                            java.util.Date expiration = jwtUtil.extractExpiration(accessToken);
                            expiresAt = expiration.getTime(); // 밀리초
                            expiresIn = (expiresAt - System.currentTimeMillis()) / 1000; // 초
                        } catch (Exception e) {
                            log.warn("Failed to extract token expiration: {}", e.getMessage());
                        }
                        break;
                    }
                }
            }

            JwtResponse response = JwtResponse.builder()
                    .userId(user.getId())
                    .email(user.getEmail())
                    .name(user.getName())
                    .role(user.getRole().name())
                    .profileImage(thumbnailUrl) // 호환성 유지
                    .thumbnailUrl(thumbnailUrl)
                    .originalUrl(originalUrl)
                    .expiresAt(expiresAt) // 토큰 만료 시각 (밀리초)
                    .expiresIn(expiresIn) // 남은 시간 (초)
                    .build();

            return ResponseEntity.ok(CommonResponse.success("사용자 정보 조회 성공", response));
        } catch (Exception e) {
            log.error("Failed to get current user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(CommonResponse.error("사용자 정보 조회에 실패했습니다."));
        }
    }

    /**
     * 사용자 로그인
     */
    @PostMapping("/login")
    @Operation(
            summary = "로그인",
            description = """
                    이메일과 비밀번호로 로그인합니다.
                    
                    성공 시 JWT Access Token과 Refresh Token을 발급하며, 
                    HttpOnly 쿠키에도 저장됩니다.
                    """,
            responses = {
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "200",
                            description = "로그인 성공",
                            content = @io.swagger.v3.oas.annotations.media.Content(
                                    mediaType = "application/json",
                                    schema = @io.swagger.v3.oas.annotations.media.Schema(implementation = JwtResponse.class)
                            )
                    ),
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "400",
                            description = "잘못된 요청 (이메일 형식 오류)",
                            content = @io.swagger.v3.oas.annotations.media.Content(
                                    mediaType = "application/json"
                            )
                    ),
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "401",
                            description = "인증 실패 (잘못된 이메일 또는 비밀번호)",
                            content = @io.swagger.v3.oas.annotations.media.Content(
                                    mediaType = "application/json"
                            )
                    )
            }
    )
    public ResponseEntity<CommonResponse<JwtResponse>> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login attempt for user: {}", request.getEmail());

        // 입력 데이터 검증
        if (!inputValidator.isValidEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(CommonResponse.error("유효하지 않은 이메일 형식입니다."));
        }

        try {
            // 인증 시도
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()));

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = (User) userDetails;

            // JWT 토큰 생성
            String accessToken = jwtUtil.generateAccessToken(userDetails);
            String refreshToken = jwtUtil.generateRefreshToken(userDetails);

            // Access Token Redis 저장 (TTL: 24시간 = 86400초)
            try {
                jwtTokenService.saveToken(user.getUsername(), accessToken, 86400L);
            } catch (Exception e) {
                log.warn("Failed to save token to Redis, but continuing login process: {}", e.getMessage());
            }

            // 마지막 로그인 시간 업데이트
            userService.updateLastLoginTime(user.getEmail());

            // ProfileImage 조회 및 URL 변환
            String thumbnailUrl = null;
            String originalUrl = null;
            ProfileImage profileImage = profileImageRepository.findByUserId(user.getId()).orElse(null);
            if (profileImage != null) {
                thumbnailUrl = s3FileService.generatePublicUrl(profileImage.getThumbnailUrl());
                originalUrl = s3FileService.generatePublicUrl(profileImage.getOriginalUrl());
            }

            // 응답 객체 (토큰은 제외, 사용자 정보만 포함)
            JwtResponse response = JwtResponse.builder()
                    .accessToken(accessToken) // 응답에는 포함하되, 쿠키에도 저장
                    .expiresIn(cookieConfig.getJwtExpirationMs() / 1000) // 환경변수에서 읽어온 만료시간 (초 단위)
                    .expiresAt(System.currentTimeMillis() + cookieConfig.getJwtExpirationMs()) // 만료 시각 (밀리초)
                    .userId(user.getId())
                    .email(user.getEmail())
                    .name(user.getName())
                    .role(user.getRole().name())
                    .profileImage(thumbnailUrl) // 호환성 유지
                    .thumbnailUrl(thumbnailUrl)
                    .originalUrl(originalUrl)
                    .build();

            log.info("Login successful for user: {}", request.getEmail());
            metricsService.recordLoginSuccess();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookieConfig.createAccessTokenCookie(accessToken).toString())
                    .header(HttpHeaders.SET_COOKIE, cookieConfig.createRefreshTokenCookie(refreshToken).toString())
                    .body(CommonResponse.success("로그인 성공", response));

        } catch (Exception e) {
            log.error("Login failed for user: {} - {}", request.getEmail(), e.getMessage());
            metricsService.recordLoginFailure();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(CommonResponse.error("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요."));
        }
    }

    /**
     * 사용자 회원가입
     */
    @PostMapping("/signup")
    @Operation(summary = "회원가입", description = "새로운 사용자를 등록합니다.")
    public ResponseEntity<CommonResponse<JwtResponse>> signup(@Valid @RequestBody SignupRequest request) {
        log.info("Signup attempt for user: {}", request.getUsername());

        // 입력 데이터 검증
        if (!inputValidator.isValidEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(CommonResponse.error("유효하지 않은 이메일 형식입니다."));
        }

        if (!inputValidator.isValidPassword(request.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(CommonResponse.error("비밀번호가 보안 요구사항을 충족하지 않습니다. 최소 8자, 숫자 포함"));
        }

        if (!inputValidator.isValidUsername(request.getUsername())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(CommonResponse.error("유효하지 않은 사용자명 형식입니다."));
        }

        if (!inputValidator.isValidPhoneNumber(request.getPhone())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(CommonResponse.error("유효하지 않은 전화번호 형식입니다."));
        }

        if (!inputValidator.isValidTextLength(request.getName(), 1, 50)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(CommonResponse.error("이름은 1-50자 사이여야 합니다."));
        }

        try {
            // 비밀번호 확인
            if (!request.getPassword().equals(request.getConfirmPassword())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(CommonResponse.error("비밀번호가 일치하지 않습니다."));
            }

            // 중복 확인
            if (userService.existsByUsernameOrEmail(request.getUsername(), request.getEmail())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(CommonResponse.error("이미 존재하는 사용자명 또는 이메일입니다."));
            }

            // 사용자 생성
            User user = User.builder()
                    .username(request.getUsername())
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .name(request.getName())
                    .phone(request.getPhone())
                    .role(UserRole.USER)
                    .status(UserStatus.ACTIVE)
                    .build();

            User savedUser = userService.createUser(user);

            // JWT 토큰 생성
            String accessToken = jwtUtil.generateAccessToken(savedUser);
            String refreshToken = jwtUtil.generateRefreshToken(savedUser);

            // JWT 토큰 Redis 저장 (key: username, value: accessToken, 만료: 24시간)
            jwtTokenService.saveToken(savedUser.getUsername(), accessToken, 86400_000L);

            // ProfileImage 조회 및 URL 변환
            String thumbnailUrl = null;
            String originalUrl = null;
            ProfileImage profileImage = profileImageRepository.findByUserId(savedUser.getId()).orElse(null);
            if (profileImage != null) {
                thumbnailUrl = s3FileService.generatePublicUrl(profileImage.getThumbnailUrl());
                originalUrl = s3FileService.generatePublicUrl(profileImage.getOriginalUrl());
            }

            JwtResponse response = JwtResponse.builder()
                    .accessToken(accessToken)
                    .expiresIn(cookieConfig.getJwtExpirationMs() / 1000) // 환경변수에서 읽어온 만료시간 (초 단위)
                    .expiresAt(System.currentTimeMillis() + cookieConfig.getJwtExpirationMs()) // 만료 시각 (밀리초)
                    .userId(savedUser.getId())
                    .email(savedUser.getEmail())
                    .name(savedUser.getName())
                    .role(savedUser.getRole().name())
                    .profileImage(thumbnailUrl) // 호환성 유지
                    .thumbnailUrl(thumbnailUrl)
                    .originalUrl(originalUrl)
                    .build();

            log.info("Signup successful for user: {}", request.getUsername());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .header(HttpHeaders.SET_COOKIE, cookieConfig.createAccessTokenCookie(accessToken).toString())
                    .header(HttpHeaders.SET_COOKIE, cookieConfig.createRefreshTokenCookie(refreshToken).toString())
                    .body(CommonResponse.success("회원가입 성공", response));

        } catch (Exception e) {
            log.error("Signup failed for user: {} - {}", request.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(CommonResponse.error("회원가입에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 토큰 새로고침
     */
    @PostMapping("/refresh")
    @Operation(summary = "토큰 새로고침", description = "HttpOnly 쿠키의 Refresh Token을 사용하여 새로운 Access Token을 발급합니다.")
    public ResponseEntity<CommonResponse<JwtResponse>> refreshToken(HttpServletRequest request) {
        try {
            String refreshToken = null;

            // 모든 쿠키를 순회하면서 refreshToken 찾기
            if (request.getCookies() != null) {
                for (Cookie cookie : request.getCookies()) {
                    if ("refreshToken".equals(cookie.getName())) {
                        refreshToken = cookie.getValue();
                        break;
                    }
                }
            }

            if (refreshToken == null || refreshToken.isEmpty()) {
                log.warn("Refresh token is missing");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(CommonResponse.error("Refresh token이 없습니다."));
            }

            // refresh token 검증
            if (jwtUtil.isTokenValid(refreshToken) && !jwtTokenService.isTokenBlacklisted(refreshToken)) {
                String username = jwtUtil.extractUsername(refreshToken);
                UserDetails userDetails = userService.loadUserByUsername(username);
                User user = (User) userDetails;

                String newAccessToken = jwtUtil.generateAccessToken(userDetails);
                String newRefreshToken = jwtUtil.generateRefreshToken(userDetails);

                // Redis 저장 (TTL: 2시간)
                jwtTokenService.saveToken(user.getUsername(), newAccessToken, cookieConfig.getJwtExpirationMs() / 1000);

                // ProfileImage 조회 및 URL 변환
                String thumbnailUrl = null;
                String originalUrl = null;
                ProfileImage profileImage = profileImageRepository.findByUserId(user.getId()).orElse(null);
                if (profileImage != null) {
                    thumbnailUrl = s3FileService.generatePublicUrl(profileImage.getThumbnailUrl());
                    originalUrl = s3FileService.generatePublicUrl(profileImage.getOriginalUrl());
                }

                JwtResponse response = JwtResponse.builder()
                        .accessToken(newAccessToken)
                        .expiresIn(cookieConfig.getJwtExpirationMs() / 1000)
                        .expiresAt(System.currentTimeMillis() + cookieConfig.getJwtExpirationMs()) // 만료 시각 (밀리초)
                        .userId(user.getId())
                        .email(user.getEmail())
                        .name(user.getName())
                        .role(user.getRole().name())
                        .profileImage(thumbnailUrl) // 호환성 유지
                        .thumbnailUrl(thumbnailUrl)
                        .originalUrl(originalUrl)
                        .build();

                log.info("Token refresh successful for user: {}", username);

                return ResponseEntity.ok()
                        .header(HttpHeaders.SET_COOKIE, cookieConfig.createAccessTokenCookie(newAccessToken).toString())
                        .header(HttpHeaders.SET_COOKIE, cookieConfig.createRefreshTokenCookie(newRefreshToken).toString())
                        .body(CommonResponse.success("토큰 새로고침 성공", response));
            }

            log.warn("Invalid or blacklisted refresh token");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(CommonResponse.error("유효하지 않은 토큰입니다."));

        } catch (Exception e) {
            log.error("Token refresh failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(CommonResponse.error("토큰 새로고침에 실패했습니다."));
        }
    }

}
