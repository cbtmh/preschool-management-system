package com.vusystem.preschool_management_backend.modules.core.controller;

import com.vusystem.preschool_management_backend.common.dto.response.ApiResponse;
import com.vusystem.preschool_management_backend.modules.core.dto.response.ClassAttendanceReportResponse;
import com.vusystem.preschool_management_backend.modules.core.services.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/core/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/attendance")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ApiResponse<ClassAttendanceReportResponse> getClassAttendanceReport(
            @RequestParam("classId") Long classId,
            @RequestParam("month") int month,
            @RequestParam("year") int year) {
        
        ClassAttendanceReportResponse report = reportService.generateClassAttendanceReport(classId, month, year);
        
        return ApiResponse.<ClassAttendanceReportResponse>builder()
                .status(200)
                .message("Generated attendance report successfully")
                .data(report)
                .build();
    }
}
