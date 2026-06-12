package com.vusystem.preschool_management_backend.modules.mobile.service.impl;

import com.vusystem.preschool_management_backend.common.entity.academic.Enrollment;
import com.vusystem.preschool_management_backend.common.entity.enums.AttendanceStatus;
import com.vusystem.preschool_management_backend.common.entity.enums.EnrollmentStatus;
import com.vusystem.preschool_management_backend.common.entity.operation.DailyLog;
import com.vusystem.preschool_management_backend.common.entity.user.Child;
import com.vusystem.preschool_management_backend.modules.core.repository.ChildRepository;
import com.vusystem.preschool_management_backend.modules.core.repository.EnrollmentRepository;
import com.vusystem.preschool_management_backend.modules.core.repository.SchoolClassRepository;
import com.vusystem.preschool_management_backend.modules.mobile.dto.request.DailyLogBatchUpdateRequest;
import com.vusystem.preschool_management_backend.modules.mobile.dto.response.DailyLogResponse;
import com.vusystem.preschool_management_backend.modules.mobile.repository.DailyLogRepository;
import com.vusystem.preschool_management_backend.modules.mobile.service.DailyLogService;
import com.vusystem.preschool_management_backend.config.security.SecurityService;
import com.vusystem.preschool_management_backend.modules.communication.services.NotificationService;
import com.vusystem.preschool_management_backend.common.entity.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DailyLogServiceImpl implements DailyLogService {

    private final DailyLogRepository dailyLogRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final ChildRepository childRepository;
    private final SecurityService securityService;
    private final NotificationService notificationService;

    @Override
    public List<DailyLogResponse> getDailyLogsForClass(Long classId, LocalDate date) {
        securityService.verifyTeacherTeachesClass(classId);

        // lọc học sinh đang học từ enrollments để ngăn điểm danh nhầm học sinh đã nghỉ học
        List<Enrollment> enrollments = enrollmentRepository.findBySchoolClassId(classId).stream()
                .filter(e -> e.getStatus() == EnrollmentStatus.STUDYING)
                .collect(Collectors.toList());

        List<DailyLog> existingLogs = dailyLogRepository.findByClassIdAndDate(classId, date);
        
        // chuyển sang map để giảm độ phức tạp tra cứu từ O(n) xuống O(1)
        Map<Long, DailyLog> logMap = existingLogs.stream()
                .collect(Collectors.toMap(log -> log.getChild().getId(), log -> log));

        // sinh dữ liệu ảo (dto) cho các bé chưa điểm danh để frontend hiển thị list đầy đủ
        return enrollments.stream().map(enrollment -> {
            Long childId = enrollment.getChild().getId();
            DailyLog existingLog = logMap.get(childId);

            if (existingLog != null) {
                return mapToResponse(existingLog);
            } else {
                return DailyLogResponse.builder()
                        .id(null) // để null để frontend biết bản ghi này chưa tồn tại trong db
                        .childId(childId)
                        .childFullName(enrollment.getChild().getFullName())
                        .date(date)
                        .attendanceStatus(AttendanceStatus.ABSENT_UNEXCUSED)
                        .hasSevereAllergy(hasSevereAllergy(enrollment.getChild()))
                        .build();
            }
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void batchUpdateDailyLogs(LocalDate date, DailyLogBatchUpdateRequest request) {
        Long classId = request.getClassId();
        securityService.verifyTeacherTeachesClass(classId);

        LocalDate today = LocalDate.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh"));
        if (date.isAfter(today)) {
            throw new RuntimeException("Không thể điểm danh cho ngày trong tương lai.");
        }
        if (date.isBefore(today)) {
            if (date.getMonthValue() != today.getMonthValue() || date.getYear() != today.getYear()) {
                throw new RuntimeException("Không thể thay đổi dữ liệu điểm danh của tháng cũ đã chốt báo cáo.");
            }
        }

        var schoolClass = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học với ID: " + classId));

        List<DailyLog> existingLogs = dailyLogRepository.findByClassIdAndDate(classId, date);
        Map<Long, DailyLog> logMap = existingLogs.stream()
                .collect(Collectors.toMap(log -> log.getChild().getId(), log -> log));

        // tối ưu hiệu suất, lấy tất cả child bằng 1 query in() để tránh n+1
        List<Long> missingLogChildIds = request.getLogs().stream()
                .map(DailyLogBatchUpdateRequest.DailyLogItem::getChildId)
                .filter(childId -> !logMap.containsKey(childId))
                .collect(Collectors.toList());

        Map<Long, Child> childMap = missingLogChildIds.isEmpty() 
            ? java.util.Collections.emptyMap() 
            : childRepository.findAllById(missingLogChildIds).stream()
                .collect(Collectors.toMap(Child::getId, child -> child));

        // chặn tấn công idor hoặc submit sai classid từ frontend
        List<Long> validChildIds = enrollmentRepository.findBySchoolClassId(classId).stream()
                .filter(e -> e.getStatus() == EnrollmentStatus.STUDYING)
                .map(e -> e.getChild().getId())
                .collect(Collectors.toList());

        List<DailyLog> logsToSave = new ArrayList<>();
        List<Runnable> notificationsToSend = new ArrayList<>();
        Long senderId = securityService.getCurrentUser().getId();

        for (DailyLogBatchUpdateRequest.DailyLogItem item : request.getLogs()) {
            if (!validChildIds.contains(item.getChildId())) {
                throw new RuntimeException("Học sinh ID: " + item.getChildId() + " không thuộc lớp học này.");
            }

            // dùng logic upsert để hỗ trợ cập nhật nhiều lần
            DailyLog dailyLog = logMap.get(item.getChildId());
            boolean isNewCheckIn = false;
            boolean isNewCheckOut = false;

            if (dailyLog == null) {
                Child child = childMap.get(item.getChildId());
                if (child == null) {
                    throw new RuntimeException("Không tìm thấy học sinh ID: " + item.getChildId());
                }
                dailyLog = DailyLog.builder()
                        .child(child)
                        .schoolClass(schoolClass)
                        .date(date)
                        .build();
                isNewCheckIn = item.getCheckInTime() != null;
                isNewCheckOut = item.getCheckOutTime() != null;
            } else {
                isNewCheckIn = dailyLog.getCheckInTime() == null && item.getCheckInTime() != null;
                isNewCheckOut = dailyLog.getCheckOutTime() == null && item.getCheckOutTime() != null;
            }

            dailyLog.setAttendanceStatus(item.getAttendanceStatus());
            dailyLog.setCheckInTime(item.getCheckInTime());
            dailyLog.setCheckOutTime(item.getCheckOutTime());
            dailyLog.setMealStatus(item.getMealStatus());
            dailyLog.setSleepStatus(item.getSleepStatus());
            dailyLog.setTeacherNotes(item.getTeacherNotes());

            logsToSave.add(dailyLog);

            // chỉ gửi thông báo khi có sự kiện phát sinh giờ vào/ra lần đầu tiên
            final DailyLog logRef = dailyLog;
            final boolean notifyCheckIn = isNewCheckIn;
            final boolean notifyCheckOut = isNewCheckOut;
            final String checkInStr = item.getCheckInTime() != null ? item.getCheckInTime().toString() : "";
            final String checkOutStr = item.getCheckOutTime() != null ? item.getCheckOutTime().toString() : "";

            if (notifyCheckIn || notifyCheckOut) {
                notificationsToSend.add(() -> {
                    Child c = logRef.getChild();
                    if (c != null && c.getParent() != null && c.getParent().getUser() != null) {
                        Long parentUserId = c.getParent().getUser().getId();
                        if (notifyCheckIn) {
                            String title = "Thông báo điểm danh: VÀO LỚP";
                            String content = "Bé " + c.getFullName() + " đã có mặt tại lớp lúc " + checkInStr + ".";
                            notificationService.sendNotificationToUserWithRef(title, content, NotificationType.INTERACTION, senderId, parentUserId, "DAILY_LOG", logRef.getId());
                        }
                        if (notifyCheckOut) {
                            String title = "Thông báo điểm danh: RA VỀ";
                            String content = "Bé " + c.getFullName() + " đã rời lớp lúc " + checkOutStr + ".";
                            notificationService.sendNotificationToUserWithRef(title, content, NotificationType.INTERACTION, senderId, parentUserId, "DAILY_LOG", logRef.getId());
                        }
                    }
                });
            }
        }

        // tối ưu hiệu suất với batch insert/update
        dailyLogRepository.saveAll(logsToSave);

        // delay gửi thông báo sau khi save để lấy được id thực của entity
        for (Runnable task : notificationsToSend) {
            task.run();
        }
    }

    // --- Helper Method ---
    private boolean hasSevereAllergy(Child child) {
        if (child == null || !Boolean.TRUE.equals(child.getAllergyDeclared()) || child.getAllergies() == null) {
            return false;
        }
        return child.getAllergies().stream().anyMatch(a -> 
            com.vusystem.preschool_management_backend.common.entity.enums.SeverityLevel.SEVERE.equals(a.getSeverity()) || 
            com.vusystem.preschool_management_backend.common.entity.enums.SeverityLevel.CRITICAL.equals(a.getSeverity()));
    }

    private DailyLogResponse mapToResponse(DailyLog log) {
        return DailyLogResponse.builder()
                .id(log.getId())
                .childId(log.getChild().getId())
                .childFullName(log.getChild().getFullName())
                .date(log.getDate())
                .attendanceStatus(log.getAttendanceStatus())
                .checkInTime(log.getCheckInTime())
                .checkOutTime(log.getCheckOutTime())
                .mealStatus(log.getMealStatus())
                .sleepStatus(log.getSleepStatus())
                .teacherNotes(log.getTeacherNotes())
                .hasSevereAllergy(hasSevereAllergy(log.getChild()))
                .build();
    }

    @Override
    public DailyLogResponse getDailyLogForChild(Long childId, LocalDate date) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ Học sinh với ID: " + childId));

        securityService.verifyParentOwnsChild(childId);

        Optional<DailyLog> logOpt = dailyLogRepository.findByChildIdAndDate(childId, date);

        // trả về template rỗng nếu giáo viên chưa điểm danh
        if (logOpt.isEmpty()) {
            return DailyLogResponse.builder()
                    .childId(child.getId())
                    .childFullName(child.getFullName())
                    .date(date)
                    .attendanceStatus(null)
                    .checkInTime(null)
                    .checkOutTime(null)
                    .mealStatus(null)
                    .sleepStatus(null)
                    .teacherNotes(null)
                    .hasSevereAllergy(hasSevereAllergy(child))
                    .build();
        }

        DailyLog log = logOpt.get();
        return DailyLogResponse.builder()
                .id(log.getId())
                .childId(child.getId())
                .childFullName(child.getFullName())
                .date(log.getDate())
                .attendanceStatus(log.getAttendanceStatus())
                .checkInTime(log.getCheckInTime())
                .checkOutTime(log.getCheckOutTime())
                .mealStatus(log.getMealStatus())
                .sleepStatus(log.getSleepStatus())
                .teacherNotes(log.getTeacherNotes())
                .build();
    }

    @Override
    public List<com.vusystem.preschool_management_backend.modules.mobile.dto.response.DailyLogHistoryResponse> getChildAttendanceHistory(Long childId, int year, int month) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ Học sinh với ID: " + childId));

        securityService.verifyParentOwnsChild(childId);

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        List<DailyLog> logs = dailyLogRepository.findByChildIdAndDateBetweenOrderByDateAsc(childId, startDate, endDate);

        return logs.stream().map(log -> com.vusystem.preschool_management_backend.modules.mobile.dto.response.DailyLogHistoryResponse.builder()
                .date(log.getDate())
                .attendanceStatus(log.getAttendanceStatus())
                .build()
        ).collect(Collectors.toList());
    }
}