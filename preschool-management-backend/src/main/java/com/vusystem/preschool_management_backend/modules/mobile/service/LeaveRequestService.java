package com.vusystem.preschool_management_backend.modules.mobile.service;

import com.vusystem.preschool_management_backend.modules.mobile.dto.request.LeaveRequestCreateRequest;
import com.vusystem.preschool_management_backend.modules.mobile.dto.response.LeaveRequestResponse;

import java.util.List;

public interface LeaveRequestService {
    LeaveRequestResponse createRequest(LeaveRequestCreateRequest request);
    List<LeaveRequestResponse> getParentRequests(Long childId);
    void updateStatus(Long id, String status); // Dùng chung cho Teacher/Admin sau này
}
