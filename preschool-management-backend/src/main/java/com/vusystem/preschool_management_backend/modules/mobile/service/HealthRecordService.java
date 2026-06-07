package com.vusystem.preschool_management_backend.modules.mobile.service;

import com.vusystem.preschool_management_backend.modules.mobile.dto.health.ChildHealthSummaryDto;
import com.vusystem.preschool_management_backend.modules.mobile.dto.health.HealthRecordCreateRequest;
import com.vusystem.preschool_management_backend.modules.mobile.dto.health.HealthRecordDto;

import java.util.List;

public interface HealthRecordService {
    List<HealthRecordDto> getHealthRecordsByChildId(Long childId);
    HealthRecordDto createHealthRecord(HealthRecordCreateRequest request);
    List<ChildHealthSummaryDto> getClassHealthSummary(Long classId, Integer year, Integer month);
    com.vusystem.preschool_management_backend.modules.core.dto.response.ChildResponse updateChildAllergiesByTeacher(Long childId, List<com.vusystem.preschool_management_backend.modules.core.dto.request.AllergyRequest> request);
}
