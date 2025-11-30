package com.campstation.camp.shared;

/**
 * OAuth2 제공자로부터 얻은 사용자 정보 인터페이스
 */
public interface OAuth2UserInfo {
    String getProviderId();
    String getProvider();
    String getEmail();
    String getName();
    String getProfileImage();
    String getId();
}
