package com.vusystem.preschool_management_backend.modules.core.services.impl;

import com.vusystem.preschool_management_backend.common.entity.academic.Enrollment;
import com.vusystem.preschool_management_backend.common.entity.enums.EnrollmentStatus;
import com.vusystem.preschool_management_backend.common.entity.enums.MealRegStatus;
import com.vusystem.preschool_management_backend.common.entity.enums.MealType;
import com.vusystem.preschool_management_backend.common.entity.operation.MealRegistration;
import com.vusystem.preschool_management_backend.common.entity.user.Child;

import com.vusystem.preschool_management_backend.common.entity.operation.DailyLog;
import com.vusystem.preschool_management_backend.common.entity.enums.AttendanceStatus;
import com.vusystem.preschool_management_backend.modules.mobile.repository.DailyLogRepository;
import com.vusystem.preschool_management_backend.modules.mobile.repository.LeaveRequestRepository;
import java.util.Optional;

import com.vusystem.preschool_management_backend.modules.core.dto.request.DailyMealRegistrationRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.request.MonthlyMealRegistrationRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.response.ChildMonthlyMealStatsResponse;
import com.vusystem.preschool_management_backend.modules.core.dto.response.MealRegistrationResponse;
import com.vusystem.preschool_management_backend.modules.core.dto.response.MealStatisticsResponse;
import com.vusystem.preschool_management_backend.modules.core.repository.ChildRepository;
import com.vusystem.preschool_management_backend.modules.core.repository.EnrollmentRepository;
import com.vusystem.preschool_management_backend.modules.core.repository.MealRegistrationRepository;
import com.vusystem.preschool_management_backend.modules.core.services.MealRegistrationService;
import com.vusystem.preschool_management_backend.modules.core.repository.SchoolClassRepository;
import com.vusystem.preschool_management_backend.modules.communication.services.NotificationService;
import com.vusystem.preschool_management_backend.common.entity.enums.NotificationType;
import com.vusystem.preschool_management_backend.config.security.SecurityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MealRegistrationServiceImpl implements MealRegistrationService {

    private final MealRegistrationRepository mealRegistrationRepository;
    private final ChildRepository childRepository;
    
    private final EnrollmentRepository enrollmentRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SecurityService securityService;
    private final NotificationService notificationService;
    private final DailyLogRepository dailyLogRepository;
    private final LeaveRequestRepository leaveRequestRepository;




    @Override
    public List<MealRegistrationResponse> getRegistrationsByClassAndDate(Long classId, LocalDate date) {
        securityService.verifyTeacherTeachesClass(classId);
        
        String className = schoolClassRepository.findById(classId)
                .map(c -> c.getName())
                .orElse("Chưa xếp lớp");

        List<MealRegistrationResponse> responses = new ArrayList<>();
        
        if (date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY) {
            return responses;
        }

        List<MealRegistration> explicitRegistrations = mealRegistrationRepository.findMealRegistrationsByClassAndDate(classId, date);
        List<Enrollment> activeEnrollments = enrollmentRepository.findBySchoolClassIdAndStatus(classId, EnrollmentStatus.STUDYING);

        MealType[] defaultMeals = MealType.values(); // BREAKFAST, LUNCH, SNACK

        for (Enrollment enrollment : activeEnrollments) {
            Child child = enrollment.getChild();
            for (MealType mealType : defaultMeals) {
                MealRegistration explicitReg = explicitRegistrations.stream()
                        .filter(reg -> reg.getChild().getId().equals(child.getId()) && reg.getMealType() == mealType)
                        .findFirst()
                        .orElse(null);

                if (explicitReg != null) {
                    responses.add(mapToResponse(explicitReg, className));
                } else {
                    responses.add(MealRegistrationResponse.builder()
                            .id(null)
                            .childId(child.getId())
                            .childFullName(child.getFullName())
                            .className(className)
                            .date(date)
                            .mealType(mealType)
                            .status(MealRegStatus.REGISTERED)
                            .build());
                }
            }
        }

        return responses;
    }

    @Override
    public List<MealRegistrationResponse> getRegistrationsByChildAndDateRange(Long childId, LocalDate startDate, LocalDate endDate) {
        securityService.verifyParentOwnsChild(childId);
        
        if (startDate.isAfter(endDate)) {
            throw new RuntimeException("Ngày bắt đầu không thể lớn hơn ngày kết thúc.");
        }
        
        String currentClassName = enrollmentRepository.findByChildIdAndStatus(childId, EnrollmentStatus.STUDYING)
                .map(e -> e.getSchoolClass().getName())
                .orElse("Chưa xếp lớp");
        
        return mealRegistrationRepository.findByChildIdAndDateBetweenOrderByDateAsc(childId, startDate, endDate).stream()
                .map(entity -> mapToResponse(entity, currentClassName))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void processMonthlyRegistration(MonthlyMealRegistrationRequest request) {
        securityService.verifyParentOwnsChild(request.getChildId());
        
        Child child = childRepository.findById(request.getChildId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học sinh với ID: " + request.getChildId()));

        LocalDate startDate = LocalDate.of(request.getYear(), request.getMonth(), 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        // truy xuất toàn bộ đăng ký hiện có trong tháng để tránh ghi đè dữ liệu hoặc tạo duplicate record
        List<MealRegistration> existingRegistrations = mealRegistrationRepository
                .findByChildIdAndDateBetweenOrderByDateAsc(request.getChildId(), startDate, endDate);

        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));

        MealRegStatus newStatus = request.getIsRegistered() ? MealRegStatus.REGISTERED : MealRegStatus.CANCELLED;
        List<MealRegistration> recordsToSave = new ArrayList<>();

        List<MealType> requestMealTypes = request.getMealTypes();
        if (requestMealTypes == null) {
            requestMealTypes = new ArrayList<>();
        }
        if (requestMealTypes.isEmpty() && request.getIsRegistered()) {
            throw new RuntimeException("Danh sách bữa ăn không được để trống khi đăng ký.");
        }

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            // logic nghiệp vụ: chỉ xử lý đăng ký suất ăn cho các ngày trong tuần (thứ 2 đến thứ 6)
            if (date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY) {
                continue;
            }
            
            if (!date.isAfter(today)) {
                continue; 
            }

            for (MealType mealType : MealType.values()) {
                boolean isSelected = requestMealTypes.contains(mealType);
                MealRegStatus statusToSet;
                
                if (request.getIsRegistered()) {
                    statusToSet = isSelected ? MealRegStatus.REGISTERED : MealRegStatus.CANCELLED;
                } else {
                    if (!isSelected) continue;
                    statusToSet = MealRegStatus.CANCELLED;
                }

                final LocalDate checkDate = date;
                MealRegistration existing = existingRegistrations.stream()
                        .filter(r -> r.getDate().isEqual(checkDate) && r.getMealType() == mealType)
                        .findFirst()
                        .orElse(null);

                if (existing != null) {
                    if (existing.getStatus() != statusToSet) {
                        existing.setStatus(statusToSet);
                        recordsToSave.add(existing);
                    }
                } else {
                    MealRegistration newReg = MealRegistration.builder()
                            .child(child)
                            .date(date)
                            .mealType(mealType)
                            .status(statusToSet)
                            .build();
                    recordsToSave.add(newReg);
                }
            }
        }

        if (!recordsToSave.isEmpty()) {
            mealRegistrationRepository.saveAll(recordsToSave);
        }
    }

    @Override
    @Transactional
    public void processDailyRegistration(DailyMealRegistrationRequest request) {
        securityService.verifyParentOwnsChild(request.getChildId());
        
        Child child = childRepository.findById(request.getChildId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học sinh với ID: " + request.getChildId()));

        LocalDate applyDate = request.getDate();

        validateTimeRule(applyDate);

        if (applyDate.getDayOfWeek() == DayOfWeek.SATURDAY || applyDate.getDayOfWeek() == DayOfWeek.SUNDAY) {
            throw new RuntimeException("Không thể đăng ký suất ăn cho ngày nghỉ cuối tuần.");
        }

        List<MealType> requestMealTypes = request.getMealTypes();
        if (requestMealTypes == null) {
            requestMealTypes = new ArrayList<>();
        }
        if (requestMealTypes.isEmpty() && request.getIsRegistered()) {
            throw new RuntimeException("Danh sách bữa ăn không được để trống khi đăng ký.");
        }

        List<MealRegistration> existingRegistrations = mealRegistrationRepository
                .findByChildIdAndDateBetweenOrderByDateAsc(request.getChildId(), applyDate, applyDate);

        MealRegStatus newStatus = request.getIsRegistered() ? MealRegStatus.REGISTERED : MealRegStatus.CANCELLED;
        List<MealRegistration> recordsToSave = new ArrayList<>();

        for (MealType mealType : MealType.values()) {
            boolean isSelected = requestMealTypes.contains(mealType);
            MealRegStatus statusToSet;
            
            if (request.getIsRegistered()) {
                statusToSet = isSelected ? MealRegStatus.REGISTERED : MealRegStatus.CANCELLED;
            } else {
                if (!isSelected) continue;
                statusToSet = MealRegStatus.CANCELLED;
            }

            MealRegistration existing = existingRegistrations.stream()
                    .filter(r -> r.getMealType() == mealType)
                    .findFirst()
                    .orElse(null);

            if (existing != null) {
                if (existing.getStatus() != statusToSet) {
                    existing.setStatus(statusToSet);
                    recordsToSave.add(existing);
                }
            } else {
                MealRegistration newReg = MealRegistration.builder()
                        .child(child)
                        .date(applyDate)
                        .mealType(mealType)
                        .status(statusToSet)
                        .build();
                recordsToSave.add(newReg);
            }
        }

        if (!recordsToSave.isEmpty()) {
            mealRegistrationRepository.saveAll(recordsToSave);
        }
    }

    @Override
    @Transactional
    public void overrideDailyRegistration(DailyMealRegistrationRequest request) {
        // Giáo viên hoặc Admin được phép thực hiện
        securityService.verifyTeacherTeachesChild(request.getChildId());
        
        Child child = childRepository.findById(request.getChildId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học sinh với ID: " + request.getChildId()));

        LocalDate applyDate = request.getDate();

        // CỐ TÌNH BỎ QUA validateTimeRule(applyDate) để giáo viên có thể ghi đè cho ngày hôm nay
        // Nhưng vẫn chặn đăng ký suất ăn cho cuối tuần
        if (applyDate.getDayOfWeek() == DayOfWeek.SATURDAY || applyDate.getDayOfWeek() == DayOfWeek.SUNDAY) {
            throw new RuntimeException("Không thể đăng ký suất ăn cho ngày nghỉ cuối tuần.");
        }

        if (request.getIsRegistered()) {
            boolean isLeave = leaveRequestRepository.existsApprovedRequest(request.getChildId(), applyDate, applyDate);
            Optional<DailyLog> dailyLog = dailyLogRepository.findByChildIdAndDate(request.getChildId(), applyDate);
            boolean isMarkedAbsent = dailyLog.isPresent() && 
                (dailyLog.get().getAttendanceStatus() == AttendanceStatus.ABSENT_EXCUSED || 
                 dailyLog.get().getAttendanceStatus() == AttendanceStatus.ABSENT_UNEXCUSED);
            boolean isMarkedPresent = dailyLog.isPresent() && dailyLog.get().getAttendanceStatus() == AttendanceStatus.PRESENT;

            if ((isLeave || isMarkedAbsent) && !isMarkedPresent) {
                throw new RuntimeException("Bé đang được ghi nhận là nghỉ học. Vui lòng điểm danh 'Có mặt' trước khi bổ sung suất ăn.");
            }
        }

        List<MealType> requestMealTypes = request.getMealTypes();
        if (requestMealTypes == null) {
            requestMealTypes = new ArrayList<>();
        }
        if (requestMealTypes.isEmpty() && request.getIsRegistered()) {
            throw new RuntimeException("Danh sách bữa ăn không được để trống khi đăng ký.");
        }

        List<MealRegistration> existingRegistrations = mealRegistrationRepository
                .findByChildIdAndDateBetweenOrderByDateAsc(request.getChildId(), applyDate, applyDate);

        MealRegStatus newStatus = request.getIsRegistered() ? MealRegStatus.REGISTERED : MealRegStatus.CANCELLED;
        List<MealRegistration> recordsToSave = new ArrayList<>();

        for (MealType mealType : MealType.values()) {
            boolean isSelected = requestMealTypes.contains(mealType);
            MealRegStatus statusToSet;
            
            if (request.getIsRegistered()) {
                statusToSet = isSelected ? MealRegStatus.REGISTERED : MealRegStatus.CANCELLED;
            } else {
                if (!isSelected) continue;
                statusToSet = MealRegStatus.CANCELLED;
            }

            MealRegistration existing = existingRegistrations.stream()
                    .filter(r -> r.getMealType() == mealType)
                    .findFirst()
                    .orElse(null);

            if (existing != null) {
                if (existing.getStatus() != statusToSet) {
                    if (!Boolean.TRUE.equals(existing.getIsTeacherOverride())) {
                        existing.setOriginalStatus(existing.getStatus());
                    }
                    existing.setIsTeacherOverride(true);
                    existing.setStatus(statusToSet);
                    recordsToSave.add(existing);
                }
            } else {
                MealRegistration newReg = MealRegistration.builder()
                        .child(child)
                        .date(applyDate)
                        .mealType(mealType)
                        .status(statusToSet)
                        .isTeacherOverride(true)
                        .originalStatus(null)
                        .build();
                recordsToSave.add(newReg);
            }
        }

        if (!recordsToSave.isEmpty()) {
            mealRegistrationRepository.saveAll(recordsToSave);
            
            // Gửi thông báo cho phụ huynh
            if (child.getParent() != null && child.getParent().getUser() != null) {
                Long parentUserId = child.getParent().getUser().getId();
                Long teacherId = securityService.getCurrentUser().getId();
                
                java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy");
                String dateStr = applyDate.format(formatter);
                
                String statusStr = request.getIsRegistered() ? "bổ sung" : "hủy";
                String mealsStr = requestMealTypes.stream()
                        .map(m -> m == MealType.BREAKFAST ? "sáng" : (m == MealType.LUNCH ? "trưa" : "xế"))
                        .collect(Collectors.joining(", "));
                
                String title = "\uD83C\uDF7D\uFE0F " + (request.getIsRegistered() ? "Bổ sung suất ăn ngày " : "Hủy suất ăn ngày ") + dateStr;
                String content = "Giáo viên đã " + statusStr + " suất ăn (" + mealsStr + ") cho bé " + child.getFullName() + " trong hôm nay. Chúc bé 1 ngày vui vẻ";
                
                try {
                    // Tránh lỗi transaction bị đánh dấu rollback-only nếu notification bị lỗi
                    notificationService.sendNotificationToUserWithRef(
                            title, content, NotificationType.INTERACTION, teacherId, parentUserId, "MEAL_REGISTRATION", null);
                } catch (Exception e) {
                    log.error("Lỗi khi gửi thông báo suất ăn ngoại lệ cho phụ huynh ID: {}", parentUserId, e);
                }
            }
        }
    }

    @Override
    @Transactional
    public void restoreDailyRegistration(DailyMealRegistrationRequest request) {
        securityService.verifyTeacherTeachesChild(request.getChildId());
        
        Child child = childRepository.findById(request.getChildId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học sinh với ID: " + request.getChildId()));

        LocalDate applyDate = request.getDate();
        
        List<MealType> requestMealTypes = request.getMealTypes();
        if (requestMealTypes == null || requestMealTypes.isEmpty()) {
            throw new RuntimeException("Suất ăn bạn muốn khôi phục thuộc 1 học sinh đang nghỉ học, không thể sử dụng tính năng này");
        }

        List<MealRegistration> existingRegistrations = mealRegistrationRepository
                .findByChildIdAndDateBetweenOrderByDateAsc(request.getChildId(), applyDate, applyDate);

        List<MealRegistration> recordsToSave = new ArrayList<>();
        List<MealRegistration> recordsToDelete = new ArrayList<>();

        for (MealType mealType : requestMealTypes) {
            MealRegistration existing = existingRegistrations.stream()
                    .filter(r -> r.getMealType() == mealType && Boolean.TRUE.equals(r.getIsTeacherOverride()))
                    .findFirst()
                    .orElse(null);

            if (existing != null) {
                if (existing.getOriginalStatus() != null) {
                    if (existing.getOriginalStatus() == MealRegStatus.REGISTERED) {
                        boolean isLeave = leaveRequestRepository.existsApprovedRequest(request.getChildId(), applyDate, applyDate);
                        if (isLeave) {
                            throw new RuntimeException("Suất ăn bạn muốn khôi phục thuộc 1 học sinh đang nghỉ học, không thể sử dụng tính năng này.");
                        }
                    }

                    existing.setStatus(existing.getOriginalStatus());
                    existing.setIsTeacherOverride(false);
                    existing.setOriginalStatus(null);
                    recordsToSave.add(existing);
                } else {
                    recordsToDelete.add(existing);
                }
            }
        }

        if (!recordsToSave.isEmpty()) {
            mealRegistrationRepository.saveAll(recordsToSave);
        }
        if (!recordsToDelete.isEmpty()) {
            mealRegistrationRepository.deleteAll(recordsToDelete);
        }
    }

    
    private void validateTimeRule(LocalDate applyDate) {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        
        if (!applyDate.isAfter(today)) {
            throw new RuntimeException("Đã hết hạn đăng ký suất ăn. Chỉ có thể đăng ký hoặc báo cắt cơm cho ngày mai trở đi.");
        }
    }

    private MealRegistrationResponse mapToResponse(MealRegistration entity, String currentClassName) {
        return MealRegistrationResponse.builder()
                .id(entity.getId())
                .childId(entity.getChild().getId())
                .childFullName(entity.getChild().getFullName())
                .className(currentClassName)
                .date(entity.getDate())
                .mealType(entity.getMealType())
                .status(entity.getStatus())
                .isTeacherOverride(entity.getIsTeacherOverride())
                .originalStatus(entity.getOriginalStatus())
                .build();
    }

    @Override
    public MealStatisticsResponse getMealStatistics(LocalDate startDate, LocalDate endDate) {
        log.info("[MealStats] Querying statistics from {} to {} with status={}", startDate, endDate, MealRegStatus.REGISTERED.name());
        
        List<Object[]> results = mealRegistrationRepository.countRegisteredMealsByDateRangeGroupByType(startDate, endDate, MealRegStatus.REGISTERED.name());
        
        log.info("[MealStats] Query returned {} rows", results.size());
        
        long breakfastCount = 0;
        long lunchCount = 0;
        long snackCount = 0;

        for (Object[] row : results) {
            if (row[0] == null || row[1] == null) {
                log.warn("[MealStats] Skipping row with null value: row[0]={}, row[1]={}", row[0], row[1]);
                continue;
            }
            
            log.info("[MealStats] Row data: row[0] type={}, value='{}', row[1] type={}, value='{}'",
                row[0].getClass().getName(), row[0], row[1].getClass().getName(), row[1]);
            
            String mealType = "";
            if (row[0] instanceof MealType) {
                mealType = ((MealType) row[0]).name();
            } else if (row[0] instanceof Number) {
                int ordinal = ((Number) row[0]).intValue();
                if (ordinal >= 0 && ordinal < MealType.values().length) {
                    mealType = MealType.values()[ordinal].name();
                }
            } else if (row[0] instanceof byte[]) {
                mealType = new String((byte[]) row[0]).trim().toUpperCase();
            } else {
                mealType = row[0].toString().trim().toUpperCase();
            }
            
            long count = ((Number) row[1]).longValue();

            switch (mealType) {
                case "BREAKFAST":
                    breakfastCount += count;
                    break;
                case "LUNCH":
                    lunchCount += count;
                    break;
                case "SNACK":
                    snackCount += count;
                    break;
            }
        }

        return MealStatisticsResponse.builder()
                .totalBreakfast(breakfastCount)
                .totalLunch(lunchCount)
                .totalSnack(snackCount)
                .totalMeals(breakfastCount + lunchCount + snackCount)
                .build();
    }

    @Override
    public List<ChildMonthlyMealStatsResponse> getMonthlyMealStatsByClass(Long classId, int month, int year) {
         if (!schoolClassRepository.existsById(classId)) {
             throw new RuntimeException("Không tìm thấy lớp học với ID: " + classId);
         }

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        List<Object[]> rawStats = mealRegistrationRepository.countMonthlyMealStatsForClass(classId, startDate, endDate);

        Map<Long, ChildMonthlyMealStatsResponse> statsMap = new LinkedHashMap<>();

        for (Object[] row : rawStats) {
            Long childId = ((Number) row[0]).longValue();
            String childFullName = (String) row[1];
            
            MealRegStatus status = null;
            if (row[2] instanceof MealRegStatus) {
                status = (MealRegStatus) row[2];
            } else if (row[2] instanceof Number) {
                int ordinal = ((Number) row[2]).intValue();
                if (ordinal >= 0 && ordinal < MealRegStatus.values().length) {
                    status = MealRegStatus.values()[ordinal];
                }
            } else if (row[2] instanceof byte[]) {
                try {
                    status = MealRegStatus.valueOf(new String((byte[]) row[2]).trim().toUpperCase());
                } catch (IllegalArgumentException e) {
                }
            } else if (row[2] != null) {
                try {
                    status = MealRegStatus.valueOf(row[2].toString().trim().toUpperCase());
                } catch (IllegalArgumentException e) {                  
                }
            }
            
            long count = ((Number) row[4]).longValue();

            ChildMonthlyMealStatsResponse studentStats = statsMap.computeIfAbsent(childId, id -> 
                ChildMonthlyMealStatsResponse.builder()
                    .childId(id)
                    .childFullName(childFullName)
                    .totalRegistered(0L)
                    .totalCancelled(0L)
                    .build()
            );

            if (status == MealRegStatus.REGISTERED) {
                studentStats.setTotalRegistered(studentStats.getTotalRegistered() + count);
            } else if (status == MealRegStatus.CANCELLED || status == MealRegStatus.CANCELLED_BY_LEAVE) {
                studentStats.setTotalCancelled(studentStats.getTotalCancelled() + count);
            }
        }

        return new ArrayList<>(statsMap.values());
    }

    @Override
    @Transactional
    public void cancelMealsForLeave(Long childId, LocalDate startDate, LocalDate endDate) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học sinh với ID: " + childId));

        List<MealRegistration> existingRegistrations = mealRegistrationRepository
                .findByChildIdAndDateBetweenOrderByDateAsc(childId, startDate, endDate);

        List<MealRegistration> recordsToSave = new ArrayList<>();
        MealType[] allMealTypes = MealType.values(); // BREAKFAST, LUNCH, SNACK

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            // thuật toán: bỏ qua thứ 7 và chủ nhật khi cấn trừ suất ăn tự động do học sinh xin nghỉ
            if (date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY) {
                continue;
            }

            // Bỏ qua việc hủy suất ăn nếu ngày đó đã qua hoặc là ngày hôm nay (giả định bếp đã nấu xong cho hôm nay)
            LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
            if (!date.isAfter(today)) {
                continue;
            }

            for (MealType mealType : allMealTypes) {
                final LocalDate checkDate = date;
                MealRegistration existing = existingRegistrations.stream()
                        .filter(r -> r.getDate().isEqual(checkDate) && r.getMealType() == mealType)
                        .findFirst()
                        .orElse(null);

                if (existing != null) {
                    if (existing.getStatus() == MealRegStatus.REGISTERED) {
                        existing.setStatus(MealRegStatus.CANCELLED_BY_LEAVE);
                        recordsToSave.add(existing);
                    }
                } else {
                    MealRegistration newReg = MealRegistration.builder()
                            .child(child)
                            .date(date)
                            .mealType(mealType)
                            .status(MealRegStatus.CANCELLED_BY_LEAVE)
                            .build();
                    recordsToSave.add(newReg);
                }
            }
        }

        if (!recordsToSave.isEmpty()) {
            mealRegistrationRepository.saveAll(recordsToSave);
        }
    }

    @Override
    @Transactional
    public void restoreMealsForLeaveCancel(Long childId, LocalDate startDate, LocalDate endDate) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học sinh với ID: " + childId));

        List<MealRegistration> existingRegistrations = mealRegistrationRepository
                .findByChildIdAndDateBetweenOrderByDateAsc(childId, startDate, endDate);

        List<MealRegistration> recordsToSave = new ArrayList<>();
        MealType[] allMealTypes = MealType.values(); 

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            if (date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY) {
                continue;
            }

            LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
            if (!date.isAfter(today)) {
                continue; // Chỉ khôi phục cho các ngày tương lai
            }

            for (MealType mealType : allMealTypes) {
                final LocalDate checkDate = date;
                MealRegistration existing = existingRegistrations.stream()
                        .filter(r -> r.getDate().isEqual(checkDate) && r.getMealType() == mealType)
                        .findFirst()
                        .orElse(null);

                if (existing != null) {
                    if (existing.getStatus() == MealRegStatus.CANCELLED_BY_LEAVE) {
                        existing.setStatus(MealRegStatus.REGISTERED);
                        recordsToSave.add(existing);
                    }
                }
            }
        }

        if (!recordsToSave.isEmpty()) {
            mealRegistrationRepository.saveAll(recordsToSave);
        }
    }
}