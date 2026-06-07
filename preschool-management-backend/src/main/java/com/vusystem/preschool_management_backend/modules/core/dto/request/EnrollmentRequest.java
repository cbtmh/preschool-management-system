package com.vusystem.preschool_management_backend.modules.core.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import lombok.Builder;

@Builder
@Data
public class EnrollmentRequest {

    @NotNull(message = "ID học sinh không được để trống")
    private Long childId;

    @NotNull(message = "ID lớp học không được để trống")
    private Long classId;

    @NotNull(message = "ID năm học không được để trống")

    @Builder.Default
    private boolean forceEnrollment = false;

    private Long academicYearId;

    private LocalDate enrollmentDate; // Nếu FE không gửi, Service sẽ tự động gán ngày hiện tại

    private String notes; // Ghi chú thêm nếu có
}