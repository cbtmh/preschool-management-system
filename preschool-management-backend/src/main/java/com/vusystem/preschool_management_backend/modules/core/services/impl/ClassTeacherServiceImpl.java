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
    @Transactional // Bắt buộc phải có để đảm bảo nếu lỗi giữa chừng thì rollback lại hết
    public ClassTeacherResponse assignTeachersToClass(ClassTeacherRequest request) {
        Long classId = request.getClassId();
        
        // 1. Kiểm tra Lớp học có tồn tại không
        SchoolClass schoolClass = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học với ID: " + classId));

        // 2. Xóa toàn bộ giáo viên cũ đang được phân công ở lớp này
        classTeacherRepository.deleteBySchoolClassId(classId);

        // 3. Phân công danh sách giáo viên mới
        List<ClassTeacher> newAssignments = new ArrayList<>();
        
        for (Long teacherId : request.getTeacherIds()) {
            // Kiểm tra từng giáo viên xem có tồn tại không
            Teacher teacher = teacherRepository.findById(teacherId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy giáo viên với ID: " + teacherId));

            // Khởi tạo Composite Key
            ClassTeacherId compositeKey = new ClassTeacherId(classId, teacherId);

            // Khởi tạo Entity trung gian
            ClassTeacher classTeacher = ClassTeacher.builder()
                    .id(compositeKey)
                    .schoolClass(schoolClass)
                    .teacher(teacher)
                    .build();

            newAssignments.add(classTeacher);
        }

        // Lưu toàn bộ danh sách mới vào Database
        List<ClassTeacher> savedAssignments = classTeacherRepository.saveAll(newAssignments);

        // 4. Map kết quả trả về Frontend
        return mapToResponse(schoolClass, savedAssignments);
    }

    @Override
    public ClassTeacherResponse getTeachersByClassId(Long classId) {
        // Kiểm tra Lớp học
        SchoolClass schoolClass = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học với ID: " + classId));

        // Query lấy danh sách phân công
        List<ClassTeacher> classTeachers = classTeacherRepository.findBySchoolClassId(classId);

        return mapToResponse(schoolClass, classTeachers);
    }

    @Override
    public List<SchoolClassResponse> getClassesByTeacherId(Long teacherId) {
        // Query lấy danh sách phân công của giáo viên
        List<ClassTeacher> classTeachers = classTeacherRepository.findByTeacherId(teacherId);

        return classTeachers.stream()
                .map(ct -> SchoolClassResponse.builder()
                        .id(ct.getSchoolClass().getId())
                        .name(ct.getSchoolClass().getName())
                        .ageGroup(ct.getSchoolClass().getAgeGroup())
                        .academicYearId(ct.getSchoolClass().getAcademicYear().getId())
                        .academicYearName(ct.getSchoolClass().getAcademicYear().getName())
                        .build())
                .collect(Collectors.toList());
    }

    // --- Helper Method ---
    private ClassTeacherResponse mapToResponse(SchoolClass schoolClass, List<ClassTeacher> classTeachers) {
        
        // Trích xuất list TeacherBasicInfo từ mảng ClassTeacher
        List<ClassTeacherResponse.TeacherBasicInfo> teacherInfos = classTeachers.stream()
                .map(ct -> ClassTeacherResponse.TeacherBasicInfo.builder()
                        .teacherId(ct.getTeacher().getId())
                        .fullName(ct.getTeacher().getFullName())
                        .phone(ct.getTeacher().getUser().getUsername()) // Số điện thoại lưu ở bảng User 
                        .build())
                .collect(Collectors.toList());

        // Build Response tổng
        return ClassTeacherResponse.builder()
                .classId(schoolClass.getId())
                .className(schoolClass.getName())
                .teachers(teacherInfos)
                .build();
    }
}