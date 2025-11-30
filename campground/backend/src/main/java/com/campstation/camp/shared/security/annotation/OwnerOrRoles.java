package com.campstation.camp.shared.security.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 리소스 소유자이거나 특정 역할을 가진 사용자만 접근 가능한 어노테이션
 * 
 * Ownable 리소스의 소유자이거나 지정된 역할 중 하나를 가진 경우 접근 허용
 * 
 * 사용 예시:
 * ```java
 * @OwnerOrRoles({"ADMIN", "MODERATOR"})
 * @PutMapping("/reviews/{id}")
 * public ResponseEntity<?> updateReview(@PathVariable Long id) {
 *     // 리뷰 작성자 본인이거나 ADMIN, MODERATOR 역할을 가진 사용자만 수정 가능
 * }
 * ```
 * 
 * @author CampStation Development Team
 * @version 1.0
 * @since 2025-11-03
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface OwnerOrRoles {
    
    /**
     * 소유자가 아닐 경우 허용할 역할 목록
     * 
     * @return 역할 배열
     */
    String[] value();
    
    /**
     * 리소스 ID를 가진 파라미터 이름
     * 
     * @return 파라미터 이름
     */
    String resourceIdParam() default "id";
    
    /**
     * 리소스 타입 (엔티티 클래스)
     * 
     * @return 리소스 클래스
     */
    Class<?> resourceType();
    
    /**
     * 에러 메시지 (선택사항)
     * 
     * @return 에러 메시지
     */
    String message() default "리소스 소유자 또는 관리자만 접근할 수 있습니다.";
}
