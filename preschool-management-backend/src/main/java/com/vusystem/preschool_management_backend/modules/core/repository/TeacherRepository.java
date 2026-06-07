package com.vusystem.preschool_management_backend.modules.core.repository;

import com.vusystem.preschool_management_backend.common.entity.user.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    
    Optional<Teacher> findByUserId(Long userId);

    // Lấy danh sách giáo viên có tài khoản đang active (Soft Delete)
    @Query("SELECT t FROM Teacher t WHERE t.user.isActive = true")
    List<Teacher> findAllActiveTeachers();
}