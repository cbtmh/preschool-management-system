package com.vusystem.preschool_management_backend.common.entity.academic;


import com.vusystem.preschool_management_backend.common.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "classes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolClass extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_id", nullable = false)
    @ToString.Exclude
    private AcademicYear academicYear;

    @Column(name = "name", nullable = false, length = 100)
    private String name; // Ví dụ: "Mầm chồi 1"

    @Column(name = "age_group", length = 50)
    private String ageGroup; // Ví dụ: "3-4 tuổi"

    @Column(name = "max_capacity", nullable = false)
    @Builder.Default
    private Integer maxCapacity = 30;
    
    // --- MAPPING QUAN HỆ ---
    
    // Danh sách giáo viên phụ trách lớp này
    @OneToMany(mappedBy = "schoolClass", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Builder.Default
    private List<ClassTeacher> classTeachers = new ArrayList<>();

    // Danh sách học sinh đăng ký vào lớp này
    @OneToMany(mappedBy = "schoolClass", cascade = CascadeType.ALL)
    @ToString.Exclude
    @Builder.Default
    private List<Enrollment> enrollments = new ArrayList<>();
}