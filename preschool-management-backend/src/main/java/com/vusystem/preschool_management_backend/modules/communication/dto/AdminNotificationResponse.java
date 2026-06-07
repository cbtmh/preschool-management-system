package com.vusystem.preschool_management_backend.modules.communication.dto;

import com.vusystem.preschool_management_backend.common.entity.enums.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminNotificationResponse {
    private Long id;
    private String title;
    private String content;
    private NotificationType type;
    private String senderName;
    private LocalDateTime createdAt;
    
    private String referenceType;
    private Long referenceId;
}
