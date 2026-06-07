package com.vusystem.preschool_management_backend.modules.mobile.controller;

import com.vusystem.preschool_management_backend.common.dto.response.ApiResponse;
import com.vusystem.preschool_management_backend.modules.mobile.dto.request.MobileTeacherProfileRequest;
import com.vusystem.preschool_management_backend.modules.mobile.service.MobileTeacherProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mobile/teacher/profile")
@RequiredArgsConstructor
public class MobileTeacherProfileController {

    private final MobileTeacherProfileService mobileTeacherProfileService;

    @PutMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ApiResponse<String> updateProfile(@Valid @RequestBody MobileTeacherProfileRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        String newToken = mobileTeacherProfileService.updateProfile(username, request);
        
        return ApiResponse.<String>builder()
                .status(200)
                .message("Cập nhật thông tin cá nhân thành công")
                .data(newToken)
                .build();
    }
}
