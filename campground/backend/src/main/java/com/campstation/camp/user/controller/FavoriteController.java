package com.campstation.camp.user.controller;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campstation.camp.shared.dto.CommonResponse;
import com.campstation.camp.shared.dto.PageResponse;
import com.campstation.camp.shared.security.annotation.Authenticated;
import com.campstation.camp.user.domain.User;
import com.campstation.camp.user.dto.FavoriteResponseDto;
import com.campstation.camp.user.dto.FavoriteToggleRequest;
import com.campstation.camp.user.service.FavoriteService;
import com.campstation.camp.user.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 찜하기 관련 API 컨트롤러
 * 최신 Spring Boot 기법과 완벽한 예외 처리, 캐싱 전략 적용
 */
@RestController
@RequestMapping("/api/v1/favorites")
@RequiredArgsConstructor
@Slf4j
@Validated
@Tag(name = "Favorites", description = "찜하기 관련 API")
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final UserService userService;

    /**
     * 캠핑장 찜하기 토글 (추가/제거)
     */
    @PostMapping("/toggle")
    @Authenticated
    @Operation(
        summary = "찜하기 토글",
        description = "캠핑장을 찜하기하거나 찜하기를 해제합니다. 이미 찜하기한 경우 제거, 아닌 경우 추가합니다."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "찜하기 추가됨"),
        @ApiResponse(responseCode = "204", description = "찜하기 제거됨"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "404", description = "캠핑장을 찾을 수 없음")
    })
    public ResponseEntity<CommonResponse<FavoriteResponseDto>> toggleFavorite(
            @Valid @RequestBody FavoriteToggleRequest request,
            Authentication authentication) {

        String email = authentication.getName();
        Long userId = getCurrentUserId(email);

        log.info("Toggle favorite request - user: {}, campground: {}", userId, request.campgroundId());

        FavoriteResponseDto result = favoriteService.toggleFavorite(userId, request.campgroundId());

        if (result == null) {
            // 찜하기 제거됨
            return ResponseEntity.noContent().build();
        } else {
            // 찜하기 추가됨
            return ResponseEntity.ok(CommonResponse.success("찜하기가 추가되었습니다.", result));
        }
    }

    /**
     * 캠핑장 찜하기 추가 (기존 방식 유지)
     */
    @PostMapping("/campgrounds/{campgroundId}")
    @Authenticated
    @Operation(
        summary = "캠핑장 찜하기 추가",
        description = "특정 캠핑장을 찜합니다."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "찜하기 추가 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 또는 이미 찜하기한 캠핑장"),
        @ApiResponse(responseCode = "404", description = "캠핑장을 찾을 수 없음")
    })
    public ResponseEntity<CommonResponse<FavoriteResponseDto>> addFavorite(
            @Parameter(description = "캠핑장 ID", example = "1")
            @PathVariable
            @Positive(message = "캠핑장 ID는 양수여야 합니다")
            Long campgroundId,
            Authentication authentication) {

        String email = authentication.getName();
        Long userId = getCurrentUserId(email);

        log.info("Add favorite request - user: {}, campground: {}", userId, campgroundId);

        validateCampgroundId(campgroundId);

        FavoriteResponseDto response = favoriteService.addFavorite(userId, campgroundId);
        return ResponseEntity.ok(CommonResponse.success("찜하기가 추가되었습니다.", response));
    }

    /**
     * 캠핑장 찜하기 제거
     */
    @DeleteMapping("/campgrounds/{campgroundId}")
    @Authenticated
    @Operation(
        summary = "찜하기 제거",
        description = "특정 캠핑장의 찜하기를 제거합니다."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "찜하기 제거 성공"),
        @ApiResponse(responseCode = "404", description = "찜하기를 찾을 수 없음")
    })
    public ResponseEntity<CommonResponse<Void>> removeFavorite(
            @Parameter(description = "캠핑장 ID", example = "1")
            @PathVariable
            @Positive(message = "캠핑장 ID는 양수여야 합니다")
            Long campgroundId,
            Authentication authentication) {

        String email = authentication.getName();
        Long userId = getCurrentUserId(email);

        log.info("Remove favorite request - user: {}, campground: {}", userId, campgroundId);

        validateCampgroundId(campgroundId);

        favoriteService.removeFavorite(userId, campgroundId);
        return ResponseEntity.ok(CommonResponse.success("찜하기가 제거되었습니다.", null));
    }

    /**
     * 사용자의 찜하기 목록 조회 (페이징 지원)
     */
    @GetMapping
    @Authenticated
    @Operation(
        summary = "찜하기 목록 조회",
        description = "현재 사용자의 찜하기 목록을 페이징하여 조회합니다."
    )
    @ApiResponse(responseCode = "200", description = "찜하기 목록 조회 성공")
    public ResponseEntity<CommonResponse<PageResponse<FavoriteResponseDto>>> getUserFavorites(
            @PageableDefault(size = 100, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable,
            Authentication authentication) {

        String email = authentication.getName();
        Long userId = getCurrentUserId(email);

        log.info("Get user favorites request - user: {}, page: {}, size: {}",
                userId, pageable.getPageNumber(), pageable.getPageSize());

        PageResponse<FavoriteResponseDto> favorites = favoriteService.getUserFavorites(userId, pageable);
        return ResponseEntity.ok(CommonResponse.success(favorites));
    }

    /**
     * 사용자의 찜하기 목록 조회 (페이징 미지원 - 하위 호환성)
     */
    @GetMapping("/all")
    @Authenticated
    @Operation(
        summary = "찜하기 목록 전체 조회",
        description = "현재 사용자의 모든 찜하기 목록을 조회합니다."
    )
    @ApiResponse(responseCode = "200", description = "찜하기 목록 조회 성공")
    public ResponseEntity<CommonResponse<List<FavoriteResponseDto>>> getAllUserFavorites(
            Authentication authentication) {

        String email = authentication.getName();
        Long userId = getCurrentUserId(email);

        log.info("Get all user favorites request - user: {}", userId);

        List<FavoriteResponseDto> favorites = favoriteService.getUserFavorites(userId);
        return ResponseEntity.ok(CommonResponse.success(favorites));
    }

    /**
     * 캠핑장 찜하기 여부 확인
     */
    @GetMapping("/campgrounds/{campgroundId}/status")
    @Authenticated
    @Operation(
        summary = "찜하기 상태 확인",
        description = "특정 캠핑장의 찜하기 상태를 확인합니다."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "찜하기 상태 확인 성공"),
        @ApiResponse(responseCode = "404", description = "캠핑장을 찾을 수 없음")
    })
    public ResponseEntity<CommonResponse<Boolean>> checkFavoriteStatus(
            @Parameter(description = "캠핑장 ID", example = "1")
            @PathVariable
            @Positive(message = "캠핑장 ID는 양수여야 합니다")
            Long campgroundId,
            Authentication authentication) {

        String email = authentication.getName();
        Long userId = getCurrentUserId(email);

        log.debug("Check favorite status request - user: {}, campground: {}", userId, campgroundId);

        validateCampgroundId(campgroundId);

        boolean isFavorite = favoriteService.isFavorite(userId, campgroundId);
        return ResponseEntity.ok(CommonResponse.success(isFavorite));
    }

    /**
     * 캠핑장 찜하기 수 조회
     */
    @GetMapping("/campgrounds/{campgroundId}/count")
    @Operation(
        summary = "찜하기 수 조회",
        description = "특정 캠핑장의 찜하기 수를 조회합니다."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "찜하기 수 조회 성공"),
        @ApiResponse(responseCode = "404", description = "캠핑장을 찾을 수 없음")
    })
    public ResponseEntity<CommonResponse<Long>> getFavoriteCount(
            @Parameter(description = "캠핑장 ID", example = "1")
            @PathVariable
            @Positive(message = "캠핑장 ID는 양수여야 합니다")
            Long campgroundId) {

        log.debug("Get favorite count request - campground: {}", campgroundId);

        validateCampgroundId(campgroundId);

        long count = favoriteService.getFavoriteCount(campgroundId);
        return ResponseEntity.ok(CommonResponse.success(count));
    }

    /**
     * 현재 사용자 ID 조회 헬퍼 메소드
     */
    private Long getCurrentUserId(String email) {
        return userService.findByEmail(email)
                .map(User::getId)
                .orElseThrow(() -> new IllegalStateException("인증된 사용자를 찾을 수 없습니다."));
    }

    /**
     * 캠핑장 ID 유효성 검증 헬퍼 메소드
     */
    private void validateCampgroundId(Long campgroundId) {
        if (campgroundId == null || campgroundId <= 0) {
            throw new IllegalArgumentException("유효하지 않은 캠핑장 ID입니다.");
        }
    }
}
