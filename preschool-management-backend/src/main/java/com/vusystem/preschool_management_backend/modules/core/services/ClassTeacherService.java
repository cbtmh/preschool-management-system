package com.vusystem.preschool_management_backend.modules.core.services;

import com.vusystem.preschool_management_backend.modules.core.dto.request.ClassTeacherRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.response.ClassTeacherResponse;

public interface ClassTeacherService {
    // Phân công giáo viên vào lớp (Sử dụng cho cả tạo mới và cập nhật)
    ClassTeacherResponse assignTeachersToClass(ClassTeacherRequest request);

    // Lấy danh sách giáo viên hiện tại của một lớp
    ClassTeacherResponse getTeachersByClassId(Long classId);

    // Lấy danh sách lớp mà giáo viên được phân công
    java.util.List<com.vusystem.preschool_management_backend.modules.core.dto.response.SchoolClassResponse> getClassesByTeacherId(Long teacherId);
}