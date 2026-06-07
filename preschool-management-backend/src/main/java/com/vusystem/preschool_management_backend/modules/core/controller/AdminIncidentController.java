package com.vusystem.preschool_management_backend.modules.core.controller;

import com.vusystem.preschool_management_backend.common.dto.response.ApiResponse;
import com.vusystem.preschool_management_backend.modules.core.dto.request.AdminIncidentUpdateRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.response.AdminIncidentResponse;
import com.vusystem.preschool_management_backend.modules.core.service.AdminIncidentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/incidents")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminIncidentController {

    private final AdminIncidentService adminIncidentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminIncidentResponse>>> getAllIncidents() {
        return ResponseEntity.ok(ApiResponse.<List<AdminIncidentResponse>>builder()
            .status(200)
            .message("Lấy danh sách tường trình thành công")
            .data(adminIncidentService.getAllIncidents())
            .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminIncidentResponse>> getIncidentDetail(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<AdminIncidentResponse>builder()
            .status(200)
            .message("Lấy chi tiết tường trình thành công")
            .data(adminIncidentService.getIncidentById(id))
            .build()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminIncidentResponse>> updateIncident(
            @PathVariable Long id,
            @RequestBody AdminIncidentUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.<AdminIncidentResponse>builder()
            .status(200)
            .message("Cập nhật tường trình thành công")
            .data(adminIncidentService.updateIncident(id, request))
            .build()
        );
    }
}
