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

        // 1. Lấy danh sách học sinh ĐANG HỌC trong lớp (từ bảng enrollments)
        List<Enrollment> enrollments = enrollmentRepository.findBySchoolClassId(classId).stream()
                .filter(e -> e.getStatus() == EnrollmentStatus.STUDYING)
                .collect(Collectors.toList());

        // 2. Lấy dữ liệu sổ tay ĐÃ CÓ trong ngày hôm nay
        List<DailyLog> existingLogs = dailyLogRepository.findByClassIdAndDate(classId, date);
        
        // Đưa list Log vào Map để tra cứu nhanh (Key là Child ID)
        Map<Long, DailyLog> logMap = existingLogs.stream()
                .collect(Collectors.toMap(log -> log.getChild().getId(), log -> log));

        // 3. Trộn dữ liệu: Bé nào chưa có điểm danh thì hệ thống tự sinh ra dữ liệu ảo trả về
        return enrollments.stream().map(enrollment -> {
            Long childId = enrollment.getChild().getId();
            DailyLog existingLog = logMap.get(childId);

            if (existingLog != null) {
                // Đã có data -> Map thẳng ra Response
                return mapToResponse(existingLog);
            } else {
                // Chưa có data -> Trả về DTO "nháp" với trạng thái mặc định, chưa save DB
                return DailyLogResponse.builder()
                        .id(null) // Cố tình để null để Frontend biết bé này chưa từng được lưu
                        .childId(childId)
                        .childFullName(enrollment.getChild().getFullName())
                        .date(date)
                        .attendanceStatus(AttendanceStatus.ABSENT_UNEXCUSED) // Mặc định là chưa điểm danh/vắng
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

        // Lấy tất cả DailyLog đã có trong ngày cho lớp này
        List<DailyLog> existingLogs = dailyLogRepository.findByClassIdAndDate(classId, date);
        Map<Long, DailyLog> logMap = existingLogs.stream()
                .collect(Collectors.toMap(log -> log.getChild().getId(), log -> log));

        // Lấy tất cả Child của các request items mà chưa có log để tránh query N+1
        List<Long> missingLogChildIds = request.getLogs().stream()
                .map(DailyLogBatchUpdateRequest.DailyLogItem::getChildId)
                .filter(childId -> !logMap.containsKey(childId))
                .collect(Collectors.toList());

        Map<Long, Child> childMap = missingLogChildIds.isEmpty() 
            ? java.util.Collections.emptyMap() 
            : childRepository.findAllById(missingLogChildIds).stream()
                .collect(Collectors.toMap(Child::getId, child -> child));

        // Lấy danh sách học sinh hợp lệ của lớp để ngăn ghi đè sai lớp
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

            // Tìm bản ghi cũ, nếu không có thì khởi tạo bản ghi mới (Upsert)
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

            // Ghi đè dữ liệu đánh giá mới từ App gửi lên
            dailyLog.setAttendanceStatus(item.getAttendanceStatus());
            dailyLog.setCheckInTime(item.getCheckInTime());
            dailyLog.setCheckOutTime(item.getCheckOutTime());
            dailyLog.setMealStatus(item.getMealStatus());
            dailyLog.setSleepStatus(item.getSleepStatus());
            dailyLog.setTeacherNotes(item.getTeacherNotes());

            logsToSave.add(dailyLog);

            // Chuẩn bị gửi thông báo nếu có sự thay đổi về giờ vào/ra
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

        // Lưu toàn bộ vào DB trong 1 hit (tối ưu hiệu suất)
        dailyLogRepository.saveAll(logsToSave);

        // Gửi thông báo sau khi lưu xong để logRef.getId() đã có giá trị thực
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
        // 1. Kiểm tra hồ sơ bé có tồn tại không
        // (Lưu ý: Nếu file này em chưa inject ChildRepository, hãy khai báo thêm lên đầu class nhé)
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ Học sinh với ID: " + childId));

        securityService.verifyParentOwnsChild(childId);

        // 2. Tìm DailyLog dưới DB
        Optional<DailyLog> logOpt = dailyLogRepository.findByChildIdAndDate(childId, date);

        // 3. Xử lý logic hiển thị nếu Giáo viên chưa điểm danh (Trả về các trường điểm danh rỗng)
        if (logOpt.isEmpty()) {
            return DailyLogResponse.builder()
                    .childId(child.getId())
                    .childFullName(child.getFullName())
                    .date(date)
                    .attendanceStatus(null) // Để trống tình trạng điểm danh theo yêu cầu
                    .checkInTime(null)
                    .checkOutTime(null)
                    .mealStatus(null)
                    .sleepStatus(null)
                    .teacherNotes(null)
                    .hasSevereAllergy(hasSevereAllergy(child))
                    .build();
        }

        // 4. Nếu giáo viên đã điểm danh rồi thì map dữ liệu trả về bình thường
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
        // 1. Kiểm tra hồ sơ bé có tồn tại không
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ Học sinh với ID: " + childId));

        securityService.verifyParentOwnsChild(childId);

        // 2. Tính toán ngày bắt đầu và kết thúc của tháng
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        // 3. Lấy dữ liệu
        List<DailyLog> logs = dailyLogRepository.findByChildIdAndDateBetweenOrderByDateAsc(childId, startDate, endDate);

        // 4. Map sang DTO
        return logs.stream().map(log -> com.vusystem.preschool_management_backend.modules.mobile.dto.response.DailyLogHistoryResponse.builder()
                .date(log.getDate())
                .attendanceStatus(log.getAttendanceStatus())
                .build()
        ).collect(Collectors.toList());
    }
}