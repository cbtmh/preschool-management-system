package com.vusystem.preschool_management_backend.modules.mobile.scheduler;

import com.vusystem.preschool_management_backend.common.entity.academic.ClassTeacher;
import com.vusystem.preschool_management_backend.common.entity.enums.NotificationType;
import com.vusystem.preschool_management_backend.common.entity.operation.DailyLog;
import com.vusystem.preschool_management_backend.common.entity.user.Child;
import com.vusystem.preschool_management_backend.common.entity.user.User;
import com.vusystem.preschool_management_backend.modules.auth.repository.UserRepository;
import com.vusystem.preschool_management_backend.modules.communication.services.NotificationService;
import com.vusystem.preschool_management_backend.modules.core.repository.ClassTeacherRepository;
import com.vusystem.preschool_management_backend.modules.mobile.repository.DailyLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DailyLogSchedulerService {

    private final DailyLogRepository dailyLogRepository;
    private final ClassTeacherRepository classTeacherRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    // Sử dụng ID mặc định cho hệ thống (Thường tài khoản Admin có id = 1)
    private static final Long SYSTEM_ADMIN_ID = 1L;

    /**
     * Chạy lúc 17:30 mỗi ngày: Nhắc nhở giáo viên nếu còn học sinh chưa được check-out
     */
    @Scheduled(cron = "0 30 17 * * ?", zone = "Asia/Ho_Chi_Minh")
    @Transactional(readOnly = true)
    public void remindTeachersForCheckout() {
        log.info("Bắt đầu tiến trình: Nhắc nhở giáo viên điểm danh ra về lúc 17:30");
        LocalDate today = LocalDate.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh"));

        List<DailyLog> pendingLogs = dailyLogRepository.findLogsWithoutCheckout(today);
        if (pendingLogs.isEmpty()) {
            log.info("Không có học sinh nào quên check-out hôm nay.");
            return;
        }

        // Nhóm theo classId
        Map<Long, List<DailyLog>> logsByClass = pendingLogs.stream()
                .collect(Collectors.groupingBy(log -> log.getSchoolClass().getId()));

        for (Map.Entry<Long, List<DailyLog>> entry : logsByClass.entrySet()) {
            Long classId = entry.getKey();
            List<DailyLog> classLogs = entry.getValue();
            String className = classLogs.get(0).getSchoolClass().getName();
            int pendingCount = classLogs.size();

            // Tìm giáo viên phụ trách lớp
            List<ClassTeacher> classTeachers = classTeacherRepository.findBySchoolClassId(classId);
            for (ClassTeacher ct : classTeachers) {
                User teacherUser = ct.getTeacher().getUser();
                if (teacherUser != null) {
                    String title = "Nhắc nhở: Điểm danh ra về";
                    String content = "Lớp " + className + " hiện còn " + pendingCount + " bé chưa được điểm danh ra về. Cô vui lòng kiểm tra lại nhé!";
                    
                    try {
                        notificationService.sendNotificationToUser(title, content, NotificationType.SYSTEM, SYSTEM_ADMIN_ID, teacherUser.getId());
                        log.info("Đã gửi nhắc nhở đến giáo viên ID: {} của lớp {}", teacherUser.getId(), className);
                    } catch (Exception e) {
                        log.error("Lỗi khi gửi thông báo nhắc nhở giáo viên ID: {}", teacherUser.getId(), e);
                    }
                }
            }
        }
        log.info("Hoàn tất tiến trình nhắc nhở giáo viên lúc 17:30.");
    }

    /**
     * Chạy lúc 19:00 mỗi ngày: Tự động check-out cho học sinh chưa được check-out
     */
    @Scheduled(cron = "0 0 19 * * ?", zone = "Asia/Ho_Chi_Minh")
    @Transactional
    public void autoCheckoutPendingLogs() {
        log.info("Bắt đầu tiến trình: Tự động check-out học sinh lúc 19:00");
        LocalDate today = LocalDate.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh"));

        List<DailyLog> pendingLogs = dailyLogRepository.findLogsWithoutCheckout(today);
        if (pendingLogs.isEmpty()) {
            log.info("Không có học sinh nào cần tự động check-out hôm nay.");
            return;
        }

        LocalTime autoCheckoutTime = LocalTime.of(17, 0, 0); // Giờ mặc định
        int count = 0;

        for (DailyLog logItem : pendingLogs) {
            logItem.setCheckOutTime(autoCheckoutTime);
            dailyLogRepository.save(logItem);
            count++;

            // Gửi thông báo cho phụ huynh
            Child child = logItem.getChild();
            if (child != null && child.getParent() != null && child.getParent().getUser() != null) {
                Long parentUserId = child.getParent().getUser().getId();
                String title = "Thông báo điểm danh: RA VỀ (Tự động)";
                String content = "Hệ thống đã tự động điểm danh ra về cho bé " + child.getFullName() + " vào lúc " + autoCheckoutTime.toString() + ".";
                
                try {
                    notificationService.sendNotificationToUserWithRef(
                            title, content, NotificationType.INTERACTION, SYSTEM_ADMIN_ID, parentUserId, "DAILY_LOG", logItem.getId());
                } catch (Exception e) {
                    log.error("Lỗi khi gửi thông báo tự động check-out cho phụ huynh ID: {}", parentUserId, e);
                }
            }
        }

        log.info("Hoàn tất tiến trình tự động check-out lúc 19:00. Đã xử lý {} bản ghi.", count);
    }
}
