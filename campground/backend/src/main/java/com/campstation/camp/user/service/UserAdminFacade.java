package com.campstation.camp.user.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campstation.camp.shared.exception.ResourceNotFoundException;
import com.campstation.camp.user.domain.User;
import com.campstation.camp.user.domain.UserStatus;
import com.campstation.camp.user.dto.AdminUserUpdateRequest;
import com.campstation.camp.user.dto.UserAdminResponse;
import com.campstation.camp.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserAdminFacade {

    private final UserRepository userRepository;

    public Page<UserAdminResponse> findAll(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(UserAdminResponse::from);
    }

    public UserAdminResponse getByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다: " + email));
        return UserAdminResponse.from(user);
    }

    public UserAdminResponse getById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다: " + userId));
        return UserAdminResponse.from(user);
    }

    @Transactional
    public UserAdminResponse updateUser(Long userId, AdminUserUpdateRequest updateRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다: " + userId));

        if (updateRequest.getName() != null) {
            user.setName(updateRequest.getName());
        }
        if (updateRequest.getPhone() != null) {
            user.setPhone(updateRequest.getPhone());
        }
        if (updateRequest.getRole() != null) {
            user.setRole(updateRequest.getRole());
        }
        if (updateRequest.getEmail() != null) {
            user.setEmail(updateRequest.getEmail());
        }
        return UserAdminResponse.from(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다: " + userId));
        userRepository.delete(user);
    }

    @Transactional
    public UserAdminResponse toggleStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다: " + userId));
        
        // UserStatus 토글: ACTIVE <-> INACTIVE
        if (user.getStatus() == UserStatus.ACTIVE) {
            user.setStatus(UserStatus.INACTIVE);
        } else {
            user.setStatus(UserStatus.ACTIVE);
        }
        
        return UserAdminResponse.from(userRepository.save(user));
    }

    public long countAll() {
        return userRepository.count();
    }
}
