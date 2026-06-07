package com.vusystem.preschool_management_backend.modules.core.controller;

import com.vusystem.preschool_management_backend.common.dto.response.ApiResponse;
import com.vusystem.preschool_management_backend.modules.core.dto.response.DashboardStatisticsResponse;
import com.vusystem.preschool_management_backend.modules.core.services.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/core/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<DashboardStatisticsResponse> getStatistics() {
        DashboardStatisticsResponse stats = dashboardService.getDashboardStatistics();
        return ApiResponse.<DashboardStatisticsResponse>builder()
                .status(200)
                .message("Get dashboard statistics successfully")
                .data(stats)
                .build();
    }
}
