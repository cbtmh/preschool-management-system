package com.vusystem.preschool_management_backend.modules.core.controller;

import com.vusystem.preschool_management_backend.common.dto.response.ApiResponse;
import com.vusystem.preschool_management_backend.modules.core.dto.request.TeacherCreateRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.request.TeacherUpdateRequest;
import com.vusystem.preschool_management_backend.modules.core.services.TeacherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/core/teachers")
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherService teacherService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse create(@Valid @RequestBody TeacherCreateRequest request) {
        return ApiResponse.builder()
                .status(200)
                .message("Thêm mới giáo viên và tạo tài khoản thành công")
                .data(teacherService.createTeacher(request))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse update(@PathVariable Long id, @Valid @RequestBody TeacherUpdateRequest request) {
        return ApiResponse.builder()
                .status(200)
                .message("Cập nhật thông tin giáo viên thành công")
                .data(teacherService.updateTeacher(id, request))
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ApiResponse getById(@PathVariable Long id) {
        return ApiResponse.builder()
                .status(200)
                .message("Lấy thông tin chi tiết giáo viên thành công")
                .data(teacherService.getTeacherById(id))
                .build();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse getAll() {
        return ApiResponse.builder()
                .status(200)
                .message("Lấy danh sách giáo viên thành công")
                .data(teacherService.getAllTeachers())
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse delete(@PathVariable Long id) {
        teacherService.deleteTeacher(id);
        return ApiResponse.builder()
                .status(200)
                .message("Đã vô hiệu hóa tài khoản và hồ sơ giáo viên thành công (Soft Delete)")
                .build();
    }
}