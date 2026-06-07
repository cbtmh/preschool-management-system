package com.vusystem.preschool_management_backend.modules.core.controller;

import com.vusystem.preschool_management_backend.common.dto.response.ApiResponse;
import com.vusystem.preschool_management_backend.modules.core.dto.request.ClassPromotionRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.request.DropOutRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.request.EnrollmentRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.request.TransferClassRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.response.EnrollmentResponse;
import com.vusystem.preschool_management_backend.modules.core.services.EnrollmentService;
import com.vusystem.preschool_management_backend.modules.core.dto.request.AutoEnrollmentRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.response.AutoEnrollmentResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/core/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    /**
     * API: Xếp một học sinh vào lớp học cụ thể trong năm học
     * Quyền: ADMIN
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<EnrollmentResponse> enrollChild(@Valid @RequestBody EnrollmentRequest request) {
        return ApiResponse.<EnrollmentResponse>builder()
                .status(200)
                .message("Xếp lớp cho học sinh thành công")
                .data(enrollmentService.enrollChild(request))
                .build();
    }

    /**
     * API: Lấy danh sách toàn bộ học sinh của một lớp
     */
    @GetMapping("/class/{classId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ApiResponse<List<EnrollmentResponse>> getStudentsInClass(@PathVariable Long classId) {
        return ApiResponse.<List<EnrollmentResponse>>builder()
                .status(200)
                .message("Lấy danh sách học sinh của lớp thành công")
                .data(enrollmentService.getStudentsInClass(classId))
                .build();
    }

    // API Chuyển lớp
    @PutMapping("/children/{childId}/transfer")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> transferClass(
            @PathVariable Long childId,
            @Valid @RequestBody TransferClassRequest request) {

        EnrollmentResponse response = enrollmentService.transferClass(childId, request);
        return ResponseEntity.ok(response);
    }

    // API Cho thôi học/Bảo lưu
    @PutMapping("/children/{childId}/drop-out")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> dropOut(
            @PathVariable Long childId,
            @RequestBody DropOutRequest request) {

        enrollmentService.dropOut(childId, request);
        return ResponseEntity.ok("Đã cập nhật trạng thái thôi học/bảo lưu cho học sinh thành công.");
    }

    @PostMapping("/promote")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Object> promoteStudents(@Valid @RequestBody ClassPromotionRequest request) {
        enrollmentService.promoteStudents(request);
        return ApiResponse.builder()
                .status(200)
                .message("Chuyển lớp đồng loạt thành công cho " + request.getChildIds().size() + " học sinh")
                .data(null)
                .build();
    }

    @PutMapping("/classes/{classId}/graduate")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Object> graduateClass(@PathVariable Long classId) {
        enrollmentService.graduateClass(classId);
        return ApiResponse.builder()
                .status(200)
                .message("Đã xử lý tốt nghiệp thành công cho toàn bộ học sinh trong lớp")
                .data(null)
                .build();
    }

    @PostMapping("/auto-enroll")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<AutoEnrollmentResponse> autoEnroll(@Valid @RequestBody AutoEnrollmentRequest request) {
        AutoEnrollmentResponse response = enrollmentService.autoEnroll(request);
        return ApiResponse.<AutoEnrollmentResponse>builder()
                .status(200)
                .message("Tự động xếp lớp hoàn tất")
                .data(response)
                .build();
    }
}