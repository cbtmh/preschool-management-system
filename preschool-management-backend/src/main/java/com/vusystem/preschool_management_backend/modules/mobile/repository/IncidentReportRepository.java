package com.vusystem.preschool_management_backend.modules.mobile.repository;

import com.vusystem.preschool_management_backend.common.entity.communication.IncidentReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentReportRepository extends JpaRepository<IncidentReport, Long> {

    // 1. Dành cho Giáo viên: Xem các sự cố do chính cô giáo này báo cáo
    List<IncidentReport> findByReportedByIdOrderByIncidentTimeDesc(Long teacherId);

    // Dành cho Giáo viên: Xem các sự cố thuộc về các lớp mà cô giáo này đang phụ trách
    List<IncidentReport> findBySchoolClassIdInOrderByIncidentTimeDesc(List<Long> classIds);

    @Query("SELECT DISTINCT ir FROM IncidentReport ir " +
           "JOIN IncidentInvolvedChild ic ON ir.id = ic.incidentReport.id " + 
           "WHERE ic.child.id = :childId AND ir.status = :status " +
           "ORDER BY ir.incidentTime DESC")
    List<IncidentReport> findByChildIdAndStatus(@Param("childId") Long childId, @Param("status") com.vusystem.preschool_management_backend.common.entity.enums.IncidentStatus status);

    @Query("SELECT DISTINCT ir FROM IncidentReport ir " +
           "JOIN IncidentInvolvedChild ic ON ir.id = ic.incidentReport.id " + 
           "WHERE ic.child.id = :childId AND ir.status IN :statuses " +
           "ORDER BY ir.incidentTime DESC")
    List<IncidentReport> findByChildIdAndStatusIn(@Param("childId") Long childId, @Param("statuses") List<com.vusystem.preschool_management_backend.common.entity.enums.IncidentStatus> statuses);

    List<IncidentReport> findAllByOrderByIncidentTimeDesc();
}