package com.vusystem.preschool_management_backend.modules.communication.services;

import com.vusystem.preschool_management_backend.common.entity.communication.NotificationRecipient;

import com.vusystem.preschool_management_backend.modules.communication.dto.NotificationResponse;
import com.vusystem.preschool_management_backend.modules.communication.dto.AdminNotificationResponse;
import com.vusystem.preschool_management_backend.common.entity.communication.Notification;
import com.vusystem.preschool_management_backend.common.entity.enums.NotificationType;
import com.vusystem.preschool_management_backend.common.entity.enums.Role;
import com.vusystem.preschool_management_backend.modules.auth.repository.UserRepository;
import com.vusystem.preschool_management_backend.modules.communication.dto.SendNotificationRequest;
import com.vusystem.preschool_management_backend.modules.communication.repository.NotificationRecipientRepository;
import com.vusystem.preschool_management_backend.modules.communication.repository.NotificationRepository;
import com.vusystem.preschool_management_backend.modules.core.repository.ClassTeacherRepository;
import com.vusystem.preschool_management_backend.modules.core.repository.EnrollmentRepository;
import com.vusystem.preschool_management_backend.modules.core.repository.SchoolClassRepository;
import com.vusystem.preschool_management_backend.common.entity.academic.ClassTeacher;
import com.vusystem.preschool_management_backend.common.entity.academic.Enrollment;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import com.vusystem.preschool_management_backend.common.entity.user.User;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRecipientRepository notificationRecipientRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ClassTeacherRepository classTeacherRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ExpoPushService expoPushService;
    private final TwilioSmsService twilioSmsService;

    @Transactional
    public void sendNotification(SendNotificationRequest request, Long senderId) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        Notification notification = Notification.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .type(request.getType())
                .sender(sender)
                .referenceType(request.getReferenceType())
                .referenceId(request.getReferenceId())
                .build();

        notificationRepository.save(notification);

        Set<User> recipients = new HashSet<>();

        if (request.getType() == NotificationType.SCHOOL || request.getType() == NotificationType.SYSTEM) {
            if (request.getTargetRoles() != null && !request.getTargetRoles().isEmpty()) {
                List<Role> roles = request.getTargetRoles().stream().map(Role::valueOf).collect(Collectors.toList());
                recipients.addAll(userRepository.findByRoleIn(roles));
            }
        } else if (request.getType() == NotificationType.CLASS) {
            if (request.getTargetClassIds() == null || request.getTargetClassIds().isEmpty()) {
                throw new IllegalArgumentException("Class IDs must be provided for CLASS notification");
            }
            if (request.getTargetRoles() != null) {
                for (Long classId : request.getTargetClassIds()) {
                    if (request.getTargetRoles().contains(Role.TEACHER.name())) {
                        List<ClassTeacher> classTeachers = classTeacherRepository.findBySchoolClassId(classId);
                        for (ClassTeacher ct : classTeachers) {
                            recipients.add(ct.getTeacher().getUser());
                        }
                    }
                    if (request.getTargetRoles().contains(Role.PARENT.name())) {
                        List<Enrollment> enrollments = enrollmentRepository.findActiveEnrollmentsByClassId(classId);
                        for (Enrollment enrollment : enrollments) {
                            if (enrollment.getChild() != null && enrollment.getChild().getParent() != null) {
                                recipients.add(enrollment.getChild().getParent().getUser());
                            }
                        }
                    }
                }
            }
        }

        List<NotificationRecipient> notificationRecipients = recipients.stream().map(user -> 
                NotificationRecipient.builder()
                        .notification(notification)
                        .recipient(user)
                        .isRead(false)
                        .build()
        ).collect(Collectors.toList());

        if (!notificationRecipients.isEmpty()) {
            notificationRecipientRepository.saveAll(notificationRecipients);
        }

        // gửi push notification
        List<String> tokens = recipients.stream()
                .map(User::getDeviceToken)
                .filter(token -> token != null && !token.isEmpty())
                .collect(Collectors.toList());

        boolean pushSuccess = false;
        if (!tokens.isEmpty()) {
            Map<String, Object> data = new HashMap<>();
            data.put("notificationId", notification.getId().toString());
            if (notification.getReferenceType() != null) {
                data.put("referenceType", notification.getReferenceType());
                data.put("referenceId", notification.getReferenceId() != null ? notification.getReferenceId().toString() : null);
            }
            pushSuccess = expoPushService.sendPushNotifications(tokens, notification.getTitle(), notification.getContent(), data);
        }

        // dự phòng gửi sms nếu push notification thất bại
        for (User user : recipients) {
            boolean hasToken = user.getDeviceToken() != null && !user.getDeviceToken().isEmpty();
            if (!hasToken || !pushSuccess) {
                twilioSmsService.sendSms(user.getUsername(), "[Cảnh báo] " + notification.getTitle() + ": " + notification.getContent());
            }
        }
    }

    @Transactional
    public void sendNotificationToUser(String title, String content, NotificationType type, Long senderId, Long recipientId) {
        sendNotificationToUserWithRef(title, content, type, senderId, recipientId, null, null);
    }

    @Transactional
    public void sendNotificationToUserWithRef(String title, String content, NotificationType type, Long senderId, Long recipientId, String referenceType, Long referenceId) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new RuntimeException("Recipient not found"));

        Notification notification = Notification.builder()
                .title(title)
                .content(content)
                .type(type)
                .sender(sender)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .build();
        notificationRepository.save(notification);

        NotificationRecipient notificationRecipient = NotificationRecipient.builder()
                .notification(notification)
                .recipient(recipient)
                .isRead(false)
                .build();
        notificationRecipientRepository.save(notificationRecipient);

        // gửi push notification
        boolean pushSuccess = false;
        if (recipient.getDeviceToken() != null && !recipient.getDeviceToken().isEmpty()) {
            Map<String, Object> data = new HashMap<>();
            data.put("notificationId", notification.getId().toString());
            if (referenceType != null) {
                data.put("referenceType", referenceType);
                data.put("referenceId", referenceId != null ? referenceId.toString() : null);
            }
            pushSuccess = expoPushService.sendPushNotifications(List.of(recipient.getDeviceToken()), title, content, data);
        }

        // dự phòng gửi sms nếu push notification thất bại
        if (recipient.getDeviceToken() == null || recipient.getDeviceToken().isEmpty() || !pushSuccess) {
            twilioSmsService.sendSms(recipient.getUsername(), "[Cảnh báo] " + title + ": " + content);
        }
    }


    @Transactional(readOnly = true)
    public Page<AdminNotificationResponse> getSentNotifications(Pageable pageable) {
        return notificationRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(notification -> AdminNotificationResponse.builder()
                        .id(notification.getId())
                        .title(notification.getTitle())
                        .content(notification.getContent())
                        .type(notification.getType())
                        .senderName(notification.getSender() != null && notification.getSender().getRole().name().equals("ADMIN") ? "Hệ thống" : (notification.getSender() != null && notification.getSender().getTeacherProfile() != null ? notification.getSender().getTeacherProfile().getFullName() : "Người gửi"))
                        .createdAt(notification.getCreatedAt())
                        .referenceType(notification.getReferenceType())
                        .referenceId(notification.getReferenceId())
                        .build());
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getMyNotifications(Long userId, Pageable pageable) {
        Page<NotificationRecipient> recipients = notificationRecipientRepository
                .findByRecipientIdOrderByNotificationCreatedAtDesc(userId, pageable);
        
        return recipients.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRecipientRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationRecipientId, Long userId) {
        NotificationRecipient recipient = notificationRecipientRepository.findById(notificationRecipientId)
                .orElseThrow(() -> new RuntimeException("Notification Recipient not found"));

        if (!recipient.getRecipient().getId().equals(userId)) {
            throw new IllegalArgumentException("You don't have permission to mark this notification as read");
        }

        if (!recipient.isRead()) {
            recipient.setRead(true);
            recipient.setReadAt(LocalDateTime.now());
            notificationRecipientRepository.save(recipient);
        }
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<NotificationRecipient> unreadList = notificationRecipientRepository.findByRecipientIdAndIsReadFalse(userId);
        for (NotificationRecipient recipient : unreadList) {
            recipient.setRead(true);
            recipient.setReadAt(LocalDateTime.now());
        }
        notificationRecipientRepository.saveAll(unreadList);
    }

    @Transactional
    public void deleteNotification(Long notificationRecipientId, Long userId) {
        NotificationRecipient recipient = notificationRecipientRepository.findById(notificationRecipientId)
                .orElseThrow(() -> new RuntimeException("Notification Recipient not found"));

        if (!recipient.getRecipient().getId().equals(userId)) {
            throw new IllegalArgumentException("You don't have permission to delete this notification");
        }

        notificationRecipientRepository.delete(recipient);
    }

    @Transactional
    public void deleteAllNotifications(Long userId) {
        notificationRecipientRepository.deleteAllByRecipientId(userId);
    }

    private NotificationResponse mapToResponse(NotificationRecipient entity) {
        return NotificationResponse.builder()
                .id(entity.getId())
                .recipientId(entity.getRecipient().getId())
                .notificationId(entity.getNotification().getId())
                .title(entity.getNotification().getTitle())
                .content(entity.getNotification().getContent())
                .type(entity.getNotification().getType())
                .senderName(getSenderFullName(entity.getNotification().getSender()))
                .isRead(entity.isRead())
                .createdAt(entity.getNotification().getCreatedAt())
                .readAt(entity.getReadAt())
                .referenceType(entity.getNotification().getReferenceType())
                .referenceId(entity.getNotification().getReferenceId())
                .build();
    }

    private String getSenderFullName(User user) {
        if (user == null) return "Hệ thống";
        if (user.getTeacherProfile() != null) {
            return user.getTeacherProfile().getFullName();
        } else if (user.getParentProfile() != null) {
            return user.getParentProfile().getFullName();
        }
        return "Hệ thống";
    }
}
