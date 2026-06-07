package com.vusystem.preschool_management_backend.modules.core.dto.response;

import com.vusystem.preschool_management_backend.common.entity.enums.Gender;
import com.vusystem.preschool_management_backend.common.entity.enums.StudentStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class ChildResponse {
    private Long id;
    private String fullName;
    private LocalDate dob;
    private Gender gender;
    private StudentStatus status;
    private String healthNotes;
    
    // Trả về ID và Tên của Phụ huynh để Frontend dễ dàng hiển thị trên bảng
    private Long parentId;
    private String parentName; 
    private String parentPhone;
    
    // Cờ để xác định học sinh này ĐÃ ĐƯỢC XẾP LỚP trong năm học HIỆN TẠI hay chưa
    private Boolean hasCurrentEnrollment;
    
    private Boolean allergyDeclared;
    private List<AllergyResponse> allergies;
}