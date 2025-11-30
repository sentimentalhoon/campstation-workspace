package com.campstation.camp.admin.dto;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private UserStats users;
    private CampgroundStats campgrounds;
    private ReservationStats reservations;
    private RevenueStats revenue;
    private ReportStats reports;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserStats {
        private Long total;
        private Long members;
        private Long owners;
        private Long admins;
        private Long newThisMonth;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CampgroundStats {
        private Long total;
        private Long approved;
        private Long pending;
        private Long rejected;
        private Long newThisMonth;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReservationStats {
        private Long total;
        private Long thisMonth;
        private Long confirmed;
        private Long cancelled;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueStats {
        private Double total;
        private Double thisMonth;
        private Double growth;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportStats {
        private Long total;
        private Long pending;
        private Long approved;
        private Long rejected;
    }
}
