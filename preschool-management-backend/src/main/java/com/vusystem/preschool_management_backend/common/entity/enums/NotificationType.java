package com.vusystem.preschool_management_backend.common.entity.enums;

public enum NotificationType {
    SCHOOL,         // Thông báo toàn trường (Thay cho ALL)
    SYSTEM,         // Thông báo hệ thống (Bảo trì, cập nhật)
    CLASS,          // Thông báo riêng cho một lớp
    INDIVIDUAL,     // Thông báo riêng cho cá nhân
    INTERACTION     // Tương tác (Xin nghỉ, dặn thuốc, check-in, check-out)
}