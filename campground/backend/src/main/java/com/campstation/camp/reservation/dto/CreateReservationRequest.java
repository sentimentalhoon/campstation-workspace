package com.campstation.camp.reservation.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.campstation.camp.reservation.domain.PaymentMethod;
import com.campstation.camp.shared.validation.ValidDateRange;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * 예약 생성 요청 DTO
 *
 * @author CampStation Team
 * @version 1.0
 * @since 2024-01-01
 */
@ValidDateRange(checkInField = "checkInDate", checkOutField = "checkOutDate")
public class CreateReservationRequest {

    @NotNull(message = "캠핑장 ID는 필수입니다.")
    private Long campgroundId;

    @NotNull(message = "사이트 ID는 필수입니다.")
    private Long siteId;

    @NotNull(message = "체크인 날짜는 필수입니다.")
    @FutureOrPresent(message = "체크인 날짜는 오늘 이후여야 합니다.")
    private LocalDate checkInDate;

    @NotNull(message = "체크아웃 날짜는 필수입니다.")
    @Future(message = "체크아웃 날짜는 미래 날짜여야 합니다.")
    private LocalDate checkOutDate;

    @NotNull(message = "인원 수는 필수입니다.")
    @Min(value = 1, message = "최소 1명 이상이어야 합니다.")
    @Max(value = 20, message = "최대 20명까지 가능합니다.")
    private Integer numberOfGuests;

    @Size(max = 1000, message = "특별 요청사항은 1000자 이하여야 합니다.")
    private String specialRequests;

    @NotNull(message = "결제 방법은 필수입니다.")
    private PaymentMethod paymentMethod;

    // 카드/카카오페이는 토스페이먼츠에서 처리하므로 정보 불필요
    // 계좌이체만 입금자명 필요
    private String depositorName;    // 계좌이체 시

    // 프론트엔드에서 계산한 예상 금액 (검증용, 선택적)
    @Positive(message = "예상 금액은 0보다 커야 합니다.")
    private BigDecimal expectedAmount;

    // Constructors
    public CreateReservationRequest() {
    }

    public CreateReservationRequest(Long campgroundId, LocalDate checkInDate, LocalDate checkOutDate, Integer numberOfGuests, String specialRequests) {
        this.campgroundId = campgroundId;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.numberOfGuests = numberOfGuests;
        this.specialRequests = specialRequests;
    }

    public CreateReservationRequest(Long campgroundId, Long siteId, LocalDate checkInDate, LocalDate checkOutDate, Integer numberOfGuests, String specialRequests) {
        this.campgroundId = campgroundId;
        this.siteId = siteId;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.numberOfGuests = numberOfGuests;
        this.specialRequests = specialRequests;
    }

    // Getters and Setters
    public Long getCampgroundId() {
        return campgroundId;
    }

    public void setCampgroundId(Long campgroundId) {
        this.campgroundId = campgroundId;
    }

    public Long getSiteId() {
        return siteId;
    }

    public void setSiteId(Long siteId) {
        this.siteId = siteId;
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

    public String getSpecialRequests() {
        return specialRequests;
    }

    public void setSpecialRequests(String specialRequests) {
        this.specialRequests = specialRequests;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getDepositorName() {
        return depositorName;
    }

    public void setDepositorName(String depositorName) {
        this.depositorName = depositorName;
    }

    public BigDecimal getExpectedAmount() {
        return expectedAmount;
    }

    public void setExpectedAmount(BigDecimal expectedAmount) {
        this.expectedAmount = expectedAmount;
    }
}