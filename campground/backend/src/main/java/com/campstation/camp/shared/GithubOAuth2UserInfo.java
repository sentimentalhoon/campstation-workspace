package com.campstation.camp.shared;

import java.util.Map;

/**
 * GitHub OAuth2 사용자 정보
 */
public class GithubOAuth2UserInfo implements OAuth2UserInfo {

    private final Map<String, Object> attributes;

    public GithubOAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    @Override
    public String getProviderId() {
        return String.valueOf(attributes.get("id"));
    }

    @Override
    public String getProvider() {
        return "github";
    }

    @Override
    public String getEmail() {
        return (String) attributes.get("email");
    }

    @Override
    public String getName() {
        return (String) attributes.get("login");
    }

    @Override
    public String getProfileImage() {
        return (String) attributes.get("avatar_url");
    }

    @Override
    public String getId() {
        return getProviderId();
    }
}
