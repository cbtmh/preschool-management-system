package com.vusystem.preschool_management_backend.modules.core.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutoEnrollmentResponse {
    private int totalProcessed;
    private int totalAssigned;
    private int totalUnassigned;
    private List<UnassignedChildDto> unassignedChildren;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UnassignedChildDto {
        private Long childId;
        private String fullName;
        private String reason;
    }
}
