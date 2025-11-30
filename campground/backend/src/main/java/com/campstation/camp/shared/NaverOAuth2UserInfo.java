package com.campstation.camp.shared;

import java.util.Map;

/**
 * Naver OAuth2 사용자 정보
 */
public class NaverOAuth2UserInfo implements OAuth2UserInfo {

    private final Map<String, Object> attributes;

    public NaverOAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> getResponse() {
        Object responseObj = attributes.get("response");
        if (responseObj instanceof Map) {
            return (Map<String, Object>) responseObj;
        }
        return null;
    }

    @Override
    public String getProviderId() {
        Map<String, Object> response = getResponse();
        return response != null ? String.valueOf(response.get("id")) : null;
    }

    @Override
    public String getProvider() {
        return "naver";
    }

    @Override
    public String getEmail() {
        Map<String, Object> response = getResponse();
        return response != null ? (String) response.get("email") : null;
    }

    @Override
    public String getName() {
        Map<String, Object> response = getResponse();
        return response != null ? (String) response.get("name") : null;
    }

    @Override
    public String getProfileImage() {
        Map<String, Object> response = getResponse();
        return response != null ? (String) response.get("profile_image") : null;
    }

    @Override
    public String getId() {
        return getProviderId();
    }
}
