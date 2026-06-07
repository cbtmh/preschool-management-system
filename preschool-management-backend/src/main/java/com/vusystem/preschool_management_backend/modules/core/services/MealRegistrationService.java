package com.vusystem.preschool_management_backend.modules.core.services;


import com.vusystem.preschool_management_backend.modules.core.dto.request.MonthlyMealRegistrationRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.response.ChildMonthlyMealStatsResponse;
import com.vusystem.preschool_management_backend.modules.core.dto.response.MealRegistrationResponse;
import com.vusystem.preschool_management_backend.modules.core.dto.response.MealStatisticsResponse;

import java.time.LocalDate;
import java.util.List;

public interface MealRegistrationService {


    // Xử lý đăng ký hoặc cắt cơm theo tháng (Tất cả 3 bữa mặc định)
    void processMonthlyRegistration(MonthlyMealRegistrationRequest request);

    // Xử lý đăng ký hoặc cắt cơm theo ngày
    void processDailyRegistration(com.vusystem.preschool_management_backend.modules.core.dto.request.DailyMealRegistrationRequest request);

    // Dành cho Giáo viên/Nhà bếp: Xem danh sách suất ăn theo lớp trong 1 ngày
    List<MealRegistrationResponse> getRegistrationsByClassAndDate(Long classId, LocalDate date);

    // Dành cho Phụ huynh: Xem lịch sử đăng ký của con trong 1 khoảng thời gian
    List<MealRegistrationResponse> getRegistrationsByChildAndDateRange(Long childId, LocalDate startDate, LocalDate endDate);

    List<ChildMonthlyMealStatsResponse> getMonthlyMealStatsByClass(Long classId, int month, int year);
    
    MealStatisticsResponse getMealStatistics(LocalDate startDate, LocalDate endDate);
}