package com.vusystem.preschool_management_backend.common.entity.communication;

import com.vusystem.preschool_management_backend.common.entity.enums.InvolvedRole;
import com.vusystem.preschool_management_backend.common.entity.user.Child;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "incident_involved_children")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentInvolvedChild {

    @EmbeddedId
    private IncidentInvolvedChildId id = new IncidentInvolvedChildId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("incidentId") // Map trường incidentId trong Embeddable ID vào Entity này
    @JoinColumn(name = "incident_id")
    private IncidentReport incidentReport;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("childId") // Map trường childId trong Embeddable ID vào Entity này
    @JoinColumn(name = "child_id")
    private Child child;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private InvolvedRole role;
}