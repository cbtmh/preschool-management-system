package com.vusystem.preschool_management_backend.modules.auth.services;

import com.vusystem.preschool_management_backend.modules.auth.dto.response.AuthResponse;
import com.vusystem.preschool_management_backend.modules.auth.dto.response.MeResponse;
import com.vusystem.preschool_management_backend.modules.auth.dto.request.ChangePasswordRequest;
import com.vusystem.preschool_management_backend.modules.auth.dto.request.LoginRequest;

public interface AuthService {
    AuthResponse login(LoginRequest loginRequest);
    MeResponse getMe();
    void changePassword(ChangePasswordRequest request);
    void logout(String token);
    com.vusystem.preschool_management_backend.modules.auth.dto.response.RefreshTokenResponse refreshToken(com.vusystem.preschool_management_backend.modules.auth.dto.request.RefreshTokenRequest request);
}