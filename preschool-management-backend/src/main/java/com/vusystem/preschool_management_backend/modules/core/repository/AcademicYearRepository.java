package com.vusystem.preschool_management_backend.modules.core.repository;

import com.vusystem.preschool_management_backend.common.entity.academic.AcademicYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AcademicYearRepository extends JpaRepository<AcademicYear, Long> {

    boolean existsByName(String name);

    Optional<AcademicYear> findByIsCurrentTrue();

    @Modifying
    @Query("UPDATE AcademicYear a SET a.isCurrent = false WHERE a.isCurrent = true")
    void resetAllIsCurrentFlags();
}