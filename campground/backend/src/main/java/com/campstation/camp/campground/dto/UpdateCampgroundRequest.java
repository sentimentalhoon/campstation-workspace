package com.campstation.camp.campground.dto;

import java.math.BigDecimal;
import java.util.List;

import com.campstation.camp.campground.domain.CampgroundCertification;
import com.campstation.camp.campground.domain.CampgroundOperationType;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateCampgroundRequest(
    @Size(max = 100, message = "캠핑장 이름은 100자를 초과할 수 없습니다")
    String name,

    @Size(max = 10000, message = "설명은 10000자를 초과할 수 없습니다")
    String description,

    @Size(max = 200, message = "주소는 200자를 초과할 수 없습니다")
    String address,

    @Pattern(regexp = "^[0-9-]+$", message = "전화번호는 숫자와 하이픈만 입력 가능합니다")
    @Size(max = 20, message = "전화번호는 20자를 초과할 수 없습니다")
    String phone,

    @Email(message = "올바른 이메일 형식이 아닙니다")
    @Size(max = 100, message = "이메일은 100자를 초과할 수 없습니다")
    String email,

    @Size(max = 200, message = "웹사이트는 200자를 초과할 수 없습니다")
    String website,

    List<String> imageUrls, // 이미지 URL 목록
    
    List<String> imagesToDelete, // 삭제할 이미지 URL 목록

    @DecimalMin(value = "33.0", message = "위도는 33.0 이상이어야 합니다")
    @DecimalMax(value = "43.0", message = "위도는 43.0 이하여야 합니다")
    BigDecimal latitude,

    @DecimalMin(value = "124.0", message = "경도는 124.0 이상이어야 합니다")
    @DecimalMax(value = "132.0", message = "경도는 132.0 이하여야 합니다")
    BigDecimal longitude,

    @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "체크인 시간은 HH:mm 형식이어야 합니다")
    String checkInTime,

    @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "체크아웃 시간은 HH:mm 형식이어야 합니다")
    String checkOutTime,

    @Size(max = 100, message = "대표자명은 100자를 초과할 수 없습니다")
    String businessOwnerName,

    @Size(max = 200, message = "상호명은 200자를 초과할 수 없습니다")
    String businessName,

    @Size(max = 300, message = "사업자 주소는 300자를 초과할 수 없습니다")
    String businessAddress,

    @Email(message = "올바른 사업자 이메일 형식이 아닙니다")
    @Size(max = 100, message = "사업자 이메일은 100자를 초과할 수 없습니다")
    String businessEmail,

    @Size(max = 50, message = "사업자 등록번호는 50자를 초과할 수 없습니다")
    String businessRegistrationNumber,

    @Size(max = 50, message = "관광사업 등록번호는 50자를 초과할 수 없습니다")
    String tourismBusinessNumber,

    @Schema(description = "운영 주체", example = "PARTNER", allowableValues = {"DIRECT", "PARTNER", "PRIVATE", "FRANCHISE"})
    CampgroundOperationType operationType,

    @Schema(description = "인증/등급", example = "CERTIFIED", allowableValues = {"PREMIUM", "CERTIFIED", "STANDARD", "NEW"})
    CampgroundCertification certification
) {}