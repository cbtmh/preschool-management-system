package com.vusystem.preschool_management_backend.modules.core.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SchoolClassRequest {

    @NotBlank(message = "Tên lớp không được để trống")
    @Size(max = 100, message = "Tên lớp không được vượt quá 100 ký tự")
    private String name;

    @NotBlank(message = "Nhóm tuổi không được để trống")
    @Size(max = 50, message = "Nhóm tuổi không được vượt quá 50 ký tự")
    private String ageGroup; // Ví dụ: "3-4 tuổi", "4-5 tuổi"

    @NotNull(message = "ID của năm học không được để trống")
    private Long academicYearId;
}