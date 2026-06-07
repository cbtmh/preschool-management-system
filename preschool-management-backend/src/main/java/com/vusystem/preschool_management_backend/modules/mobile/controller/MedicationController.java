package com.vusystem.preschool_management_backend.modules.mobile.controller;

import com.vusystem.preschool_management_backend.common.dto.response.ApiResponse;
import com.vusystem.preschool_management_backend.modules.mobile.dto.request.MedicationCreateRequest;
import com.vusystem.preschool_management_backend.modules.mobile.service.MedicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/mobile/medications")
@RequiredArgsConstructor
public class MedicationController {

    private final MedicationService medicationService;

    // --- API CHO PHỤ HUYNH ---

    @PostMapping
    @PreAuthorize("hasRole('PARENT')")
    public ApiResponse<?> createRequest(@Valid @RequestBody MedicationCreateRequest request) {
        return ApiResponse.builder()
                .status(200)
                .message("Tạo đơn xin uống thuốc thành công")
                .data(medicationService.createRequest(request))
                .build();
    }

    @GetMapping("/children/{childId}")
    @PreAuthorize("hasRole('PARENT')")
    public ApiResponse<List<?>> getParentRequests(@PathVariable Long childId) {
        return ApiResponse.<List<?>>builder()
                .status(200)
                .message("Lấy lịch sử đơn thuốc thành công")
                .data(medicationService.getParentRequests(childId))
                .build();
    }

    // --- API CHO GIÁO VIÊN ---

    @GetMapping("/classes/{classId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ApiResponse<List<?>> getClassRequests(
            @PathVariable Long classId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ApiResponse.<List<?>>builder()
                .status(200)
                .message("Lấy danh sách cần uống thuốc của lớp thành công")
                .data(medicationService.getClassRequests(classId, date))
                .build();
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ApiResponse<?> markAsCompleted(@PathVariable Long id) {
        medicationService.markAsCompleted(id);
        return ApiResponse.builder()
                .status(200)
                .message("Đã cập nhật trạng thái uống thuốc thành COMPLETED")
                .data(null)
                .build();
    }
}