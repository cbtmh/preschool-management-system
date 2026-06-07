package com.vusystem.preschool_management_backend.modules.core.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutoEnrollmentRequest {
    @NotNull(message = "ID năm học không được để trống")
    private Long academicYearId;
}
