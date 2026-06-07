package com.vusystem.preschool_management_backend.common.entity.user;

import com.vusystem.preschool_management_backend.common.entity.base.BaseEntity;
import com.vusystem.preschool_management_backend.common.entity.enums.Gender;
import com.vusystem.preschool_management_backend.common.entity.enums.StudentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;

import com.vusystem.preschool_management_backend.common.entity.health.Allergy;

@Entity
@Table(name = "children")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Child extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Trẻ em thuộc về 1 phụ huynh
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id", nullable = false)
    @ToString.Exclude
    private Parent parent;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "dob", nullable = false)
    private LocalDate dob;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 10, nullable = false)
    private Gender gender;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private StudentStatus status = StudentStatus.STUDYING;

    @Column(name = "health_notes", columnDefinition = "TEXT")
    private String healthNotes;
    
    @Column(name = "allergy_declared", nullable = false)
    @Builder.Default
    private Boolean allergyDeclared = false;

    @OneToMany(mappedBy = "child", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Allergy> allergies = new ArrayList<>();
    
    // Note: Sau này em có thể mapping thêm các quan hệ OneToMany 
    // tới Enrollment, DailyLog, HealthRecord ở đây nếu cần thiết truy xuất ngược.
}