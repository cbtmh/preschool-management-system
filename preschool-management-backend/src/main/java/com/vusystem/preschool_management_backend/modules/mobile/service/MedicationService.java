package com.vusystem.preschool_management_backend.modules.mobile.service;

import com.vusystem.preschool_management_backend.modules.mobile.dto.request.MedicationCreateRequest;
import com.vusystem.preschool_management_backend.modules.mobile.dto.response.MedicationResponse;

import java.time.LocalDate;
import java.util.List;

public interface MedicationService {
    MedicationResponse createRequest(MedicationCreateRequest request);

    List<MedicationResponse> getParentRequests(Long childId);

    // phân tách api cho giáo viên, cần map thêm cảnh báo dị ứng từ profile học sinh
    List<MedicationResponse> getClassRequests(Long classId, LocalDate date);

    void markAsCompleted(Long id);
}