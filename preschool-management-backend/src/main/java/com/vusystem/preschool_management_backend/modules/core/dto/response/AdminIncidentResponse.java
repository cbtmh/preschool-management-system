package com.vusystem.preschool_management_backend.modules.core.dto.response;

import com.vusystem.preschool_management_backend.common.entity.enums.IncidentStatus;
import com.vusystem.preschool_management_backend.common.entity.enums.SeverityLevel;
import com.vusystem.preschool_management_backend.common.entity.enums.InvolvedRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonFormat;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminIncidentResponse {
    private Long id;
    private String title;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime incidentTime;
    private String description;
    private SeverityLevel severityLevel;
    private IncidentStatus status;
    private String reportedByTeacherName;
    private Long classId;
    private String className;
    private List<String> imageUrls;
    private String principalNotes;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    private List<InvolvedChildRes> involvedChildren;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InvolvedChildRes {
        private Long childId;
        private String childFullName;
        private InvolvedRole role;
    }
}
