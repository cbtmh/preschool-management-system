package com.vusystem.preschool_management_backend.modules.mobile.dto.health;

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
public class ChildHealthSummaryDto {
    private Long id;
    private String name;
    private String status;
    private boolean hasRecord;
    private LocalDate lastRecord;
    private Boolean allergyDeclared;
    private List<AllergyResponse> allergies;
}
