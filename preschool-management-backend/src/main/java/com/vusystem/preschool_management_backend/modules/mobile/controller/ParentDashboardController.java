package com.vusystem.preschool_management_backend.modules.mobile.controller;

import com.vusystem.preschool_management_backend.common.dto.response.ApiResponse;
import com.vusystem.preschool_management_backend.modules.mobile.dto.response.ParentDashboardResponse;
import com.vusystem.preschool_management_backend.modules.mobile.service.ParentDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mobile/parent/dashboard")
@RequiredArgsConstructor
public class ParentDashboardController {

    private final ParentDashboardService parentDashboardService;

    @GetMapping
    @PreAuthorize("hasRole('PARENT')")
    public ApiResponse<ParentDashboardResponse> getDashboardData() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        ParentDashboardResponse data = parentDashboardService.getDashboardData(username);
        
        return ApiResponse.<ParentDashboardResponse>builder()
                .status(200)
                .message("Lấy dữ liệu trang chủ thành công")
                .data(data)
                .build();
    }
}
