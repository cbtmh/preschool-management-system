package com.vusystem.preschool_management_backend.modules.core.services.impl;

import com.vusystem.preschool_management_backend.modules.core.dto.response.DashboardStatisticsResponse;
import com.vusystem.preschool_management_backend.modules.core.repository.ChildRepository;
import com.vusystem.preschool_management_backend.modules.core.repository.SchoolClassRepository;
import com.vusystem.preschool_management_backend.modules.core.repository.TeacherRepository;
import com.vusystem.preschool_management_backend.modules.core.services.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final ChildRepository childRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final TeacherRepository teacherRepository;

    @Override
    public DashboardStatisticsResponse getDashboardStatistics() {
        long totalStudents = childRepository.count();
        long totalClasses = schoolClassRepository.count();
        long totalTeachers = teacherRepository.count();

        return DashboardStatisticsResponse.builder()
                .totalStudents(totalStudents)
                .totalClasses(totalClasses)
                .totalTeachers(totalTeachers)
                .build();
    }
}
