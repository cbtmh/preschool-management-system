package com.vusystem.preschool_management_backend.modules.core.controller;

import com.vusystem.preschool_management_backend.common.dto.response.ApiResponse;
import com.vusystem.preschool_management_backend.modules.core.dto.request.AcademicYearRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.response.AcademicYearResponse;
import com.vusystem.preschool_management_backend.modules.core.services.AcademicYearService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/core/academic-years")
@RequiredArgsConstructor
public class AcademicYearController {

    private final AcademicYearService academicYearService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<AcademicYearResponse> create(@Valid @RequestBody AcademicYearRequest request) {
        return ApiResponse.<AcademicYearResponse>builder()
                .status(200)
                .message("Tạo năm học mới thành công")
                .data(academicYearService.createAcademicYear(request))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<AcademicYearResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody AcademicYearRequest request) {
        return ApiResponse.<AcademicYearResponse>builder()
                .status(200)
                .message("Cập nhật thông tin năm học thành công")
                .data(academicYearService.updateAcademicYear(id, request))
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PARENT')")
    public ApiResponse<AcademicYearResponse> getById(@PathVariable Long id) {
        return ApiResponse.<AcademicYearResponse>builder()
                .status(200)
                .message("Lấy thông tin chi tiết năm học thành công")
                .data(academicYearService.getAcademicYearById(id))
                .build();
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PARENT')")
    public ApiResponse<List<AcademicYearResponse>> getAll() {
        return ApiResponse.<List<AcademicYearResponse>>builder()
                .status(200)
                .message("Lấy danh sách năm học thành công")
                .data(academicYearService.getAllAcademicYears())
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        academicYearService.deleteAcademicYear(id);
        return ApiResponse.<Void>builder()
                .status(200)
                .message("Xóa năm học thành công")
                .data(null)
                .build();
    }
}