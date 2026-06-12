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
import com.vusystem.preschool_management_backend.config.security.SecurityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicationServiceImpl implements MedicationService {

    private final MedicationRequestRepository medicationRepository;
    private final AllergyRepository allergyRepository;
    private final ChildRepository childRepository;
    private final SecurityService securityService;

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

        MedicationRequest newRequest = MedicationRequest.builder()
                .child(child)
                .medicationName(request.getMedicationName())
                .dosage(request.getDosage())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .note(request.getNotes())
                .status(RequestStatus.PENDING)
                .build();

        return mapToResponse(medicationRepository.save(newRequest));
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
    public void markAsCompleted(Long id) {
        MedicationRequest request = medicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn thuốc với ID: " + id));

        securityService.verifyTeacherTeachesChild(request.getChild().getId());

        request.setStatus(RequestStatus.COMPLETED);
        medicationRepository.save(request);
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
                .build();
    }
}