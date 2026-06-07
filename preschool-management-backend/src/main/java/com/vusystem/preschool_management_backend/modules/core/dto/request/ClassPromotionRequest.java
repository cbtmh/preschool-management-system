package com.vusystem.preschool_management_backend.modules.core.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassPromotionRequest {

    @NotNull(message = "ID lớp cũ không được để trống")
    private Long oldClassId;

    @NotNull(message = "ID lớp mới không được để trống")
    private Long newClassId;

    @NotEmpty(message = "Danh sách học sinh cần chuyển không được để trống")
    private List<Long> childIds;
}