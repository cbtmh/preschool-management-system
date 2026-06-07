package com.vusystem.preschool_management_backend.modules.auth.controller;

import com.vusystem.preschool_management_backend.modules.auth.dto.response.AuthResponse;
import com.vusystem.preschool_management_backend.modules.auth.dto.request.ChangePasswordRequest;
import com.vusystem.preschool_management_backend.modules.auth.dto.request.ForgotPasswordRequest;
import com.vusystem.preschool_management_backend.modules.auth.dto.request.LoginRequest;
import com.vusystem.preschool_management_backend.common.dto.response.ApiResponse;
import com.vusystem.preschool_management_backend.modules.auth.services.AuthService;
import com.vusystem.preschool_management_backend.modules.auth.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.vusystem.preschool_management_backend.modules.auth.dto.response.MeResponse;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse data = authService.login(request);

        ApiResponse<AuthResponse> response = ApiResponse.<AuthResponse>builder()
                .status(200)
                .message("Đăng nhập thành công")
                .data(data)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse> getMe() {
        MeResponse data = authService.getMe();

        ApiResponse response = ApiResponse.builder()
                .status(200)
                .message("Lấy thông tin cá nhân thành công")
                .data(data)
                .build();

        return ResponseEntity.ok(response);
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(request);

        ApiResponse response = ApiResponse.builder()
                .status(200)
                .message("Đổi mật khẩu thành công")
                .data(null)
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-password/{userId}")
    public ResponseEntity<ApiResponse> resendPassword(@PathVariable Long userId) {
        userService.resendPassword(userId);

        ApiResponse response = ApiResponse.builder()
                .status(200)
                .message("Đã gửi lại mật khẩu thành công")
                .data(null)
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        userService.forgotPassword(request.getUsername());

        ApiResponse response = ApiResponse.builder()
                .status(200)
                .message("Đã gửi mật khẩu mới đến số điện thoại của bạn")
                .data(null)
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            authService.logout(token);
        }
        
        ApiResponse response = ApiResponse.builder()
                .status(200)
                .message("Đăng xuất thành công")
                .data(null)
                .build();
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse> refreshToken(@Valid @RequestBody com.vusystem.preschool_management_backend.modules.auth.dto.request.RefreshTokenRequest request) {
        com.vusystem.preschool_management_backend.modules.auth.dto.response.RefreshTokenResponse data = authService.refreshToken(request);
        
        ApiResponse response = ApiResponse.builder()
                .status(200)
                .message("Làm mới token thành công")
                .data(data)
                .build();
        return ResponseEntity.ok(response);
    }
}