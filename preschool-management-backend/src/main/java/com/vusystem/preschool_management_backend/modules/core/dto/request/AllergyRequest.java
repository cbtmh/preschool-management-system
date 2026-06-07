package com.vusystem.preschool_management_backend.modules.core.dto.request;

import com.vusystem.preschool_management_backend.common.entity.enums.SeverityLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AllergyRequest {

    @NotBlank(message = "Tác nhân gây dị ứng không được để trống")
    private String allergen;

    @NotNull(message = "Mức độ dị ứng không được để trống")
    private SeverityLevel severity;

    private String description;
}
