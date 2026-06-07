package com.vusystem.preschool_management_backend.modules.mobile.dto.request;

import com.vusystem.preschool_management_backend.common.entity.enums.AttendanceStatus;
import com.vusystem.preschool_management_backend.common.entity.enums.MealLevel;
import com.vusystem.preschool_management_backend.common.entity.enums.SleepQuality;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyLogBatchUpdateRequest {

    @NotNull(message = "ID lớp học không được để trống")
    private Long classId;

    @NotEmpty(message = "Danh sách điểm danh không được để trống")
    @Valid
    private List<DailyLogItem> logs;

    // Inner class đại diện cho 1 dòng điểm danh của 1 bé
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyLogItem {
        @NotNull(message = "ID học sinh không được để trống")
        private Long childId;

        @NotNull(message = "Trạng thái điểm danh không được để trống")
        private AttendanceStatus attendanceStatus;

        // Các trường đánh giá này có thể null (ví dụ: bé nghỉ học thì không có đánh giá ăn/ngủ)
        private LocalTime checkInTime;
        private LocalTime checkOutTime;
        private MealLevel mealStatus;
        private SleepQuality sleepStatus;
        private String teacherNotes;
    }
}