package com.campstation.camp.shared.security.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import org.springframework.security.access.prepost.PreAuthorize;

/**
 * OWNER 또는 ADMIN 권한이 필요한 메서드에 사용하는 커스텀 어노테이션
 * 
 * 이 어노테이션은 @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")와 동일한 기능을 제공합니다.
 * 
 * @see PreAuthorize
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
public @interface OwnerOrAdmin {
}
