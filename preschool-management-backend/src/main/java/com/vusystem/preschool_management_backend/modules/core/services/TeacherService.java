package com.vusystem.preschool_management_backend.modules.core.services;

import com.vusystem.preschool_management_backend.modules.core.dto.request.TeacherCreateRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.request.TeacherUpdateRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.response.TeacherResponse;

import java.util.List;

public interface TeacherService {
    TeacherResponse createTeacher(TeacherCreateRequest request);

    TeacherResponse updateTeacher(Long id, TeacherUpdateRequest request);

    TeacherResponse getTeacherById(Long id);

    List<TeacherResponse> getAllTeachers();

    void deleteTeacher(Long id);
}