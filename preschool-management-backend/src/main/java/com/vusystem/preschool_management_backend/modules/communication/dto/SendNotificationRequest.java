package com.vusystem.preschool_management_backend.modules.communication.dto;

import com.vusystem.preschool_management_backend.common.entity.enums.NotificationType;
import com.vusystem.preschool_management_backend.common.entity.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SendNotificationRequest {
    private String title;
    private String content;
    private NotificationType type;
    private List<String> targetRoles;
    private List<Long> targetClassIds; // Required when type is CLASS
    
    private String referenceType;
    private Long referenceId;
}
