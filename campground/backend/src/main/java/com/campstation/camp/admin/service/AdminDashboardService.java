package com.campstation.camp.admin.service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.campstation.camp.admin.dto.DashboardStatsDto;
import com.campstation.camp.admin.dto.RecentActivityDto;
import com.campstation.camp.campground.repository.CampgroundRepository;
import com.campstation.camp.reservation.domain.ReservationStatus;
import com.campstation.camp.reservation.repository.ReservationRepository;
import com.campstation.camp.user.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

/**
 * 관리자 대시보드 서비스
 */
@Service
@Slf4j
public class AdminDashboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CampgroundRepository campgroundRepository;

    @Autowired
    private ReservationRepository reservationRepository;
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Autowired
    private ObjectMapper objectMapper;

    /**
     * 대시보드 통계 데이터 조회 (Multi-level 캐싱)
     * L1: Caffeine (1분)
     * L2: Redis (10분)
     * L3: DB
     */
    @Cacheable(value = "dashboardStats", key = "'admin'")
    public DashboardStatsDto getDashboardStats() {
        // L2: Redis 조회
        String redisKey = "dashboard:admin:stats";
        Object cached = redisTemplate.opsForValue().get(redisKey);
        
        if (cached != null) {
            try {
                // LinkedHashMap을 DashboardStatsDto로 변환
                return objectMapper.convertValue(cached, DashboardStatsDto.class);
            } catch (Exception e) {
                log.warn("Redis 캐시 역직렬화 실패, DB에서 재조회: {}", e.getMessage());
            }
        }
        
        // L3: DB 조회 및 계산
        DashboardStatsDto stats = calculateStatsFromDB();
        
        // Redis에 캐시 저장 (10분)
        redisTemplate.opsForValue().set(redisKey, stats, 10, TimeUnit.MINUTES);
        
        return stats;
    }
    
    /**
     * DB에서 통계 계산
     */
    private DashboardStatsDto calculateStatsFromDB() {
        // 사용자 통계
        Long totalUsers = userRepository.count();
        Long members = 0L; // TODO: Role별 count 구현
        Long owners = 0L;
        Long admins = 0L;
        Long newUsersThisMonth = 0L; // TODO: 이번 달 신규 사용자 count
        
        DashboardStatsDto.UserStats userStats = DashboardStatsDto.UserStats.builder()
            .total(totalUsers)
            .members(members)
            .owners(owners)
            .admins(admins)
            .newThisMonth(newUsersThisMonth)
            .build();

        // 캠핑장 통계
        Long totalCampgrounds = campgroundRepository.count();
        Long approvedCampgrounds = 0L; // TODO: Status별 count 구현
        Long pendingCampgrounds = 0L;
        Long rejectedCampgrounds = 0L;
        Long newCampgroundsThisMonth = 0L;
        
        DashboardStatsDto.CampgroundStats campgroundStats = DashboardStatsDto.CampgroundStats.builder()
            .total(totalCampgrounds)
            .approved(approvedCampgrounds)
            .pending(pendingCampgrounds)
            .rejected(rejectedCampgrounds)
            .newThisMonth(newCampgroundsThisMonth)
            .build();

        // 예약 통계
        Long totalReservations = reservationRepository.count();
        Long activeReservations = reservationRepository.countByStatus(ReservationStatus.CONFIRMED);
        Long thisMonthReservations = 0L; // TODO: 이번 달 예약 count
        Long cancelledReservations = 0L; // TODO: 취소된 예약 count
        
        DashboardStatsDto.ReservationStats reservationStats = DashboardStatsDto.ReservationStats.builder()
            .total(totalReservations)
            .thisMonth(thisMonthReservations)
            .confirmed(activeReservations)
            .cancelled(cancelledReservations)
            .build();

        // 수익 통계
        YearMonth currentMonth = YearMonth.now();
        LocalDateTime startOfMonth = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = currentMonth.atEndOfMonth().atTime(23, 59, 59);
        
        Double monthlyRevenue = reservationRepository.sumTotalAmountByStatusAndCreatedAtBetween(
            ReservationStatus.CONFIRMED, startOfMonth, endOfMonth);
        if (monthlyRevenue == null) {
            monthlyRevenue = 0.0;
        }
        
        DashboardStatsDto.RevenueStats revenueStats = DashboardStatsDto.RevenueStats.builder()
            .total(0.0) // TODO: 전체 수익 계산
            .thisMonth(monthlyRevenue)
            .growth(0.0) // TODO: 전월 대비 증감률 계산
            .build();

        // 신고 통계
        DashboardStatsDto.ReportStats reportStats = DashboardStatsDto.ReportStats.builder()
            .total(0L) // TODO: Report 기능 구현 후 추가
            .pending(0L)
            .approved(0L)
            .rejected(0L)
            .build();

        return DashboardStatsDto.builder()
            .users(userStats)
            .campgrounds(campgroundStats)
            .reservations(reservationStats)
            .revenue(revenueStats)
            .reports(reportStats)
            .build();
    }

    /**
     * 최근 활동 내역 조회
     */
    public List<RecentActivityDto> getRecentActivities(int limit) {
        List<RecentActivityDto> activities = new ArrayList<>();

        // 임시 샘플 데이터 (추후 실제 데이터로 대체)
        activities.add(new RecentActivityDto(
            1L, "user", "새로운 사용자 가입", "김철수님이 가입했습니다.", 
            LocalDateTime.now().minusHours(1)
        ));
        activities.add(new RecentActivityDto(
            2L, "campground", "새로운 캠핑장 등록", "한강캠핑장이 등록되었습니다.", 
            LocalDateTime.now().minusHours(2)
        ));
        activities.add(new RecentActivityDto(
            3L, "reservation", "새로운 예약", "이영희님이 설악산캠핑장을 예약했습니다.", 
            LocalDateTime.now().minusHours(3)
        ));
        activities.add(new RecentActivityDto(
            4L, "review", "새로운 리뷰", "박민수님이 지리산캠핑장에 리뷰를 작성했습니다.", 
            LocalDateTime.now().minusHours(4)
        ));

        return activities.stream()
                .limit(limit)
                .toList();
    }
}