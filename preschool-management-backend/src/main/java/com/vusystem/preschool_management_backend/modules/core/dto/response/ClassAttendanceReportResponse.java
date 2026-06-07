package com.vusystem.preschool_management_backend.modules.core.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassAttendanceReportResponse {
    private Long classId;
    private String className;
    private int month;
    private int year;
    private int totalSchoolDays;
    private List<ChildAttendanceReportDto> childReports;
}
