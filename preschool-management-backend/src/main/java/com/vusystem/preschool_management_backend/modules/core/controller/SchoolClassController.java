package com.vusystem.preschool_management_backend.modules.core.controller;

import com.vusystem.preschool_management_backend.common.dto.response.ApiResponse;
import com.vusystem.preschool_management_backend.modules.core.dto.request.SchoolClassRequest;
import com.vusystem.preschool_management_backend.modules.core.services.SchoolClassService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/core/classes")
@RequiredArgsConstructor
public class SchoolClassController {

    private final SchoolClassService schoolClassService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse create(@Valid @RequestBody SchoolClassRequest request) {
        return ApiResponse.builder()
                .status(200)
                .message("Tạo lớp học mới thành công")
                .data(schoolClassService.createClass(request))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse update(
            @PathVariable Long id,
            @Valid @RequestBody SchoolClassRequest request) {
        return ApiResponse.builder()
                .status(200)
                .message("Cập nhật thông tin lớp học thành công")
                .data(schoolClassService.updateClass(id, request))
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PARENT')")
    public ApiResponse getById(@PathVariable Long id) {
        return ApiResponse.builder()
                .status(200)
                .message("Lấy thông tin chi tiết lớp học thành công")
                .data(schoolClassService.getClassById(id))
                .build();
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ApiResponse<List<?>> getAll() {
        return ApiResponse.<List<?>>builder()
                .status(200)
                .message("Lấy danh sách tất cả lớp học thành công")
                .data(schoolClassService.getAllClasses())
                .build();
    }

    @GetMapping("/academic-year/{academicYearId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PARENT')")
    public ApiResponse<List<?>> getByAcademicYear(@PathVariable Long academicYearId) {
        return ApiResponse.<List<?>>builder()
                .status(200)
                .message("Lấy danh sách lớp theo năm học thành công")
                .data(schoolClassService.getClassesByAcademicYearId(academicYearId))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse delete(@PathVariable Long id) {
        schoolClassService.deleteClass(id);
        return ApiResponse.builder()
                .status(200)
                .message("Xóa lớp học thành công")
                .data(null)
                .build();
    }
}