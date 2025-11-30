package com.campstation.camp.shared.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import com.campstation.camp.user.domain.User;
import com.campstation.camp.user.domain.UserRole;

/**
 * SecurityUtils 단위 테스트
 * 
 * Java 21의 최신 기법을 활용한 테스트:
 * - @Nested를 통한 테스트 그룹화
 * - @DisplayName으로 테스트 의도 명확화
 * - AssertJ를 활용한 fluent assertion
 */
@DisplayName("SecurityUtils 테스트")
class SecurityUtilsTest {

    private User adminUser;
    private User ownerUser;
    private User regularUser;
    private User anotherUser;
    
    @BeforeEach
    void setUp() throws Exception {
        // ADMIN 역할 사용자
        adminUser = createUserWithId(1L, UserRole.ADMIN, "admin@test.com");
        
        // OWNER 역할 사용자
        ownerUser = createUserWithId(2L, UserRole.OWNER, "owner@test.com");
        
        // 일반 USER 역할 사용자
        regularUser = createUserWithId(3L, UserRole.USER, "user@test.com");
        
        // 다른 일반 사용자
        anotherUser = createUserWithId(4L, UserRole.USER, "another@test.com");
    }
    
    /**
     * 테스트용 User 생성 헬퍼 메서드
     * Reflection을 사용하여 ID를 설정
     */
    private User createUserWithId(Long id, UserRole role, String email) throws Exception {
        User user = new User();
        user.setEmail(email);
        user.setRole(role);
        
        // Reflection을 사용하여 ID 설정 (BaseEntity의 private id 필드)
        java.lang.reflect.Field idField = user.getClass().getSuperclass().getDeclaredField("id");
        idField.setAccessible(true);
        idField.set(user, id);
        
        return user;
    }
    
    @Nested
    @DisplayName("isOwnerOrAdmin 메서드")
    class IsOwnerOrAdminTests {
        
        @Test
        @DisplayName("ADMIN 사용자는 모든 리소스에 접근 가능")
        void adminCanAccessAnyResource() {
            // given
            Long anyOwnerId = 999L;
            
            // when & then
            assertThat(SecurityUtils.isOwnerOrAdmin(adminUser, anyOwnerId))
                .as("ADMIN은 어떤 소유자 ID에도 접근 가능해야 함")
                .isTrue();
        }
        
        @Test
        @DisplayName("소유자 본인은 자신의 리소스에 접근 가능")
        void ownerCanAccessOwnResource() {
            // given
            Long ownerId = ownerUser.getId();
            
            // when & then
            assertThat(SecurityUtils.isOwnerOrAdmin(ownerUser, ownerId))
                .as("소유자는 자신의 리소스에 접근 가능해야 함")
                .isTrue();
        }
        
        @Test
        @DisplayName("일반 사용자는 자신의 리소스에만 접근 가능")
        void regularUserCanAccessOwnResourceOnly() {
            // given
            Long ownerId = regularUser.getId();
            
            // when & then
            assertThat(SecurityUtils.isOwnerOrAdmin(regularUser, ownerId))
                .as("일반 사용자는 자신의 리소스에 접근 가능해야 함")
                .isTrue();
        }
        
        @Test
        @DisplayName("일반 사용자는 다른 사용자의 리소스에 접근 불가")
        void regularUserCannotAccessOthersResource() {
            // given
            Long otherOwnerId = anotherUser.getId();
            
            // when & then
            assertThat(SecurityUtils.isOwnerOrAdmin(regularUser, otherOwnerId))
                .as("일반 사용자는 다른 사용자의 리소스에 접근 불가해야 함")
                .isFalse();
        }
        
        @Test
        @DisplayName("null 사용자는 접근 불가")
        void nullUserCannotAccess() {
            // given
            Long ownerId = 1L;
            
            // when & then
            assertThat(SecurityUtils.isOwnerOrAdmin(null, ownerId))
                .as("null 사용자는 접근 불가해야 함")
                .isFalse();
        }
        
        @Test
        @DisplayName("null 소유자 ID는 접근 불가")
        void nullOwnerIdCannotBeAccessed() {
            // when & then
            assertThat(SecurityUtils.isOwnerOrAdmin(regularUser, null))
                .as("null 소유자 ID는 접근 불가해야 함")
                .isFalse();
        }
        
        @Test
        @DisplayName("null 사용자와 null 소유자 ID는 접근 불가")
        void bothNullCannotAccess() {
            // when & then
            assertThat(SecurityUtils.isOwnerOrAdmin(null, null))
                .as("둘 다 null이면 접근 불가해야 함")
                .isFalse();
        }
    }
    
    @Nested
    @DisplayName("isResourceOwnerOrAdmin 메서드")
    class IsResourceOwnerOrAdminTests {
        
        private TestOwnable ownableResource;
        
        @BeforeEach
        void setUp() {
            ownableResource = new TestOwnable(regularUser);
        }
        
        @Test
        @DisplayName("ADMIN 사용자는 모든 리소스에 접근 가능")
        void adminCanAccessAnyResource() {
            // when & then
            assertThat(SecurityUtils.isResourceOwnerOrAdmin(adminUser, ownableResource))
                .as("ADMIN은 모든 리소스에 접근 가능해야 함")
                .isTrue();
        }
        
        @Test
        @DisplayName("리소스 소유자는 자신의 리소스에 접근 가능")
        void resourceOwnerCanAccessOwnResource() {
            // when & then
            assertThat(SecurityUtils.isResourceOwnerOrAdmin(regularUser, ownableResource))
                .as("리소스 소유자는 자신의 리소스에 접근 가능해야 함")
                .isTrue();
        }
        
