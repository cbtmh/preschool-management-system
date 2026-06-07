package com.vusystem.preschool_management_backend.modules.auth.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class TeacherDto {
    private Long teacherId;
    private String fullName;
    private LocalDate dob;
    private String gender;
    private String address;
    // Tạm thời trả về thông tin cá nhân cơ bản. Nếu đã có logic query lớp chủ nhiệm từ ClassTeacher, có thể bổ sung thêm list các class vào đây.
}