package com.vusystem.preschool_management_backend.modules.mobile.service.impl;

import com.vusystem.preschool_management_backend.common.entity.academic.Enrollment;
import com.vusystem.preschool_management_backend.common.entity.enums.EnrollmentStatus;
import com.vusystem.preschool_management_backend.common.entity.health.HealthRecord;
import com.vusystem.preschool_management_backend.common.entity.user.Child;
import com.vusystem.preschool_management_backend.modules.mobile.dto.health.ChildHealthSummaryDto;
import com.vusystem.preschool_management_backend.modules.mobile.dto.health.HealthRecordCreateRequest;
import com.vusystem.preschool_management_backend.modules.mobile.dto.health.HealthRecordDto;
import com.vusystem.preschool_management_backend.modules.mobile.repository.HealthRecordRepository;
import com.vusystem.preschool_management_backend.modules.mobile.service.HealthRecordService;
import com.vusystem.preschool_management_backend.modules.core.dto.response.AllergyResponse;
import com.vusystem.preschool_management_backend.modules.core.repository.ChildRepository;
import com.vusystem.preschool_management_backend.modules.core.repository.EnrollmentRepository;
import com.vusystem.preschool_management_backend.config.security.SecurityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;
import com.vusystem.preschool_management_backend.modules.core.services.ChildService;
import com.vusystem.preschool_management_backend.modules.communication.services.NotificationService;
import com.vusystem.preschool_management_backend.modules.communication.dto.SendNotificationRequest;
import com.vusystem.preschool_management_backend.common.entity.enums.NotificationType;
import org.springframework.security.core.context.SecurityContextHolder;
import com.vusystem.preschool_management_backend.common.entity.user.User;
import com.vusystem.preschool_management_backend.modules.auth.repository.UserRepository;
import com.vusystem.preschool_management_backend.common.entity.user.Parent;

@Service
@RequiredArgsConstructor
public class HealthRecordServiceImpl implements HealthRecordService {

    private final HealthRecordRepository healthRecordRepository;
    private final ChildRepository childRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ChildService childService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final SecurityService securityService;

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            username = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<HealthRecordDto> getHealthRecordsByChildId(Long childId) {
        securityService.verifyAccessToChild(childId);
        
        List<HealthRecord> records = healthRecordRepository.findByChildIdOrderByCheckupDateDesc(childId);
        return records.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public HealthRecordDto createHealthRecord(HealthRecordCreateRequest request) {
        securityService.verifyTeacherTeachesChild(request.getChildId());
        
        Child child = childRepository.findById(request.getChildId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học sinh với ID: " + request.getChildId()));

        HealthRecord newRecord = HealthRecord.builder()
                .child(child)
                .checkupDate(LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")))
                .height(request.getHeight())
                .weight(request.getWeight())
                .healthStatus(request.getStatus())
                .note(request.getNote())
                .build();

        HealthRecord savedRecord = healthRecordRepository.save(newRecord);
        return mapToDto(savedRecord);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChildHealthSummaryDto> getClassHealthSummary(Long classId, Integer year, Integer month) {
        securityService.verifyTeacherTeachesClass(classId);
        
        List<Enrollment> enrollments = enrollmentRepository.findBySchoolClassId(classId).stream()
                .filter(e -> e.getStatus() == EnrollmentStatus.STUDYING)
                .collect(Collectors.toList());

        LocalDate now = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        int currentMonth = month != null ? month : now.getMonthValue();
        int currentYear = year != null ? year : now.getYear();

        // Fix N+1: Fetch all health records for the class in one query
        List<Long> childIds = enrollments.stream().map(e -> e.getChild().getId()).collect(Collectors.toList());
        
        java.util.Map<Long, List<HealthRecord>> recordsByChild = childIds.isEmpty() ? 
            java.util.Collections.emptyMap() : 
            healthRecordRepository.findByChildIdInOrderByCheckupDateDesc(childIds)
                .stream().collect(Collectors.groupingBy(r -> r.getChild().getId()));

        return enrollments.stream().map(enrollment -> {
            Child child = enrollment.getChild();
            List<HealthRecord> records = recordsByChild.getOrDefault(child.getId(), java.util.Collections.emptyList());
            
            boolean hasRecord = false;
            String status = "Chưa nhập";
            LocalDate lastRecordDate = null;

            if (!records.isEmpty()) {
                HealthRecord latest = records.get(0);
                lastRecordDate = latest.getCheckupDate();
                
                if (lastRecordDate.getMonthValue() == currentMonth && lastRecordDate.getYear() == currentYear) {
                    hasRecord = true;
                    status = "Đã nhập (T" + currentMonth + ")";
                } else {
                    status = "Chưa nhập (T" + currentMonth + ")";
                }
            }

            return ChildHealthSummaryDto.builder()
                    .id(child.getId())
                    .name(child.getFullName())
                    .status(status)
                    .hasRecord(hasRecord)
                    .lastRecord(lastRecordDate)
                    .allergyDeclared(child.getAllergyDeclared())
                    .allergies(child.getAllergies() != null ? child.getAllergies().stream().map(a -> 
                        AllergyResponse.builder()
                                .id(a.getId())
                                .allergen(a.getAllergen())
                                .severity(a.getSeverity())
                                .description(a.getDescription())
                                .build()
                    ).collect(Collectors.toList()) : java.util.Collections.emptyList())
                    .build();
        }).collect(Collectors.toList());
    }

    private HealthRecordDto mapToDto(HealthRecord record) {
        LocalDate date = record.getCheckupDate();
        String monthStr = "Tháng " + date.getMonthValue() + "/" + date.getYear();

        return HealthRecordDto.builder()
                .id(record.getId())
                .childId(record.getChild().getId())
                .month(monthStr)
                .height(record.getHeight())
                .weight(record.getWeight())
                .status(record.getHealthStatus())
                .note(record.getNote())
                .recordedDate(date)
                .build();
    }

    @Override
    @Transactional
    public com.vusystem.preschool_management_backend.modules.core.dto.response.ChildResponse updateChildAllergiesByTeacher(Long childId, List<com.vusystem.preschool_management_backend.modules.core.dto.request.AllergyRequest> request) {
        securityService.verifyTeacherTeachesChild(childId);
        
        // 1. Save allergies using ChildService
        com.vusystem.preschool_management_backend.modules.core.dto.response.ChildResponse childResponse = childService.updateChildAllergies(childId, request);

        // 2. Find parent user
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học sinh ID: " + childId));
        Parent parent = child.getParent();
        
        if (parent != null && parent.getUser() != null) {
            User sender = getCurrentUser();
            String childName = child.getFullName();
            
            notificationService.sendNotificationToUser(
                "Cập nhật thông tin dị ứng",
                "Giáo viên đã cập nhật thông tin dị ứng của bé " + childName + ". Vui lòng kiểm tra lại xem thông tin đã chính xác chưa.",
                NotificationType.SYSTEM,
                sender.getId(),
                parent.getUser().getId()
            );
        }

        return childResponse;
    }
}