        @Test
        @DisplayName("다른 사용자는 리소스에 접근 불가")
        void otherUserCannotAccessResource() {
            // when & then
            assertThat(SecurityUtils.isResourceOwnerOrAdmin(anotherUser, ownableResource))
                .as("다른 사용자는 리소스에 접근 불가해야 함")
                .isFalse();
        }
        
        @Test
        @DisplayName("null 사용자는 접근 불가")
        void nullUserCannotAccess() {
            // when & then
            assertThat(SecurityUtils.isResourceOwnerOrAdmin(null, ownableResource))
                .as("null 사용자는 접근 불가해야 함")
                .isFalse();
        }
        
        @Test
        @DisplayName("null 리소스는 접근 불가")
        void nullResourceCannotBeAccessed() {
            // when & then
            assertThat(SecurityUtils.isResourceOwnerOrAdmin(regularUser, null))
                .as("null 리소스는 접근 불가해야 함")
                .isFalse();
        }
        
        @Test
        @DisplayName("소유자가 null인 리소스는 접근 불가")
        void resourceWithNullOwnerCannotBeAccessed() {
            // given
            TestOwnable resourceWithNullOwner = new TestOwnable(null);
            
            // when & then
            assertThat(SecurityUtils.isResourceOwnerOrAdmin(regularUser, resourceWithNullOwner))
                .as("소유자가 null인 리소스는 접근 불가해야 함")
                .isFalse();
        }
    }
    
    @Nested
    @DisplayName("isAdmin 메서드")
    class IsAdminTests {
        
        @Test
        @DisplayName("ADMIN 역할 사용자는 true 반환")
        void adminUserReturnsTrue() {
            // when & then
            assertThat(SecurityUtils.isAdmin(adminUser))
                .as("ADMIN 역할 사용자는 true를 반환해야 함")
                .isTrue();
        }
        
        @Test
        @DisplayName("OWNER 역할 사용자는 false 반환")
        void ownerUserReturnsFalse() {
            // when & then
            assertThat(SecurityUtils.isAdmin(ownerUser))
                .as("OWNER 역할 사용자는 false를 반환해야 함")
                .isFalse();
        }
        
        @Test
        @DisplayName("일반 USER 역할 사용자는 false 반환")
        void regularUserReturnsFalse() {
            // when & then
            assertThat(SecurityUtils.isAdmin(regularUser))
                .as("일반 USER 역할 사용자는 false를 반환해야 함")
                .isFalse();
        }
        
        @Test
        @DisplayName("null 사용자는 false 반환")
        void nullUserReturnsFalse() {
            // when & then
            assertThat(SecurityUtils.isAdmin(null))
                .as("null 사용자는 false를 반환해야 함")
                .isFalse();
        }
    }
    
    @Nested
    @DisplayName("isOwner 메서드")
    class IsOwnerTests {
        
        @Test
        @DisplayName("OWNER 역할 사용자는 true 반환")
        void ownerUserReturnsTrue() {
            // when & then
            assertThat(SecurityUtils.isOwner(ownerUser))
                .as("OWNER 역할 사용자는 true를 반환해야 함")
                .isTrue();
        }
        
        @Test
        @DisplayName("ADMIN 역할 사용자는 false 반환")
        void adminUserReturnsFalse() {
            // when & then
            assertThat(SecurityUtils.isOwner(adminUser))
                .as("ADMIN 역할 사용자는 false를 반환해야 함")
                .isFalse();
        }
        
        @Test
        @DisplayName("일반 USER 역할 사용자는 false 반환")
        void regularUserReturnsFalse() {
            // when & then
            assertThat(SecurityUtils.isOwner(regularUser))
                .as("일반 USER 역할 사용자는 false를 반환해야 함")
                .isFalse();
        }
        
        @Test
        @DisplayName("null 사용자는 false 반환")
        void nullUserReturnsFalse() {
            // when & then
            assertThat(SecurityUtils.isOwner(null))
                .as("null 사용자는 false를 반환해야 함")
                .isFalse();
        }
    }
    
    @Nested
    @DisplayName("hasOwnerOrAdminRole 메서드")
    class HasOwnerOrAdminRoleTests {
        
        @Test
        @DisplayName("ADMIN 역할 사용자는 true 반환")
        void adminUserReturnsTrue() {
            // when & then
            assertThat(SecurityUtils.hasOwnerOrAdminRole(adminUser))
                .as("ADMIN 역할 사용자는 true를 반환해야 함")
                .isTrue();
        }
        
        @Test
        @DisplayName("OWNER 역할 사용자는 true 반환")
        void ownerUserReturnsTrue() {
            // when & then
            assertThat(SecurityUtils.hasOwnerOrAdminRole(ownerUser))
                .as("OWNER 역할 사용자는 true를 반환해야 함")
                .isTrue();
        }
        
        @Test
        @DisplayName("일반 USER 역할 사용자는 false 반환")
        void regularUserReturnsFalse() {
            // when & then
            assertThat(SecurityUtils.hasOwnerOrAdminRole(regularUser))
                .as("일반 USER 역할 사용자는 false를 반환해야 함")
                .isFalse();
        }
        
        @Test
        @DisplayName("null 사용자는 false 반환")
        void nullUserReturnsFalse() {
            // when & then
            assertThat(SecurityUtils.hasOwnerOrAdminRole(null))
                .as("null 사용자는 false를 반환해야 함")
                .isFalse();
        }
    }
    
    /**
     * 테스트용 Ownable 구현체
     */
    private static class TestOwnable implements Ownable {
        private final User owner;
        
        TestOwnable(User owner) {
            this.owner = owner;
        }
        
        @Override
        public User getOwner() {
            return owner;
        }
    }
}
