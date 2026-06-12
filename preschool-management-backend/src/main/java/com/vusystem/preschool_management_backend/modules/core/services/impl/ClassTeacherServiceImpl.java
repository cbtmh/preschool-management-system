package com.vusystem.preschool_management_backend.modules.core.services.impl;

import com.vusystem.preschool_management_backend.common.entity.academic.ClassTeacher;
import com.vusystem.preschool_management_backend.common.entity.academic.ClassTeacherId;
import com.vusystem.preschool_management_backend.common.entity.academic.SchoolClass;
import com.vusystem.preschool_management_backend.common.entity.user.Teacher;
import com.vusystem.preschool_management_backend.modules.core.dto.request.ClassTeacherRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.response.ClassTeacherResponse;
import com.vusystem.preschool_management_backend.modules.core.dto.response.SchoolClassResponse;
import com.vusystem.preschool_management_backend.modules.core.repository.ClassTeacherRepository;
import com.vusystem.preschool_management_backend.modules.core.repository.SchoolClassRepository;
import com.vusystem.preschool_management_backend.modules.core.repository.TeacherRepository;
import com.vusystem.preschool_management_backend.modules.core.services.ClassTeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassTeacherServiceImpl implements ClassTeacherService {

    private final ClassTeacherRepository classTeacherRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final TeacherRepository teacherRepository;

    @Override
    @Transactional
    public ClassTeacherResponse assignTeachersToClass(ClassTeacherRequest request) {
        SchoolClass schoolClass = schoolClassRepository.findById(request.getClassId())
                .orElseThrow(() -> new RuntimeException("không tìm thấy lớp học."));

        classTeacherRepository.deleteBySchoolClassId(request.getClassId());

        List<ClassTeacher> newAssignments = new ArrayList<>();
        
        for (Long teacherId : request.getTeacherIds()) {
            Teacher teacher = teacherRepository.findById(teacherId)
                    .orElseThrow(() -> new RuntimeException("không tìm thấy giáo viên với id: " + teacherId));

            ClassTeacherId id = new ClassTeacherId(request.getClassId(), teacherId);

            ClassTeacher newAssignment = ClassTeacher.builder()
                    .id(id)
                    .schoolClass(schoolClass)
                    .teacher(teacher)
                    .build();

            newAssignments.add(newAssignment);
        }

        classTeacherRepository.saveAll(newAssignments);

        return mapToResponse(schoolClass, newAssignments);
    }

    @Override
    public ClassTeacherResponse getTeachersByClassId(Long classId) {
        SchoolClass schoolClass = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("không tìm thấy lớp học."));

        List<ClassTeacher> assignments = classTeacherRepository.findBySchoolClassId(classId);

        return mapToResponse(schoolClass, assignments);
    }

    @Override
    public List<SchoolClassResponse> getClassesByTeacherId(Long teacherId) {
        List<ClassTeacher> assignments = classTeacherRepository.findByTeacherId(teacherId);

        return assignments.stream()
                .map(ct -> SchoolClassResponse.builder()
                        .id(ct.getSchoolClass().getId())
                        .name(ct.getSchoolClass().getName())
                        .ageGroup(ct.getSchoolClass().getAgeGroup())
                        .academicYearId(ct.getSchoolClass().getAcademicYear().getId())
                        .academicYearName(ct.getSchoolClass().getAcademicYear().getName())
                        .build())
                .collect(Collectors.toList());
    }

    private ClassTeacherResponse mapToResponse(SchoolClass schoolClass, List<ClassTeacher> assignments) {
        List<ClassTeacherResponse.TeacherBasicInfo> teacherInfos = assignments.stream()
                .map(ct -> ClassTeacherResponse.TeacherBasicInfo.builder()
                        .teacherId(ct.getTeacher().getId())
                        .fullName(ct.getTeacher().getFullName())
                        .phone(ct.getTeacher().getUser().getUsername())
                        .build())
                .collect(Collectors.toList());

        return ClassTeacherResponse.builder()
                .classId(schoolClass.getId())
                .className(schoolClass.getName())
                .teachers(teacherInfos)
                .build();
    }
}