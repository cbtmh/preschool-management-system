package com.vusystem.preschool_management_backend.modules.mobile.service;

import com.vusystem.preschool_management_backend.modules.mobile.dto.request.LeaveRequestCreateRequest;
import com.vusystem.preschool_management_backend.modules.mobile.dto.response.LeaveRequestResponse;

import java.util.List;

public interface LeaveRequestService {
    LeaveRequestResponse createRequest(LeaveRequestCreateRequest request);
    List<LeaveRequestResponse> getParentRequests(Long childId);
    void updateStatus(Long id, String status); // thiết kế dùng chung cho teacher và admin mở rộng sau này
    List<LeaveRequestResponse> getClassRequests(Long classId);
}
