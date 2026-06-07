package com.vusystem.preschool_management_backend.modules.core.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SchoolClassResponse {
    
    private Long id;
    private String name;
    private String ageGroup;
    
    // Trải phẳng dữ liệu của AcademicYear ra để Frontend dễ dùng
    private Long academicYearId;
    private String academicYearName;
}