package com.vusystem.preschool_management_backend.modules.mobile.dto.request;

import com.vusystem.preschool_management_backend.common.entity.enums.SeverityLevel;
import com.vusystem.preschool_management_backend.common.entity.enums.InvolvedRole;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentReportRequest {

    @NotNull(message = "Thời gian xảy ra sự cố không được để trống")
private LocalDateTime incidentTime;

    @NotBlank(message = "Mô tả sự cố không được để trống")
    private String description;

    @NotNull(message = "Mức độ nghiêm trọng không được để trống")
    private SeverityLevel severityLevel;
    @NotNull(message = "Lớp học không được để trống")
    private Long classId;
    
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;
    @NotEmpty(message = "Danh sách học sinh liên quan không được để trống")
    @Valid
    private List<InvolvedChildReq> involvedChildren;

    private List<String> imageUrls;
    
    private String initialHandling;

    // Inner class map với từng học sinh
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InvolvedChildReq {
        @NotNull(message = "ID học sinh không được để trống")
        private Long childId;

        @NotNull(message = "Vai trò của học sinh không được để trống")
        private InvolvedRole role; // VICTIM (Nạn nhân), CAUSER (Gây ra), INVOLVED (Liên quan)
    }
}