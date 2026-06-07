package com.vusystem.preschool_management_backend.modules.mobile.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicationCreateRequest {

    @NotNull(message = "ID học sinh không được để trống")
    private Long childId;

    @NotBlank(message = "Tên thuốc không được để trống")
    private String medicationName;

    @NotBlank(message = "Liều lượng không được để trống")
    private String dosage;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    @FutureOrPresent(message = "Ngày bắt đầu phải từ hôm nay trở đi")
    private LocalDate startDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    @FutureOrPresent(message = "Ngày kết thúc phải từ hôm nay trở đi")
    private LocalDate endDate;

    // Lời dặn dò thêm của phụ huynh (uống sau ăn, uống nước ấm...)
    @Size(max = 500, message = "Lời dặn dò không được vượt quá 500 ký tự")
    private String notes;
}