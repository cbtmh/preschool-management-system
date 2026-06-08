package com.vusystem.preschool_management_backend.modules.core.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherResponse {
    private Long id; // Teacher ID
    private Long userId; // Liên kết tới bảng User

    // Thông tin tài khoản
    private String username; // Số điện thoại
    private String email;

    // Thông tin hồ sơ
    private String fullName;
    private LocalDate dob;
    private String gender;
    private String address;
    
    // Danh sách lớp đang chủ nhiệm
    private java.util.List<String> assignedClasses;
}