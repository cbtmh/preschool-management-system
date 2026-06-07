package com.vusystem.preschool_management_backend.common.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private int status;       // VD: 200, 400, 404
    private String message;   // VD: "Thành công", "Sai mật khẩu"
    private T data;           // Payload thực tế (thường là DTO)
}