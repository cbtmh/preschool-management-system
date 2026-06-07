package com.vusystem.preschool_management_backend.modules.core.controller;

import com.vusystem.preschool_management_backend.common.dto.response.ApiResponse;

import com.vusystem.preschool_management_backend.modules.core.dto.request.MealMenuRequest;
import com.vusystem.preschool_management_backend.modules.core.services.MealMenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/core/meal-menus")
@RequiredArgsConstructor
public class MealMenuController {

    private final MealMenuService mealMenuService;

    // 1. Tạo mới thực đơn (Admin, Teacher)
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ApiResponse<?> createMealMenu(@Valid @RequestBody MealMenuRequest request) {
        return ApiResponse.builder()
                .status(200)
                .message("Tạo thực đơn thành công")
                .data(mealMenuService.createMealMenu(request))
                .build();
    }

    // 2. Cập nhật thực đơn (Admin, Teacher)
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ApiResponse<?> updateMealMenu(
            @PathVariable Long id,
            @Valid @RequestBody MealMenuRequest request) {
        return ApiResponse.builder()
                .status(200)
                .message("Cập nhật thực đơn thành công")
                .data(mealMenuService.updateMealMenu(id, request))
                .build();
    }

    // 3. Lấy chi tiết 1 bữa ăn (Tất cả đều xem được)
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PARENT')")
    public ApiResponse<?> getMealMenuById(@PathVariable Long id) {
        return ApiResponse.builder()
                .status(200)
                .message("Lấy thông tin thực đơn thành công")
                .data(mealMenuService.getMealMenuById(id))
                .build();
    }

    // 4. Lấy thực đơn trong 1 ngày (Tất cả đều xem được)
    // VD: GET /api/core/meal-menus/date?date=2024-05-15
    @GetMapping("/date")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PARENT')")
    public ApiResponse<?> getMealMenusByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ApiResponse.builder()
                .status(200)
                .message("Lấy danh sách thực đơn theo ngày thành công")
                .data(mealMenuService.getMealMenusByDate(date))
                .build();
    }

    // 5. Lấy thực đơn trong một khoảng thời gian (Tuần/Tháng) (Tất cả đều xem được)
    // VD: GET /api/core/meal-menus/range?startDate=2024-05-01&endDate=2024-05-31
    @GetMapping("/range")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'PARENT')")
    public ApiResponse<?> getMealMenusBetweenDates(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            return ApiResponse.builder()
                    .status(200)
                    .message("Lấy danh sách thực đơn theo khoảng thời gian thành công")
                    .data(mealMenuService.getMealMenusBetweenDates(startDate, endDate))
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.builder()
                    .status(500)
                    .message("Lỗi: " + e.getMessage() + " | Cause: " + (e.getCause() != null ? e.getCause().getMessage() : "null"))
                    .data(null)
                    .build();
        }
    }

    // 6. Xóa thực đơn (Admin, Teacher)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ApiResponse<?> deleteMealMenu(@PathVariable Long id) {
        mealMenuService.deleteMealMenu(id);
        return ApiResponse.builder()
                .status(200)
                .message("Xóa thực đơn thành công")
                .data(null)
                .build();
    }
}