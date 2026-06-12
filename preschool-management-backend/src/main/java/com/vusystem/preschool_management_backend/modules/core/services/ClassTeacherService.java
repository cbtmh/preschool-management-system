package com.vusystem.preschool_management_backend.modules.core.services;

import com.vusystem.preschool_management_backend.modules.core.dto.request.ClassTeacherRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.response.ClassTeacherResponse;

public interface ClassTeacherService {
    // phân công giáo viên vào lớp hỗ trợ cả luồng thêm mới và cập nhật
    ClassTeacherResponse assignTeachersToClass(ClassTeacherRequest request);

    ClassTeacherResponse getTeachersByClassId(Long classId);

    java.util.List<com.vusystem.preschool_management_backend.modules.core.dto.response.SchoolClassResponse> getClassesByTeacherId(Long teacherId);
}