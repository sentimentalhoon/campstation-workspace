package com.campstation.camp.shared.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Getter;
import lombok.Setter;

/**
 * 토스페이먼츠 결제 게이트웨이 설정 클래스
 * 
 * application.yml의 toss.payments 설정을 바인딩
 * - Secret Key, Client Key 등 인증 정보
 * - 결제 성공/실패 리다이렉트 URL
 * - API 타임아웃 설정
 * 
 * @see <a href="https://docs.tosspayments.com">토스페이먼츠 API 문서</a>
 */
@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "toss.payments")
public class TossPaymentsConfig {
    
    /**
     * 토스페이먼츠 시크릿 키 (서버 사이드 인증용)
     * Base64 인코딩하여 Authorization 헤더에 사용
     */
    private String secretKey;
    
    /**
     * 토스페이먼츠 클라이언트 키 (프론트엔드용)
     * 결제창을 띄울 때 사용
     */
    private String clientKey;
    
    /**
     * 토스페이먼츠 API 기본 URL
     * 기본값: https://api.tosspayments.com
     */
    private String baseUrl = "https://api.tosspayments.com";
    
    /**
     * 결제 성공 시 리다이렉트 URL
     */
    private String successUrl;
    
    /**
     * 결제 실패 시 리다이렉트 URL
     */
    private String failUrl;
    
    /**
     * 결제 API 타임아웃 (밀리초)
     * 기본값: 30000 (30초)
     */
    private int timeout = 30000;
}
