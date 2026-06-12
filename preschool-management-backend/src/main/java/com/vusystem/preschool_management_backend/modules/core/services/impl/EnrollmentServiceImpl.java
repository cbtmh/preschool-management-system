package com.vusystem.preschool_management_backend.modules.core.services.impl;

import com.vusystem.preschool_management_backend.common.entity.academic.AcademicYear;
import com.vusystem.preschool_management_backend.common.entity.academic.Enrollment;
import com.vusystem.preschool_management_backend.common.entity.academic.SchoolClass;
import com.vusystem.preschool_management_backend.common.entity.enums.EnrollmentStatus;
import com.vusystem.preschool_management_backend.common.entity.enums.StudentStatus;
import com.vusystem.preschool_management_backend.common.entity.user.Child;
import com.vusystem.preschool_management_backend.modules.core.dto.request.EnrollmentRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.request.TransferClassRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.response.EnrollmentResponse;
import com.vusystem.preschool_management_backend.modules.core.repository.AcademicYearRepository;
import com.vusystem.preschool_management_backend.modules.core.repository.ChildRepository;
import com.vusystem.preschool_management_backend.modules.core.repository.EnrollmentRepository;
import com.vusystem.preschool_management_backend.modules.core.repository.SchoolClassRepository;
import com.vusystem.preschool_management_backend.modules.core.services.EnrollmentService;
import com.vusystem.preschool_management_backend.modules.core.dto.request.ClassPromotionRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.request.DropOutRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.request.AutoEnrollmentRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.response.AutoEnrollmentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnrollmentServiceImpl implements EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final ChildRepository childRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final AcademicYearRepository academicYearRepository;
    private static final int HARD_LIMIT_OVERFLOW = 5;

    @Override
    @Transactional
    public EnrollmentResponse enrollChild(EnrollmentRequest request) {
        Child child = childRepository.findById(request.getChildId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học sinh với ID: " + request.getChildId()));

        SchoolClass schoolClass = schoolClassRepository.findById(request.getClassId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học với ID: " + request.getClassId()));

        AcademicYear academicYear = academicYearRepository.findById(request.getAcademicYearId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy năm học với ID: " + request.getAcademicYearId()));
                checkClassCapacity(schoolClass, request.isForceEnrollment());
        // ràng buộc cốt lõi: học sinh không thể học 2 lớp trong cùng 1 năm
        if (enrollmentRepository.existsByChildIdAndAcademicYearId(child.getId(), academicYear.getId())) {
            throw new RuntimeException("Học sinh này đã được xếp vào một lớp khác trong năm học này!");
        }
        Enrollment enrollment = Enrollment.builder()
                .child(child)
                .schoolClass(schoolClass)
                .academicYear(academicYear)
                .enrollmentDate(request.getEnrollmentDate() != null ? request.getEnrollmentDate() : LocalDate.now())
                .status(EnrollmentStatus.STUDYING)
                .notes(request.getNotes())
                .build();

        enrollment = enrollmentRepository.save(enrollment);

        if (child.getStatus() != StudentStatus.STUDYING) {
            child.setStatus(StudentStatus.STUDYING);
            childRepository.save(child);
        }

        return mapToResponse(enrollment);
    }

    @Override
    public List<EnrollmentResponse> getStudentsInClass(Long classId) {
        if (!schoolClassRepository.existsById(classId)) {
            throw new RuntimeException("Không tìm thấy lớp học với ID: " + classId);
        }

        List<Enrollment> enrollments = enrollmentRepository.findBySchoolClassId(classId);
        return enrollments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private EnrollmentResponse mapToResponse(Enrollment enrollment) {
        return EnrollmentResponse.builder()
                .id(enrollment.getId())
                .childId(enrollment.getChild().getId())
                .childName(enrollment.getChild().getFullName())
                .classId(enrollment.getSchoolClass().getId())
                .className(enrollment.getSchoolClass().getName())
                .academicYearId(enrollment.getAcademicYear().getId())
                .academicYearName(enrollment.getAcademicYear().getName())
                .enrollmentDate(enrollment.getEnrollmentDate())
                .status(enrollment.getStatus())
                .notes(enrollment.getNotes())
                .build();
    }

    @Override
    @Transactional
    public EnrollmentResponse transferClass(Long childId, TransferClassRequest request) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học sinh với ID: " + childId));

        Optional<Enrollment> currentEnrollmentOpt = enrollmentRepository.findByChildIdAndStatus(childId, EnrollmentStatus.STUDYING);

        SchoolClass newClass = schoolClassRepository.findById(request.getNewClassId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học mới."));
        checkClassCapacity(newClass, request.isForceEnrollment());

        if (currentEnrollmentOpt.isPresent()) {
            Enrollment currentEnrollment = currentEnrollmentOpt.get();
            // lớp mới phải cùng năm học với lớp cũ
            if (!newClass.getAcademicYear().getId().equals(currentEnrollment.getAcademicYear().getId())) {
                throw new RuntimeException("Lỗi logic: Không thể chuyển sang lớp của một năm học khác.");
            }
            
            // không được chuyển vào chính lớp cũ
            if (newClass.getId().equals(currentEnrollment.getSchoolClass().getId())) {
                throw new RuntimeException("Học sinh đang học tại lớp này, không thể chuyển.");
            }

            currentEnrollment.setStatus(EnrollmentStatus.DROPPED);
            currentEnrollment.setNotes("Chuyển sang lớp: " + newClass.getName() + ". Lý do: " + request.getNote());
            enrollmentRepository.save(currentEnrollment);

            Enrollment newEnrollment = Enrollment.builder()
                    .child(child)
                    .schoolClass(newClass)
                    .academicYear(newClass.getAcademicYear())
                    .enrollmentDate(LocalDate.now())
                    .status(EnrollmentStatus.STUDYING)
                    .notes("Chuyển đến từ lớp: " + currentEnrollment.getSchoolClass().getName())
                    .build();

            return mapToResponse(enrollmentRepository.save(newEnrollment)); 
        } else {
            Enrollment newEnrollment = Enrollment.builder()
                    .child(child)
                    .schoolClass(newClass)
                    .academicYear(newClass.getAcademicYear())
                    .enrollmentDate(LocalDate.now())
                    .status(EnrollmentStatus.STUDYING)
                    .notes("Xếp lớp mới. Ghi chú: " + request.getNote())
                    .build();

            if (child.getStatus() != StudentStatus.STUDYING) {
                child.setStatus(StudentStatus.STUDYING);
                childRepository.save(child);
            }
            return mapToResponse(enrollmentRepository.save(newEnrollment));
        }
    }

    @Override
    @Transactional
    public void dropOut(Long childId, DropOutRequest request) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học sinh với ID: " + childId));

        Optional<Enrollment> currentEnrollmentOpt = enrollmentRepository.findByChildIdAndStatus(childId, EnrollmentStatus.STUDYING);
        if (currentEnrollmentOpt.isPresent()) {
            Enrollment currentEnrollment = currentEnrollmentOpt.get();
            currentEnrollment.setStatus(EnrollmentStatus.DROPPED);
            currentEnrollment.setNotes("Đã thôi học/Bảo lưu. Lý do: " + request.getNote());
            enrollmentRepository.save(currentEnrollment);
        }

        child.setStatus(StudentStatus.RESERVED);
        childRepository.save(child);
    }

    private void checkClassCapacity(SchoolClass schoolClass, boolean forceEnrollment) {
        int maxCapacity = schoolClass.getMaxCapacity();
        int currentCount = enrollmentRepository.countBySchoolClassIdAndStatus(schoolClass.getId(), EnrollmentStatus.STUDYING);

        // kiểm tra giới hạn sức chứa cứng (hard limit) không bao giờ được vượt qua
        int absoluteMax = maxCapacity + HARD_LIMIT_OVERFLOW;
        if (currentCount >= absoluteMax) {
            throw new RuntimeException("Lớp đã đạt giới hạn sức chứa tối đa tuyệt đối (" + absoluteMax + " trẻ). Hệ thống từ chối thêm học sinh.");
        }

        // kiểm tra giới hạn mềm (soft limit), cho phép vượt nếu admin xác nhận force_enrollment
        if (currentCount >= maxCapacity && !forceEnrollment) {
            throw new RuntimeException("Lớp đã đạt sĩ số chuẩn (" + maxCapacity + " trẻ). Bạn có chắc chắn muốn thêm ngoại lệ không?");
        }
    }

    @Override
    @Transactional
    public void promoteStudents(ClassPromotionRequest request) {
        SchoolClass newClass = schoolClassRepository.findById(request.getNewClassId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học mới với ID: " + request.getNewClassId()));

        List<Enrollment> oldEnrollments = enrollmentRepository.findActiveEnrollmentsByClassAndChildren(
                request.getOldClassId(), request.getChildIds()
        );

        if (oldEnrollments.isEmpty()) {
            throw new RuntimeException("Không tìm thấy học sinh nào đang học ở lớp cũ trong danh sách đã chọn");
        }

        List<Enrollment> newEnrollments = new ArrayList<>();

        for (Enrollment oldEnrollment : oldEnrollments) {
            oldEnrollment.setStatus(EnrollmentStatus.COMPLETED);
            oldEnrollment.setNotes("Đã hoàn thành để lên lớp mới");

            Enrollment newEnrollment = Enrollment.builder()
                    .child(oldEnrollment.getChild())
                    .schoolClass(newClass)
                    .academicYear(newClass.getAcademicYear())
                    .enrollmentDate(LocalDate.now())
                    .status(EnrollmentStatus.STUDYING)
                    .build();

            newEnrollments.add(newEnrollment);
        }

        enrollmentRepository.saveAll(oldEnrollments);
        enrollmentRepository.saveAll(newEnrollments);
    }

    @Override
    @Transactional
    public void graduateClass(Long classId) {
        SchoolClass schoolClass = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học với ID: " + classId));

        List<Enrollment> activeEnrollments = enrollmentRepository.findActiveEnrollmentsByClassId(classId);

        if (activeEnrollments.isEmpty()) {
            throw new RuntimeException("Lớp học này hiện không có học sinh nào đang theo học");
        }

        List<Child> graduatingChildren = new ArrayList<>();

        for (Enrollment enrollment : activeEnrollments) {
            enrollment.setStatus(EnrollmentStatus.COMPLETED);
            enrollment.setNotes("Đã tốt nghiệp (Hoàn thành chương trình mầm non)");

            Child child = enrollment.getChild();
            child.setStatus(StudentStatus.ENTRANCE_PRIMARY);
            
            graduatingChildren.add(child);
        }

        enrollmentRepository.saveAll(activeEnrollments);
        childRepository.saveAll(graduatingChildren);
    }

    @Override
    @Transactional
    public AutoEnrollmentResponse autoEnroll(AutoEnrollmentRequest request) {
        Long academicYearId = request.getAcademicYearId();
        
        AcademicYear academicYear = academicYearRepository.findById(academicYearId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy năm học với ID: " + academicYearId));

        // chặn xếp lớp cho các năm học trong quá khứ để bảo vệ tính toàn vẹn của dữ liệu lịch sử
        if (academicYear.getEndDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Năm học này đã qua nên không thể tiến hành xếp lớp nữa");
        }

        List<Child> childrenToEnroll = childRepository.findActiveChildrenWithoutEnrollmentInYear(academicYearId);
        
        if (childrenToEnroll.isEmpty()) {
            return AutoEnrollmentResponse.builder()
                    .totalProcessed(0)
                    .totalAssigned(0)
                    .totalUnassigned(0)
                    .unassignedChildren(new ArrayList<>())
                    .build();
        }

        List<SchoolClass> classes = schoolClassRepository.findByAcademicYearId(academicYearId);
        
        Map<String, List<ClassCapacity>> classCapacityMap = new java.util.HashMap<>();
        for (SchoolClass sc : classes) {
            int currentCount = enrollmentRepository.countBySchoolClassIdAndStatus(sc.getId(), EnrollmentStatus.STUDYING);
            int remaining = sc.getMaxCapacity() - currentCount;
            if (remaining > 0) {
                classCapacityMap.computeIfAbsent(sc.getAgeGroup(), k -> new ArrayList<>())
                        .add(new ClassCapacity(sc, remaining));
            }
        }

        List<Enrollment> newEnrollments = new ArrayList<>();
        List<AutoEnrollmentResponse.UnassignedChildDto> unassigned = new ArrayList<>();
        List<Child> updatedChildren = new ArrayList<>();
        
        LocalDate cutoffDate = LocalDate.of(academicYear.getStartDate().getYear(), 9, 1);

        Map<String, List<Child>> childrenByAgeGroup = new java.util.HashMap<>();
        for (Child child : childrenToEnroll) {
            String ageGroup = mapAgeToGroup(child.getDob(), cutoffDate);
            if (ageGroup == null) {
                unassigned.add(AutoEnrollmentResponse.UnassignedChildDto.builder()
                        .childId(child.getId())
                        .fullName(child.getFullName())
                        .reason("Tuổi không phù hợp (dưới 18 tháng hoặc quá 72 tháng)")
                        .build());
                continue;
            }
            childrenByAgeGroup.computeIfAbsent(ageGroup, k -> new ArrayList<>()).add(child);
        }

        for (Map.Entry<String, List<Child>> entry : childrenByAgeGroup.entrySet()) {
            String ageGroup = entry.getKey();
            List<Child> groupChildren = entry.getValue();
            
            java.util.Queue<Child> maleQueue = new java.util.LinkedList<>();
            java.util.Queue<Child> femaleQueue = new java.util.LinkedList<>();
            
            for (Child c : groupChildren) {
                if (c.getGender() == com.vusystem.preschool_management_backend.common.entity.enums.Gender.MALE) maleQueue.add(c);
                else femaleQueue.add(c);
            }
            
            List<ClassCapacity> availableClasses = classCapacityMap.getOrDefault(ageGroup, new ArrayList<>());
            
            while (!maleQueue.isEmpty() || !femaleQueue.isEmpty()) {
                if (availableClasses.isEmpty()) {
                    while (!maleQueue.isEmpty()) {
                        Child c = maleQueue.poll();
                        unassigned.add(AutoEnrollmentResponse.UnassignedChildDto.builder()
                                .childId(c.getId())
                                .fullName(c.getFullName())
                                .reason("Hết chỗ trong các lớp thuộc nhóm " + ageGroup)
                                .build());
                    }
                    while (!femaleQueue.isEmpty()) {
                        Child c = femaleQueue.poll();
                        unassigned.add(AutoEnrollmentResponse.UnassignedChildDto.builder()
                                .childId(c.getId())
                                .fullName(c.getFullName())
                                .reason("Hết chỗ trong các lớp thuộc nhóm " + ageGroup)
                                .build());
                    }
                    break;
                }
                
                java.util.Iterator<ClassCapacity> iterator = availableClasses.iterator();
                while (iterator.hasNext()) {
                    ClassCapacity cc = iterator.next();
                    
                    if (!femaleQueue.isEmpty()) {
                        Child f = femaleQueue.poll();
                        assignChild(f, cc, academicYear, newEnrollments, updatedChildren);
                    }
                    
                    if (cc.remaining > 0 && !maleQueue.isEmpty()) {
                        Child m = maleQueue.poll();
                        assignChild(m, cc, academicYear, newEnrollments, updatedChildren);
                    }
                    
                    if (cc.remaining <= 0) {
                        iterator.remove();
                    }
                }
            }
        }
        
        if (!newEnrollments.isEmpty()) {
            enrollmentRepository.saveAll(newEnrollments);
        }
        if (!updatedChildren.isEmpty()) {
            childRepository.saveAll(updatedChildren);
        }
        
        return AutoEnrollmentResponse.builder()
                .totalProcessed(childrenToEnroll.size())
                .totalAssigned(newEnrollments.size())
                .totalUnassigned(unassigned.size())
                .unassignedChildren(unassigned)
                .build();
    }

    private void assignChild(Child child, ClassCapacity cc, AcademicYear year, List<Enrollment> enrollments, List<Child> updated) {
        enrollments.add(Enrollment.builder()
                .child(child)
                .schoolClass(cc.schoolClass)
                .academicYear(year)
                .enrollmentDate(LocalDate.now())
                .status(EnrollmentStatus.STUDYING)
                .notes("Xếp lớp tự động")
                .build());
        
        if (child.getStatus() != StudentStatus.STUDYING) {
            child.setStatus(StudentStatus.STUDYING);
            updated.add(child);
        }
        cc.remaining--;
    }

    private String mapAgeToGroup(LocalDate dob, LocalDate cutoffDate) {
        int months = (cutoffDate.getYear() - dob.getYear()) * 12 + (cutoffDate.getMonthValue() - dob.getMonthValue());
        
        if (months < 18) return null; 
        if (months >= 18 && months < 24) return "Nhà trẻ (18-24 tháng)";
        if (months >= 24 && months < 36) return "Nhà trẻ (24-36 tháng)";
        if (months >= 36 && months < 48) return "Mầm (3-4 tuổi)";
        if (months >= 48 && months < 60) return "Chồi (4-5 tuổi)";
        if (months >= 60 && months <= 72) return "Lá (5-6 tuổi)";
        
        return null; 
    }

    private static class ClassCapacity {
        SchoolClass schoolClass;
        int remaining;

        ClassCapacity(SchoolClass schoolClass, int remaining) {
            this.schoolClass = schoolClass;
            this.remaining = remaining;
        }
    }
}