package com.vusystem.preschool_management_backend.modules.core.services.impl;

import com.vusystem.preschool_management_backend.common.entity.academic.Enrollment;
import com.vusystem.preschool_management_backend.common.entity.enums.EnrollmentStatus;
import com.vusystem.preschool_management_backend.common.entity.enums.MealRegStatus;
import com.vusystem.preschool_management_backend.common.entity.enums.MealType;
import com.vusystem.preschool_management_backend.common.entity.operation.MealRegistration;
import com.vusystem.preschool_management_backend.common.entity.user.Child;

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
import com.vusystem.preschool_management_backend.config.security.SecurityService;
import lombok.RequiredArgsConstructor;
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

@Service
@RequiredArgsConstructor
public class MealRegistrationServiceImpl implements MealRegistrationService {

    private final MealRegistrationRepository mealRegistrationRepository;
    private final ChildRepository childRepository;
    
    private final EnrollmentRepository enrollmentRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SecurityService securityService;

    private static final LocalTime CUTOFF_TIME = LocalTime.of(8, 0); // cấu hình thời gian khóa hệ thống đăng ký suất ăn để nhà bếp chốt số lượng thực phẩm (08:00 sáng)


    @Override
    public List<MealRegistrationResponse> getRegistrationsByClassAndDate(Long classId, LocalDate date) {
        securityService.verifyTeacherTeachesClass(classId);
        
        String className = schoolClassRepository.findById(classId)
                .map(c -> c.getName())
                .orElse("Chưa xếp lớp");

        return mealRegistrationRepository.findMealRegistrationsByClassAndDate(classId, date).stream()
                .map(entity -> mapToResponse(entity, className))
                .collect(Collectors.toList());
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
        if (requestMealTypes == null || requestMealTypes.isEmpty()) {
            throw new RuntimeException("Danh sách bữa ăn không được để trống.");
        }

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            // logic nghiệp vụ: chỉ xử lý đăng ký suất ăn cho các ngày trong tuần (thứ 2 đến thứ 6)
            if (date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY) {
                continue;
            }
            
            if (date.isBefore(today) || (date.isEqual(today) && LocalTime.now(ZoneId.of("Asia/Ho_Chi_Minh")).isAfter(CUTOFF_TIME))) {
                continue; 
            }

            for (MealType mealType : requestMealTypes) {
                final LocalDate checkDate = date;
                MealRegistration existing = existingRegistrations.stream()
                        .filter(r -> r.getDate().isEqual(checkDate) && r.getMealType() == mealType)
                        .findFirst()
                        .orElse(null);

                if (existing != null) {
                    if (existing.getStatus() != newStatus) {
                        existing.setStatus(newStatus);
                        recordsToSave.add(existing);
                    }
                } else {
                    MealRegistration newReg = MealRegistration.builder()
                            .child(child)
                            .date(date)
                            .mealType(mealType)
                            .status(newStatus)
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
        if (requestMealTypes == null || requestMealTypes.isEmpty()) {
            throw new RuntimeException("Danh sách bữa ăn không được để trống.");
        }

        List<MealRegistration> existingRegistrations = mealRegistrationRepository
                .findByChildIdAndDateBetweenOrderByDateAsc(request.getChildId(), applyDate, applyDate);

        MealRegStatus newStatus = request.getIsRegistered() ? MealRegStatus.REGISTERED : MealRegStatus.CANCELLED;
        List<MealRegistration> recordsToSave = new ArrayList<>();

        for (MealType mealType : requestMealTypes) {
            MealRegistration existing = existingRegistrations.stream()
                    .filter(r -> r.getMealType() == mealType)
                    .findFirst()
                    .orElse(null);

            if (existing != null) {
                if (existing.getStatus() != newStatus) {
                    existing.setStatus(newStatus);
                    recordsToSave.add(existing);
                }
            } else {
                MealRegistration newReg = MealRegistration.builder()
                        .child(child)
                        .date(applyDate)
                        .mealType(mealType)
                        .status(newStatus)
                        .build();
                recordsToSave.add(newReg);
            }
        }

        if (!recordsToSave.isEmpty()) {
            mealRegistrationRepository.saveAll(recordsToSave);
        }
    }

    
    private void validateTimeRule(LocalDate applyDate) {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        
        if (applyDate.isBefore(today)) {
            throw new RuntimeException("Không thể đăng ký hoặc báo cắt cơm cho ngày trong quá khứ.");
        }

        if (applyDate.isEqual(today)) {
            if (LocalTime.now(ZoneId.of("Asia/Ho_Chi_Minh")).isAfter(CUTOFF_TIME)) {
                throw new RuntimeException("Đã quá 8h00 sáng, không thể thay đổi thông tin suất ăn của ngày hôm nay.");
            }
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
                .build();
    }

    @Override
    public MealStatisticsResponse getMealStatistics(LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = mealRegistrationRepository.countRegisteredMealsByDateRangeGroupByType(startDate, endDate);
        
        long breakfastCount = 0;
        long lunchCount = 0;
        long snackCount = 0;

        for (Object[] row : results) {
            if (row[0] == null || row[1] == null) continue;
            
            String mealType = row[0].toString();
            long count = ((Number) row[1]).longValue();

            switch (mealType) {
                case "BREAKFAST":
                    breakfastCount = count;
                    break;
                case "LUNCH":
                    lunchCount = count;
                    break;
                case "SNACK":
                    snackCount = count;
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
            Long childId = (Long) row[0];
            String childFullName = (String) row[1];
            MealRegStatus status = (MealRegStatus) row[2]; // Ép kiểu về đúng Enum MealRegStatus của dự án
            long count = (Long) row[3];

            ChildMonthlyMealStatsResponse studentStats = statsMap.computeIfAbsent(childId, id -> 
                ChildMonthlyMealStatsResponse.builder()
                    .childId(id)
                    .childFullName(childFullName)
                    .totalRegistered(0L)
                    .totalCancelled(0L)
                    .build()
            );

            if (status == MealRegStatus.REGISTERED) {
                studentStats.setTotalRegistered(count);
            } else if (status == MealRegStatus.CANCELLED) {
                studentStats.setTotalCancelled(count);
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

            for (MealType mealType : allMealTypes) {
                final LocalDate checkDate = date;
                MealRegistration existing = existingRegistrations.stream()
                        .filter(r -> r.getDate().isEqual(checkDate) && r.getMealType() == mealType)
                        .findFirst()
                        .orElse(null);

                if (existing != null) {
                    if (existing.getStatus() != MealRegStatus.CANCELLED) {
                        existing.setStatus(MealRegStatus.CANCELLED);
                        recordsToSave.add(existing);
                    }
                } else {
                    MealRegistration newReg = MealRegistration.builder()
                            .child(child)
                            .date(date)
                            .mealType(mealType)
                            .status(MealRegStatus.CANCELLED)
                            .build();
                    recordsToSave.add(newReg);
                }
            }
        }

        if (!recordsToSave.isEmpty()) {
            mealRegistrationRepository.saveAll(recordsToSave);
        }
    }
}