package com.vusystem.preschool_management_backend.modules.core.service.impl;

import com.vusystem.preschool_management_backend.common.entity.communication.IncidentInvolvedChild;
import com.vusystem.preschool_management_backend.common.entity.communication.IncidentReport;
import com.vusystem.preschool_management_backend.modules.core.dto.request.AdminIncidentUpdateRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.response.AdminIncidentResponse;
import com.vusystem.preschool_management_backend.modules.core.service.AdminIncidentService;
import com.vusystem.preschool_management_backend.modules.mobile.repository.IncidentInvolvedChildRepository;
import com.vusystem.preschool_management_backend.modules.mobile.repository.IncidentReportRepository;
import com.vusystem.preschool_management_backend.modules.communication.services.NotificationService;
import com.vusystem.preschool_management_backend.modules.auth.repository.UserRepository;
import com.vusystem.preschool_management_backend.common.entity.enums.IncidentStatus;
import com.vusystem.preschool_management_backend.common.entity.enums.NotificationType;
import com.vusystem.preschool_management_backend.common.entity.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminIncidentServiceImpl implements AdminIncidentService {

    private final IncidentReportRepository incidentReportRepository;
    private final IncidentInvolvedChildRepository incidentInvolvedChildRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

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
    public List<AdminIncidentResponse> getAllIncidents() {
        return incidentReportRepository.findAllByOrderByIncidentTimeDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AdminIncidentResponse getIncidentById(Long id) {
        IncidentReport report = incidentReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tường trình với ID: " + id));
        return mapToResponse(report);
    }

    @Override
    @Transactional
    public AdminIncidentResponse updateIncident(Long id, AdminIncidentUpdateRequest request) {
        IncidentReport report = incidentReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tường trình với ID: " + id));
        
        IncidentStatus oldStatus = report.getStatus();
        
        if (request.getStatus() != null) {
            report.setStatus(request.getStatus());
        }
        if (request.getPrincipalNotes() != null) {
            report.setPrincipalNotes(request.getPrincipalNotes());
        }
        
        IncidentReport savedReport = incidentReportRepository.save(report);

        // gửi thông báo cho phụ huynh khi trạng thái sự cố được cập nhật
        if (request.getStatus() != null && request.getStatus() != oldStatus &&
            (request.getStatus() == IncidentStatus.IN_PROGRESS || request.getStatus() == IncidentStatus.RESOLVED)) {
            
            String notifTitle = request.getStatus() == IncidentStatus.IN_PROGRESS 
                ? "Nhà trường đang xử lý sự việc: " + savedReport.getTitle()
                : "Cập nhật sự việc: " + savedReport.getTitle();
            String notifContent = "Thông tin xử lý mới nhất từ nhà trường. Vui lòng xem chi tiết trên ứng dụng.";
            
            try {
                User adminUser = getCurrentUser();
                List<IncidentInvolvedChild> involvedChildren = incidentInvolvedChildRepository.findByIncidentReportId(savedReport.getId());
                for (IncidentInvolvedChild child : involvedChildren) {
                    if (child.getChild().getParent() != null && child.getChild().getParent().getUser() != null) {
                        Long parentUserId = child.getChild().getParent().getUser().getId();
                        notificationService.sendNotificationToUserWithRef(
                            notifTitle, notifContent, NotificationType.INTERACTION, 
                            adminUser.getId(), parentUserId, 
                            "INCIDENT", savedReport.getId()
                        );
                    }
                }
            } catch (Exception e) {
                System.err.println("Failed to send notification to parents: " + e.getMessage());
            }
        }

        return mapToResponse(savedReport);
    }

    private AdminIncidentResponse mapToResponse(IncidentReport report) {
        List<IncidentInvolvedChild> involvedChildren = incidentInvolvedChildRepository.findByIncidentReportId(report.getId());
        
        List<AdminIncidentResponse.InvolvedChildRes> childResList = involvedChildren.stream().map(ic -> 
            AdminIncidentResponse.InvolvedChildRes.builder()
                .childId(ic.getChild().getId())
                .childFullName(ic.getChild().getFullName())
                .role(ic.getRole())
                .build()
        ).collect(Collectors.toList());

        return AdminIncidentResponse.builder()
                .id(report.getId())
                .title(report.getTitle())
                .incidentTime(report.getIncidentTime())
                .description(report.getDescription())
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
