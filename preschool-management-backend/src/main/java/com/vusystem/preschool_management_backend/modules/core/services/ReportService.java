package com.vusystem.preschool_management_backend.modules.core.services;

import com.vusystem.preschool_management_backend.modules.core.dto.response.ClassAttendanceReportResponse;

public interface ReportService {
    ClassAttendanceReportResponse generateClassAttendanceReport(Long classId, int month, int year);
}
