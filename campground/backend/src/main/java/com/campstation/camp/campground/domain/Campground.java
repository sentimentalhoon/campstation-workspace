package com.campstation.camp.campground.domain;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import com.campstation.camp.shared.domain.BaseEntity;
import com.campstation.camp.shared.security.Ownable;
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
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * 캠핑장 정보를 저장하는 엔티티
 * Ownable 인터페이스를 구현하여 소유자 기반 권한 체크 지원
 */
@Entity
@Table(name = "campgrounds")
public class Campground extends BaseEntity implements Ownable {

    @Column(name = "name", nullable = false, length = 100)
    @NotBlank(message = "캠핑장 이름은 필수입니다")
    @Size(max = 100, message = "캠핑장 이름은 100자를 초과할 수 없습니다")
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    @Size(max = 10000, message = "설명은 10000자를 초과할 수 없습니다")
    private String description;

    @Column(name = "address", nullable = false, length = 200)
    @NotBlank(message = "주소는 필수입니다")
    @Size(max = 200, message = "주소는 200자를 초과할 수 없습니다")
    private String address;

    @Column(name = "phone", length = 20)
    @Pattern(regexp = "^[0-9-]+$", message = "전화번호는 숫자와 하이픈만 입력 가능합니다")
    private String phone;

    @Column(name = "email", length = 100)
    @Email(message = "올바른 이메일 형식이 아닙니다")
    private String email;

    @Column(name = "website", length = 200)
    private String website;

