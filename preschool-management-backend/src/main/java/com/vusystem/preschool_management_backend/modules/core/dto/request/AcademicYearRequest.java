package com.vusystem.preschool_management_backend.modules.core.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AcademicYearRequest {

    @NotBlank(message = "Tên năm học không được để trống")
    @Pattern(regexp = "^\\d{4}-\\d{4}$", message = "Tên năm học phải đúng định dạng YYYY-YYYY (VD: 2024-2025)")
    private String name;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDate startDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    private LocalDate endDate;

    @NotNull(message = "Trạng thái năm học hiện tại không được để trống")
    private Boolean isCurrent;
}