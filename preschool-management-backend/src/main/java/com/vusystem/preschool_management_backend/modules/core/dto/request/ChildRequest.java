package com.vusystem.preschool_management_backend.modules.core.dto.request;

import com.vusystem.preschool_management_backend.common.entity.enums.Gender;
import com.vusystem.preschool_management_backend.common.entity.enums.StudentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class ChildRequest {

    @NotBlank(message = "Họ tên của bé không được để trống")
    private String fullName;

    @NotNull(message = "Ngày sinh của bé không được để trống")
    private LocalDate dob;

    @NotNull(message = "Giới tính không được để trống")
    private Gender gender;

    @NotNull(message = "Trạng thái học tập không được để trống")
    private StudentStatus status; // STUDYING, RESERVED, ENTRANCE_PRIMARY

    private String healthNotes; // Ghi chú sức khỏe (có thể null)

    @NotNull(message = "ID của Phụ huynh không được để trống")
    private Long parentId; // Khóa ngoại bắt buộc phải có để map với Parent

    private List<AllergyRequest> allergies;
    
    private Boolean allergyDeclared;
}