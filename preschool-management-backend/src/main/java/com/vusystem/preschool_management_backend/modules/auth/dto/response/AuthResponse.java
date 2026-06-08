package com.vusystem.preschool_management_backend.modules.auth.dto.response;

import com.vusystem.preschool_management_backend.common.entity.enums.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;     // Sẽ dùng JWT token
    private String refreshToken;
    private Long userId;
    private String username;  // Số điện thoại
    private String email;
    private Role role;        
    private Boolean requiresPasswordChange;
}