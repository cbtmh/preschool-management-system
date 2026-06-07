package com.vusystem.preschool_management_backend.modules.core.services;

import com.vusystem.preschool_management_backend.modules.core.dto.response.DashboardStatisticsResponse;

public interface DashboardService {
    DashboardStatisticsResponse getDashboardStatistics();
}
