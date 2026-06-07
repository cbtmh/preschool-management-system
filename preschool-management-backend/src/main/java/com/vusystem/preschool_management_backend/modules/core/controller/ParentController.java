package com.vusystem.preschool_management_backend.modules.core.controller;

import com.vusystem.preschool_management_backend.common.dto.response.ApiResponse;
import com.vusystem.preschool_management_backend.modules.core.dto.request.ParentCreateRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.request.ParentUpdateRequest;
import com.vusystem.preschool_management_backend.modules.core.services.ParentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/core/parents")
@RequiredArgsConstructor
public class ParentController {

    private final ParentService parentService;

    // 1. Tạo mới Phụ huynh
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> createParent(@Valid @RequestBody ParentCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Tạo hồ sơ phụ huynh thành công")
                .data(parentService.createParent(request))
                .build());
    }

    // 2. Cập nhật thông tin Phụ huynh
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> updateParent(
            @PathVariable Long id, 
            @Valid @RequestBody ParentUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Cập nhật hồ sơ phụ huynh thành công")
                .data(parentService.updateParent(id, request))
                .build());
    }

    // 3. Lấy thông tin chi tiết 1 Phụ huynh
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getParentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Lấy thông tin phụ huynh thành công")
                .data(parentService.getParentById(id))
                .build());
    }

    // 4. Lấy danh sách toàn bộ Phụ huynh (Active)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getAllParents() {
        return ResponseEntity.ok(ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Lấy danh sách phụ huynh thành công")
                .data(parentService.getAllParents())
                .build());
    }

    // 5. Xóa (Khóa tài khoản) Phụ huynh
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deleteParent(@PathVariable Long id) {
        parentService.deleteParent(id);
        return ResponseEntity.ok(ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("Đã khóa tài khoản phụ huynh thành công")
                .data(null)
                .build());
    }
}