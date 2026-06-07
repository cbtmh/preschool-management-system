package com.vusystem.preschool_management_backend.modules.core.service;

import com.vusystem.preschool_management_backend.modules.core.dto.request.AdminIncidentUpdateRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.response.AdminIncidentResponse;

import java.util.List;

public interface AdminIncidentService {
    List<AdminIncidentResponse> getAllIncidents();
    AdminIncidentResponse getIncidentById(Long id);
    AdminIncidentResponse updateIncident(Long id, AdminIncidentUpdateRequest request);
}
