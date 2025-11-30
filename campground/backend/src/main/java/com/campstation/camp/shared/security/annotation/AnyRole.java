package com.campstation.camp.shared.security.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 여러 역할 중 하나라도 가지고 있으면 접근을 허용하는 어노테이션
 * 
 * OR 조건으로 동작하여 지정된 역할 중 하나만 있어도 접근 가능
 * 
 * 사용 예시:
 * ```java
 * @AnyRole({"USER", "OWNER", "ADMIN"})
 * public ResponseEntity<?> someMethod() {
 *     // USER, OWNER, ADMIN 중 하나의 역할을 가진 사용자만 접근 가능
 * }
 * ```
 * 
 * @author CampStation Development Team
 * @version 1.0
 * @since 2025-11-03
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface AnyRole {
    
    /**
     * 허용할 역할 목록 (OR 조건)
     * 
     * @return 역할 배열
     */
    String[] value();
    
    /**
     * 에러 메시지 (선택사항)
     * 
     * @return 에러 메시지
     */
    String message() default "접근 권한이 없습니다.";
}
