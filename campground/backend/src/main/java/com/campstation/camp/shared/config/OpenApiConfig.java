package com.campstation.camp.shared.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;

/**
 * SpringDoc OpenAPI 3.0 구성
 * 
 * 최신 OpenAPI 3.0 표준을 사용한 API 문서화 설정
 * JWT Bearer 인증 스키마 및 다중 서버 환경 지원
 * 
 * @author CampStation Development Team
 * @version 3.0
 * @since 2025-11-03
 */
@Configuration
public class OpenApiConfig {

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    @Value("${app.version:1.0.0}")
    private String appVersion;

    /**
     * OpenAPI 3.0 문서 구성
     * 
     * @return OpenAPI 객체
     */
    @Bean
    public OpenAPI campStationOpenAPI() {
        return new OpenAPI()
                .info(apiInfo())
                .servers(servers())
                .components(securityComponents());
    }

    /**
     * API 정보 구성
     */
    private Info apiInfo() {
        return new Info()
                .title("CampStation API")
                .version(appVersion)
                .description("""
                        # CampStation API Documentation
                        
                        캠핑장 예약 및 관리를 위한 RESTful API 서비스입니다.
                        
                        ## 주요 기능
                        - 🔐 JWT 기반 인증 및 OAuth2 소셜 로그인
                        - 🏕️ 캠핑장 및 사이트 관리
                        - 📅 예약 및 결제 처리
                        - ⭐ 리뷰 및 즐겨찾기
                        - 👤 사용자 프로필 관리
                        - 🔧 관리자 대시보드
                        
                        ## 인증 방법
                        1. `/api/v1/auth/login` 또는 `/api/v1/auth/signup`으로 로그인/회원가입
                        2. 응답으로 받은 `accessToken`을 복사
                        3. 우측 상단 'Authorize' 버튼 클릭
                        4. `Bearer {accessToken}` 형식으로 입력
                        
                        ## 응답 형식
                        모든 API는 다음과 같은 공통 응답 형식을 따릅니다:
                        ```json
                        {
                          "success": true,
                          "message": "Success message",
                          "data": { ... }
                        }
                        ```
                        
                        ## 에러 코드
                        - `400` Bad Request: 잘못된 요청
                        - `401` Unauthorized: 인증 실패
                        - `403` Forbidden: 권한 없음
                        - `404` Not Found: 리소스 없음
                        - `500` Internal Server Error: 서버 오류
                        """)
                .contact(new Contact()
                        .name("CampStation Development Team")
                        .email("support@campstation.com")
                        .url("https://github.com/sentimentalhoon/campstation-backend"))
                .license(new License()
                        .name("MIT License")
                        .url("https://opensource.org/licenses/MIT"));
    }

    /**
     * 서버 정보 구성 (환경별)
     */
    private List<Server> servers() {
        return switch (activeProfile) {
            case "prod" -> List.of(
                    new Server()
                            .url("https://api.campstation.com")
                            .description("프로덕션 서버"),
                    new Server()
                            .url("https://staging.campstation.com")
                            .description("스테이징 서버")
            );
            case "dev" -> List.of(
                    new Server()
                            .url("http://localhost:8080")
                            .description("개발 서버"),
                    new Server()
                            .url("http://localhost:3000")
                            .description("프론트엔드 개발 서버")
            );
            default -> List.of(
                    new Server()
                            .url("http://localhost:8080")
                            .description("로컬 서버")
            );
        };
    }

    /**
     * 보안 스키마 구성 (JWT Bearer)
     */
    private Components securityComponents() {
        return new Components()
                .addSecuritySchemes("bearer-jwt", new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("""
                                JWT 인증 토큰을 입력하세요.
                                
                                형식: `Bearer {token}`
                                
                                예시:
                                ```
                                Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                                ```
                                
                                토큰은 로그인 API를 통해 발급받을 수 있습니다.
                                """));
    }
}