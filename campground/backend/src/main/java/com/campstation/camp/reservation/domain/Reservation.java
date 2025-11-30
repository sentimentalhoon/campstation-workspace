package com.campstation.camp.reservation.domain;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.campstation.camp.campground.domain.Campground;
import com.campstation.camp.campground.domain.Site;
import com.campstation.camp.reservation.dto.PriceBreakdownDto;
import com.campstation.camp.shared.domain.BaseEntity;
import com.campstation.camp.shared.security.Ownable;
import com.campstation.camp.user.domain.Guest;
import com.campstation.camp.user.domain.User;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

/**
 * 예약 엔티티
 * Ownable 인터페이스를 구현하여 소유자(예약자) 기반 권한 체크 지원
 *
 * @author CampStation Team
 * @version 1.0
 * @since 2024-01-01
 */
@Entity
@Table(name = "reservations")
public class Reservation extends BaseEntity implements Ownable {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campground_id", nullable = false)
    private Campground campground;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;

    @Column(name = "check_in_date", nullable = false)
    private LocalDate checkInDate;

    @Column(name = "check_out_date", nullable = false)
    private LocalDate checkOutDate;

    @Column(name = "number_of_guests", nullable = false)
    private Integer numberOfGuests;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status = ReservationStatus.PENDING;

    @Column(name = "special_requests", columnDefinition = "TEXT")
    private String specialRequests;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    // 비회원 예약 정보 (정규화: Guest 엔티티로 분리)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_id")
    private Guest guest;

    /**
     * 가격 상세 내역 (JSONB 스냅샷)
     * 예약 생성 시점의 가격 계산 내역을 보존
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "price_breakdown", columnDefinition = "jsonb")
    private PriceBreakdownDto priceBreakdown;

    /**
     * 가격 항목 목록 (분석/리포팅용)
     */
    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReservationPriceItem> priceItems = new ArrayList<>();

    // Constructors
    public Reservation() {
    }

    public Reservation(User user, Campground campground, LocalDate checkInDate, LocalDate checkOutDate,
                      Integer numberOfGuests, BigDecimal totalAmount, ReservationStatus status, String specialRequests,
                      Guest guest) {
        this.user = user;
        this.campground = campground;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.numberOfGuests = numberOfGuests;
        this.totalAmount = totalAmount;
        this.status = status;
        this.specialRequests = specialRequests;
        this.guest = guest;
    }

    // Getters and Setters
    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    /**
     * Ownable 인터페이스 구현: 예약자(소유자) 반환
     * 
     * @return 예약자 (회원 예약의 경우)
     */
    @Override
    public User getOwner() {
        return this.user;
    }

    public Campground getCampground() {
        return campground;
    }

    public void setCampground(Campground campground) {
        this.campground = campground;
    }

    public Site getSite() {
        return site;
    }

    public void setSite(Site site) {
        this.site = site;
    }

    public LocalDate getCheckInDate() {
        return checkInDate;
    }

    public void setCheckInDate(LocalDate checkInDate) {
        this.checkInDate = checkInDate;
    }

    public LocalDate getCheckOutDate() {
        return checkOutDate;
    }

    public void setCheckOutDate(LocalDate checkOutDate) {
        this.checkOutDate = checkOutDate;
    }

    public Integer getNumberOfGuests() {
        return numberOfGuests;
    }

    public void setNumberOfGuests(Integer numberOfGuests) {
        this.numberOfGuests = numberOfGuests;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public ReservationStatus getStatus() {
        return status;
    }

    public void setStatus(ReservationStatus status) {
        this.status = status;
    }

    public String getSpecialRequests() {
        return specialRequests;
    }

    public void setSpecialRequests(String specialRequests) {
        this.specialRequests = specialRequests;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public Guest getGuest() {
        return guest;
    }

    public void setGuest(Guest guest) {
        this.guest = guest;
    }

    public PriceBreakdownDto getPriceBreakdown() {
        return priceBreakdown;
    }

    public void setPriceBreakdown(PriceBreakdownDto priceBreakdown) {
        this.priceBreakdown = priceBreakdown;
    }

    public List<ReservationPriceItem> getPriceItems() {
        return priceItems;
    }

    public void setPriceItems(List<ReservationPriceItem> priceItems) {
        this.priceItems = priceItems;
    }

    /**
     * 가격 항목 추가 헬퍼 메서드
     *
     * @param item 추가할 항목
     */
    public void addPriceItem(ReservationPriceItem item) {
        this.priceItems.add(item);
        item.setReservation(this);
    }

    /**
     * 예약 기간(박) 계산
     *
     * @return 예약 기간 (박)
     */
    public int getNumberOfNights() {
        return (int) checkInDate.datesUntil(checkOutDate).count();
    }

    /**
     * 예약 정보 업데이트
     *
     * @param checkInDate 체크인 날짜
     * @param checkOutDate 체크아웃 날짜
     * @param numberOfGuests 인원 수
     * @param specialRequests 특별 요청사항
     */
    public void updateReservation(LocalDate checkInDate, LocalDate checkOutDate,
                                Integer numberOfGuests, String specialRequests) {
        if (checkInDate != null) {
            this.checkInDate = checkInDate;
        }
        if (checkOutDate != null) {
            this.checkOutDate = checkOutDate;
        }
        if (numberOfGuests != null) {
            this.numberOfGuests = numberOfGuests;
        }
        this.specialRequests = specialRequests;
    }

    /**
     * 예약 상태 변경
     *
     * @param status 새로운 상태
     */
    public void changeStatus(ReservationStatus status) {
        this.status = status;
    }

    /**
     * 사용자가 예약 삭제 (soft delete)
     * BaseEntity의 markAsDeleted() 메서드 활용
     */
    public void deleteByUser() {
        this.status = ReservationStatus.DELETED;
        this.markAsDeleted();
    }

    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private User user;
        private Campground campground;
        private LocalDate checkInDate;
        private LocalDate checkOutDate;
        private Integer numberOfGuests;
        private BigDecimal totalAmount;
        private ReservationStatus status = ReservationStatus.PENDING;
        private String specialRequests;
        private Guest guest;

        public Builder user(User user) {
            this.user = user;
            return this;
        }

        public Builder campground(Campground campground) {
            this.campground = campground;
            return this;
        }

        public Builder checkInDate(LocalDate checkInDate) {
            this.checkInDate = checkInDate;
            return this;
        }

        public Builder checkOutDate(LocalDate checkOutDate) {
            this.checkOutDate = checkOutDate;
            return this;
        }

        public Builder numberOfGuests(Integer numberOfGuests) {
            this.numberOfGuests = numberOfGuests;
            return this;
        }

        public Builder totalAmount(BigDecimal totalAmount) {
            this.totalAmount = totalAmount;
            return this;
        }

        public Builder status(ReservationStatus status) {
            this.status = status;
            return this;
        }

        public Builder specialRequests(String specialRequests) {
            this.specialRequests = specialRequests;
            return this;
        }

        public Builder guest(Guest guest) {
            this.guest = guest;
            return this;
        }

        public Reservation build() {
            Reservation reservation = new Reservation();
            reservation.setUser(user);
            reservation.setCampground(campground);
            reservation.setCheckInDate(checkInDate);
            reservation.setCheckOutDate(checkOutDate);
            reservation.setNumberOfGuests(numberOfGuests);
            reservation.setTotalAmount(totalAmount);
            reservation.setStatus(status);
            reservation.setSpecialRequests(specialRequests);
            reservation.setGuest(guest);
            return reservation;
        }
    }
}
