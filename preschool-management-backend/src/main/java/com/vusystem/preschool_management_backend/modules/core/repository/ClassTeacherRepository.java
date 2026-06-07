package com.vusystem.preschool_management_backend.modules.core.repository;

import com.vusystem.preschool_management_backend.common.entity.academic.ClassTeacher;
import com.vusystem.preschool_management_backend.common.entity.academic.ClassTeacherId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassTeacherRepository extends JpaRepository<ClassTeacher, ClassTeacherId> {

    // Lấy danh sách toàn bộ giáo viên được phân công vào một lớp cụ thể
    List<ClassTeacher> findBySchoolClassId(Long classId);

    // Lấy danh sách các lớp mà một giáo viên cụ thể đang phụ trách
    List<ClassTeacher> findByTeacherId(Long teacherId);

    // Kiểm tra xem giáo viên đã được phân công vào lớp này chưa (hữu ích cho Validate)
    boolean existsBySchoolClassIdAndTeacherId(Long classId, Long teacherId);

    // Xóa toàn bộ giáo viên khỏi một lớp. 
    // Rất quan trọng khi dùng hàm Update (xóa danh sách cũ đi và insert danh sách mới)
    @Modifying
    @Query("DELETE FROM ClassTeacher ct WHERE ct.schoolClass.id = :classId")
    void deleteBySchoolClassId(@Param("classId") Long classId);
}