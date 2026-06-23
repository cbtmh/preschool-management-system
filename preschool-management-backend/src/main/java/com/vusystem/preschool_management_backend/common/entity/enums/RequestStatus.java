package com.vusystem.preschool_management_backend.common.entity.enums;

public enum RequestStatus {
    PENDING,    // Chờ duyệt
    APPROVED,   // Đã duyệt
    IN_PROGRESS,// Đang thực hiện
    REJECTED,   // Từ chối
    COMPLETED,  // Đã hoàn thành (đã cho uống xong)
    CANCELLED   // Đã hủy
}