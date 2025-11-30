package com.campstation.camp.shared.security.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 모든 지정된 역할을 가지고 있어야 접근을 허용하는 어노테이션
 * 
 * AND 조건으로 동작하여 지정된 모든 역할을 가지고 있어야 접근 가능
 * 
 * 사용 예시:
 * ```java
 * @AllRoles({"OWNER", "VERIFIED"})
 * public ResponseEntity<?> someMethod() {
 *     // OWNER이면서 동시에 VERIFIED 역할을 가진 사용자만 접근 가능
 * }
 * ```
 * 
 * @author CampStation Development Team
 * @version 1.0
 * @since 2025-11-03
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface AllRoles {
    
    /**
     * 필요한 모든 역할 목록 (AND 조건)
     * 
     * @return 역할 배열
     */
    String[] value();
    
    /**
     * 에러 메시지 (선택사항)
     * 
     * @return 에러 메시지
     */
    String message() default "모든 필수 권한이 필요합니다.";
}
