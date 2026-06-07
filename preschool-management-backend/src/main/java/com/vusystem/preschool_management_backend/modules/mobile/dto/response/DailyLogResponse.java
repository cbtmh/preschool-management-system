package com.vusystem.preschool_management_backend.modules.mobile.dto.response;

import com.vusystem.preschool_management_backend.common.entity.enums.AttendanceStatus;
import com.vusystem.preschool_management_backend.common.entity.enums.MealLevel;
import com.vusystem.preschool_management_backend.common.entity.enums.SleepQuality;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyLogResponse {
    
    private Long id; 
    private Long childId;
    private String childFullName; 
    private LocalDate date;
    private LocalTime checkInTime; 
    private LocalTime checkOutTime;
    private AttendanceStatus attendanceStatus;
    private MealLevel mealStatus;
    private SleepQuality sleepStatus;
    private String teacherNotes;
    
    private Boolean hasSevereAllergy;
}