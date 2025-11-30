package com.campstation.camp.shared.validation;

import java.util.regex.Pattern;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import lombok.extern.slf4j.Slf4j;

/**
 * 입력 데이터 유효성 검증을 위한 유틸리티 클래스
 */
@Component
@Slf4j
public class InputValidator {

    // 이메일 정규식 패턴
    private static final Pattern EMAIL_PATTERN =
        Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    // 비밀번호 패턴 (최소 8자, 숫자 포함)
    private static final Pattern PASSWORD_PATTERN =
        Pattern.compile("^(?=.*\\d).{8,}$");

    // 사용자명 패턴 (알파벳, 숫자, 밑줄만 허용, 3-20자)
    private static final Pattern USERNAME_PATTERN =
        Pattern.compile("^[a-zA-Z0-9_]{3,20}$");

    // 전화번호 패턴 (국제 형식)
    private static final Pattern PHONE_PATTERN =
        Pattern.compile("^(\\+?[1-9]\\d{1,14}|01[016789]-?\\d{3,4}-?\\d{4}|0\\d{1,2}-?\\d{3,4}-?\\d{4})$");

    /**
     * 이메일 주소 유효성 검증
     */
    public boolean isValidEmail(String email) {
        if (!StringUtils.hasText(email)) {
            return false;
        }

        boolean isValid = EMAIL_PATTERN.matcher(email.trim()).matches();
        if (!isValid) {
            log.warn("Invalid email format: {}", email);
        }
        return isValid;
    }

    /**
     * 비밀번호 강도 검증
     */
    public boolean isValidPassword(String password) {
        if (!StringUtils.hasText(password)) {
            return false;
        }

        boolean isValid = PASSWORD_PATTERN.matcher(password).matches();
        if (!isValid) {
            log.warn("Password does not meet security requirements");
        }
        return isValid;
    }

    /**
     * 사용자명 유효성 검증
     */
    public boolean isValidUsername(String username) {
        if (!StringUtils.hasText(username)) {
            return false;
        }

        boolean isValid = USERNAME_PATTERN.matcher(username.trim()).matches();
        if (!isValid) {
            log.warn("Invalid username format: {}", username);
        }
        return isValid;
    }

    /**
     * 전화번호 유효성 검증
     */
    public boolean isValidPhoneNumber(String phoneNumber) {
        if (!StringUtils.hasText(phoneNumber)) {
            return false;
        }

        boolean isValid = PHONE_PATTERN.matcher(phoneNumber.trim()).matches();
        if (!isValid) {
            log.warn("Invalid phone number format: {}", phoneNumber);
        }
        return isValid;
    }

    /**
     * 일반 텍스트 길이 검증
     */
    public boolean isValidTextLength(String text, int minLength, int maxLength) {
        if (!StringUtils.hasText(text)) {
            return minLength == 0; // 빈 문자열이 허용되는 경우
        }

        int length = text.trim().length();
        boolean isValid = length >= minLength && length <= maxLength;

        if (!isValid) {
            log.warn("Text length out of range: {} (required: {}-{})", length, minLength, maxLength);
        }

        return isValid;
    }

    /**
     * SQL 인젝션 방지를 위한 텍스트 정리
     */
    public String sanitizeInput(String input) {
        if (!StringUtils.hasText(input)) {
            return input;
        }

        // 기본적인 SQL 인젝션 방지
        return input.trim()
                .replaceAll("(?i)script", "")
                .replaceAll("(?i)javascript", "")
                .replaceAll("(?i)onload", "")
                .replaceAll("(?i)onerror", "")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;");
    }

    /**
     * XSS 방지를 위한 HTML 이스케이프
     */
    public String escapeHtml(String input) {
        if (!StringUtils.hasText(input)) {
            return input;
        }

        return input.replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;")
                .replaceAll("\"", "&quot;")
                .replaceAll("'", "&#x27;")
                .replaceAll("/", "&#x2F;");
    }
}