package com.vusystem.preschool_management_backend.modules.core.services.impl;

import com.vusystem.preschool_management_backend.common.entity.academic.AcademicYear;
import com.vusystem.preschool_management_backend.modules.core.dto.request.AcademicYearRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.response.AcademicYearResponse;
import com.vusystem.preschool_management_backend.modules.core.repository.AcademicYearRepository;
import com.vusystem.preschool_management_backend.modules.core.services.AcademicYearService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AcademicYearServiceImpl implements AcademicYearService {

    private final AcademicYearRepository academicYearRepository;

    @Override
    @Transactional
    public AcademicYearResponse createAcademicYear(AcademicYearRequest request) {
        validateDates(request);

        if (academicYearRepository.existsByName(request.getName())) {
            throw new RuntimeException("Tên năm học đã tồn tại trong hệ thống");
        }

        handleIsCurrentFlag(request.getIsCurrent());

        AcademicYear academicYear = AcademicYear.builder()
                .name(request.getName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .isCurrent(request.getIsCurrent())
                .build();

        AcademicYear savedYear = academicYearRepository.save(academicYear);
        return mapToResponse(savedYear);
    }

    @Override
    @Transactional
    public AcademicYearResponse updateAcademicYear(Long id, AcademicYearRequest request) {
        AcademicYear existingYear = academicYearRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy năm học với ID: " + id));

        validateDates(request);

        if (!existingYear.getName().equals(request.getName()) && academicYearRepository.existsByName(request.getName())) {
            throw new RuntimeException("Tên năm học đã tồn tại trong hệ thống");
        }

        // kiểm tra và cập nhật cờ is_current nếu có sự thay đổi để đảm bảo chỉ có 1 năm học hiện tại
        if (request.getIsCurrent() && !existingYear.isCurrent()) {
            handleIsCurrentFlag(true);
        }

        existingYear.setName(request.getName());
        existingYear.setStartDate(request.getStartDate());
        existingYear.setEndDate(request.getEndDate());
        existingYear.setCurrent(request.getIsCurrent());

        AcademicYear updatedYear = academicYearRepository.save(existingYear);
        return mapToResponse(updatedYear);
    }

    @Override
    public AcademicYearResponse getAcademicYearById(Long id) {
        AcademicYear academicYear = academicYearRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy năm học với ID: " + id));
        return mapToResponse(academicYear);
    }

    @Override
    public List<AcademicYearResponse> getAllAcademicYears() {
        return academicYearRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteAcademicYear(Long id) {
        AcademicYear academicYear = academicYearRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy năm học với ID: " + id));

        if (academicYear.isCurrent()) {
            throw new RuntimeException("Không thể xóa năm học đang được đặt làm năm học hiện tại");
        }

        academicYearRepository.delete(academicYear);
    }

    
    private void validateDates(AcademicYearRequest request) {
        if (!request.getStartDate().isBefore(request.getEndDate())) {
            throw new RuntimeException("Ngày bắt đầu năm học phải trước ngày kết thúc");
        }
    }

    private void handleIsCurrentFlag(Boolean isCurrentRequest) {
        if (isCurrentRequest != null && isCurrentRequest) {
            academicYearRepository.resetAllIsCurrentFlags();
        }
    }

    private AcademicYearResponse mapToResponse(AcademicYear entity) {
        return AcademicYearResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .isCurrent(entity.isCurrent())
                .build();
    }
}