package com.vusystem.preschool_management_backend.common.entity.operation;

import com.vusystem.preschool_management_backend.common.entity.base.BaseEntity;
import com.vusystem.preschool_management_backend.common.entity.enums.RequestStatus;
import com.vusystem.preschool_management_backend.common.entity.user.Child;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "leave_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveRequest extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_id", nullable = false)
    @ToString.Exclude
    private Child child;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "reason", columnDefinition = "TEXT", nullable = false)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50, nullable = false)
    @Builder.Default
    private RequestStatus status = RequestStatus.PENDING;
}
