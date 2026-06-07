package com.vusystem.preschool_management_backend.common.entity.academic;

import com.vusystem.preschool_management_backend.common.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "academic_years")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcademicYear extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 50)
    private String name; // Ví dụ: "2025-2026"

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "is_current", nullable = false)
    private boolean isCurrent;
    
    // --- MAPPING QUAN HỆ ---
    @OneToMany(mappedBy = "academicYear", cascade = CascadeType.ALL)
    @ToString.Exclude
    @Builder.Default
    private List<SchoolClass> classes = new ArrayList<>();
}