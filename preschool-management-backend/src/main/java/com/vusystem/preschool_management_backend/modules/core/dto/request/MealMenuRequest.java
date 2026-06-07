package com.vusystem.preschool_management_backend.modules.core.dto.request;

import com.vusystem.preschool_management_backend.common.entity.enums.MealType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MealMenuRequest {

    @NotNull(message = "Ngày áp dụng thực đơn không được để trống")
    private LocalDate date;

    @NotNull(message = "Loại bữa ăn không được để trống")
    private MealType mealType;

    @NotBlank(message = "Mô tả thực đơn không được để trống")
    private String description;

    // Ảnh có thể null nếu trường chưa kịp chụp/cập nhật
    private String imageUrl;
}