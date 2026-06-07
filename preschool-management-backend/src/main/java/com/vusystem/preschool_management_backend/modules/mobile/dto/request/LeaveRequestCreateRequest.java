package com.vusystem.preschool_management_backend.modules.mobile.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequestCreateRequest {

    @NotNull(message = "ID học sinh không được để trống")
    private Long childId;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    // @FutureOrPresent(message = "Ngày xin nghỉ không được trong quá khứ") 
    // Chúng ta sẽ tự handle logic validate này trong service để check thêm giờ (9h sáng).
    private LocalDate startDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    private LocalDate endDate;

    @NotBlank(message = "Lý do không được để trống")
    private String reason;
}
