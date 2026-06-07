package com.vusystem.preschool_management_backend.common.entity.health;

import com.vusystem.preschool_management_backend.common.entity.base.BaseEntity;
import com.vusystem.preschool_management_backend.common.entity.user.Child;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "authorized_pickups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthorizedPickup extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "relationship", nullable = false)
    private String relationship; // Quan hệ với bé (VD: Ông nội, Dì, Hàng xóm)

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Column(name = "photo_url")
    private String photoUrl; // Rất cần thiết để giáo viên nhận diện đúng người

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true; // Cho phép vô hiệu hóa nếu người này không được phép đón nữa
}