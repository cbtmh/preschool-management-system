package com.vusystem.preschool_management_backend.modules.core.services;

import com.vusystem.preschool_management_backend.modules.core.dto.request.AcademicYearRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.response.AcademicYearResponse;

import java.util.List;

public interface AcademicYearService {
    
    AcademicYearResponse createAcademicYear(AcademicYearRequest request);

    AcademicYearResponse updateAcademicYear(Long id, AcademicYearRequest request);

    AcademicYearResponse getAcademicYearById(Long id);

    List<AcademicYearResponse> getAllAcademicYears();

    void deleteAcademicYear(Long id);
}