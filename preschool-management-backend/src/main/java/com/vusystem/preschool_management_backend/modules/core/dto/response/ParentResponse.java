package com.vusystem.preschool_management_backend.modules.core.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParentResponse {
    private Long id;          // ID của hồ sơ phụ huynh
    private Long userId;      // ID của tài khoản đăng nhập
    private String username;  // Số điện thoại
    private String email;
    private String fullName;
    private String address;
    private List<String> childrenNames;
}