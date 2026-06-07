package com.vusystem.preschool_management_backend.modules.auth.dto.response;

import com.vusystem.preschool_management_backend.common.entity.enums.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MeResponse {
    private Long userId;
    private String username;
    private Role role;
    private Object profile; // Linh hoạt trả về TeacherDto hoặc ParentDto
    private Boolean requiresPasswordChange;
}