package com.vusystem.preschool_management_backend.modules.core.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TransferClassRequest {
    @NotNull(message = "ID lớp học mới không được để trống")
    private Long newClassId;
    
    private String note; // Lý do chuyển lớp

    @Builder.Default
    private boolean forceEnrollment = false;
}