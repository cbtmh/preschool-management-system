package com.vusystem.preschool_management_backend.modules.mobile.dto.health;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthRecordDto {
    private Long id;
    private Long childId;
    private String month; // Dạng hiển thị, ví dụ: "Tháng 5/2026"
    private Double height;
    private Double weight;
    private String status;
    private String note;
    private LocalDate recordedDate;
}
