package com.vusystem.preschool_management_backend.modules.mobile.service.impl;

import com.vusystem.preschool_management_backend.common.entity.enums.RequestStatus;
import com.vusystem.preschool_management_backend.common.entity.operation.LeaveRequest;
import com.vusystem.preschool_management_backend.common.entity.user.Child;
import com.vusystem.preschool_management_backend.modules.core.repository.ChildRepository;
import com.vusystem.preschool_management_backend.modules.mobile.dto.request.LeaveRequestCreateRequest;
import com.vusystem.preschool_management_backend.modules.mobile.dto.response.LeaveRequestResponse;
import com.vusystem.preschool_management_backend.modules.mobile.repository.LeaveRequestRepository;
import com.vusystem.preschool_management_backend.modules.mobile.service.LeaveRequestService;
import com.vusystem.preschool_management_backend.config.security.SecurityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveRequestServiceImpl implements LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final ChildRepository childRepository;
    private final SecurityService securityService;

    @Override
    @Transactional
    public LeaveRequestResponse createRequest(LeaveRequestCreateRequest request) {
        securityService.verifyParentOwnsChild(request.getChildId());
        
        Child child = childRepository.findById(request.getChildId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học sinh với ID: " + request.getChildId()));

        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        LocalTime now = LocalTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));

        // Validate ngày bắt đầu
        if (request.getStartDate().isBefore(today)) {
            throw new RuntimeException("Không thể tạo đơn xin nghỉ cho ngày trong quá khứ.");
        }

        // Validate cutoff time nếu xin nghỉ ngày hôm nay
        if (request.getStartDate().isEqual(today)) {
            if (now.isAfter(LocalTime.of(9, 0))) {
                throw new RuntimeException("Đã quá 9:00 sáng, bạn không thể xin nghỉ cho ngày hôm nay nữa.");
            }
        }

        // Validate ngày kết thúc
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new RuntimeException("Ngày kết thúc không được nhỏ hơn ngày bắt đầu.");
        }

        LeaveRequest entity = LeaveRequest.builder()
                .child(child)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .reason(request.getReason())
                .status(RequestStatus.PENDING)
                .build();

        return mapToResponse(leaveRequestRepository.save(entity));
    }

    @Override
    public List<LeaveRequestResponse> getParentRequests(Long childId) {
        securityService.verifyParentOwnsChild(childId);
        
        return leaveRequestRepository.findByChildIdOrderByCreatedAtDesc(childId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void updateStatus(Long id, String status) {
        LeaveRequest request = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn xin nghỉ với ID: " + id));
        
        securityService.verifyTeacherTeachesChild(request.getChild().getId());
        
        request.setStatus(RequestStatus.valueOf(status));
        leaveRequestRepository.save(request);
    }

    private LeaveRequestResponse mapToResponse(LeaveRequest entity) {
        return LeaveRequestResponse.builder()
                .id(entity.getId())
                .childId(entity.getChild().getId())
                .childFullName(entity.getChild().getFullName())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .reason(entity.getReason())
                .status(entity.getStatus())
                .build();
    }
}
