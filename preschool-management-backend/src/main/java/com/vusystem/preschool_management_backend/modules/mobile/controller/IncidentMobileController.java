package com.vusystem.preschool_management_backend.modules.mobile.controller;

import com.vusystem.preschool_management_backend.common.dto.response.ApiResponse;
import com.vusystem.preschool_management_backend.modules.mobile.dto.request.IncidentReportRequest;
import com.vusystem.preschool_management_backend.modules.mobile.dto.response.IncidentReportResponse;
import com.vusystem.preschool_management_backend.modules.mobile.service.IncidentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mobile/incidents")
@RequiredArgsConstructor
public class IncidentMobileController {

    private final IncidentService incidentService;

    // --- TEACHER APIs ---

    @PostMapping("/teacher")
    @PreAuthorize("hasRole('TEACHER')")
    public ApiResponse<IncidentReportResponse> createIncident(@Valid @RequestBody IncidentReportRequest request) {
        return ApiResponse.<IncidentReportResponse>builder()
                .status(200)
                .message("Tạo tường trình sự việc thành công")
                .data(incidentService.createIncident(request))
                .build();
    }

    @GetMapping("/teacher")
    @PreAuthorize("hasRole('TEACHER')")
    public ApiResponse<List<IncidentReportResponse>> getTeacherIncidents() {
        return ApiResponse.<List<IncidentReportResponse>>builder()
                .status(200)
                .message("Lấy danh sách tường trình thành công")
                .data(incidentService.getTeacherIncidents())
                .build();
    }

    @GetMapping("/teacher/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ApiResponse<IncidentReportResponse> getTeacherIncidentDetail(@PathVariable Long id) {
        return ApiResponse.<IncidentReportResponse>builder()
                .status(200)
                .message("Lấy chi tiết tường trình thành công")
                .data(incidentService.getIncidentDetail(id))
                .build();
    }

    // --- PARENT APIs ---

    @GetMapping("/parent/children/{childId}")
    @PreAuthorize("hasRole('PARENT')")
    public ApiResponse<List<IncidentReportResponse>> getParentIncidents(@PathVariable Long childId) {
        return ApiResponse.<List<IncidentReportResponse>>builder()
                .status(200)
                .message("Lấy danh sách thông báo sự việc thành công")
                .data(incidentService.getParentIncidents(childId))
                .build();
    }

    @GetMapping("/parent/{id}/children/{childId}")
    @PreAuthorize("hasRole('PARENT')")
    public ApiResponse<IncidentReportResponse> getParentIncidentDetail(@PathVariable Long id, @PathVariable Long childId) {
        return ApiResponse.<IncidentReportResponse>builder()
                .status(200)
                .message("Lấy chi tiết thông báo sự việc thành công")
                .data(incidentService.getParentIncidentDetail(id, childId))
                .build();
    }
}
