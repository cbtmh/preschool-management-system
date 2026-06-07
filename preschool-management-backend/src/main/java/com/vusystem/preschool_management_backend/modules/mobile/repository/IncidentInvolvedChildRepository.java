package com.vusystem.preschool_management_backend.modules.mobile.repository;

import com.vusystem.preschool_management_backend.common.entity.communication.IncidentInvolvedChild;
import com.vusystem.preschool_management_backend.common.entity.communication.IncidentInvolvedChildId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentInvolvedChildRepository extends JpaRepository<IncidentInvolvedChild, IncidentInvolvedChildId> {
    List<IncidentInvolvedChild> findByIncidentReportId(Long incidentId);
    List<IncidentInvolvedChild> findByIncidentReportIdIn(List<Long> reportIds);
}
