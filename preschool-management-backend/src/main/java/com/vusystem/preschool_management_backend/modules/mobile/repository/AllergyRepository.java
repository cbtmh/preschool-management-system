package com.vusystem.preschool_management_backend.modules.mobile.repository;

import com.vusystem.preschool_management_backend.common.entity.health.Allergy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AllergyRepository extends JpaRepository<Allergy, Long> {
    List<Allergy> findByChildId(Long childId);
}