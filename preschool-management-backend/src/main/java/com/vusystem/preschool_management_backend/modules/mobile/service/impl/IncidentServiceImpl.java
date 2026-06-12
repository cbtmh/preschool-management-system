package com.vusystem.preschool_management_backend.modules.mobile.service.impl;

import com.vusystem.preschool_management_backend.common.entity.academic.SchoolClass;
import com.vusystem.preschool_management_backend.common.entity.communication.IncidentInvolvedChild;
import com.vusystem.preschool_management_backend.common.entity.communication.IncidentInvolvedChildId;
import com.vusystem.preschool_management_backend.common.entity.communication.IncidentReport;
import com.vusystem.preschool_management_backend.common.entity.enums.IncidentStatus;
import com.vusystem.preschool_management_backend.common.entity.user.Child;
import com.vusystem.preschool_management_backend.common.entity.user.Teacher;
import com.vusystem.preschool_management_backend.common.entity.user.User;
import com.vusystem.preschool_management_backend.modules.core.repository.SchoolClassRepository;
import com.vusystem.preschool_management_backend.modules.core.repository.ChildRepository;
import com.vusystem.preschool_management_backend.modules.core.repository.TeacherRepository;
import com.vusystem.preschool_management_backend.modules.core.repository.ClassTeacherRepository;
import com.vusystem.preschool_management_backend.modules.core.repository.EnrollmentRepository;
import com.vusystem.preschool_management_backend.common.entity.enums.EnrollmentStatus;
import com.vusystem.preschool_management_backend.modules.mobile.dto.request.IncidentReportRequest;
import com.vusystem.preschool_management_backend.modules.mobile.dto.response.IncidentReportResponse;
import com.vusystem.preschool_management_backend.modules.mobile.repository.IncidentInvolvedChildRepository;
import com.vusystem.preschool_management_backend.modules.mobile.repository.IncidentReportRepository;
import com.vusystem.preschool_management_backend.modules.mobile.service.IncidentService;
import com.vusystem.preschool_management_backend.config.security.SecurityService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.vusystem.preschool_management_backend.modules.communication.services.NotificationService;
import com.vusystem.preschool_management_backend.modules.communication.services.TelegramNotificationService;
import com.vusystem.preschool_management_backend.modules.communication.dto.SendNotificationRequest;
import com.vusystem.preschool_management_backend.common.entity.enums.NotificationType;
import com.vusystem.preschool_management_backend.common.entity.enums.Role;
import java.util.Arrays;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncidentServiceImpl implements IncidentService {

    private final IncidentReportRepository incidentReportRepository;
    private final IncidentInvolvedChildRepository incidentInvolvedChildRepository;
    private final TeacherRepository teacherRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final ClassTeacherRepository classTeacherRepository;
    private final ChildRepository childRepository;
    private final com.vusystem.preschool_management_backend.modules.auth.repository.UserRepository userRepository;
    private final NotificationService notificationService;
    private final SecurityService securityService;
    private final EnrollmentRepository enrollmentRepository;
    private final TelegramNotificationService telegramNotificationService;

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

    private Teacher getCurrentTeacher() {
        User user = getCurrentUser();
        return teacherRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin giáo viên"));
    }

    @Override
    @Transactional
    public IncidentReportResponse createIncident(IncidentReportRequest request) {
        Teacher teacher = getCurrentTeacher();
        
        securityService.verifyTeacherTeachesClass(request.getClassId());

        SchoolClass schoolClass = schoolClassRepository.findById(request.getClassId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học"));

        IncidentReport report = IncidentReport.builder()
                .schoolClass(schoolClass)
                .reportedBy(teacher)
                .incidentTime(request.getIncidentTime())
                .severity(request.getSeverityLevel())
                .title(request.getTitle())
                .description(request.getDescription())
                .initialHandling(request.getInitialHandling())
                .imageUrls(request.getImageUrls() != null ? request.getImageUrls() : new ArrayList<>())
                .status(IncidentStatus.NEW)
                .build();
        
        IncidentReport savedReport = incidentReportRepository.save(report);

        if (request.getInvolvedChildren() != null && !request.getInvolvedChildren().isEmpty()) {
            List<Long> validChildIds = enrollmentRepository.findBySchoolClassId(request.getClassId()).stream()
                    .filter(e -> e.getStatus() == EnrollmentStatus.STUDYING)
                    .map(e -> e.getChild().getId())
                    .collect(Collectors.toList());

            for (IncidentReportRequest.InvolvedChildReq childReq : request.getInvolvedChildren()) {
                if (!validChildIds.contains(childReq.getChildId())) {
                    throw new RuntimeException("Học sinh ID: " + childReq.getChildId() + " không thuộc lớp học này.");
                }

                Child child = childRepository.findById(childReq.getChildId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy học sinh ID: " + childReq.getChildId()));
                
                IncidentInvolvedChild involvedChild = IncidentInvolvedChild.builder()
                        .id(new IncidentInvolvedChildId(savedReport.getId(), child.getId()))
                        .incidentReport(savedReport)
                        .child(child)
                        .role(childReq.getRole())
                        .build();
                
                incidentInvolvedChildRepository.save(involvedChild);
            }
        }

        SendNotificationRequest notifReq = SendNotificationRequest.builder()
                .title("Sự việc mới: " + request.getTitle())
                .content("Giáo viên " + teacher.getFullName() + " vừa báo cáo một sự việc mới tại lớp " + schoolClass.getName())
                .type(NotificationType.SYSTEM)
                .targetRoles(Arrays.asList(Role.ADMIN.name()))
                .referenceType("INCIDENT")
                .referenceId(savedReport.getId())
                .build();
        try {
            notificationService.sendNotification(notifReq, getCurrentUser().getId());
        } catch (Exception e) {
            System.err.println("Failed to send notification to admin: " + e.getMessage());
        }

        telegramNotificationService.sendIncidentAlert(
                request.getTitle(),
                request.getDescription(),
                schoolClass.getName(),
                teacher.getFullName(),
                request.getSeverityLevel() != null ? request.getSeverityLevel().name() : "MEDIUM",
                request.getImageUrls()
        );

        return mapToResponse(savedReport, null, false);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IncidentReportResponse> getTeacherIncidents() {
        Teacher teacher = getCurrentTeacher();
        
        List<Long> classIds = classTeacherRepository.findByTeacherId(teacher.getId())
                .stream()
                .map(ct -> ct.getSchoolClass().getId())
                .collect(Collectors.toList());
                
        List<IncidentReport> reports;
        if (classIds.isEmpty()) {
            reports = new ArrayList<>();
        } else {
            reports = incidentReportRepository.findBySchoolClassIdInOrderByIncidentTimeDesc(classIds);
        }
        
        List<Long> reportIds = reports.stream().map(IncidentReport::getId).collect(Collectors.toList());
        java.util.Map<Long, List<IncidentInvolvedChild>> childrenMap = reportIds.isEmpty() ? 
            java.util.Collections.emptyMap() :
            incidentInvolvedChildRepository.findByIncidentReportIdIn(reportIds).stream()
                .collect(Collectors.groupingBy(ic -> ic.getIncidentReport().getId()));
        
        return reports.stream()
                .map(r -> mapToResponse(r, null, false, childrenMap.getOrDefault(r.getId(), new ArrayList<>())))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public IncidentReportResponse getIncidentDetail(Long id) {
        Teacher teacher = getCurrentTeacher();
        IncidentReport report = incidentReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tường trình"));
        
        // đảm bảo bảo mật: giáo viên chỉ xem được sự cố do mình báo cáo hoặc sự cố của lớp mình phụ trách
        boolean isReportedByThem = report.getReportedBy().getId().equals(teacher.getId());
        boolean isTeacherInClass = classTeacherRepository.findBySchoolClassId(report.getSchoolClass().getId())
                .stream()
                .anyMatch(ct -> ct.getTeacher().getId().equals(teacher.getId()));

        if (!isReportedByThem && !isTeacherInClass) {
            throw new RuntimeException("Bạn không có quyền xem tường trình này");
        }
        
        return mapToResponse(report, null, false);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IncidentReportResponse> getParentIncidents(Long childId) {
        User user = getCurrentUser();
        securityService.verifyParentOwnsChild(childId);
        
        // chỉ hiển thị sự cố đã được admin duyệt để tránh gây hoang mang
        List<IncidentReport> reports = incidentReportRepository.findByChildIdAndStatusIn(
                childId, 
                Arrays.asList(IncidentStatus.IN_PROGRESS, IncidentStatus.RESOLVED)
        );
        
        List<Long> reportIds = reports.stream().map(IncidentReport::getId).collect(Collectors.toList());
        java.util.Map<Long, List<IncidentInvolvedChild>> childrenMap = reportIds.isEmpty() ? 
            java.util.Collections.emptyMap() :
            incidentInvolvedChildRepository.findByIncidentReportIdIn(reportIds).stream()
                .collect(Collectors.groupingBy(ic -> ic.getIncidentReport().getId()));
                
        return reports.stream()
                .map(r -> mapToResponse(r, childId, true, childrenMap.getOrDefault(r.getId(), new ArrayList<>())))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public IncidentReportResponse getParentIncidentDetail(Long id, Long childId) {
        securityService.verifyParentOwnsChild(childId);
        
        IncidentReport report = incidentReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo"));
                
        if (report.getStatus() != IncidentStatus.RESOLVED && report.getStatus() != IncidentStatus.IN_PROGRESS) {
            throw new RuntimeException("Sự việc này đang chờ nhà trường xác nhận, vui lòng thử lại sau.");
        }
        
        return mapToResponse(report, childId, true);
    }

    private IncidentReportResponse mapToResponse(IncidentReport report, Long viewerChildId, boolean maskOtherChildren) {
        return mapToResponse(report, viewerChildId, maskOtherChildren, incidentInvolvedChildRepository.findByIncidentReportId(report.getId()));
    }

    private IncidentReportResponse mapToResponse(IncidentReport report, Long viewerChildId, boolean maskOtherChildren, List<IncidentInvolvedChild> involvedChildren) {
        List<IncidentReportResponse.InvolvedChildRes> childResList = involvedChildren.stream().map(ic -> {
            String childName = ic.getChild().getFullName();
            
            // bảo mật thông tin: che tên các trẻ khác liên quan nếu người xem là phụ huynh
            if (maskOtherChildren && viewerChildId != null) {
                if (!ic.getChild().getId().equals(viewerChildId)) {
                    childName = "Một bé khác";
                }
            }
            
            return IncidentReportResponse.InvolvedChildRes.builder()
                    .childId(ic.getChild().getId())
                    .childFullName(childName)
                    .role(ic.getRole())
                    .build();
        }).collect(Collectors.toList());

        return IncidentReportResponse.builder()
                .id(report.getId())
                .title(report.getTitle())
                .incidentTime(report.getIncidentTime())
                .description(report.getDescription())
                .initialHandling(report.getInitialHandling())
                .severityLevel(report.getSeverity())
                .status(report.getStatus())
                .reportedByTeacherName(report.getReportedBy().getFullName())
                .classId(report.getSchoolClass().getId())
                .className(report.getSchoolClass().getName())
                .imageUrls(report.getImageUrls())
                .principalNotes(report.getPrincipalNotes())
                .createdAt(report.getCreatedAt())
                .involvedChildren(childResList)
                .build();
    }
}
