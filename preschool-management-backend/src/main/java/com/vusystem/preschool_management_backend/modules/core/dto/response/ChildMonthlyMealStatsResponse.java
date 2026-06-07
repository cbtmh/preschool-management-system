package com.vusystem.preschool_management_backend.modules.core.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChildMonthlyMealStatsResponse {
    private Long childId;
    private String childFullName;
    private long totalRegistered; // Tổng số buổi đăng ký ăn
    private long totalCancelled;  // Tổng số buổi báo cắt cơm
}