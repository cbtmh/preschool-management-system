package com.vusystem.preschool_management_backend.modules.core.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChildAttendanceReportDto {
    private Long childId;
    private String childName;
    private int totalPresentDays;
    private int totalExcusedAbsences;
    private int totalUnexcusedAbsences;
    private int totalCancelledMeals;
    private int totalCancelledBreakfasts;
    private int totalCancelledLunches;
    private int totalCancelledSnacks;
    private double attendanceRate;
}
