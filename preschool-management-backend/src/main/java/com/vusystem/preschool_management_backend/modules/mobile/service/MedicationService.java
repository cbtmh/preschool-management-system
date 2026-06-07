package com.vusystem.preschool_management_backend.modules.mobile.service;

import com.vusystem.preschool_management_backend.modules.mobile.dto.request.MedicationCreateRequest;
import com.vusystem.preschool_management_backend.modules.mobile.dto.response.MedicationResponse;

import java.time.LocalDate;
import java.util.List;

public interface MedicationService {
    // Phụ huynh: Tạo đơn xin uống thuốc
    MedicationResponse createRequest(MedicationCreateRequest request);

    // Phụ huynh: Xem danh sách đơn thuốc của con
    List<MedicationResponse> getParentRequests(Long childId);

    // Giáo viên: Lấy danh sách đơn thuốc của lớp (có kèm cảnh báo Dị ứng)
    List<MedicationResponse> getClassRequests(Long classId, LocalDate date);

    // Giáo viên: Xác nhận đã cho uống thuốc xong
    void markAsCompleted(Long id);
}