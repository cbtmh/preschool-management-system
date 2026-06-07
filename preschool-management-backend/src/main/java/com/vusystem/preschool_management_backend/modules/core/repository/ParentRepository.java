package com.vusystem.preschool_management_backend.modules.core.repository;

import com.vusystem.preschool_management_backend.common.entity.user.Parent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParentRepository extends JpaRepository<Parent, Long> {

    // Tìm hồ sơ phụ huynh thông qua ID của tài khoản User
    Optional<Parent> findByUserId(Long userId);

    // Truy vấn chỉ lấy danh sách phụ huynh mà tài khoản User còn đang Active
    // Tránh lỗi PropertyReferenceException bằng cách định nghĩa rõ @Query
    @Query("SELECT p FROM Parent p JOIN FETCH p.user u WHERE u.isActive = true")
    List<Parent> findAllActiveParents();

    // Tìm hồ sơ phụ huynh thông qua username của tài khoản User
    Optional<Parent> findByUserUsername(String username);
}