package com.vusystem.preschool_management_backend.modules.mobile.repository;

import com.vusystem.preschool_management_backend.common.entity.operation.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByChildIdOrderByCreatedAtDesc(Long childId);

    @org.springframework.data.jpa.repository.Query("SELECT lr FROM LeaveRequest lr " +
           "WHERE lr.child.id IN (SELECT e.child.id FROM com.vusystem.preschool_management_backend.common.entity.academic.Enrollment e WHERE e.schoolClass.id = :classId) " +
           "AND lr.status = 'APPROVED' " +
           "AND ((lr.startDate >= :startDate AND lr.startDate <= :endDate) OR " +
           "(lr.endDate >= :startDate AND lr.endDate <= :endDate) OR " +
           "(lr.startDate <= :startDate AND lr.endDate >= :endDate))")
    List<LeaveRequest> findApprovedLeaveRequestsForClassInDateRange(
            @org.springframework.data.repository.query.Param("classId") Long classId,
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);

    @org.springframework.data.jpa.repository.Query("SELECT lr FROM LeaveRequest lr " +
           "WHERE lr.child.id IN (SELECT e.child.id FROM com.vusystem.preschool_management_backend.common.entity.academic.Enrollment e WHERE e.schoolClass.id = :classId) " +
           "ORDER BY lr.createdAt DESC")
    List<LeaveRequest> findLeaveRequestsByClassIdOrderByCreatedAtDesc(@org.springframework.data.repository.query.Param("classId") Long classId);
}
