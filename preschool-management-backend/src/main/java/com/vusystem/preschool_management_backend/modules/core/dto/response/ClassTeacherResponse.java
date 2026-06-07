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
public class ClassTeacherResponse {
    
    private Long classId;
    private String className;
    
    // Danh sách thông tin cơ bản của các giáo viên trong lớp
    private List<TeacherBasicInfo> teachers;

    // Class nội bộ (Inner class) để chứa thông tin thu gọn của Giáo viên
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeacherBasicInfo {
        private Long teacherId;
        private String fullName;
        private String phone; // Trả về số điện thoại để phụ huynh/trường tiện liên lạc
    }
}