package com.campstation.camp.stats.controller;

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

import com.campstation.camp.shared.dto.CommonResponse;
import com.campstation.camp.stats.dto.CampgroundStatsResponse;
import com.campstation.camp.stats.dto.RecordDurationRequest;
import com.campstation.camp.stats.dto.RecordViewRequest;
import com.campstation.camp.stats.dto.ViewCountResponse;
import com.campstation.camp.stats.service.CampgroundStatsService;
import com.campstation.camp.user.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 캠핑장 조회수 통계 컨트롤러
 */
@Slf4j
@Tag(name = "Campground Stats", description = "캠핑장 조회수 통계 API")
@RestController
@RequestMapping("/api/v1/campgrounds")
@RequiredArgsConstructor
public class CampgroundStatsController {

    private final CampgroundStatsService statsService;
    private final UserService userService;

    /**
     * 조회 기록 저장
     * POST /api/v1/campgrounds/{id}/view-log
     */
    @Operation(summary = "조회 기록", description = "캠핑장 페이지 조회 기록을 저장합니다. 24시간 내 중복 방문은 기록하지 않습니다.")
    @PostMapping("/{id}/view-log")
    public ResponseEntity<CommonResponse<Void>> recordView(
            @PathVariable Long id,
            @Valid @RequestBody RecordViewRequest request,
            HttpServletRequest httpRequest) {

        // 로그인한 사용자 ID 조회 (선택)
        Long userId = getCurrentUserId();

        statsService.recordView(id, request.getSessionId(), request.getReferrer(),
                                userId, httpRequest);

        return ResponseEntity.ok(CommonResponse.success("조회 기록이 저장되었습니다.", null));
    }

    /**
     * 체류 시간 기록
     * POST /api/v1/campgrounds/{id}/view-duration
     */
    @Operation(summary = "체류 시간 기록", description = "캠핑장 페이지 체류 시간을 기록합니다.")
    @PostMapping("/{id}/view-duration")
    public ResponseEntity<CommonResponse<Void>> recordDuration(
            @PathVariable Long id,
            @Valid @RequestBody RecordDurationRequest request) {

        statsService.recordDuration(id, request.getSessionId(), request.getDuration());

        return ResponseEntity.ok(CommonResponse.success("체류 시간이 기록되었습니다.", null));
    }

    /**
     * 실시간 조회수 조회
     * GET /api/v1/campgrounds/{id}/view-count
     */
    @Operation(summary = "실시간 조회수", description = "최근 24시간 내 고유 방문자 수를 조회합니다.")
    @GetMapping("/{id}/view-count")
    public ResponseEntity<CommonResponse<ViewCountResponse>> getViewCount(@PathVariable Long id) {
        ViewCountResponse response = statsService.getViewCount(id);
        return ResponseEntity.ok(CommonResponse.success("조회수 조회 성공", response));
    }

    /**
     * 캠핑장 통계 조회
     * GET /api/v1/campgrounds/{id}/stats
     */
    @Operation(summary = "캠핑장 통계", description = "캠핑장 통계를 조회합니다. 기본 30일치 통계를 반환합니다.")
    @GetMapping("/{id}/stats")
    public ResponseEntity<CommonResponse<CampgroundStatsResponse>> getStats(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "30") Integer days) {

        CampgroundStatsResponse response = statsService.getStats(id, days);
        return ResponseEntity.ok(CommonResponse.success("통계 조회 성공", response));
    }

    /**
     * 현재 로그인한 사용자 ID 조회 (인증된 경우)
     */
    private Long getCurrentUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal())) {
                String username = authentication.getName();
                return userService.findByEmail(username)
                        .map(user -> user.getId())
                        .orElse(null);
            }
        } catch (Exception e) {
            log.debug("사용자 인증 정보를 가져올 수 없습니다: {}", e.getMessage());
        }
        return null;
    }
}
