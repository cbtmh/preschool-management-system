package com.vusystem.preschool_management_backend.modules.core.services;


import com.vusystem.preschool_management_backend.modules.core.dto.request.MonthlyMealRegistrationRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.response.ChildMonthlyMealStatsResponse;
import com.vusystem.preschool_management_backend.modules.core.dto.response.MealRegistrationResponse;
import com.vusystem.preschool_management_backend.modules.core.dto.response.MealStatisticsResponse;

import java.time.LocalDate;
import java.util.List;

public interface MealRegistrationService {


    // xử lý tự động đăng ký hoặc cắt cơm hàng loạt theo tháng để hỗ trợ tác vụ hành chính
    void processMonthlyRegistration(MonthlyMealRegistrationRequest request);

    void processDailyRegistration(com.vusystem.preschool_management_backend.modules.core.dto.request.DailyMealRegistrationRequest request);

    List<MealRegistrationResponse> getRegistrationsByClassAndDate(Long classId, LocalDate date);

    List<MealRegistrationResponse> getRegistrationsByChildAndDateRange(Long childId, LocalDate startDate, LocalDate endDate);

    List<ChildMonthlyMealStatsResponse> getMonthlyMealStatsByClass(Long classId, int month, int year);
    
    MealStatisticsResponse getMealStatistics(LocalDate startDate, LocalDate endDate);

    // tự động đồng bộ hóa việc cắt cơm khi học sinh có đơn xin nghỉ được duyệt
    void cancelMealsForLeave(Long childId, LocalDate startDate, LocalDate endDate);
}