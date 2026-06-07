package com.vusystem.preschool_management_backend.modules.core.dto.response;

import com.vusystem.preschool_management_backend.common.entity.enums.EnrollmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentResponse {
    
    private Long id; // ID của bản ghi Enrollment
    
    // --- Thông tin Học sinh ---
    private Long childId;
    private String childName;
    
    // --- Thông tin Lớp & Năm học ---
    private Long classId;
    private String className;
    private Long academicYearId;
    private String academicYearName;
    
    // --- Thông tin Xếp lớp ---
    private LocalDate enrollmentDate;
    private EnrollmentStatus status; // STUDYING, DROPPED, COMPLETED
    private String notes;
}