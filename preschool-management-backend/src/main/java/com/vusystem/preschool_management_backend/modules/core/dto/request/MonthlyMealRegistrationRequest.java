package com.vusystem.preschool_management_backend.modules.core.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyMealRegistrationRequest {

    @NotNull(message = "ID của trẻ không được để trống")
    private Long childId;

    @NotNull(message = "Tháng không được để trống")
    @Min(value = 1, message = "Tháng không hợp lệ")
    @Max(value = 12, message = "Tháng không hợp lệ")
    private Integer month;

    @NotNull(message = "Năm không được để trống")
    private Integer year;

    @NotNull(message = "Trạng thái đăng ký không được để trống")
    private Boolean isRegistered;

    @NotNull(message = "Danh sách bữa ăn không được để trống")
    private java.util.List<com.vusystem.preschool_management_backend.common.entity.enums.MealType> mealTypes;
}
