package com.vusystem.preschool_management_backend.modules.communication.controller;

import com.vusystem.preschool_management_backend.common.dto.response.ApiResponse;
import com.vusystem.preschool_management_backend.common.entity.communication.Notification;
import com.vusystem.preschool_management_backend.modules.communication.dto.AdminNotificationResponse;
import com.vusystem.preschool_management_backend.common.entity.user.User;
import com.vusystem.preschool_management_backend.modules.auth.repository.UserRepository;
import com.vusystem.preschool_management_backend.modules.communication.dto.SendNotificationRequest;
import com.vusystem.preschool_management_backend.modules.communication.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/notifications")
@RequiredArgsConstructor
public class AdminNotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @PostMapping("/send")
    public ResponseEntity<ApiResponse<Void>> sendNotification(
            @RequestBody SendNotificationRequest request,
            Authentication authentication) {
        
        Long adminId = getUserId(authentication);
        notificationService.sendNotification(request, adminId);
        
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(200)
                .message("Gửi thông báo thành công")
                .data(null)
                .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminNotificationResponse>>> getSentNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Page<AdminNotificationResponse> notifications = notificationService.getSentNotifications(PageRequest.of(page, size));
        
        return ResponseEntity.ok(ApiResponse.<Page<AdminNotificationResponse>>builder()
                .status(200)
                .message("Lấy danh sách thông báo đã gửi thành công")
                .data(notifications)
                .build());
    }

    private Long getUserId(Authentication authentication) {
        String phone = authentication.getName();
        User user = userRepository.findByUsername(phone)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        return user.getId();
    }
}
