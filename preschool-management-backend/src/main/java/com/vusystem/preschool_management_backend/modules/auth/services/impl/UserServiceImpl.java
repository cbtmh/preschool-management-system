package com.vusystem.preschool_management_backend.modules.auth.services.impl;

import com.vusystem.preschool_management_backend.modules.auth.repository.UserRepository;
import com.vusystem.preschool_management_backend.modules.auth.services.UserService;
import com.vusystem.preschool_management_backend.common.entity.user.User;
import com.vusystem.preschool_management_backend.common.entity.enums.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import java.util.Random;
import com.vusystem.preschool_management_backend.modules.auth.services.SmsService;
import com.vusystem.preschool_management_backend.modules.communication.services.MailService;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SmsService smsService;
    private final MailService mailService;
    private static final String ALPHANUMERIC_STRING = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    @Override
    @Transactional
    public User createNewUser(String username, String email, Role role) {
        if (existsByUsername(username)) {
            throw new RuntimeException("Số điện thoại này đã được đăng ký tài khoản");
        }
        if (email != null && !email.trim().isEmpty() && userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email này đã được đăng ký tài khoản");
        }

        // Generate a random 6-character alphanumeric password
        StringBuilder builder = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < 6; i++) {
            int character = (int)(random.nextDouble() * ALPHANUMERIC_STRING.length());
            builder.append(ALPHANUMERIC_STRING.charAt(character));
        }
        String generatedPassword = builder.toString();

        User newUser = User.builder()
                .username(username)
                .email(email != null && !email.trim().isEmpty() ? email : null)
                .passwordHash(passwordEncoder.encode(generatedPassword))
                .role(role)
                .isActive(true)
                .requiresPasswordChange(true)
                .build();

        User savedUser = userRepository.save(newUser);
        
        // Send SMS
        try {
            smsService.sendTemporaryPassword(username, generatedPassword);
        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", username, e.getMessage());
        }

        // Send Email if available
        if (savedUser.getEmail() != null && !savedUser.getEmail().isEmpty()) {
            String roleName = role == Role.TEACHER ? "Giáo viên" : (role == Role.PARENT ? "Phụ huynh" : "Người dùng");
            mailService.sendAccountCreationEmail(savedUser.getEmail(), username, generatedPassword, roleName);
        }
        
        return savedUser;
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id));
    }

    @Override
    @Transactional
    public void resendPassword(Long userId) {
        User user = findById(userId);
        
        // Generate a new random 6-character alphanumeric password
        StringBuilder builder = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < 6; i++) {
            int character = (int)(random.nextDouble() * ALPHANUMERIC_STRING.length());
            builder.append(ALPHANUMERIC_STRING.charAt(character));
        }
        String generatedPassword = builder.toString();

        user.setPasswordHash(passwordEncoder.encode(generatedPassword));
        user.setRequiresPasswordChange(true);
        userRepository.save(user);

        // Send SMS
        try {
            smsService.sendTemporaryPassword(user.getUsername(), generatedPassword);
        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", user.getUsername(), e.getMessage());
        }

        // Send Email if available
        if (user.getEmail() != null && !user.getEmail().isEmpty()) {
            String roleName = user.getRole() == Role.TEACHER ? "Giáo viên" : (user.getRole() == Role.PARENT ? "Phụ huynh" : "Người dùng");
            mailService.sendAccountCreationEmail(user.getEmail(), user.getUsername(), generatedPassword, roleName);
        }
    }

    @Override
    @Transactional
    public void forgotPassword(String username) {
        User user = findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với số điện thoại này"));
        resendPassword(user.getId());
    }

    @Override
    @Transactional
    public void updatePushToken(Long userId, String token) {
        User user = findById(userId);
        user.setDeviceToken(token);
        userRepository.save(user);
    }
}