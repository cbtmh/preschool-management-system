package com.vusystem.preschool_management_backend.modules.mobile.controller;

import com.vusystem.preschool_management_backend.common.dto.response.ApiResponse;
import com.vusystem.preschool_management_backend.modules.mobile.dto.request.LeaveRequestCreateRequest;
import com.vusystem.preschool_management_backend.modules.mobile.dto.response.LeaveRequestResponse;
import com.vusystem.preschool_management_backend.modules.mobile.service.LeaveRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mobile/leave-requests")
@RequiredArgsConstructor
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    // --- PARENT APIs ---

    @PostMapping
    @PreAuthorize("hasRole('PARENT')")
    public ApiResponse<LeaveRequestResponse> createRequest(@Valid @RequestBody LeaveRequestCreateRequest request) {
        return ApiResponse.<LeaveRequestResponse>builder()
                .status(200)
                .message("Tạo đơn xin nghỉ thành công")
                .data(leaveRequestService.createRequest(request))
                .build();
    }

    @GetMapping("/children/{childId}")
    @PreAuthorize("hasRole('PARENT')")
    public ApiResponse<List<LeaveRequestResponse>> getParentRequests(@PathVariable Long childId) {
        return ApiResponse.<List<LeaveRequestResponse>>builder()
                .status(200)
                .message("Lấy danh sách đơn xin nghỉ thành công")
                .data(leaveRequestService.getParentRequests(childId))
                .build();
    }

    // --- TEACHER / ADMIN APIs ---

    @GetMapping("/classes/{classId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ApiResponse<List<LeaveRequestResponse>> getClassRequests(@PathVariable Long classId) {
        return ApiResponse.<List<LeaveRequestResponse>>builder()
                .status(200)
                .message("Lấy danh sách đơn xin nghỉ của lớp thành công")
                .data(leaveRequestService.getClassRequests(classId))
                .build();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ApiResponse<?> updateStatus(@PathVariable Long id, @RequestParam String status) {
        leaveRequestService.updateStatus(id, status);
        return ApiResponse.builder()
                .status(200)
                .message("Cập nhật trạng thái đơn xin nghỉ thành công")
                .data(null)
                .build();
    }
}
