package com.vusystem.preschool_management_backend.modules.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPasswordRequest {
    @NotBlank(message = "Số điện thoại không được để trống")
    private String username;
}
