package com.vusystem.preschool_management_backend.modules.mobile.controller;

import com.vusystem.preschool_management_backend.common.dto.response.ApiResponse;
import com.vusystem.preschool_management_backend.modules.mobile.dto.health.ChildHealthSummaryDto;
import com.vusystem.preschool_management_backend.modules.mobile.dto.health.HealthRecordCreateRequest;
import com.vusystem.preschool_management_backend.modules.mobile.dto.health.HealthRecordDto;
import com.vusystem.preschool_management_backend.modules.mobile.service.HealthRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mobile/health-records")
@RequiredArgsConstructor
public class HealthRecordController {

    private final HealthRecordService healthRecordService;

    @GetMapping("/children/{childId}")
    @PreAuthorize("hasAnyRole('PARENT', 'TEACHER', 'ADMIN')")
    public ApiResponse<List<HealthRecordDto>> getHealthRecords(@PathVariable Long childId) {
        return ApiResponse.<List<HealthRecordDto>>builder()
                .status(200)
                .message("Lấy danh sách chỉ số sức khỏe thành công")
                .data(healthRecordService.getHealthRecordsByChildId(childId))
                .build();
    }

    @GetMapping("/classes/{classId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ApiResponse<List<ChildHealthSummaryDto>> getClassHealthSummary(
            @PathVariable Long classId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        return ApiResponse.<List<ChildHealthSummaryDto>>builder()
                .status(200)
                .message("Lấy trạng thái sức khỏe của lớp thành công")
                .data(healthRecordService.getClassHealthSummary(classId, year, month))
                .build();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ApiResponse<HealthRecordDto> createHealthRecord(@Valid @RequestBody HealthRecordCreateRequest request) {
        return ApiResponse.<HealthRecordDto>builder()
                .status(200)
                .message("Cập nhật chỉ số sức khỏe thành công")
                .data(healthRecordService.createHealthRecord(request))
                .build();
    }

    @PutMapping("/children/{id}/allergies/teacher")
    @PreAuthorize("hasRole('TEACHER')")
    public ApiResponse<Object> updateChildAllergiesByTeacher(
            @PathVariable Long id,
            @RequestBody List<com.vusystem.preschool_management_backend.modules.core.dto.request.AllergyRequest> request) {
        return ApiResponse.builder()
                .status(200)
                .message("Cập nhật thông tin dị ứng thành công")
                .data(healthRecordService.updateChildAllergiesByTeacher(id, request))
                .build();
    }
}
