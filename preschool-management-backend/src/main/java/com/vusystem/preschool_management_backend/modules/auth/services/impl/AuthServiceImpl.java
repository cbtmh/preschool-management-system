package com.vusystem.preschool_management_backend.modules.auth.services.impl;

import com.vusystem.preschool_management_backend.common.entity.user.User;
import com.vusystem.preschool_management_backend.common.utils.JwtUtil;
import com.vusystem.preschool_management_backend.modules.auth.dto.request.LoginRequest;
import com.vusystem.preschool_management_backend.modules.auth.dto.response.AuthResponse;
import com.vusystem.preschool_management_backend.modules.auth.dto.response.ChildDto;
import com.vusystem.preschool_management_backend.modules.auth.dto.response.MeResponse;
import com.vusystem.preschool_management_backend.modules.auth.dto.response.ParentDto;
import com.vusystem.preschool_management_backend.modules.auth.dto.response.TeacherDto;
import com.vusystem.preschool_management_backend.modules.auth.repository.UserRepository;
import com.vusystem.preschool_management_backend.modules.auth.services.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import com.vusystem.preschool_management_backend.modules.auth.dto.response.*;
import com.vusystem.preschool_management_backend.common.entity.enums.Role;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import com.vusystem.preschool_management_backend.modules.auth.dto.request.ChangePasswordRequest;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import com.vusystem.preschool_management_backend.modules.auth.entity.TokenBlacklist;
import com.vusystem.preschool_management_backend.modules.auth.repository.TokenBlacklistRepository;
import com.vusystem.preschool_management_backend.modules.auth.entity.RefreshToken;
import com.vusystem.preschool_management_backend.modules.auth.repository.RefreshTokenRepository;
import com.vusystem.preschool_management_backend.modules.auth.dto.request.RefreshTokenRequest;
import java.util.Date;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

        private final UserRepository userRepository;
        private final AuthenticationManager authenticationManager;
        private final JwtUtil jwtUtil;
        private final PasswordEncoder passwordEncoder;
        private final TokenBlacklistRepository tokenBlacklistRepository;
        private final RefreshTokenRepository refreshTokenRepository;

        @Override
        @Transactional
        public AuthResponse login(LoginRequest request) {

                // xác thực thông qua spring security authenticationmanager, tự động ném badcredentialsexception nếu thất bại
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getUsername(),
                                                request.getPassword()));

        User user = userRepository.findByUsernameOrEmail(request.getUsername(), request.getUsername())
                                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

                // kiểm tra trạng thái kích hoạt của tài khoản
                if (!user.getIsActive()) {
                        throw new RuntimeException("Tài khoản đã bị khóa");
                }

        Map<String, Object> extraClaims = new HashMap<>();
                extraClaims.put("role", user.getRole().name());
                extraClaims.put("userId", user.getId());

        String token = jwtUtil.generateToken(extraClaims, user);
                String refreshTokenStr = jwtUtil.generateRefreshToken();
                
                // vô hiệu hóa các session cũ để đảm bảo 1 tài khoản chỉ có 1 session hoạt động tại một thời điểm
                refreshTokenRepository.deleteByUser_Id(user.getId());
                
        RefreshToken refreshToken = RefreshToken.builder()
                        .user(user)
                        .token(refreshTokenStr)
                        .expiryDate(new Date(System.currentTimeMillis() + jwtUtil.getRefreshExpiration()))
                        .build();
                refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
                                .token(token)
                                .refreshToken(refreshTokenStr)
                                .userId(user.getId())
                                .username(user.getUsername())
                                .email(user.getEmail())
                                .role(user.getRole())
                                .requiresPasswordChange(user.getRequiresPasswordChange())
                                .build();
        }

        @Override
        @Transactional(readOnly = true)
        public MeResponse getMe() {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                String username = authentication.getName();

                User user = userRepository.findByUsernameOrEmail(username, username)
                                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

                Object profile = null;

                if (user.getRole() == Role.TEACHER && user.getTeacherProfile() != null) {
                        var teacher = user.getTeacherProfile();
                        profile = TeacherDto.builder()
                                        .teacherId(teacher.getId())
                                        .fullName(teacher.getFullName())
                                        .dob(teacher.getDob())
                                        .gender(teacher.getGender() != null ? teacher.getGender().name() : null)
                                        .address(teacher.getAddress())
                                        .build();
                } else if (user.getRole() == Role.PARENT && user.getParentProfile() != null) {
                        var parent = user.getParentProfile();
                        var childDtos = parent.getChildren().stream()
                                        .map(child -> ChildDto.builder()
                                                        .childId(child.getId())
                                                        .fullName(child.getFullName())
                                                        .dob(child.getDob())
                                                        .gender(child.getGender().name())
                                                        .status(child.getStatus().name())
                                                        .build())
                                        .collect(Collectors.toList());

                        profile = ParentDto.builder()
                                        .parentId(parent.getId())
                                        .fullName(parent.getFullName())
                                        .address(parent.getAddress())
                                        .children(childDtos)
                                        .build();
                }
                return MeResponse.builder()
                                .userId(user.getId())
                                .username(user.getUsername())
                                .email(user.getEmail())
                                .role(user.getRole())
                                .profile(profile)
                                .requiresPasswordChange(user.getRequiresPasswordChange())
                                .build();
        }

        @Override
        public void changePassword(ChangePasswordRequest request) {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                String username = authentication.getName();

                User user = userRepository.findByUsernameOrEmail(username, username)
                                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

                if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
                        throw new RuntimeException("Mật khẩu cũ không chính xác");
                }

                user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
                user.setRequiresPasswordChange(false);
                userRepository.save(user);
        }

        @Override
        @Transactional
        public void logout(String token) {
                if (tokenBlacklistRepository.existsByToken(token)) {
                        return;
                }
                
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication != null && authentication.getName() != null) {
                    User user = userRepository.findByUsernameOrEmail(authentication.getName(), authentication.getName()).orElse(null);
                    if (user != null) {
                        refreshTokenRepository.deleteByUser_Id(user.getId());
                        user.setDeviceToken(null);
                        userRepository.save(user);
                    }
                }

                Date expiryDate = jwtUtil.extractExpiration(token);
                TokenBlacklist blacklist = TokenBlacklist.builder()
                                .token(token)
                                .expiryDate(expiryDate)
                                .build();
                tokenBlacklistRepository.save(blacklist);
        }

        @Override
        @Transactional
        public RefreshTokenResponse refreshToken(RefreshTokenRequest request) {
            RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                    .orElseThrow(() -> new RuntimeException("Refresh Token không hợp lệ"));
            
            if (refreshToken.getExpiryDate().before(new Date())) {
                refreshTokenRepository.delete(refreshToken);
                throw new RuntimeException("Refresh Token đã hết hạn. Vui lòng đăng nhập lại.");
            }
            
            User user = refreshToken.getUser();
            Map<String, Object> extraClaims = new HashMap<>();
            extraClaims.put("role", user.getRole().name());
            extraClaims.put("userId", user.getId());
            
            String accessToken = jwtUtil.generateToken(extraClaims, user);
            
            // thu hồi refresh token cũ để triển khai cơ chế refresh token rotation, ngăn chặn tấn công replay
            refreshTokenRepository.delete(refreshToken);

            String newRefreshTokenStr = jwtUtil.generateRefreshToken();
            RefreshToken newRefreshToken = RefreshToken.builder()
                    .user(user)
                    .token(newRefreshTokenStr)
                    .expiryDate(new Date(System.currentTimeMillis() + jwtUtil.getRefreshExpiration()))
                    .build();
            refreshTokenRepository.save(newRefreshToken);
            
            return RefreshTokenResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(newRefreshTokenStr)
                    .build();
        }
}
