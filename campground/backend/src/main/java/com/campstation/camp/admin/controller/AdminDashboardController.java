package com.campstation.camp.admin.controller;

import com.campstation.camp.admin.dto.DashboardStatsDto;
import com.campstation.camp.admin.dto.RecentActivityDto;
import com.campstation.camp.admin.service.AdminDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 관리자 대시보드 API 컨트롤러
 * 
 * @author CampStation Team
 * @version 1.0
 * @since 2024-01-01
 */
@Tag(name = "관리자 대시보드", description = "관리자용 대시보드 API")
@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    /**
     * 대시보드 통계 데이터 조회
     */
    @GetMapping("/stats")
    @Operation(
        summary = "대시보드 통계 조회",
        description = "관리자 대시보드의 전체 통계 데이터를 조회합니다.",
        responses = {
            @ApiResponse(responseCode = "200", description = "통계 조회 성공"),
            @ApiResponse(responseCode = "403", description = "관리자 권한 필요")
        }
    )
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        log.info("관리자 대시보드 통계 조회 요청");
        DashboardStatsDto stats = adminDashboardService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * 최근 활동 내역 조회
     */
    @GetMapping("/recent-activities")
    @Operation(
        summary = "최근 활동 내역 조회",
        description = "관리자 대시보드의 최근 활동 내역을 조회합니다.",
        responses = {
            @ApiResponse(responseCode = "200", description = "활동 내역 조회 성공"),
            @ApiResponse(responseCode = "403", description = "관리자 권한 필요")
        }
    )
    public ResponseEntity<List<RecentActivityDto>> getRecentActivities(
            @Parameter(description = "조회할 활동 개수", example = "10")
            @RequestParam(defaultValue = "10") int limit) {
        log.info("관리자 대시보드 최근 활동 내역 조회 요청, limit: {}", limit);
        List<RecentActivityDto> activities = adminDashboardService.getRecentActivities(limit);
        return ResponseEntity.ok(activities);
    }
}
