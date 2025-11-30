package com.campstation.camp.shared;

import java.util.Map;
import java.util.UUID;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.campstation.camp.user.domain.User;
import com.campstation.camp.user.domain.UserRole;
import com.campstation.camp.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * OAuth2 사용자 정보 서비스
 * 소셜 로그인 시 사용자 정보를 로드하고 처리
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        try {
            return processOAuth2User(userRequest, oauth2User);
        } catch (Exception ex) {
            log.error("OAuth2 사용자 처리 중 오류 발생", ex);
                throw new OAuth2AuthenticationException("OAuth2 사용자 처리 실패");
        }
    }
    private OAuth2User processOAuth2User(OAuth2UserRequest oauth2UserRequest, OAuth2User oauth2User) {
        String registrationId = oauth2UserRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = oauth2User.getAttributes();

        OAuth2UserInfo oAuth2UserInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(registrationId, attributes);

        if (!StringUtils.hasText(oAuth2UserInfo.getEmail())) {
            throw new OAuth2AuthenticationException("OAuth2 제공자로부터 이메일을 가져올 수 없습니다.");
        }

        User user = userRepository.findByEmail(oAuth2UserInfo.getEmail())
                .map(existingUser -> updateExistingUser(existingUser, oAuth2UserInfo))
                .orElseGet(() -> registerNewUser(oauth2UserRequest, oAuth2UserInfo));

        return new CustomOAuth2User(user, attributes);
    }

    private User registerNewUser(OAuth2UserRequest oauth2UserRequest, OAuth2UserInfo oAuth2UserInfo) {
        User user = User.builder()
                .email(oAuth2UserInfo.getEmail())
                .name(oAuth2UserInfo.getName())
                .username(oAuth2UserInfo.getEmail()) // 이메일을 username으로
                .password(UUID.randomUUID().toString()) // 랜덤 패스워드
                .provider(oauth2UserRequest.getClientRegistration().getRegistrationId())
                .providerId(oAuth2UserInfo.getProviderId())
                .profileImage(oAuth2UserInfo.getProfileImage())
                .role(UserRole.USER)
                .build();

        return userRepository.save(user);
    }
    private User updateExistingUser(User existingUser, OAuth2UserInfo oAuth2UserInfo) {
        existingUser.updateOAuth2Info(oAuth2UserInfo.getName(), oAuth2UserInfo.getProfileImage());
        return userRepository.save(existingUser);
    }
}
