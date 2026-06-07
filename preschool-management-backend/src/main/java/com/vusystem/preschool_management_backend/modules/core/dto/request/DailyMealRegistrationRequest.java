package com.vusystem.preschool_management_backend.modules.core.dto.request;

import com.vusystem.preschool_management_backend.common.entity.enums.MealType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyMealRegistrationRequest {

    @NotNull(message = "ID của trẻ không được để trống")
    private Long childId;

    @NotNull(message = "Ngày cập nhật không được để trống")
    private LocalDate date;

    @NotNull(message = "Trạng thái đăng ký không được để trống")
    private Boolean isRegistered;

    @NotNull(message = "Danh sách bữa ăn không được để trống")
    private List<MealType> mealTypes;
}
