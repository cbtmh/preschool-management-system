package com.vusystem.preschool_management_backend.modules.mobile.service.impl;

import com.vusystem.preschool_management_backend.common.entity.enums.RequestStatus;
import com.vusystem.preschool_management_backend.common.entity.health.Allergy;
import com.vusystem.preschool_management_backend.common.entity.health.MedicationRequest;
import com.vusystem.preschool_management_backend.common.entity.user.Child;
import com.vusystem.preschool_management_backend.modules.core.repository.ChildRepository;
import com.vusystem.preschool_management_backend.modules.mobile.dto.request.MedicationCreateRequest;
import com.vusystem.preschool_management_backend.modules.mobile.dto.response.MedicationResponse;
import com.vusystem.preschool_management_backend.modules.mobile.repository.AllergyRepository;
import com.vusystem.preschool_management_backend.modules.mobile.repository.MedicationRequestRepository;
import com.vusystem.preschool_management_backend.modules.mobile.service.MedicationService;
import com.vusystem.preschool_management_backend.modules.mobile.repository.DailyLogRepository;
import com.vusystem.preschool_management_backend.common.entity.operation.DailyLog;
import com.vusystem.preschool_management_backend.common.entity.enums.AttendanceStatus;
import com.vusystem.preschool_management_backend.config.security.SecurityService;
import com.vusystem.preschool_management_backend.modules.communication.services.NotificationService;
import com.vusystem.preschool_management_backend.modules.core.repository.EnrollmentRepository;
import com.vusystem.preschool_management_backend.modules.communication.dto.SendNotificationRequest;
import com.vusystem.preschool_management_backend.common.entity.enums.NotificationType;
import com.vusystem.preschool_management_backend.common.entity.academic.Enrollment;
import com.vusystem.preschool_management_backend.common.entity.enums.EnrollmentStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicationServiceImpl implements MedicationService {

    private final MedicationRequestRepository medicationRepository;
    private final AllergyRepository allergyRepository;
    private final ChildRepository childRepository;
    private final SecurityService securityService;
    private final NotificationService notificationService;
    private final EnrollmentRepository enrollmentRepository;
    private final DailyLogRepository dailyLogRepository;

    @Override
    @Transactional
    public MedicationResponse createRequest(MedicationCreateRequest request) {
        securityService.verifyParentOwnsChild(request.getChildId());

        Child child = childRepository.findById(request.getChildId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học sinh với ID: " + request.getChildId()));

        // xác minh logic ngày tháng ở tầng service để bảo vệ toàn vẹn dữ liệu
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new RuntimeException("Ngày kết thúc không được nhỏ hơn ngày bắt đầu");
        }

        // không thể dặn thuốc sau 9h  (đối với ngày hiện tại)
        if (request.getStartDate().isEqual(LocalDate.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh")))) {
            if (java.time.LocalTime.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh")).isAfter(java.time.LocalTime.of(9, 0))) {
                throw new RuntimeException("Không thể dặn thuốc cho ngày hôm nay sau 9h sáng");
            }
        }

        MedicationRequest newRequest = MedicationRequest.builder()
                .child(child)
                .medicationName(request.getMedicationName())
                .dosage(request.getDosage())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .note(request.getNotes())
                .status(RequestStatus.PENDING)
                .build();

        MedicationRequest savedEntity = medicationRepository.save(newRequest);

        try {
            Long currentUserId = securityService.getCurrentUser().getId();
            Enrollment enrollment = enrollmentRepository.findByChildIdAndStatus(child.getId(), EnrollmentStatus.STUDYING).orElse(null);
            
            if (enrollment != null && enrollment.getSchoolClass() != null) {
                SendNotificationRequest notifRequest = SendNotificationRequest.builder()
                        .title("Đơn dặn thuốc mới")
                        .content("Phụ huynh bé " + child.getFullName() + " vừa gửi đơn dặn thuốc mới (" + request.getMedicationName() + ").")
                        .type(NotificationType.CLASS)
                        .targetClassIds(List.of(enrollment.getSchoolClass().getId()))
                        .targetRoles(List.of("TEACHER"))
                        .referenceType("MEDICATION_REQUEST")
                        .referenceId(savedEntity.getId())
                        .build();
                notificationService.sendNotification(notifRequest, currentUserId);
            }
        } catch (Exception e) {
            System.err.println("Lỗi khi gửi thông báo đơn dặn thuốc: " + e.getMessage());
        }

        return mapToResponse(savedEntity);
    }

    @Override
    public List<MedicationResponse> getParentRequests(Long childId) {
        securityService.verifyParentOwnsChild(childId);
        
        return medicationRepository.findByChildIdOrderByCreatedAtDesc(childId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicationResponse> getClassRequests(Long classId, LocalDate date) {
        securityService.verifyTeacherTeachesClass(classId);

        List<MedicationRequest> requests = medicationRepository.findMedicationsForClassOnDate(classId, date);

        // map thông tin dị ứng vào response để giáo viên chú ý khi cho uống thuốc
        return requests.stream().map(req -> {
            MedicationResponse dto = mapToResponse(req);
            
            if (req.getConfirmedDates() != null && req.getConfirmedDates().contains(date)) {
                dto.setStatus(RequestStatus.COMPLETED);
            } else {
                dto.setStatus(RequestStatus.PENDING);
            }
            
            List<String> allergies = allergyRepository.findByChildId(req.getChild().getId())
                    .stream()
                    .map(Allergy::getAllergen)
                    .collect(Collectors.toList());
            dto.setAllergies(allergies);
            
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markAsCompleted(Long id, LocalDate date) {
        MedicationRequest request = medicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn thuốc với ID: " + id));

        securityService.verifyTeacherTeachesChild(request.getChild().getId());

        // Kiểm tra xem bé có đi học hôm nay không
        Optional<DailyLog> logOpt = dailyLogRepository.findByChildIdAndDate(request.getChild().getId(), date);
        if (logOpt.isEmpty() || logOpt.get().getAttendanceStatus() != AttendanceStatus.PRESENT) {
            throw new RuntimeException("Học sinh chưa điểm danh có mặt hoặc đang vắng mặt. Không thể xác nhận cho uống thuốc.");
        }

        if (request.getConfirmedDates() != null && request.getConfirmedDates().contains(date)) {
            throw new RuntimeException("Đã xác nhận uống thuốc cho ngày này rồi");
        }

        request.getConfirmedDates().add(date);
        
        long totalDays = java.time.temporal.ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        if (request.getConfirmedDates().size() >= totalDays || date.isEqual(request.getEndDate()) || date.isAfter(request.getEndDate())) {
            request.setStatus(RequestStatus.COMPLETED);
        } else {
            request.setStatus(RequestStatus.IN_PROGRESS);
        }
        
        medicationRepository.save(request);

        try {
            Long currentUserId = securityService.getCurrentUser().getId();
            
            Long recipientId = request.getChild().getParent().getUser().getId();
            
            long totalDaysCount = java.time.temporal.ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
            int confirmedCount = request.getConfirmedDates().size();
            String progressMsg = confirmedCount + "/" + totalDaysCount;

            notificationService.sendNotificationToUserWithRef(
                    "Cập nhật đơn dặn thuốc",
                    "Giáo viên đã cho bé " + request.getChild().getFullName() + " uống thuốc (" + request.getMedicationName() + "). Tiến độ: " + progressMsg + " ngày.",
                    NotificationType.INDIVIDUAL,
                    currentUserId,
                    recipientId,
                    "MEDICATION_REQUEST",
                    request.getId()
            );
        } catch (Exception e) {
            System.err.println("Lỗi khi gửi thông báo hoàn thành đơn dặn thuốc: " + e.getMessage());
        }
    }

    private MedicationResponse mapToResponse(MedicationRequest entity) {
        return MedicationResponse.builder()
                .id(entity.getId())
                .childId(entity.getChild().getId())
                .childFullName(entity.getChild().getFullName())
                .medicationName(entity.getMedicationName())
                .dosage(entity.getDosage())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .notes(entity.getNote())
                .status(entity.getStatus())
                .confirmedDates(entity.getConfirmedDates())
                .build();
    }
}