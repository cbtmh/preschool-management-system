package com.vusystem.preschool_management_backend.modules.mobile.service;

import com.vusystem.preschool_management_backend.modules.mobile.dto.response.ParentDashboardResponse;
import com.vusystem.preschool_management_backend.modules.mobile.dto.request.MobileParentProfileRequest;

public interface ParentDashboardService {
    ParentDashboardResponse getDashboardData(String username);
    String updateProfile(String currentUsername, MobileParentProfileRequest request);
}
