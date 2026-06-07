package com.vusystem.preschool_management_backend.modules.core.repository;

import com.vusystem.preschool_management_backend.common.entity.academic.Enrollment;
import com.vusystem.preschool_management_backend.common.entity.enums.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    // 1. RÀNG BUỘC CỐT LÕI: Kiểm tra xem bé đã được xếp vào một lớp nào đó trong
    // năm học này chưa
    boolean existsByChildIdAndAcademicYearId(Long childId, Long academicYearId);

    // 2. Lấy toàn bộ danh sách học sinh của một lớp (dùng cho Hiệu trưởng xem tổng
    // quan)
    List<Enrollment> findBySchoolClassId(Long classId);

    // 3. Lấy danh sách học sinh ĐANG HỌC trong một lớp (phục vụ cho việc Điểm danh,
    // Đăng ký ăn)
    List<Enrollment> findBySchoolClassIdAndStatus(Long classId, EnrollmentStatus status);

    // 4. Xem lịch sử học tập của một bé qua các năm (Sắp xếp từ mới nhất đến cũ
    // nhất)
    List<Enrollment> findByChildIdOrderByEnrollmentDateDesc(Long childId);

    // 5. Lấy bản ghi xếp lớp cụ thể của một bé trong một năm học (Dùng để update
    // trạng thái thôi học/chuyển lớp)
    Optional<Enrollment> findByChildIdAndAcademicYearId(Long childId, Long academicYearId);

    // Thêm hàm này vào EnrollmentRepository hiện tại của em
    Optional<Enrollment> findByChildIdAndStatus(Long childId, EnrollmentStatus status);

    int countBySchoolClassIdAndStatus(Long classId, EnrollmentStatus status);

    @Query("SELECT e FROM Enrollment e WHERE e.schoolClass.id = :classId AND e.child.id IN :childIds AND e.status = 'STUDYING'")
    List<Enrollment> findActiveEnrollmentsByClassAndChildren(
            @Param("classId") Long classId, 
            @Param("childIds") List<Long> childIds
    );

    @Query("SELECT e FROM Enrollment e WHERE e.schoolClass.id = :classId AND e.status = 'STUDYING'")
    List<Enrollment> findActiveEnrollmentsByClassId(@Param("classId") Long classId);

    @Query("SELECT e.child.id FROM Enrollment e WHERE e.academicYear.isCurrent = true AND e.status = 'STUDYING'")
    java.util.Set<Long> findChildIdsEnrolledInCurrentYear();
}