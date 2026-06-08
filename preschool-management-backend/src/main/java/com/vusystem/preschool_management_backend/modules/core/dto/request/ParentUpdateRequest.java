package com.vusystem.preschool_management_backend.modules.core.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParentUpdateRequest {

    @jakarta.validation.constraints.Email(message = "Email không hợp lệ")
    private String email;

    // Khi update hồ sơ, không cho phép đổi SĐT và Mật khẩu ở API này
    @NotBlank(message = "Họ và tên không được để trống")
    @Size(max = 100, message = "Họ và tên không được vượt quá 100 ký tự")
    private String fullName;

    @NotBlank(message = "Địa chỉ không được để trống")
    private String address;
}