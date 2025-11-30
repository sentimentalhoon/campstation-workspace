package com.campstation.camp.stats.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campstation.camp.campground.domain.Campground;
import com.campstation.camp.campground.repository.CampgroundRepository;
import com.campstation.camp.stats.domain.CampgroundStatsDaily;
import com.campstation.camp.stats.domain.CampgroundViewLog;
import com.campstation.camp.stats.dto.CampgroundStatsResponse;
import com.campstation.camp.stats.dto.DailyStats;
import com.campstation.camp.stats.dto.ViewCountResponse;
import com.campstation.camp.stats.repository.CampgroundStatsDailyRepository;
import com.campstation.camp.stats.repository.CampgroundViewLogRepository;
import com.campstation.camp.user.domain.User;
import com.campstation.camp.user.repository.UserRepository;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 캠핑장 조회수 통계 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CampgroundStatsService {

    private final CampgroundViewLogRepository viewLogRepository;
    private final CampgroundStatsDailyRepository statsDailyRepository;
    private final CampgroundRepository campgroundRepository;
    private final UserRepository userRepository;

    /**
     * 조회 기록 저장
     * 24시간 내 중복 방문은 기록하지 않음
     */
    @Transactional
    public void recordView(Long campgroundId, String sessionId, String referrer,
                          Long userId, HttpServletRequest request) {
        // 캠핑장 조회
        Campground campground = campgroundRepository.findById(campgroundId)
                .orElseThrow(() -> new IllegalArgumentException("캠핑장을 찾을 수 없습니다."));

        // 24시간 내 중복 방문 체크
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        if (viewLogRepository.findRecentView(sessionId, campgroundId, since).isPresent()) {
            log.debug("중복 방문: sessionId={}, campgroundId={}", sessionId, campgroundId);
            return;
        }

        // 사용자 조회 (로그인한 경우)
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }

        // IP 주소 추출
        String ipAddress = extractIpAddress(request);

        // User-Agent 추출
        String userAgent = request.getHeader("User-Agent");

        // 조회 로그 저장
        CampgroundViewLog viewLog = CampgroundViewLog.builder()
                .campground(campground)
                .user(user)
                .sessionId(sessionId)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .referrer(referrer)
                .viewDuration(0)
                .viewedAt(LocalDateTime.now())
                .build();

        viewLogRepository.save(viewLog);
        log.info("조회 기록 저장: campgroundId={}, sessionId={}, userId={}",
                 campgroundId, sessionId, userId);
    }

    /**
     * 체류 시간 업데이트
     */
    @Transactional
    public void recordDuration(Long campgroundId, String sessionId, Integer duration) {
        // 최근 조회 기록 조회 (24시간 내)
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        CampgroundViewLog viewLog = viewLogRepository.findRecentView(sessionId, campgroundId, since)
                .orElseThrow(() -> new IllegalArgumentException("조회 기록을 찾을 수 없습니다."));

        // 체류 시간 업데이트
        viewLog.updateViewDuration(duration);
        log.info("체류 시간 업데이트: campgroundId={}, sessionId={}, duration={}초",
                 campgroundId, sessionId, duration);
    }

    /**
     * 실시간 조회수 조회 (최근 24시간)
     */
    @Transactional(readOnly = true)
    public ViewCountResponse getViewCount(Long campgroundId) {
        // 캠핑장 존재 여부 확인
        campgroundRepository.findById(campgroundId)
                .orElseThrow(() -> new IllegalArgumentException("캠핑장을 찾을 수 없습니다."));

        // 최근 24시간 내 고유 방문자 수 조회
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        Long count = viewLogRepository.countUniqueVisitorsLast24Hours(campgroundId, since);

        return new ViewCountResponse(campgroundId, count);
    }

    /**
     * 캠핑장 통계 조회 (기간별)
     */
    @Transactional(readOnly = true)
    public CampgroundStatsResponse getStats(Long campgroundId, Integer days) {
        // 캠핑장 존재 여부 확인
        campgroundRepository.findById(campgroundId)
                .orElseThrow(() -> new IllegalArgumentException("캠핑장을 찾을 수 없습니다."));

        // 기본값: 30일
        if (days == null || days <= 0) {
            days = 30;
        }

        // 날짜 범위 계산
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days - 1);

        // 일별 통계 조회
        List<CampgroundStatsDaily> dailyStatsList = statsDailyRepository
                .findRecentStats(campgroundId, startDate);

        // 통계 집계
        int totalVisitors = dailyStatsList.stream()
                .mapToInt(CampgroundStatsDaily::getUniqueVisitors)
                .sum();

        int totalViews = dailyStatsList.stream()
                .mapToInt(CampgroundStatsDaily::getTotalViews)
                .sum();

        double avgDailyVisitors = dailyStatsList.isEmpty() ? 0.0 :
                (double) totalVisitors / dailyStatsList.size();

        // 평균 체류 시간 계산 (가중 평균)
        int totalDuration = dailyStatsList.stream()
                .mapToInt(s -> s.getAvgViewDuration() * s.getUniqueVisitors())
                .sum();
        int avgViewDuration = totalVisitors > 0 ? totalDuration / totalVisitors : 0;

        // 전환율 계산
        int totalReservations = dailyStatsList.stream()
                .mapToInt(CampgroundStatsDaily::getReservationsCount)
                .sum();
        BigDecimal conversionRate = totalVisitors > 0 ?
                BigDecimal.valueOf(totalReservations)
                        .multiply(BigDecimal.valueOf(100))
                        .divide(BigDecimal.valueOf(totalVisitors), 2, RoundingMode.HALF_UP) :
                BigDecimal.ZERO;

        // DTO 변환
        List<DailyStats> dailyStats = dailyStatsList.stream()
                .map(DailyStats::from)
                .collect(Collectors.toList());

        return CampgroundStatsResponse.builder()
                .campgroundId(campgroundId)
                .totalVisitors(totalVisitors)
                .totalViews(totalViews)
                .avgDailyVisitors(Math.round(avgDailyVisitors * 100.0) / 100.0)
                .avgViewDuration(avgViewDuration)
                .conversionRate(conversionRate)
                .dailyStats(dailyStats)
                .build();
    }

    /**
     * IP 주소 추출
     */
    private String extractIpAddress(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = request.getHeader("X-Real-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = request.getRemoteAddr();
        }
        // 다중 IP인 경우 첫 번째 IP만 사용
        if (ipAddress != null && ipAddress.contains(",")) {
            ipAddress = ipAddress.split(",")[0].trim();
        }
        return ipAddress;
    }
}
