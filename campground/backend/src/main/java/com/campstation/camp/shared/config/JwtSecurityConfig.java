package com.campstation.camp.shared.config;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.campstation.camp.auth.service.JwtTokenService;
import com.campstation.camp.shared.CustomOAuth2UserService;
import com.campstation.camp.shared.JwtAuthenticationFilter;
import com.campstation.camp.shared.JwtUtil;
import com.campstation.camp.shared.OAuth2AuthenticationSuccessHandler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Spring Security JWT 설정
 * JWT 기반 인증/권한 처리
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@Slf4j
public class JwtSecurityConfig {

    @Value("${cors.allowed-origins:http://localhost:3000}")
    private String allowedOrigins;

    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final JwtTokenService jwtTokenService;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .headers(headers -> headers
                    .frameOptions(frameOptions -> frameOptions.sameOrigin()) // H2 콘솔을 위한 frame 허용
                )
                .exceptionHandling(exception -> exception
                    .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        // 인증 불필요한 경로
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/api/test/**").permitAll()
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/api-docs/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/actuator/**").permitAll()

                        // 캠핑장 조회는 인증 불필요
                        .requestMatchers(HttpMethod.GET, "/api/v1/campgrounds").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/campgrounds/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/campgrounds/{id}/sites").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/campgrounds/search").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/campgrounds/popular").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/campgrounds/map").permitAll()
                        
                        // 리뷰 조회는 인증 불필요
                        .requestMatchers(HttpMethod.GET, "/api/v1/reviews/**").permitAll()
                        
                        // 파일 조회는 인증 불필요
                        .requestMatchers(HttpMethod.GET, "/api/v1/files/**").permitAll()
                        
                        // 비회원 예약 API는 인증 불필요
                        .requestMatchers("/api/v1/reservations/guest/**").permitAll()
                        
                        // sites 조회는 인증 불필요
                        .requestMatchers(HttpMethod.GET, "/api/v1/sites/**").permitAll()
                        
                        // 사이트 예약 날짜 조회는 인증 불필요 (개별 조회)
                        .requestMatchers(HttpMethod.GET, "/api/v1/reservations/sites/{siteId}/reserved-dates").permitAll()
                        
                        // 캠핑장 예약 날짜 조회는 인증 불필요 (일괄 조회)
                        .requestMatchers(HttpMethod.GET, "/api/v1/reservations/campgrounds/{campgroundId}/reserved-dates").permitAll()
                        
                        // 캠핑장 생성/수정/삭제는 인증 필요
                        .requestMatchers("/api/v1/campgrounds/**").authenticated()
                        
                        // 리뷰 작성/수정/삭제는 인증 필요
                        .requestMatchers("/api/v1/reviews/**").authenticated()
                        
                        // 예약 관련 API는 인증 필요
                        .requestMatchers("/api/v1/reservations/**").authenticated()
                        
                        // 결제 관련 API는 인증 필요
                        .requestMatchers("/api/v1/payments/**").authenticated()
                        
                        // 관리자 API는 ADMIN 권한 필요
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        
                        // Owner API는 OWNER 권한 필요
                        .requestMatchers("/api/v1/owner/**").hasAnyRole("OWNER", "ADMIN")
                        
                        // OWNER 또는 ADMIN 권한 필요
                        .requestMatchers("/owner/**").hasAnyRole("OWNER", "ADMIN")
                        
                        // OAuth2 로그인 엔드포인트 허용
                        .requestMatchers("/oauth2/**").permitAll()  // OAuth2 로그인 경로 허용
                        
                        // 나머지는 인증 필요
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
                .oauth2Login(oauth2 -> oauth2
                    .userInfoEndpoint(userInfo -> userInfo
                        .userService(customOAuth2UserService)
                    )
                    .successHandler(oAuth2AuthenticationSuccessHandler)
                );

        return http.build();
    }

    /**
     * JWT 인증 필터 Bean 생성
     */
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtUtil, userDetailsService, jwtTokenService);
    }

    /**
     * 인증 매니저 (Spring Security 6.x 권장 방식)
     * DaoAuthenticationProvider를 별도로 생성하지 않고 
     * AuthenticationManagerBuilder를 통해 자동 구성
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * 비밀번호 인코더
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * CORS 설정
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 환경변수로 허용할 origin 설정
        String[] origins = allowedOrigins.split(",");
        configuration.setAllowedOriginPatterns(Arrays.asList(origins));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}