package com.vusystem.preschool_management_backend.modules.communication.controller;

import com.vusystem.preschool_management_backend.common.dto.response.ApiResponse;
import com.vusystem.preschool_management_backend.modules.communication.dto.NotificationResponse;
import com.vusystem.preschool_management_backend.modules.communication.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.vusystem.preschool_management_backend.common.entity.user.User;
import com.vusystem.preschool_management_backend.modules.auth.repository.UserRepository;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @GetMapping("/my-notifications")
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getMyNotifications(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Long userId = getUserId(authentication);
        Page<NotificationResponse> notifications = notificationService.getMyNotifications(userId, PageRequest.of(page, size));
        
        return ResponseEntity.ok(ApiResponse.<Page<NotificationResponse>>builder()
                .status(200)
                .message("Lấy danh sách thông báo thành công")
                .data(notifications)
                .build());
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(Authentication authentication) {
        Long userId = getUserId(authentication);
        long count = notificationService.getUnreadCount(userId);
        
        return ResponseEntity.ok(ApiResponse.<Long>builder()
                .status(200)
                .message("Lấy số lượng thông báo chưa đọc thành công")
                .data(count)
                .build());
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long id,
            Authentication authentication) {
        
        Long userId = getUserId(authentication);
        notificationService.markAsRead(id, userId);
        
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(200)
                .message("Đánh dấu đã đọc thành công")
                .data(null)
                .build());
    }

    @PutMapping("/mark-all-read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(Authentication authentication) {
        Long userId = getUserId(authentication);
        notificationService.markAllAsRead(userId);
        
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(200)
                .message("Đánh dấu tất cả đã đọc thành công")
                .data(null)
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @PathVariable Long id,
            Authentication authentication) {
        
        Long userId = getUserId(authentication);
        notificationService.deleteNotification(id, userId);
        
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(200)
                .message("Xóa thông báo thành công")
                .data(null)
                .build());
    }

    @DeleteMapping("/all")
    public ResponseEntity<ApiResponse<Void>> deleteAllNotifications(Authentication authentication) {
        Long userId = getUserId(authentication);
        notificationService.deleteAllNotifications(userId);
        
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(200)
                .message("Xóa tất cả thông báo thành công")
                .data(null)
                .build());
    }

    private Long getUserId(Authentication authentication) {
        String phone = authentication.getName();
        User user = userRepository.findByUsername(phone)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        return user.getId();
    }
}