    // 위치 정보
    @Column(name = "latitude", precision = 10, scale = 8)
    @DecimalMin(value = "33.0", message = "위도는 33.0 이상이어야 합니다")
    @DecimalMax(value = "43.0", message = "위도는 43.0 이하여야 합니다")
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 11, scale = 8)
    @DecimalMin(value = "124.0", message = "경도는 124.0 이상이어야 합니다")
    @DecimalMax(value = "132.0", message = "경도는 132.0 이하여야 합니다")
    private BigDecimal longitude;

    // 운영 상태
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private CampgroundStatus status = CampgroundStatus.ACTIVE;

    // 운영 주체
    @Enumerated(EnumType.STRING)
    @Column(name = "operation_type", length = 20)
    private CampgroundOperationType operationType;

    // 인증/등급
    @Enumerated(EnumType.STRING)
    @Column(name = "certification", length = 20)
    private CampgroundCertification certification;

    // 즐겨찾기 카운트 (성능 최적화)
    @Column(name = "favorite_count", nullable = false)
    private Integer favoriteCount = 0;

    // 리뷰 카운트 (성능 최적화)
    @Column(name = "review_count", nullable = false)
    private Integer reviewCount = 0;

    // 체크인/체크아웃 시간
    @Column(name = "check_in_time")
    private java.time.LocalTime checkInTime;

    @Column(name = "check_out_time")
    private java.time.LocalTime checkOutTime;

    // 사업자 정보
    @Column(name = "business_owner_name", length = 100)
    private String businessOwnerName;

    @Column(name = "business_name", length = 200)
    private String businessName;

    @Column(name = "business_address", length = 300)
    private String businessAddress;

    @Column(name = "business_email", length = 100)
    @Email(message = "올바른 사업자 이메일 형식이 아닙니다")
    private String businessEmail;

    @Column(name = "business_registration_number", length = 50)
    private String businessRegistrationNumber;

    @Column(name = "tourism_business_number", length = 50)
    private String tourismBusinessNumber;

    // 연관 관계
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    @OneToMany(mappedBy = "campground", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Site> sites = new ArrayList<>();

    @OneToMany(mappedBy = "campground", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("displayOrder ASC, id ASC")
    private List<CampgroundImage> images = new ArrayList<>();

    /**
     * 캠핑장 정보 업데이트
     */
    public void updateInfo(String name, String description, String address,
                          String phone, String email, String website) {
        if (name != null && !name.isBlank()) {
            this.name = name;
        }
        this.description = description;
        if (address != null && !address.isBlank()) {
            this.address = address;
        }
        this.phone = phone;
        this.email = email;
        this.website = website;
    }

    /**
     * 위치 정보 업데이트
     */
    public void updateLocation(BigDecimal latitude, BigDecimal longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    /**
     * 상태 변경
     */
    public void changeStatus(CampgroundStatus status) {
        this.status = status;
    }

    /**
     * 즐겨찾기 카운트 증가
     */
    public void incrementFavoriteCount() {
        this.favoriteCount++;
    }

    /**
     * 즐겨찾기 카운트 감소
     */
    public void decrementFavoriteCount() {
        if (this.favoriteCount > 0) {
            this.favoriteCount--;
        }
    }

    /**
     * 리뷰 카운트 증가
     */
    public void incrementReviewCount() {
        this.reviewCount++;
    }

    /**
     * 리뷰 카운트 감소
     */
    public void decrementReviewCount() {
        if (this.reviewCount > 0) {
            this.reviewCount--;
        }
    }

    /**
     * 사이트 추가
     */
    public void addSite(Site site) {
        sites.add(site);
        site.setCampground(this);
    }

    /**
     * 사이트 제거
     */
    public void removeSite(Site site) {
        sites.remove(site);
        site.setCampground(null);
    }

    /**
     * 이미지 추가
     */
    public void addImage(CampgroundImage image) {
        images.add(image);
        image.setCampground(this);
    }

    /**
     * 이미지 제거
     */
    public void removeImage(CampgroundImage image) {
        images.remove(image);
        image.setCampground(null);
    }

    /**
     * 메인 이미지 URL 반환 (첫 번째 이미지 또는 isMain=true인 이미지)
     */
    public String getMainImageUrl() {
        return images.stream()
                .filter(img -> img.getIsMain())
                .findFirst()
                .map(CampgroundImage::getThumbnailUrl)
                .orElse(images.isEmpty() ? null : images.get(0).getThumbnailUrl());
    }

    /**
     * 모든 썸네일 이미지 URL 목록 반환
     */
    public List<String> getAllThumbnailUrls() {
        return images.stream()
                .map(CampgroundImage::getThumbnailUrl)
                .toList();
    }

    /**
     * 모든 원본 이미지 URL 목록 반환
     */
    public List<String> getAllOriginalImageUrls() {
        return images.stream()
                .map(CampgroundImage::getOriginalUrl)
                .toList();
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public BigDecimal getLatitude() {
        return latitude;
    }

    public void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }

    public BigDecimal getLongitude() {
        return longitude;
    }

    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }

    public CampgroundStatus getStatus() {
        return status;
    }

    public void setStatus(CampgroundStatus status) {
        this.status = status;
    }

    public CampgroundOperationType getOperationType() {
        return operationType;
    }

    public void setOperationType(CampgroundOperationType operationType) {
        this.operationType = operationType;
    }

    public CampgroundCertification getCertification() {
        return certification;
    }

    public void setCertification(CampgroundCertification certification) {
        this.certification = certification;
    }

    public Integer getFavoriteCount() {
        return favoriteCount;
    }

    public void setFavoriteCount(Integer favoriteCount) {
        this.favoriteCount = favoriteCount;
    }

    public Integer getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Integer reviewCount) {
        this.reviewCount = reviewCount;
    }

    public java.time.LocalTime getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(java.time.LocalTime checkInTime) {
        this.checkInTime = checkInTime;
    }

    public java.time.LocalTime getCheckOutTime() {
        return checkOutTime;
    }

    public void setCheckOutTime(java.time.LocalTime checkOutTime) {
        this.checkOutTime = checkOutTime;
    }

    public String getBusinessOwnerName() {
        return businessOwnerName;
    }

    public void setBusinessOwnerName(String businessOwnerName) {
        this.businessOwnerName = businessOwnerName;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getBusinessAddress() {
        return businessAddress;
    }

    public void setBusinessAddress(String businessAddress) {
        this.businessAddress = businessAddress;
    }

    public String getBusinessEmail() {
        return businessEmail;
    }

    public void setBusinessEmail(String businessEmail) {
        this.businessEmail = businessEmail;
    }

    public String getBusinessRegistrationNumber() {
        return businessRegistrationNumber;
    }

    public void setBusinessRegistrationNumber(String businessRegistrationNumber) {
        this.businessRegistrationNumber = businessRegistrationNumber;
    }

    public String getTourismBusinessNumber() {
        return tourismBusinessNumber;
    }

    public void setTourismBusinessNumber(String tourismBusinessNumber) {
        this.tourismBusinessNumber = tourismBusinessNumber;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public List<Site> getSites() {
        return sites;
    }

    public void setSites(List<Site> sites) {
        this.sites = sites;
    }

    public List<CampgroundImage> getImages() {
        return images;
    }

    public void setImages(List<CampgroundImage> images) {
        this.images = images;
    }

    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String name;
        private String description;
        private String address;
        private String phone;
        private String email;
        private String website;
        private BigDecimal latitude;
        private BigDecimal longitude;
        private CampgroundStatus status = CampgroundStatus.ACTIVE;
        private CampgroundOperationType operationType;
        private CampgroundCertification certification;
        private Integer favoriteCount = 0;
        private Integer reviewCount = 0;
        private java.time.LocalTime checkInTime;
        private java.time.LocalTime checkOutTime;
        private String businessOwnerName;
        private String businessName;
        private String businessAddress;
        private String businessEmail;
        private String businessRegistrationNumber;
        private String tourismBusinessNumber;
        private User owner;
        private List<Site> sites = new ArrayList<>();
        private List<CampgroundImage> images = new ArrayList<>();

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder description(String description) {
            this.description = description;
            return this;
        }

        public Builder address(String address) {
            this.address = address;
            return this;
        }

        public Builder phone(String phone) {
            this.phone = phone;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder website(String website) {
            this.website = website;
            return this;
        }

        public Builder latitude(BigDecimal latitude) {
            this.latitude = latitude;
            return this;
        }

        public Builder longitude(BigDecimal longitude) {
            this.longitude = longitude;
            return this;
        }

        public Builder status(CampgroundStatus status) {
            this.status = status;
            return this;
        }

        public Builder operationType(CampgroundOperationType operationType) {
            this.operationType = operationType;
            return this;
        }

        public Builder certification(CampgroundCertification certification) {
            this.certification = certification;
            return this;
        }

        public Builder favoriteCount(Integer favoriteCount) {
            this.favoriteCount = favoriteCount;
            return this;
        }

        public Builder reviewCount(Integer reviewCount) {
            this.reviewCount = reviewCount;
            return this;
        }

        public Builder checkInTime(java.time.LocalTime checkInTime) {
            this.checkInTime = checkInTime;
            return this;
        }

        public Builder checkOutTime(java.time.LocalTime checkOutTime) {
            this.checkOutTime = checkOutTime;
            return this;
        }

        public Builder businessOwnerName(String businessOwnerName) {
            this.businessOwnerName = businessOwnerName;
            return this;
        }

        public Builder businessName(String businessName) {
            this.businessName = businessName;
            return this;
        }

        public Builder businessAddress(String businessAddress) {
            this.businessAddress = businessAddress;
            return this;
        }

        public Builder businessEmail(String businessEmail) {
            this.businessEmail = businessEmail;
            return this;
        }

        public Builder businessRegistrationNumber(String businessRegistrationNumber) {
            this.businessRegistrationNumber = businessRegistrationNumber;
            return this;
        }

        public Builder tourismBusinessNumber(String tourismBusinessNumber) {
            this.tourismBusinessNumber = tourismBusinessNumber;
            return this;
        }

        public Builder owner(User owner) {
            this.owner = owner;
            return this;
        }

        public Builder sites(List<Site> sites) {
            this.sites = sites;
            return this;
        }

        public Builder images(List<CampgroundImage> images) {
            this.images = images;
            return this;
        }

        public Campground build() {
            Campground campground = new Campground();
            campground.setName(name);
            campground.setDescription(description);
            campground.setAddress(address);
            campground.setPhone(phone);
            campground.setEmail(email);
            campground.setWebsite(website);
            campground.setLatitude(latitude);
            campground.setLongitude(longitude);
            campground.setStatus(status);
            campground.setOperationType(operationType);
            campground.setCertification(certification);
            campground.setFavoriteCount(favoriteCount);
            campground.setReviewCount(reviewCount);
            campground.setCheckInTime(checkInTime);
            campground.setCheckOutTime(checkOutTime);
            campground.setBusinessOwnerName(businessOwnerName);
            campground.setBusinessName(businessName);
            campground.setBusinessAddress(businessAddress);
            campground.setBusinessEmail(businessEmail);
            campground.setBusinessRegistrationNumber(businessRegistrationNumber);
            campground.setTourismBusinessNumber(tourismBusinessNumber);
            campground.setOwner(owner);
            campground.setSites(sites);
            campground.setImages(images);
            return campground;
        }
    }
}