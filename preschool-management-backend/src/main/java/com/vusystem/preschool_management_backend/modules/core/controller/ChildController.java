package com.vusystem.preschool_management_backend.modules.core.controller;

import com.vusystem.preschool_management_backend.common.dto.response.ApiResponse;
import com.vusystem.preschool_management_backend.modules.core.dto.request.ChildRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.request.AllergyRequest;
import com.vusystem.preschool_management_backend.modules.core.services.ChildService;
import com.vusystem.preschool_management_backend.config.security.SecurityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import java.util.List;

@RestController
@RequestMapping("/api/core/children")
@RequiredArgsConstructor
public class ChildController {

    private final ChildService childService;
    private final SecurityService securityService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse createChild(@Valid @RequestBody ChildRequest request) {
        return ApiResponse.builder()
                .status(200)
                .message("Thêm mới hồ sơ Học sinh thành công")
                .data(childService.createChild(request))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse updateChild(
            @PathVariable Long id,
            @Valid @RequestBody ChildRequest request) {
        return ApiResponse.builder()
                .status(200)
                .message("Cập nhật hồ sơ Học sinh thành công")
                .data(childService.updateChild(id, request))
                .build();
    }
    
    @PutMapping("/{id}/allergies")
    @PreAuthorize("hasAnyRole('ADMIN', 'PARENT')")
    public ApiResponse updateChildAllergies(
            @PathVariable Long id,
            @RequestBody List<AllergyRequest> request) {
            
        securityService.verifyParentOwnsChild(id);
        
        return ApiResponse.builder()
                .status(200)
                .message("Cập nhật thông tin dị ứng thành công")
                .data(childService.updateChildAllergies(id, request))
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PARENT')")
    public ApiResponse getChildById(@PathVariable Long id) {
        securityService.verifyAccessToChild(id);
        return ApiResponse.builder()
                .status(200)
                .message("Lấy thông tin Học sinh thành công")
                .data(childService.getChildById(id))
                .build();
    }

    @GetMapping("/parent/{parentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse getChildrenByParentId(@PathVariable Long parentId) {
        return ApiResponse.builder()
                .status(200)
                .message("Lấy danh sách Học sinh theo Phụ huynh thành công")
                .data(childService.getChildrenByParentId(parentId))
                .build();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse getAllChildren() {
        return ApiResponse.builder()
                .status(200)
                .message("Lấy danh sách Học sinh thành công")
                .data(childService.getAllChildren())
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse deleteChild(@PathVariable Long id) {
        childService.deleteChild(id);
        return ApiResponse.builder()
                .status(200)
                .message("Xóa hồ sơ Học sinh thành công")
                .data(null)
                .build();
    }

    @PostMapping(value = "/import-bulk", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse importBulkChildrenAndParents(@RequestParam("file") MultipartFile file) {
        childService.importChildrenAndParents(file);
        return ApiResponse.builder()
                .status(200)
                .message("Import danh sách học sinh và phụ huynh thành công")
                .data(null)
                .build();
    }
}