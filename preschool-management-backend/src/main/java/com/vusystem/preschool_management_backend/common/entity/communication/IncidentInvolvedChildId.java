package com.vusystem.preschool_management_backend.common.entity.communication;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class IncidentInvolvedChildId implements Serializable {

    @Column(name = "incident_id")
    private Long incidentId;

    @Column(name = "child_id")
    private Long childId;

    // BẮT BUỘC phải override equals và hashCode cho Composite Key trong JPA
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        IncidentInvolvedChildId that = (IncidentInvolvedChildId) o;
        return Objects.equals(incidentId, that.incidentId) &&
               Objects.equals(childId, that.childId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(incidentId, childId);
    }
}