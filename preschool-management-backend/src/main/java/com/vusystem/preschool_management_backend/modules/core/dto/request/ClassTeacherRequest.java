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
public class ClassTeacherRequest {

    @NotNull(message = "ID lớp học không được để trống")
    private Long classId;

    @NotEmpty(message = "Danh sách ID giáo viên không được để trống")
    private List<Long> teacherIds;
}