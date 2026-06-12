package com.vusystem.preschool_management_backend.modules.core.services;

import com.vusystem.preschool_management_backend.modules.core.dto.request.SchoolClassRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.response.SchoolClassResponse;

import java.util.List;

public interface SchoolClassService {
    SchoolClassResponse createClass(SchoolClassRequest request);
    SchoolClassResponse updateClass(Long id, SchoolClassRequest request);
    SchoolClassResponse getClassById(Long id);
    List<SchoolClassResponse> getAllClasses();
    List<SchoolClassResponse> getClassesByAcademicYearId(Long academicYearId);
    void deleteClass(Long id);
}