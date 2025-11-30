package com.campstation.camp.shared;

import java.util.Map;

/**
 * OAuth2 제공자별 사용자 정보 팩토리
 */
public class OAuth2UserInfoFactory {

    public static OAuth2UserInfo getOAuth2UserInfo(String registrationId, Map<String, Object> attributes) {
        if ("google".equals(registrationId)) {
            return new GoogleOAuth2UserInfo(attributes);
        } else if ("github".equals(registrationId)) {
            return new GithubOAuth2UserInfo(attributes);
        } else if ("kakao".equals(registrationId)) {
            return new KakaoOAuth2UserInfo(attributes);
        } else if ("naver".equals(registrationId)) {
            return new NaverOAuth2UserInfo(attributes);
        } else {
            throw new IllegalArgumentException("지원하지 않는 OAuth2 제공자: " + registrationId);
        }
    }
}
