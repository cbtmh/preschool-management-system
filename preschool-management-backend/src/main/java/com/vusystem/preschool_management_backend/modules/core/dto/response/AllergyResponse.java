package com.vusystem.preschool_management_backend.modules.core.dto.response;

import com.vusystem.preschool_management_backend.common.entity.enums.SeverityLevel;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AllergyResponse {
    private Long id;
    private String allergen;
    private SeverityLevel severity;
    private String description;
}
