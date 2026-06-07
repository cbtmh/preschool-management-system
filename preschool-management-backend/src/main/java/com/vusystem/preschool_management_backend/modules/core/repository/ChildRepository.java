package com.vusystem.preschool_management_backend.modules.core.repository;

import com.vusystem.preschool_management_backend.common.entity.user.Child;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface ChildRepository extends JpaRepository<Child, Long> {
    
    // 1. Dùng để API lấy danh sách tất cả các bé của một phụ huynh cụ thể
    // Rất hữu ích cho App Mobile sau này: Phụ huynh login vào sẽ gọi hàm này để lấy list con của họ
    List<Child> findByParentId(Long parentId);

    // 2. Dùng để check ràng buộc toàn vẹn dữ liệu
    // Trước khi xóa 1 Parent, gọi hàm này check. Nếu == true thì chặn lại, không cho xóa.
    boolean existsByParentId(Long parentId);

    // 3. Lấy danh sách trẻ đang học hoặc bảo lưu nhưng CHƯA có lớp trong năm học chỉ định
    @Query("SELECT c FROM Child c WHERE c.status IN ('STUDYING', 'RESERVED') AND NOT EXISTS " +
           "(SELECT e FROM Enrollment e WHERE e.child = c AND e.academicYear.id = :academicYearId)")
    List<Child> findActiveChildrenWithoutEnrollmentInYear(@Param("academicYearId") Long academicYearId);

    // 4. Kiểm tra xem bé đã tồn tại trong DB chưa (tránh trùng lặp khi import Excel)
    boolean existsByFullNameAndDobAndParentId(String fullName, java.time.LocalDate dob, Long parentId);
}