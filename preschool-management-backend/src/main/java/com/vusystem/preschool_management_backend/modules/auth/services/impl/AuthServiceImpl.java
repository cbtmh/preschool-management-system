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

                // 1. Xác thực bằng AuthenticationManager của Spring Security (thay cho check
                // password thủ công)
                // Nếu sai mật khẩu hoặc user không tồn tại, nó sẽ tự ném ra
                // BadCredentialsException
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getUsername(),
                                                request.getPassword()));

                // 2. Tìm user (đã chắc chắn đúng thông tin sau khi pass bước 1)
                User user = userRepository.findByUsername(request.getUsername())
                                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

                // 3. Kiểm tra trạng thái hoạt động (Nếu làm chuẩn thì có thể đưa vào
                // UserDetails.isEnabled() như bước 2)
                if (!user.getIsActive()) {
                        throw new RuntimeException("Tài khoản đã bị khóa");
                }

                // 4. Tạo extra claims để ném thêm thông tin hữu ích vào payload của JWT
                Map<String, Object> extraClaims = new HashMap<>();
                extraClaims.put("role", user.getRole().name());
                extraClaims.put("userId", user.getId());

                // 5. Sinh JWT Token và Refresh Token
                String token = jwtUtil.generateToken(extraClaims, user);
                String refreshTokenStr = jwtUtil.generateRefreshToken();
                
                // Xóa refresh token cũ (tuỳ chọn: để 1 user chỉ có 1 session tại 1 thời điểm)
                refreshTokenRepository.deleteByUser_Id(user.getId());
                
                // Lưu Refresh Token
                RefreshToken refreshToken = RefreshToken.builder()
                        .user(user)
                        .token(refreshTokenStr)
                        .expiryDate(new Date(System.currentTimeMillis() + jwtUtil.getRefreshExpiration()))
                        .build();
                refreshTokenRepository.save(refreshToken);

                // 6. Trả về Response
                return AuthResponse.builder()
                                .token(token)
                                .refreshToken(refreshTokenStr)
                                .userId(user.getId())
                                .username(user.getUsername())
                                .role(user.getRole())
                                .requiresPasswordChange(user.getRequiresPasswordChange())
                                .build();
        }

        @Override
        @Transactional(readOnly = true)
        public MeResponse getMe() {
                // 1. Lấy thông tin xác thực từ SecurityContext (do JwtAuthFilter đã đẩy vào)
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                String username = authentication.getName(); // Đây chính là số điện thoại

                // 2. Query DB để lấy thực thể User
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

                // 3. Xây dựng thông tin Profile tùy theo Role
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
                        var childDtos = parent.getChildren().stream() // Danh sách con của Parent [cite: 109, 444]
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
                // Nếu là ADMIN thì profile có thể để null hoặc tạo một AdminDto riêng nếu cần

                // 4. Trả về kết quả
                return MeResponse.builder()
                                .userId(user.getId())
                                .username(user.getUsername())
                                .role(user.getRole())
                                .profile(profile)
                                .requiresPasswordChange(user.getRequiresPasswordChange())
                                .build();
        }

        @Override
        public void changePassword(ChangePasswordRequest request) {
                // Lấy thông tin người dùng đang đăng nhập từ SecurityContext
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                String username = authentication.getName();

                // Tìm user trong Database
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

                // Kiểm tra mật khẩu cũ có khớp với mật khẩu đã hash trong DB không
                if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
                        throw new RuntimeException("Mật khẩu cũ không chính xác");
                }

                // Băm mật khẩu mới và cập nhật xuống Database
                user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
                user.setRequiresPasswordChange(false);
                userRepository.save(user);
        }

        @Override
        @Transactional
        public void logout(String token) {
                if (tokenBlacklistRepository.existsByToken(token)) {
                        return; // Already blacklisted
                }
                
                // Xoá Refresh Token của user hiện tại
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication != null && authentication.getName() != null) {
                    User user = userRepository.findByUsername(authentication.getName()).orElse(null);
                    if (user != null) {
                        refreshTokenRepository.deleteByUser_Id(user.getId());
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
            
            // Xóa Refresh Token cũ để tránh bị sử dụng lại (Cơ chế Refresh Token Rotation)
            refreshTokenRepository.delete(refreshToken);

            // Tạo Refresh Token mới
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
