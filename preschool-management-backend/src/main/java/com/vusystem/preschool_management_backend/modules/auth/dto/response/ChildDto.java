package com.vusystem.preschool_management_backend.modules.auth.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class ChildDto {
    private Long childId;
    private String fullName;
    private LocalDate dob;
    private String gender;
    private String status;
}