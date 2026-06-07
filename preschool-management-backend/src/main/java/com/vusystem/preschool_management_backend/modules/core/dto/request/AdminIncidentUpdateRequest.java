package com.vusystem.preschool_management_backend.modules.core.dto.request;

import com.vusystem.preschool_management_backend.common.entity.enums.IncidentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminIncidentUpdateRequest {
    private IncidentStatus status;
    private String principalNotes;
}
