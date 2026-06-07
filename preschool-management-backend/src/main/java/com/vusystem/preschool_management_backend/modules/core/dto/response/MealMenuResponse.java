package com.vusystem.preschool_management_backend.modules.core.dto.response;

import com.vusystem.preschool_management_backend.common.entity.enums.MealType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MealMenuResponse {
    private Long id;
    private LocalDate date;
    private MealType mealType;
    private String description;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}