package com.vusystem.preschool_management_backend.modules.communication.dto;

import com.vusystem.preschool_management_backend.common.entity.enums.NotificationType;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private Long recipientId;
    private Long notificationId;
    private String title;
    private String content;
    private NotificationType type;
    private String senderName;
    
    @JsonProperty("isRead")
    private boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    
    private String referenceType;
    private Long referenceId;
}
