package com.vusystem.preschool_management_backend.modules.core.services.impl;

import com.vusystem.preschool_management_backend.common.entity.academic.AcademicYear;
import com.vusystem.preschool_management_backend.common.entity.academic.SchoolClass;
import com.vusystem.preschool_management_backend.modules.core.dto.request.SchoolClassRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.response.SchoolClassResponse;
import com.vusystem.preschool_management_backend.modules.core.repository.AcademicYearRepository;
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
    
    // Inject thêm Repository của Năm học để Validate khóa ngoại
    private final AcademicYearRepository academicYearRepository;

    @Override
    @Transactional
    public SchoolClassResponse createClass(SchoolClassRequest request) {
        // 1. Kiểm tra xem năm học có tồn tại không
        AcademicYear academicYear = academicYearRepository.findById(request.getAcademicYearId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy năm học với ID: " + request.getAcademicYearId()));

        // 2. Chặn lỗi logic: Không cho phép 2 lớp trùng tên trong CÙNG MỘT năm học
        if (schoolClassRepository.existsByNameAndAcademicYearId(request.getName(), request.getAcademicYearId())) {
            throw new RuntimeException("Tên lớp '" + request.getName() + "' đã tồn tại trong năm học này");
        }

        // 3. Chuyển đổi dữ liệu và lưu
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
        // 1. Tìm lớp học cần sửa
        SchoolClass existingClass = schoolClassRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học với ID: " + id));

        // 2. Kiểm tra năm học mới có tồn tại không
        AcademicYear academicYear = academicYearRepository.findById(request.getAcademicYearId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy năm học với ID: " + request.getAcademicYearId()));

        // 3. Kiểm tra trùng tên (nếu người dùng đổi tên lớp khác với tên hiện tại)
        if (!existingClass.getName().equals(request.getName()) &&
            schoolClassRepository.existsByNameAndAcademicYearId(request.getName(), request.getAcademicYearId())) {
            throw new RuntimeException("Tên lớp '" + request.getName() + "' đã tồn tại trong năm học này");
        }

        // 4. Cập nhật dữ liệu
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
        // Kiểm tra năm học trước khi query để báo lỗi chuẩn xác nếu API bị gọi nhầm ID
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
        
        // TODO: Tương lai khi làm module Xếp lớp cho Học sinh, ta sẽ check thêm điều kiện: 
        // "Nếu lớp đang có học sinh thì không được xóa". Hiện tại cứ xóa bình thường.
        
        schoolClassRepository.delete(schoolClass);
    }

    // --- Hàm hỗ trợ: Chuyển đổi từ Entity sang Response (Trải phẳng dữ liệu) ---
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