package com.vusystem.preschool_management_backend.modules.mobile.dto.response;

import com.vusystem.preschool_management_backend.common.entity.enums.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyLogHistoryResponse {
    private LocalDate date;
    private AttendanceStatus attendanceStatus;
}
