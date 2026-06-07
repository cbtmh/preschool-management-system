package com.vusystem.preschool_management_backend.modules.core.dto.response;

import com.vusystem.preschool_management_backend.common.entity.enums.MealRegStatus;
import com.vusystem.preschool_management_backend.common.entity.enums.MealType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MealRegistrationResponse {
    
    private Long id;
    
    private Long childId;
    
    private String childFullName; // Lấy thêm tên bé để Frontend dễ hiển thị (đỡ phải gọi API 2 lần)
    
    private String className; // Lấy thêm tên lớp hiện tại của bé
    
    private LocalDate date;
    
    private MealType mealType;
    
    private MealRegStatus status;
}