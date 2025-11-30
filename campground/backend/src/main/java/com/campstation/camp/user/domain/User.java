package com.campstation.camp.user.domain;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.campstation.camp.shared.domain.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

/**
 * 사용자 엔티티
 * Spring Security UserDetails 인터페이스를 구현하여 인증 정보 제공
 */
@Entity
@Table(name = "users")
@JsonIgnoreProperties({"enabled", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "authorities"})
public class User extends BaseEntity implements UserDetails {

    @Column(unique = true, nullable = true, length = 50)
    private String username;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(length = 50)
    private String name;

    @Column(length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role = UserRole.USER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(length = 20)
    private String provider;

    @Column(name = "provider_id", length = 100)
    private String providerId;

    @Transient
    private String profileImage; // TODO: ProfileImage 엔티티로 마이그레이션 예정

    // 환불 계좌 정보
    @Column(name = "refund_bank_name", length = 50)
    private String refundBankName; // 환불 은행명
    
    @Column(name = "refund_account_number", length = 50)
    private String refundAccountNumber; // 환불 계좌번호
    
    @Column(name = "refund_account_holder", length = 50)
    private String refundAccountHolder; // 환불 계좌 예금주명

    // Constructors
    public User() {
    }

    public User(String username, String email, String password, String name, String phone, UserRole role, UserStatus status, LocalDateTime lastLoginAt, String provider, String providerId, String profileImage) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.name = name;
        this.phone = phone;
        this.role = role;
        this.status = status;
        this.lastLoginAt = lastLoginAt;
        this.provider = provider;
        this.providerId = providerId;
        this.profileImage = profileImage;
    }

    // Getters and Setters
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getUsernameField() {
        return username;
    }

    public void setUsernameField(String username) {
        this.username = username;
    }

    /**
     * 소셜 로그인 시 username 자동 생성
     * username이 없는 경우 email의 로컬 파트 + ID를 조합하여 생성
     */
    public void generateUsernameForSocialLogin() {
        if (this.username == null && this.email != null) {
            String baseUsername = this.email.split("@")[0];
            // 특수문자 제거 및 길이 제한
            String cleanUsername = baseUsername.replaceAll("[^a-zA-Z0-9_]", "_");
            if (cleanUsername.length() > 20) {
                cleanUsername = cleanUsername.substring(0, 20);
            }
            this.username = cleanUsername;
        }
    }

    /**
     * username 중복 시 숫자 접미사 추가
     * @param suffix 추가할 숫자
     */
    public void appendUsernameSuffix(int suffix) {
        if (this.username != null) {
            this.username = this.username + suffix;
        }
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public UserStatus getStatus() {
        return status;
    }

    public void setStatus(UserStatus status) {
        this.status = status;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

    public LocalDateTime getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(LocalDateTime lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }

    public String getRefundBankName() {
        return refundBankName;
    }

    public void setRefundBankName(String refundBankName) {
        this.refundBankName = refundBankName;
    }

    public String getRefundAccountNumber() {
        return refundAccountNumber;
    }

    public void setRefundAccountNumber(String refundAccountNumber) {
        this.refundAccountNumber = refundAccountNumber;
    }

    public String getRefundAccountHolder() {
        return refundAccountHolder;
    }

    public void setRefundAccountHolder(String refundAccountHolder) {
        this.refundAccountHolder = refundAccountHolder;
    }

    /**
     * OAuth2 로그인 시 사용자 정보 업데이트
     */
    public void updateOAuth2Info(String name, String profileImage) {
        if (name != null && !name.isEmpty()) {
            this.name = name;
        }
        if (profileImage != null && !profileImage.isEmpty()) {
            this.profileImage = profileImage;
        }
    }

    // Spring Security UserDetails 구현
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return status == UserStatus.ACTIVE;
    }

    @Override
    public boolean isAccountNonLocked() {
        return status != UserStatus.LOCKED;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return status == UserStatus.ACTIVE;
    }

    /**
     * 관리자 여부 확인
     */
    public boolean isAdmin() {
        return role == UserRole.ADMIN;
    }

    /**
     * 캠핑장 소유자 여부 확인
     */
    public boolean isOwner() {
        return role == UserRole.OWNER || role == UserRole.ADMIN;
    }

    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String username;
        private String email;
        private String password;
        private String name;
        private String phone;
        private UserRole role = UserRole.USER;
        private UserStatus status = UserStatus.ACTIVE;
        private LocalDateTime lastLoginAt;
        private String provider;
        private String providerId;
        private String profileImage;

        public Builder username(String username) {
            this.username = username;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder password(String password) {
            this.password = password;
            return this;
        }

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder phone(String phone) {
            this.phone = phone;
            return this;
        }

        public Builder role(UserRole role) {
            this.role = role;
            return this;
        }

        public Builder status(UserStatus status) {
            this.status = status;
            return this;
        }

        public Builder lastLoginAt(LocalDateTime lastLoginAt) {
            this.lastLoginAt = lastLoginAt;
            return this;
        }

        public Builder provider(String provider) {
            this.provider = provider;
            return this;
        }

        public Builder providerId(String providerId) {
            this.providerId = providerId;
            return this;
        }

        public Builder profileImage(String profileImage) {
            this.profileImage = profileImage;
            return this;
        }

        public User build() {
            User user = new User();
            user.setUsernameField(username);
            user.setEmail(email);
            user.setPassword(password);
            user.setName(name);
            user.setPhone(phone);
            user.setRole(role);
            user.setStatus(status);
            user.setLastLoginAt(lastLoginAt);
            user.setProvider(provider);
            user.setProviderId(providerId);
            user.setProfileImage(profileImage);
            return user;
        }
    }
}
