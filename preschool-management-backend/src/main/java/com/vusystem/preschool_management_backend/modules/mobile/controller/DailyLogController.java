package com.vusystem.preschool_management_backend.modules.mobile.controller;

import com.vusystem.preschool_management_backend.common.dto.response.ApiResponse;
import com.vusystem.preschool_management_backend.modules.mobile.dto.request.DailyLogBatchUpdateRequest;
import com.vusystem.preschool_management_backend.modules.mobile.dto.response.DailyLogResponse;
import com.vusystem.preschool_management_backend.modules.mobile.service.DailyLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/mobile/daily-logs")
@RequiredArgsConstructor
public class DailyLogController {

    private final DailyLogService dailyLogService;

    // 1. Lấy sổ tay điểm danh của lớp
    @GetMapping("/classes/{classId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ApiResponse<List<?>> getDailyLogs(
            @PathVariable Long classId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        return ApiResponse.<List<?>>builder()
                .status(200)
                .message("Lấy danh sách sổ tay điểm danh thành công")
                .data(dailyLogService.getDailyLogsForClass(classId, date))
                .build();
    }

    // 2. Gửi hàng loạt cập nhật (Lưu sổ tay)
    @PutMapping("/batch")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ApiResponse<?> batchUpdateDailyLogs(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Valid @RequestBody DailyLogBatchUpdateRequest request) {

        dailyLogService.batchUpdateDailyLogs(date, request);

        return ApiResponse.builder()
                .status(200)
                .message("Đã lưu sổ tay điểm danh thành công")
                .data(null)
                .build();
    }

    // 3. Xem sổ tay của con (Dành cho Phụ huynh)
    @GetMapping("/children/{childId}")
    @PreAuthorize("hasRole('PARENT')")
    public ApiResponse<DailyLogResponse> getDailyLogForChild(
            @PathVariable Long childId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        return ApiResponse.<DailyLogResponse>builder()
                .status(200)
                .message("Lấy thông tin sổ tay điểm danh thành công")
                .data(dailyLogService.getDailyLogForChild(childId, date))
                .build();
    }

    // 4. Lịch sử điểm danh nguyên tháng của con (Dành cho Phụ huynh)
    @GetMapping("/history/children/{childId}")
    @PreAuthorize("hasRole('PARENT')")
    public ApiResponse<List<com.vusystem.preschool_management_backend.modules.mobile.dto.response.DailyLogHistoryResponse>> getChildAttendanceHistory(
            @PathVariable Long childId,
            @RequestParam int year,
            @RequestParam int month) {

        return ApiResponse.<List<com.vusystem.preschool_management_backend.modules.mobile.dto.response.DailyLogHistoryResponse>>builder()
                .status(200)
                .message("Lấy lịch sử điểm danh thành công")
                .data(dailyLogService.getChildAttendanceHistory(childId, year, month))
                .build();
    }
}