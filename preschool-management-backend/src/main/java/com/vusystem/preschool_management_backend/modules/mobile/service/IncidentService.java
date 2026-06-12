package com.vusystem.preschool_management_backend.modules.mobile.service;

import com.vusystem.preschool_management_backend.modules.mobile.dto.request.IncidentReportRequest;
import com.vusystem.preschool_management_backend.modules.mobile.dto.response.IncidentReportResponse;

import java.util.List;

public interface IncidentService {
    // phân tách api theo luồng giáo viên
    IncidentReportResponse createIncident(IncidentReportRequest request);
    List<IncidentReportResponse> getTeacherIncidents();
    IncidentReportResponse getIncidentDetail(Long id);

    // phân tách api theo luồng phụ huynh
    List<IncidentReportResponse> getParentIncidents(Long childId);
    IncidentReportResponse getParentIncidentDetail(Long id, Long childId);
}