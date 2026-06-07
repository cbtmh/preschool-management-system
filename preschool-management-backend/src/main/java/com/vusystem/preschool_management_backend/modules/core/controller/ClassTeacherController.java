package com.vusystem.preschool_management_backend.modules.core.controller;

import com.vusystem.preschool_management_backend.common.dto.response.ApiResponse;
import com.vusystem.preschool_management_backend.modules.core.dto.request.ClassTeacherRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.response.ClassTeacherResponse;
import com.vusystem.preschool_management_backend.modules.core.services.ClassTeacherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/core/class-teachers")
@RequiredArgsConstructor
public class ClassTeacherController {

    private final ClassTeacherService classTeacherService;

    // 1. API Phân công giáo viên vào lớp (Ghi đè danh sách cũ)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> assignTeachers(@Valid @RequestBody ClassTeacherRequest request) {
        ClassTeacherResponse data = classTeacherService.assignTeachersToClass(request);
        
        ApiResponse response = ApiResponse.builder()
                .status(200)
                .message("Phân công giáo viên chủ nhiệm thành công")
                .data(data)
                .build();
                
        return ResponseEntity.ok(response);
    }

    // 2. API Lấy danh sách giáo viên của một lớp
    @GetMapping("/{classId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse> getTeachersByClass(@PathVariable Long classId) {
        ClassTeacherResponse data = classTeacherService.getTeachersByClassId(classId);
        
        ApiResponse response = ApiResponse.builder()
                .status(200)
                .message("Lấy danh sách giáo viên của lớp thành công")
                .data(data)
                .build();
                
        return ResponseEntity.ok(response);
    }

    // 3. API Lấy danh sách lớp mà giáo viên được phân công
    @GetMapping("/teacher/{teacherId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse> getClassesByTeacher(@PathVariable Long teacherId) {
        java.util.List<com.vusystem.preschool_management_backend.modules.core.dto.response.SchoolClassResponse> data = classTeacherService.getClassesByTeacherId(teacherId);
        
        ApiResponse response = ApiResponse.builder()
                .status(200)
                .message("Lấy danh sách lớp của giáo viên thành công")
                .data(data)
                .build();
                
        return ResponseEntity.ok(response);
    }
}