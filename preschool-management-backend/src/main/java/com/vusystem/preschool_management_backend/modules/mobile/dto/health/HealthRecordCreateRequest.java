package com.vusystem.preschool_management_backend.modules.mobile.dto.health;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthRecordCreateRequest {
    @NotNull(message = "ID học sinh không được để trống")
    private Long childId;

    @NotNull(message = "Chiều cao không được để trống")
    private Double height;

    @NotNull(message = "Cân nặng không được để trống")
    private Double weight;

    private String status;
    private String note;
}
