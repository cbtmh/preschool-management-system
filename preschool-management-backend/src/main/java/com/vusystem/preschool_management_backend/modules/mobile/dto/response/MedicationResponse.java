package com.vusystem.preschool_management_backend.modules.mobile.dto.response;

import com.vusystem.preschool_management_backend.common.entity.enums.RequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicationResponse {
    private Long id;
    private Long childId;
    private String childFullName;
    private String medicationName;
    private String dosage;
    private LocalDate startDate;
    private LocalDate endDate;
    private String notes;
    private RequestStatus status;
    
    // ĐIỂM ĂN TIỀN: Trả luôn danh sách dị ứng của bé này để FE bật Alert đỏ
    private List<String> allergies;
}