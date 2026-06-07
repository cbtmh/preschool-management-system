package com.vusystem.preschool_management_backend.modules.mobile.controller;

import com.vusystem.preschool_management_backend.common.dto.response.ApiResponse;
import com.vusystem.preschool_management_backend.modules.mobile.dto.request.MobileParentProfileRequest;
import com.vusystem.preschool_management_backend.modules.mobile.service.ParentDashboardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mobile/parent/profile")
@RequiredArgsConstructor
public class MobileParentProfileController {

    private final ParentDashboardService parentDashboardService;

    @PutMapping
    @PreAuthorize("hasRole('PARENT')")
    public ApiResponse<String> updateProfile(@Valid @RequestBody MobileParentProfileRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        String newToken = parentDashboardService.updateProfile(username, request);
        
        return ApiResponse.<String>builder()
                .status(200)
                .message("Cập nhật thông tin cá nhân thành công")
                .data(newToken) // Nếu có token mới thì trả về, không thì null
                .build();
    }
}
