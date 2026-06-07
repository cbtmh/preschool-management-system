package com.vusystem.preschool_management_backend.common.entity.communication;

import com.vusystem.preschool_management_backend.common.entity.academic.SchoolClass;
import com.vusystem.preschool_management_backend.common.entity.base.BaseEntity;
import com.vusystem.preschool_management_backend.common.entity.enums.IncidentStatus;
import com.vusystem.preschool_management_backend.common.entity.enums.SeverityLevel;
import com.vusystem.preschool_management_backend.common.entity.user.Teacher;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "incident_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentReport extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private SchoolClass schoolClass;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by", nullable = false)
    private Teacher reportedBy;

    @Column(name = "incident_time", nullable = false)
    private LocalDateTime incidentTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false)
    private SeverityLevel severity;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "initial_handling", columnDefinition = "TEXT")
    private String initialHandling;

    // Sử dụng tính năng của Hibernate 6 để map thẳng JSON trong DB ra List<String> trong Java
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "image_urls", columnDefinition = "json")
    private List<String> imageUrls;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private IncidentStatus status = IncidentStatus.NEW;

    @Column(name = "principal_notes", columnDefinition = "TEXT")
    private String principalNotes; // Ghi chú cách xử lý của Hiệu trưởng
}