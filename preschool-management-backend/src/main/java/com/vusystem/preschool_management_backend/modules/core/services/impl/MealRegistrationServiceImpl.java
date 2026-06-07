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
    
    // Inject thêm EnrollmentRepository để lấy tên Lớp học hiện tại cho Response DTO
    private final EnrollmentRepository enrollmentRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SecurityService securityService;

    private static final LocalTime CUTOFF_TIME = LocalTime.of(8, 0); // Khóa lúc 8h00 sáng


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
        
        // Validate ngày tháng hợp lệ
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

        // Get all existing registrations for the month to avoid creating duplicates
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
            // Only process weekdays (Monday to Friday)
            if (date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY) {
                continue;
            }
            
            // Skip past days or today if after cutoff time
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

        // Validate Business Rules: Past date and Cutoff Time
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

    // --- Private Helper Methods ---

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
                .childFullName(entity.getChild().getFullName()) // Lấy từ Entity Child
                .className(currentClassName) // Lấy từ parameter (tránh N+1)
                .date(entity.getDate())
                .mealType(entity.getMealType())
                .status(entity.getStatus())
                .build();
    }

    @Override
    public MealStatisticsResponse getMealStatistics(LocalDate startDate, LocalDate endDate) {
        // Gọi hàm repository mà em đã viết sẵn
        List<Object[]> results = mealRegistrationRepository.countRegisteredMealsByDateRangeGroupByType(startDate, endDate);
        
        long breakfastCount = 0;
        long lunchCount = 0;
        long snackCount = 0;

        // Map dữ liệu từ DB (Object[]) sang DTO
        for (Object[] row : results) {
            // Kiểm tra an toàn tránh null
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
        // 1. Nghiệp vụ kiểm tra tính toàn vẹn: Check lớp học có tồn tại không theo đúng pattern hệ thống
         if (!schoolClassRepository.existsById(classId)) {
             throw new RuntimeException("Không tìm thấy lớp học với ID: " + classId);
         }

        // 2. Tự động tính toán ngày đầu tháng và ngày cuối tháng để truyền vào câu query linh hoạt
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        // 3. Gọi hàm Repo lấy mớ Object[] thô từ SQL Group By lên
        List<Object[]> rawStats = mealRegistrationRepository.countMonthlyMealStatsForClass(classId, startDate, endDate);

        // 4. Khởi tạo LinkedHashMap để giữ đúng thứ tự sắp xếp và gom dòng của học sinh
        Map<Long, ChildMonthlyMealStatsResponse> statsMap = new LinkedHashMap<>();

        for (Object[] row : rawStats) {
            Long childId = (Long) row[0];
            String childFullName = (String) row[1];
            MealRegStatus status = (MealRegStatus) row[2]; // Ép kiểu về đúng Enum MealRegStatus của dự án
            long count = (Long) row[3];

            // Nếu học sinh này chưa có trong Map thì tạo mới khung DTO ban đầu
            ChildMonthlyMealStatsResponse studentStats = statsMap.computeIfAbsent(childId, id -> 
                ChildMonthlyMealStatsResponse.builder()
                    .childId(id)
                    .childFullName(childFullName)
                    .totalRegistered(0L)
                    .totalCancelled(0L)
                    .build()
            );

            // Bóc tách đếm số record cộng dồn vào DTO đại diện của học sinh đó
            if (status == MealRegStatus.REGISTERED) {
                studentStats.setTotalRegistered(count);
            } else if (status == MealRegStatus.CANCELLED) {
                studentStats.setTotalCancelled(count);
            }
        }

        // 5. Trả về danh sách DTO đã được gom nhóm sạch đẹp cho từng cá nhân bé
        return new ArrayList<>(statsMap.values());
    }
}