package com.vusystem.preschool_management_backend.modules.core.services.impl;

import com.vusystem.preschool_management_backend.common.entity.academic.Enrollment;
import com.vusystem.preschool_management_backend.common.entity.academic.SchoolClass;
import com.vusystem.preschool_management_backend.common.entity.enums.AttendanceStatus;
import com.vusystem.preschool_management_backend.common.entity.enums.MealRegStatus;
import com.vusystem.preschool_management_backend.common.entity.enums.MealType;
import com.vusystem.preschool_management_backend.common.entity.operation.LeaveRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.response.ChildAttendanceReportDto;
import com.vusystem.preschool_management_backend.modules.core.dto.response.ClassAttendanceReportResponse;
import com.vusystem.preschool_management_backend.modules.core.repository.EnrollmentRepository;
import com.vusystem.preschool_management_backend.modules.core.repository.MealRegistrationRepository;
import com.vusystem.preschool_management_backend.modules.core.repository.SchoolClassRepository;
import com.vusystem.preschool_management_backend.modules.core.services.ReportService;
import com.vusystem.preschool_management_backend.modules.mobile.repository.DailyLogRepository;
import com.vusystem.preschool_management_backend.modules.mobile.repository.LeaveRequestRepository;
import com.vusystem.preschool_management_backend.config.security.SecurityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final SchoolClassRepository schoolClassRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final DailyLogRepository dailyLogRepository;
    private final MealRegistrationRepository mealRegistrationRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final SecurityService securityService;

    @Override
    public ClassAttendanceReportResponse generateClassAttendanceReport(Long classId, int month, int year) {
        securityService.verifyTeacherTeachesClass(classId);
        
        SchoolClass schoolClass = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found with id: " + classId));

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        // 1. Lấy danh sách bé trong lớp
        List<Enrollment> enrollments = enrollmentRepository.findActiveEnrollmentsByClassId(classId);

        // Map để lưu trữ DTO của từng bé
        Map<Long, ChildAttendanceReportDto> reportMap = new HashMap<>();
        for (Enrollment e : enrollments) {
            reportMap.put(e.getChild().getId(), ChildAttendanceReportDto.builder()
                    .childId(e.getChild().getId())
                    .childName(e.getChild().getFullName())
                    .totalPresentDays(0)
                    .totalExcusedAbsences(0)
                    .totalUnexcusedAbsences(0)
                    .totalCancelledMeals(0)
                    .totalCancelledBreakfasts(0)
                    .totalCancelledLunches(0)
                    .totalCancelledSnacks(0)
                    .attendanceRate(0.0)
                    .build());
        }

        // 2. Lấy số liệu điểm danh
        List<Object[]> attendanceStats = dailyLogRepository.countAttendanceStatsForClass(classId, startDate, endDate);
        for (Object[] stat : attendanceStats) {
            Long childId = (Long) stat[0];
            AttendanceStatus status = (AttendanceStatus) stat[1];
            Long count = (Long) stat[2];

            if (reportMap.containsKey(childId)) {
                ChildAttendanceReportDto dto = reportMap.get(childId);
                if (status == AttendanceStatus.PRESENT) {
                    dto.setTotalPresentDays(count.intValue());
                } else if (status == AttendanceStatus.ABSENT_UNEXCUSED || status == AttendanceStatus.ABSENT_EXCUSED) {
                    // Tạm thời coi tất cả vắng mặt là không phép, sau đó trừ đi những ngày có phép
                    dto.setTotalUnexcusedAbsences(dto.getTotalUnexcusedAbsences() + count.intValue());
                }
            }
        }

        // 3. Tính số ngày nghỉ có phép
        List<LeaveRequest> leaveRequests = leaveRequestRepository.findApprovedLeaveRequestsForClassInDateRange(classId, startDate, endDate);
        for (LeaveRequest lr : leaveRequests) {
            Long childId = lr.getChild().getId();
            if (reportMap.containsKey(childId)) {
                ChildAttendanceReportDto dto = reportMap.get(childId);
                
                // Tính số ngày giao nhau giữa (startDate, endDate) của báo cáo và LeaveRequest
                LocalDate lrStart = lr.getStartDate().isBefore(startDate) ? startDate : lr.getStartDate();
                LocalDate lrEnd = lr.getEndDate().isAfter(endDate) ? endDate : lr.getEndDate();
                
                int excusedDays = 0;
                while (!lrStart.isAfter(lrEnd)) {
                    // Nếu là ngày trong tuần (T2-T6) thì tính là nghỉ có phép
                    if (lrStart.getDayOfWeek().getValue() >= 1 && lrStart.getDayOfWeek().getValue() <= 5) {
                        excusedDays++;
                    }
                    lrStart = lrStart.plusDays(1);
                }
                
                dto.setTotalExcusedAbsences(dto.getTotalExcusedAbsences() + excusedDays);
                // Giảm số ngày nghỉ không phép xuống
                dto.setTotalUnexcusedAbsences(Math.max(0, dto.getTotalUnexcusedAbsences() - excusedDays));
            }
        }

        // 4. Lấy số liệu suất ăn đã hủy
        List<Object[]> mealStats = mealRegistrationRepository.countMonthlyMealStatsForClass(classId, startDate, endDate);
        for (Object[] stat : mealStats) {
            Long childId = (Long) stat[0];
            MealRegStatus status = (MealRegStatus) stat[2];
            MealType mealType = (MealType) stat[3];
            Long count = (Long) stat[4];

            if (reportMap.containsKey(childId) && status == MealRegStatus.CANCELLED) {
                ChildAttendanceReportDto dto = reportMap.get(childId);
                dto.setTotalCancelledMeals(dto.getTotalCancelledMeals() + count.intValue());
                
                if (mealType == MealType.BREAKFAST) {
                    dto.setTotalCancelledBreakfasts(dto.getTotalCancelledBreakfasts() + count.intValue());
                } else if (mealType == MealType.LUNCH) {
                    dto.setTotalCancelledLunches(dto.getTotalCancelledLunches() + count.intValue());
                } else if (mealType == MealType.SNACK) {
                    dto.setTotalCancelledSnacks(dto.getTotalCancelledSnacks() + count.intValue());
                }
            }
        }

        // 5. Tính tổng số ngày học của lớp (mặc định là số ngày cao nhất có mặt + vắng mặt của 1 bé)
        int totalSchoolDays = 0;
        for (ChildAttendanceReportDto dto : reportMap.values()) {
            int total = dto.getTotalPresentDays() + dto.getTotalExcusedAbsences() + dto.getTotalUnexcusedAbsences();
            if (total > totalSchoolDays) {
                totalSchoolDays = total;
            }
        }

        // 6. Cập nhật tỷ lệ chuyên cần
        for (ChildAttendanceReportDto dto : reportMap.values()) {
            if (totalSchoolDays > 0) {
                double rate = (double) dto.getTotalPresentDays() / totalSchoolDays * 100;
                dto.setAttendanceRate(Math.round(rate * 10.0) / 10.0); // Làm tròn 1 chữ số thập phân
            }
        }

        return ClassAttendanceReportResponse.builder()
                .classId(classId)
                .className(schoolClass.getName())
                .month(month)
                .year(year)
                .totalSchoolDays(totalSchoolDays)
                .childReports(new ArrayList<>(reportMap.values()))
                .build();
    }
}
