package com.vusystem.preschool_management_backend.modules.core.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MealStatisticsResponse {
    private long totalBreakfast;
    private long totalLunch;
    private long totalSnack;
    private long totalMeals; // Tổng cộng tất cả các bữa
}