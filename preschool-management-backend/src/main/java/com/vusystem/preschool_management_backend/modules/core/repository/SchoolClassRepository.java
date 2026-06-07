package com.vusystem.preschool_management_backend.modules.core.repository;

import com.vusystem.preschool_management_backend.common.entity.academic.SchoolClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SchoolClassRepository extends JpaRepository<SchoolClass, Long> {

    // Lấy danh sách tất cả các lớp học thuộc một năm học cụ thể
    List<SchoolClass> findByAcademicYearId(Long academicYearId);

    // Kiểm tra xem tên lớp đã tồn tại trong một năm học cụ thể hay chưa (dùng để validate)
    boolean existsByNameAndAcademicYearId(String name, Long academicYearId);
}