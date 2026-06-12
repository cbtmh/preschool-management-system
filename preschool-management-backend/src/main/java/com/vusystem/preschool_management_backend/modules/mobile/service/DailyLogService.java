package com.vusystem.preschool_management_backend.modules.mobile.service;

import com.vusystem.preschool_management_backend.modules.mobile.dto.request.DailyLogBatchUpdateRequest;
import com.vusystem.preschool_management_backend.modules.mobile.dto.response.DailyLogResponse;

import com.vusystem.preschool_management_backend.modules.mobile.dto.response.DailyLogHistoryResponse;

import java.time.LocalDate;
import java.util.List;

public interface DailyLogService {
    
    List<DailyLogResponse> getDailyLogsForClass(Long classId, LocalDate date);

    void batchUpdateDailyLogs(LocalDate date, DailyLogBatchUpdateRequest request);

    // dùng cho luồng phụ huynh
    DailyLogResponse getDailyLogForChild(Long childId, LocalDate date);

    List<DailyLogHistoryResponse> getChildAttendanceHistory(Long childId, int year, int month);
}