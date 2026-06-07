package com.vusystem.preschool_management_backend.modules.mobile.service;

import com.vusystem.preschool_management_backend.modules.mobile.dto.request.IncidentReportRequest;
import com.vusystem.preschool_management_backend.modules.mobile.dto.response.IncidentReportResponse;

import java.util.List;

public interface IncidentService {
    // Luồng Giáo viên
    IncidentReportResponse createIncident(IncidentReportRequest request);
    List<IncidentReportResponse> getTeacherIncidents();
    IncidentReportResponse getIncidentDetail(Long id);

    // Luồng Phụ huynh
    List<IncidentReportResponse> getParentIncidents(Long childId);
    IncidentReportResponse getParentIncidentDetail(Long id, Long childId);
}