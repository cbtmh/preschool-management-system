package com.vusystem.preschool_management_backend.modules.core.services.impl;

import com.vusystem.preschool_management_backend.common.entity.academic.AcademicYear;
import com.vusystem.preschool_management_backend.common.entity.academic.SchoolClass;
import com.vusystem.preschool_management_backend.modules.core.dto.request.SchoolClassRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.response.SchoolClassResponse;
import com.vusystem.preschool_management_backend.modules.core.repository.AcademicYearRepository;
import com.vusystem.preschool_management_backend.modules.core.repository.EnrollmentRepository;
import com.vusystem.preschool_management_backend.modules.core.repository.SchoolClassRepository;
import com.vusystem.preschool_management_backend.modules.core.services.SchoolClassService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SchoolClassServiceImpl implements SchoolClassService {

    private final SchoolClassRepository schoolClassRepository;
    
    private final AcademicYearRepository academicYearRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Override
    @Transactional
    public SchoolClassResponse createClass(SchoolClassRequest request) {
        AcademicYear academicYear = academicYearRepository.findById(request.getAcademicYearId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy năm học với ID: " + request.getAcademicYearId()));

        // chặn lỗi logic: không cho phép 2 lớp trùng tên trong cùng một năm học
        if (schoolClassRepository.existsByNameAndAcademicYearId(request.getName(), request.getAcademicYearId())) {
            throw new RuntimeException("Tên lớp '" + request.getName() + "' đã tồn tại trong năm học này");
        }

        SchoolClass schoolClass = SchoolClass.builder()
                .name(request.getName())
                .ageGroup(request.getAgeGroup())
                .academicYear(academicYear)
                .build();

        SchoolClass savedClass = schoolClassRepository.save(schoolClass);

        return mapToResponse(savedClass);
    }

    @Override
    @Transactional
    public SchoolClassResponse updateClass(Long id, SchoolClassRequest request) {
        SchoolClass existingClass = schoolClassRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học với ID: " + id));

        AcademicYear academicYear = academicYearRepository.findById(request.getAcademicYearId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy năm học với ID: " + request.getAcademicYearId()));

        // kiểm tra trùng lặp tên lớp trong cùng năm học nếu có thay đổi tên
        if (!existingClass.getName().equals(request.getName()) &&
            schoolClassRepository.existsByNameAndAcademicYearId(request.getName(), request.getAcademicYearId())) {
            throw new RuntimeException("Tên lớp '" + request.getName() + "' đã tồn tại trong năm học này");
        }

        existingClass.setName(request.getName());
        existingClass.setAgeGroup(request.getAgeGroup());
        existingClass.setAcademicYear(academicYear);

        SchoolClass updatedClass = schoolClassRepository.save(existingClass);
        return mapToResponse(updatedClass);
    }

    @Override
    public SchoolClassResponse getClassById(Long id) {
        SchoolClass schoolClass = schoolClassRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học với ID: " + id));
        return mapToResponse(schoolClass);
    }

    @Override
    public List<SchoolClassResponse> getAllClasses() {
        return schoolClassRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<SchoolClassResponse> getClassesByAcademicYearId(Long academicYearId) {
        // kiểm tra năm học trước khi query để báo lỗi chuẩn xác nếu request gởi sai academic_year_id
        if (!academicYearRepository.existsById(academicYearId)) {
            throw new RuntimeException("Không tìm thấy năm học với ID: " + academicYearId);
        }

        return schoolClassRepository.findByAcademicYearId(academicYearId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteClass(Long id) {
        SchoolClass schoolClass = schoolClassRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học với ID: " + id));
        
        // kiểm tra ràng buộc không cho xóa lớp nếu lớp đang có học sinh
        if (!enrollmentRepository.findBySchoolClassId(id).isEmpty()) {
            throw new RuntimeException("Không thể xóa lớp học vì đang có học sinh trong lớp");
        }
        schoolClassRepository.delete(schoolClass);
    }

    private SchoolClassResponse mapToResponse(SchoolClass entity) {
        return SchoolClassResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .ageGroup(entity.getAgeGroup())
                .academicYearId(entity.getAcademicYear().getId())
                .academicYearName(entity.getAcademicYear().getName())
                .build();
    }
}