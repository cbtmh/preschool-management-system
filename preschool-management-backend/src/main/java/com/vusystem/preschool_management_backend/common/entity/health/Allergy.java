package com.vusystem.preschool_management_backend.common.entity.health;

import com.vusystem.preschool_management_backend.common.entity.base.BaseEntity;
import com.vusystem.preschool_management_backend.common.entity.enums.SeverityLevel;
import com.vusystem.preschool_management_backend.common.entity.user.Child;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "allergies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Allergy extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;

    @Column(name = "allergen", nullable = false)
    private String allergen; // Tác nhân gây dị ứng (VD: Lạc, Phấn hoa, Sữa bò...)

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false)
    private SeverityLevel severity;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description; // Biểu hiện và cách xử lý nhanh
}