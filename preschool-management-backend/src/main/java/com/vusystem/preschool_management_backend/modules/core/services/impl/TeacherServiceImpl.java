package com.vusystem.preschool_management_backend.modules.core.services.impl;

import com.vusystem.preschool_management_backend.common.entity.enums.Gender;
import com.vusystem.preschool_management_backend.common.entity.enums.Role;
import com.vusystem.preschool_management_backend.common.entity.user.Teacher;
import com.vusystem.preschool_management_backend.common.entity.user.User;
import com.vusystem.preschool_management_backend.modules.auth.repository.UserRepository;
import com.vusystem.preschool_management_backend.modules.auth.services.UserService;
import com.vusystem.preschool_management_backend.modules.core.dto.request.TeacherCreateRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.request.TeacherUpdateRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.response.TeacherResponse;
import com.vusystem.preschool_management_backend.modules.core.repository.TeacherRepository;
import com.vusystem.preschool_management_backend.modules.core.repository.ClassTeacherRepository;
import com.vusystem.preschool_management_backend.common.entity.academic.ClassTeacher;
import com.vusystem.preschool_management_backend.modules.core.services.TeacherService;

import java.util.ArrayList;
import java.util.Map;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherServiceImpl implements TeacherService {

    private final TeacherRepository teacherRepository;
    private final UserService userService;
    private final UserRepository userRepository; // Inject thêm để xử lý soft delete
    private final ClassTeacherRepository classTeacherRepository;

    @Override
    @Transactional
    public TeacherResponse createTeacher(TeacherCreateRequest request) {
        User savedUser = userService.createNewUser(
                request.getPhone(),
                Role.TEACHER
        );

        Teacher teacher = Teacher.builder()
                .user(savedUser)
                .fullName(request.getFullName())
                .dob(request.getDob())
                .gender(parseGender(request.getGender())) // Dùng hàm helper an toàn
                .address(request.getAddress())
                .build();

        Teacher savedTeacher = teacherRepository.save(teacher);
        return mapToResponse(savedTeacher);
    }

    @Override
    @Transactional
    public TeacherResponse updateTeacher(Long id, TeacherUpdateRequest request) {
        Teacher existingTeacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giáo viên với ID: " + id));

        existingTeacher.setFullName(request.getFullName());
        existingTeacher.setDob(request.getDob());
        existingTeacher.setGender(parseGender(request.getGender())); // Dùng hàm helper an toàn
        existingTeacher.setAddress(request.getAddress());

        Teacher updatedTeacher = teacherRepository.save(existingTeacher);
        return mapToResponse(updatedTeacher);
    }

    @Override
    public TeacherResponse getTeacherById(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giáo viên với ID: " + id));
        return mapToResponse(teacher);
    }

    @Override
    public List<TeacherResponse> getAllTeachers() {
        // Lấy tất cả phân công lớp để tránh N+1 query
        List<ClassTeacher> allAssignments = classTeacherRepository.findAll();
        
        // Chỉ map những lớp thuộc năm học HIỆN TẠI (isCurrent = true)
        Map<Long, List<String>> teacherClassMap = allAssignments.stream()
                .filter(ct -> ct.getSchoolClass().getAcademicYear().isCurrent())
                .collect(Collectors.groupingBy(
                        ct -> ct.getTeacher().getId(),
                        Collectors.mapping(
                                ct -> ct.getSchoolClass().getName() + " (" + ct.getSchoolClass().getAcademicYear().getName() + ")", 
                                Collectors.toList()
                        )
                ));

        // Dùng query lấy Active thay vì findAll()
        return teacherRepository.findAllActiveTeachers().stream()
                .map(t -> {
                    TeacherResponse res = mapToResponse(t);
                    res.setAssignedClasses(teacherClassMap.getOrDefault(t.getId(), new ArrayList<>()));
                    return res;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteTeacher(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giáo viên với ID: " + id));
        
        // Soft delete: Vô hiệu hóa tài khoản User thay vì xóa cứng Entity Teacher
        User user = teacher.getUser();
        user.setIsActive(false); 
        userRepository.save(user); 
    }

    // --- Helper Methods ---
    
    private Gender parseGender(String genderStr) {
        try {
            return Gender.valueOf(genderStr.toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new RuntimeException("Giới tính không hợp lệ. Vui lòng nhập MALE, FEMALE hoặc OTHER");
        }
    }

    private TeacherResponse mapToResponse(Teacher entity) {
        return TeacherResponse.builder()
                .id(entity.getId())
                .userId(entity.getUser().getId())
                .username(entity.getUser().getUsername()) 
                .fullName(entity.getFullName())
                .dob(entity.getDob())
                .gender(entity.getGender() != null ? entity.getGender().name() : null)
                .address(entity.getAddress())
                .build();
    }
}