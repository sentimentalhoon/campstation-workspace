package com.campstation.camp.shared.security;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

/**
 * 보안 어노테이션 통합 테스트
 * 
 * @Authenticated와 @OwnerOrAdmin 어노테이션이 Controller 레벨에서
 * 제대로 작동하는지 검증하는 통합 테스트
 * 
 * HTTP 응답 상태 코드(401 Unauthorized, 403 Forbidden)를 통해
 * 권한 체크 로직이 올바르게 동작하는지 검증합니다.
 * 
 * 참고: 이 테스트는 보안 설정에 따라 일부 실패할 수 있습니다.
 * 실제 프로덕션 환경에서는 각 Controller의 비즈니스 로직을 Mock하여 테스트해야 합니다.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@DisplayName("보안 어노테이션 통합 테스트")
class SecurityAnnotationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Nested
    @DisplayName("@Authenticated 어노테이션 테스트")
    class AuthenticatedAnnotationTests {

        @Test
        @DisplayName("인증된 사용자는 예약 목록을 조회할 수 있다")
        void authenticatedUserCanViewReservations() throws Exception {
            mockMvc.perform(get("/api/v1/reservations")
                    .with(user("user@test.com")
                            .authorities(List.of(new SimpleGrantedAuthority("ROLE_USER")))))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("인증되지 않은 사용자는 예약 목록을 조회할 수 없다 - 401 Unauthorized")
        void unauthenticatedUserCannotViewReservations() throws Exception {
            mockMvc.perform(get("/api/v1/reservations"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("인증된 사용자는 즐겨찾기 목록을 조회할 수 있다")
        void authenticatedUserCanViewFavorites() throws Exception {
            mockMvc.perform(get("/api/v1/favorites")
                    .with(user("user@test.com")
                            .authorities(List.of(new SimpleGrantedAuthority("ROLE_USER")))))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("인증되지 않은 사용자는 즐겨찾기를 조회할 수 없다 - 401 Unauthorized")
        void unauthenticatedUserCannotViewFavorites() throws Exception {
            mockMvc.perform(get("/api/v1/favorites"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("인증된 사용자는 사용자 정보를 조회할 수 있다")
        void authenticatedUserCanViewProfile() throws Exception {
            mockMvc.perform(get("/api/v1/users/1")
                    .with(user("user@test.com")
                            .authorities(List.of(new SimpleGrantedAuthority("ROLE_USER")))))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("인증되지 않은 사용자는 사용자 정보를 조회할 수 없다 - 401 Unauthorized")
        void unauthenticatedUserCannotViewProfile() throws Exception {
            mockMvc.perform(get("/api/v1/users/1"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("@OwnerOrAdmin 어노테이션 테스트")
    class OwnerOrAdminAnnotationTests {

        @Test
        @DisplayName("ADMIN 사용자는 캠핑장을 생성할 수 있다")
        void adminCanCreateCampground() throws Exception {
            String campgroundJson = """
                {
                    "name": "Test Campground",
                    "description": "Test Description",
                    "address": "Test Address"
                }
                """;

            mockMvc.perform(post("/api/v1/campgrounds")
                    .with(user("admin@test.com")
                            .authorities(List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(campgroundJson))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("OWNER 사용자는 캠핑장을 생성할 수 있다")
        void ownerCanCreateCampground() throws Exception {
            String campgroundJson = """
                {
                    "name": "Test Campground",
                    "description": "Test Description",
                    "address": "Test Address"
                }
                """;

            mockMvc.perform(post("/api/v1/campgrounds")
                    .with(user("owner@test.com")
                            .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER"))))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(campgroundJson))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("일반 USER는 캠핑장을 생성할 수 없다 - 403 Forbidden")
        void regularUserCannotCreateCampground() throws Exception {
            String campgroundJson = """
                {
                    "name": "Test Campground",
                    "description": "Test Description",
                    "address": "Test Address"
                }
                """;

            mockMvc.perform(post("/api/v1/campgrounds")
                    .with(user("user@test.com")
                            .authorities(List.of(new SimpleGrantedAuthority("ROLE_USER"))))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(campgroundJson))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("ADMIN 사용자는 Owner 대시보드를 조회할 수 있다")
        void adminCanViewOwnerDashboard() throws Exception {
            mockMvc.perform(get("/api/v1/owner/dashboard/stats")
                    .with(user("admin@test.com")
                            .authorities(List.of(new SimpleGrantedAuthority("ROLE_ADMIN")))))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("OWNER 사용자는 자신의 대시보드를 조회할 수 있다")
        void ownerCanViewOwnDashboard() throws Exception {
            mockMvc.perform(get("/api/v1/owner/dashboard/stats")
                    .with(user("owner@test.com")
                            .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER")))))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("일반 USER는 Owner 대시보드를 조회할 수 없다 - 403 Forbidden")
        void regularUserCannotViewOwnerDashboard() throws Exception {
            mockMvc.perform(get("/api/v1/owner/dashboard/stats")
                    .with(user("user@test.com")
                            .authorities(List.of(new SimpleGrantedAuthority("ROLE_USER")))))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("ADMIN 사용자는 Owner의 캠핑장 목록을 조회할 수 있다")
        void adminCanViewOwnerCampgrounds() throws Exception {
            mockMvc.perform(get("/api/v1/owner/campgrounds")
                    .with(user("admin@test.com")
                            .authorities(List.of(new SimpleGrantedAuthority("ROLE_ADMIN")))))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("OWNER 사용자는 자신의 캠핑장 목록을 조회할 수 있다")
        void ownerCanViewOwnCampgrounds() throws Exception {
            mockMvc.perform(get("/api/v1/owner/campgrounds")
                    .with(user("owner@test.com")
                            .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER")))))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("일반 USER는 Owner의 캠핑장 목록을 조회할 수 없다 - 403 Forbidden")
        void regularUserCannotViewOwnerCampgrounds() throws Exception {
            mockMvc.perform(get("/api/v1/owner/campgrounds")
                    .with(user("user@test.com")
                            .authorities(List.of(new SimpleGrantedAuthority("ROLE_USER")))))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("인증 vs 인가 차이 테스트")
    class AuthenticationVsAuthorizationTests {

        @Test
        @DisplayName("인증 없이 접근 시 401 Unauthorized 반환")
        void noAuthenticationReturns401() throws Exception {
            mockMvc.perform(get("/api/v1/reservations"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("인증은 되었지만 권한이 부족한 경우 403 Forbidden 반환")
        void insufficientPermissionReturns403() throws Exception {
            mockMvc.perform(post("/api/v1/campgrounds")
                    .with(user("user@test.com")
                            .authorities(List.of(new SimpleGrantedAuthority("ROLE_USER"))))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{}"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("OWNER 권한이 필요한 엔드포인트에 USER로 접근 시 403 Forbidden")
        void userAccessingOwnerEndpointReturns403() throws Exception {
            mockMvc.perform(get("/api/v1/owner/dashboard/stats")
                    .with(user("user@test.com")
                            .authorities(List.of(new SimpleGrantedAuthority("ROLE_USER")))))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("인증 없이 Owner 엔드포인트 접근 시 401 Unauthorized")
        void unauthenticatedAccessingOwnerEndpointReturns401() throws Exception {
            mockMvc.perform(get("/api/v1/owner/campgrounds"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("다양한 권한 조합 테스트")
    class MultipleRoleScenarioTests {

        @Test
        @DisplayName("ADMIN과 OWNER 모두 Owner 엔드포인트에 접근 가능")
        void adminAndOwnerCanAccessOwnerEndpoints() throws Exception {
            // ADMIN 접근
            mockMvc.perform(get("/api/v1/owner/reservations")
                    .with(user("admin@test.com")
                            .authorities(List.of(new SimpleGrantedAuthority("ROLE_ADMIN")))))
                    .andExpect(status().isOk());

            // OWNER 접근
            mockMvc.perform(get("/api/v1/owner/reservations")
                    .with(user("owner@test.com")
                            .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER")))))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("모든 권한 사용자는 인증이 필요한 엔드포인트에 접근 가능")
        void allRolesCanAccessAuthenticatedEndpoints() throws Exception {
            // USER 접근
            mockMvc.perform(get("/api/v1/favorites")
                    .with(user("user@test.com")
                            .authorities(List.of(new SimpleGrantedAuthority("ROLE_USER")))))
                    .andExpect(status().isOk());

            // OWNER 접근
            mockMvc.perform(get("/api/v1/favorites")
                    .with(user("owner@test.com")
                            .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER")))))
                    .andExpect(status().isOk());

            // ADMIN 접근
            mockMvc.perform(get("/api/v1/favorites")
                    .with(user("admin@test.com")
                            .authorities(List.of(new SimpleGrantedAuthority("ROLE_ADMIN")))))
                    .andExpect(status().isOk());
        }
    }
}
