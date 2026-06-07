package com.vusystem.preschool_management_backend.modules.mobile.repository;

import com.vusystem.preschool_management_backend.common.entity.health.MedicationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MedicationRequestRepository extends JpaRepository<MedicationRequest, Long> {

    // 1. Dành cho Phụ huynh: Xem lịch sử đơn thuốc của con mình
    List<MedicationRequest> findByChildIdOrderByCreatedAtDesc(Long childId);

    // 2. Dành cho Giáo viên: Lấy danh sách các đơn thuốc CẦN UỐNG của lớp trong 1 ngày cụ thể
    // Điều kiện: Ngày truy vấn (date) nằm giữa startDate và endDate của đơn thuốc
    @Query("SELECT m FROM MedicationRequest m " +
           "JOIN m.child c " +
           "JOIN Enrollment e ON e.child.id = c.id " +
           "WHERE e.schoolClass.id = :classId " +
           "AND e.status = 'STUDYING' " +
           "AND :date BETWEEN m.startDate AND m.endDate " +
           "ORDER BY m.createdAt DESC")
    List<MedicationRequest> findMedicationsForClassOnDate(@Param("classId") Long classId, @Param("date") LocalDate date);
}