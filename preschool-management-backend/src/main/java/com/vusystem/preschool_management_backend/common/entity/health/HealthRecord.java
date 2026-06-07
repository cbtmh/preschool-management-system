package com.vusystem.preschool_management_backend.common.entity.health;

import com.vusystem.preschool_management_backend.common.entity.base.BaseEntity;
import com.vusystem.preschool_management_backend.common.entity.user.Child;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "health_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthRecord extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Quan hệ N-1 với Child: Luôn dùng LAZY để tối ưu hiệu năng
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;

    @Column(name = "checkup_date", nullable = false)
    private LocalDate checkupDate;

    @Column(name = "weight", columnDefinition = "numeric(5,2)")
    private Double weight;

    @Column(name = "height", columnDefinition = "numeric(5,2)") // Định nghĩa rõ ràng để tránh lỗi khi lưu vào DB
    private Double height;

    @Column(name = "health_status", columnDefinition = "TEXT")
    private String healthStatus;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;
}