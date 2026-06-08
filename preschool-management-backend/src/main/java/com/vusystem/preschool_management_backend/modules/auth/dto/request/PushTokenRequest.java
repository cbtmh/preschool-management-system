package com.vusystem.preschool_management_backend.modules.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PushTokenRequest {
    @NotBlank(message = "Push token cannot be blank")
    private String token;
}
