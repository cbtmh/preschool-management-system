package com.vusystem.preschool_management_backend.modules.auth.services;

import com.vusystem.preschool_management_backend.common.entity.user.User;
import com.vusystem.preschool_management_backend.common.entity.enums.Role;

import java.util.Optional;

public interface UserService {
    User createNewUser(String username, String email, Role role);
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    User findById(Long id);
    void resendPassword(Long userId);
    void forgotPassword(String username);
    void updatePushToken(Long userId, String token);
}