package com.campstation.camp.shared;

import java.util.Map;

/**
 * Kakao OAuth2 사용자 정보
 */
public class KakaoOAuth2UserInfo implements OAuth2UserInfo {

    private final Map<String, Object> attributes;

    public KakaoOAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> getKakaoAccount() {
        Object accountObj = attributes.get("kakao_account");
        if (accountObj instanceof Map) {
            return (Map<String, Object>) accountObj;
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> getProperties() {
        Object propertiesObj = attributes.get("properties");
        if (propertiesObj instanceof Map) {
            return (Map<String, Object>) propertiesObj;
        }
        return null;
    }

    @Override
    public String getProviderId() {
        Object id = attributes.get("id");
        return id != null ? String.valueOf(id) : null;
    }

    @Override
    public String getProvider() {
        return "kakao";
    }

    @Override
    public String getEmail() {
        Map<String, Object> kakaoAccount = getKakaoAccount();
        return kakaoAccount != null ? (String) kakaoAccount.get("email") : null;
    }

    @Override
    public String getName() {
        Map<String, Object> properties = getProperties();
        return properties != null ? (String) properties.get("nickname") : null;
    }

    @Override
    public String getProfileImage() {
        Map<String, Object> properties = getProperties();
        return properties != null ? (String) properties.get("profile_image") : null;
    }

    @Override
    public String getId() {
        return getProviderId();
    }
}
