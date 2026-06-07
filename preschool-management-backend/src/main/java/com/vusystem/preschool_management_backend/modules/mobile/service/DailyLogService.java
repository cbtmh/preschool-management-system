package com.vusystem.preschool_management_backend.modules.mobile.service;

import com.vusystem.preschool_management_backend.modules.mobile.dto.request.DailyLogBatchUpdateRequest;
import com.vusystem.preschool_management_backend.modules.mobile.dto.response.DailyLogResponse;

import com.vusystem.preschool_management_backend.modules.mobile.dto.response.DailyLogHistoryResponse;

import java.time.LocalDate;
import java.util.List;

public interface DailyLogService {
    
    // Lấy danh sách điểm danh của lớp trong 1 ngày cụ thể
    List<DailyLogResponse> getDailyLogsForClass(Long classId, LocalDate date);

    // Lưu đồng loạt danh sách điểm danh
    void batchUpdateDailyLogs(LocalDate date, DailyLogBatchUpdateRequest request);

    // Lấy sổ tay điểm danh của 1 học sinh cụ thể trong ngày (Dành cho Phụ huynh)
    DailyLogResponse getDailyLogForChild(Long childId, LocalDate date);

    // Lấy lịch sử điểm danh của 1 học sinh trong 1 tháng
    List<DailyLogHistoryResponse> getChildAttendanceHistory(Long childId, int year, int month);
}