package com.vusystem.preschool_management_backend.modules.core.controller;

import com.vusystem.preschool_management_backend.common.dto.response.ApiResponse;

import com.vusystem.preschool_management_backend.modules.core.dto.request.DailyMealRegistrationRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.request.MonthlyMealRegistrationRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.response.ChildMonthlyMealStatsResponse;
import com.vusystem.preschool_management_backend.modules.core.dto.response.MealRegistrationResponse;
import com.vusystem.preschool_management_backend.modules.core.dto.response.MealStatisticsResponse;
import com.vusystem.preschool_management_backend.modules.core.services.MealRegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/core/meal-registrations")
@RequiredArgsConstructor
public class MealRegistrationController {

    private final MealRegistrationService mealRegistrationService;



    /**
     * API: Đăng ký/Hủy suất ăn theo tháng (Bulk)
     * Thao tác từ Mobile App của Phụ huynh.
     */
    @PostMapping("/monthly")
    @PreAuthorize("hasAnyRole('PARENT', 'TEACHER')")
    public ApiResponse<?> processMonthlyRegistration(
            @Valid @RequestBody MonthlyMealRegistrationRequest request) {
        
        mealRegistrationService.processMonthlyRegistration(request);
        
        return ApiResponse.builder()
                .status(200)
                .message("Xử lý đăng ký suất ăn theo tháng thành công")
                .data(null)
                .build();
    }

    /**
     * API: Đăng ký/Hủy suất ăn theo từng ngày
     */
    @PostMapping("/daily")
    @PreAuthorize("hasAnyRole('PARENT', 'TEACHER')")
    public ApiResponse<?> processDailyRegistration(
            @Valid @RequestBody DailyMealRegistrationRequest request) {
        
        mealRegistrationService.processDailyRegistration(request);
        
        return ApiResponse.builder()
                .status(200)
                .message("Xử lý đăng ký suất ăn theo ngày thành công")
                .data(null)
                .build();
    }

    /**
     * API 2: Lấy danh sách đăng ký suất ăn của một Lớp học theo Ngày cụ thể
     * Phục vụ cho Giáo viên theo dõi lớp học và Nhà bếp tổng hợp số lượng nấu ăn.
     */
    @GetMapping("/class/{classId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ApiResponse<List<MealRegistrationResponse>> getRegistrationsByClassAndDate(
            @PathVariable Long classId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        List<MealRegistrationResponse> responseList = mealRegistrationService.getRegistrationsByClassAndDate(classId, date);
        
        return ApiResponse.<List<MealRegistrationResponse>>builder()
                .status(200)
                .message("Lấy danh sách suất ăn theo lớp và ngày thành công")
                .data(responseList)
                .build();
    }

    /**
     * API 3: Xem lịch sử đăng ký suất ăn của một Học sinh (Child) theo khoảng thời gian
     * Phục vụ cho Phụ huynh tra cứu trên Mobile hoặc Admin kiểm tra quyết toán tiền ăn.
     */
    @GetMapping("/child/{childId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PARENT')")
    public ApiResponse<List<MealRegistrationResponse>> getRegistrationsByChildAndDateRange(
            @PathVariable Long childId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<MealRegistrationResponse> responseList = mealRegistrationService.getRegistrationsByChildAndDateRange(childId, startDate, endDate);
        
        return ApiResponse.<List<MealRegistrationResponse>>builder()
                .status(200)
                .message("Lấy lịch sử đăng ký suất ăn của học sinh thành công")
                .data(responseList)
                .build();
    }

    /**
     * API 4: Thống kê tổng số lượng suất ăn theo ngày (Dành cho Nhà bếp/Admin)
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<MealStatisticsResponse> getMealStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        MealStatisticsResponse response = mealRegistrationService.getMealStatistics(startDate, endDate);
        
        return ApiResponse.<MealStatisticsResponse>builder()
                .status(200)
                .message("Thống kê suất ăn từ " + startDate + " đến " + endDate + " thành công")
                .data(response)
                .build();
    }
//thống kê suất ăn/tháng của lớp học
    @GetMapping("/classes/{classId}/monthly-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<ChildMonthlyMealStatsResponse>> getMonthlyMealStatsByClass(
            @PathVariable Long classId,
            @RequestParam int month,
            @RequestParam int year) {

        List<ChildMonthlyMealStatsResponse> stats = mealRegistrationService.getMonthlyMealStatsByClass(classId, month, year);

        return ApiResponse.<List<ChildMonthlyMealStatsResponse>>builder()
                .status(200)
                .message(String.format("Thống kê suất ăn tháng %d/%d của lớp học thành công", month, year))
                .data(stats)
                .build();
    }
}