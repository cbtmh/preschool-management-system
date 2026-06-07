package com.vusystem.preschool_management_backend.modules.mobile.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import com.vusystem.preschool_management_backend.modules.core.dto.response.AllergyResponse;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChildSummaryDTO {
    private Long id;
    private String fullName;
    private LocalDate dob;
    private String gender;
    
    private Boolean allergyDeclared;
    private List<AllergyResponse> allergies;

    private String className;
    private TeacherSummaryDTO teacher;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeacherSummaryDTO {
        private String fullName;
        private String phoneNumber;
    }
}
