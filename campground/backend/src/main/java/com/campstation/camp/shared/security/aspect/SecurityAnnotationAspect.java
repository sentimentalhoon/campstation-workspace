package com.campstation.camp.shared.security.aspect;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.campstation.camp.shared.security.annotation.AllRoles;
import com.campstation.camp.shared.security.annotation.AnyRole;
import com.campstation.camp.shared.security.annotation.OwnerOrRoles;
import com.campstation.camp.user.domain.User;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 커스텀 보안 어노테이션 처리 Aspect
 * 
 * Java 21의 패턴 매칭과 레코드를 활용한 현대적인 AOP 구현
 * 
 * @author CampStation Development Team
 * @version 2.0
 * @since 2025-11-03
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class SecurityAnnotationAspect {

    /**
     * @AnyRole 어노테이션 처리
     * 
     * 지정된 역할 중 하나라도 가지고 있으면 접근 허용 (OR 조건)
     */
    @Before("@annotation(anyRole)")
    public void checkAnyRole(JoinPoint joinPoint, AnyRole anyRole) {
        log.debug("Checking @AnyRole: {}", Arrays.toString(anyRole.value()));
        
        User currentUser = getCurrentUser();
        Set<String> requiredRoles = Arrays.stream(anyRole.value())
                .collect(Collectors.toSet());
        
        boolean hasAnyRole = requiredRoles.stream()
                .anyMatch(role -> currentUser.getRole().name().equals(role));
        
        if (!hasAnyRole) {
            log.warn("Access denied for user {} - required any of roles: {}", 
                    currentUser.getEmail(), requiredRoles);
            throw new AccessDeniedException(anyRole.message());
        }
        
        log.debug("Access granted for user {} with role {}", 
                currentUser.getEmail(), currentUser.getRole());
    }

    /**
     * @AllRoles 어노테이션 처리
     * 
     * 지정된 모든 역할을 가지고 있어야 접근 허용 (AND 조건)
     * 
     * Note: 현재 시스템은 단일 역할만 지원하므로,
     * 이 어노테이션은 향후 다중 역할 시스템 도입 시 활용 가능
     */
    @Before("@annotation(allRoles)")
    public void checkAllRoles(JoinPoint joinPoint, AllRoles allRoles) {
        log.debug("Checking @AllRoles: {}", Arrays.toString(allRoles.value()));
        
        User currentUser = getCurrentUser();
        Set<String> requiredRoles = Arrays.stream(allRoles.value())
                .collect(Collectors.toSet());
        
        // 현재는 단일 역할만 지원하므로, 요구되는 역할이 1개를 초과하면 실패
        if (requiredRoles.size() > 1) {
            log.warn("Multiple roles required but system only supports single role per user");
            throw new AccessDeniedException("다중 역할 시스템이 아직 지원되지 않습니다.");
        }
        
        boolean hasAllRoles = requiredRoles.stream()
                .allMatch(role -> currentUser.getRole().name().equals(role));
        
        if (!hasAllRoles) {
            log.warn("Access denied for user {} - required all roles: {}", 
                    currentUser.getEmail(), requiredRoles);
            throw new AccessDeniedException(allRoles.message());
        }
        
        log.debug("Access granted for user {} with role {}", 
                currentUser.getEmail(), currentUser.getRole());
    }

    /**
     * @OwnerOrRoles 어노테이션 처리
     * 
     * 리소스 소유자이거나 지정된 역할을 가진 경우 접근 허용
     */
    @Before("@annotation(ownerOrRoles)")
    public void checkOwnerOrRoles(JoinPoint joinPoint, OwnerOrRoles ownerOrRoles) {
        log.debug("Checking @OwnerOrRoles: resource={}, roles={}", 
                ownerOrRoles.resourceType().getSimpleName(), 
                Arrays.toString(ownerOrRoles.value()));
        
        User currentUser = getCurrentUser();
        
        // 먼저 지정된 역할을 가지고 있는지 확인
        Set<String> allowedRoles = Arrays.stream(ownerOrRoles.value())
                .collect(Collectors.toSet());
        
        boolean hasAllowedRole = allowedRoles.stream()
                .anyMatch(role -> currentUser.getRole().name().equals(role));
        
        if (hasAllowedRole) {
            log.debug("Access granted for user {} with privileged role {}", 
                    currentUser.getEmail(), currentUser.getRole());
            return;
        }
        
        // 역할이 없으면 리소스 소유자인지 확인
        try {
            Long resourceId = extractResourceId(joinPoint, ownerOrRoles.resourceIdParam());
            
            // TODO: 리소스를 로드하여 소유자 확인
            // 실제 구현에서는 Repository를 통해 리소스를 조회하고 Ownable.getOwner()로 검증
            log.debug("Resource ownership check for user {} on resource ID {}", 
                    currentUser.getEmail(), resourceId);
            
            // 임시: 리소스 ID가 제공되었으면 소유자로 간주 (실제 구현 시 수정 필요)
            log.warn("Resource ownership check not fully implemented - access granted by default");
            
        } catch (Exception e) {
            log.error("Failed to extract resource ID", e);
            throw new AccessDeniedException(ownerOrRoles.message());
        }
    }

    /**
     * 현재 인증된 사용자를 가져옴
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }
        
        Object principal = authentication.getPrincipal();
        
        return switch (principal) {
            case User user -> user;
            case String username -> throw new AccessDeniedException("사용자 정보를 찾을 수 없습니다: " + username);
            default -> throw new AccessDeniedException("알 수 없는 인증 타입: " + principal.getClass());
        };
    }

    /**
     * 메서드 파라미터에서 리소스 ID를 추출
     */
    private Long extractResourceId(JoinPoint joinPoint, String paramName) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String[] parameterNames = signature.getParameterNames();
        Object[] args = joinPoint.getArgs();
        
        for (int i = 0; i < parameterNames.length; i++) {
            if (parameterNames[i].equals(paramName)) {
                Object arg = args[i];
                return switch (arg) {
                    case Long id -> id;
                    case Integer id -> id.longValue();
                    case String id -> Long.parseLong(id);
                    case null -> throw new IllegalArgumentException("Resource ID cannot be null");
                    default -> throw new IllegalArgumentException(
                            "Unsupported resource ID type: " + arg.getClass());
                };
            }
        }
        
        throw new IllegalArgumentException("Parameter not found: " + paramName);
    }
}
