package com.campstation.camp.shared.security;

import com.campstation.camp.user.domain.User;
import com.campstation.camp.user.domain.UserRole;

/**
 * 보안 권한 체크 유틸리티 클래스
 * 
 * OWNER 및 ADMIN 권한 검증을 위한 헬퍼 메서드를 제공합니다.
 */
public class SecurityUtils {
    
    /**
     * 사용자가 ADMIN이거나 지정된 소유자인지 확인
     * 
     * @param user 확인할 사용자
     * @param ownerId 소유자 ID
     * @return ADMIN이거나 소유자면 true
     */
    public static boolean isOwnerOrAdmin(User user, Long ownerId) {
        if (user == null || ownerId == null) {
            return false;
        }
        
        return user.getRole() == UserRole.ADMIN || 
               user.getId().equals(ownerId);
    }
    
    /**
     * 사용자가 ADMIN이거나 리소스의 소유자인지 확인
     * 
     * @param user 확인할 사용자
     * @param resource 소유자 정보를 가진 리소스
     * @return ADMIN이거나 리소스 소유자면 true
     */
    public static boolean isResourceOwnerOrAdmin(User user, Ownable resource) {
        if (user == null || resource == null || resource.getOwner() == null) {
            return false;
        }
        
        return user.getRole() == UserRole.ADMIN || 
               resource.getOwner().getId().equals(user.getId());
    }
    
    /**
     * 사용자가 ADMIN 권한을 가지고 있는지 확인
     * 
     * @param user 확인할 사용자
     * @return ADMIN이면 true
     */
    public static boolean isAdmin(User user) {
        if (user == null) {
            return false;
        }
        
        return user.getRole() == UserRole.ADMIN;
    }
    
    /**
     * 사용자가 OWNER 권한을 가지고 있는지 확인
     * 
     * @param user 확인할 사용자
     * @return OWNER면 true
     */
    public static boolean isOwner(User user) {
        if (user == null) {
            return false;
        }
        
        return user.getRole() == UserRole.OWNER;
    }
    
    /**
     * 사용자가 OWNER 또는 ADMIN 권한을 가지고 있는지 확인
     * 
     * @param user 확인할 사용자
     * @return OWNER 또는 ADMIN이면 true
     */
    public static boolean hasOwnerOrAdminRole(User user) {
        if (user == null) {
            return false;
        }
        
        return user.getRole() == UserRole.OWNER || 
               user.getRole() == UserRole.ADMIN;
    }
}
