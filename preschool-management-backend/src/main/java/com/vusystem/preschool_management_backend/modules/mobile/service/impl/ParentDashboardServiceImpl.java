package com.vusystem.preschool_management_backend.modules.mobile.service.impl;

import com.vusystem.preschool_management_backend.common.entity.user.Child;
import com.vusystem.preschool_management_backend.common.entity.user.Parent;
import com.vusystem.preschool_management_backend.modules.core.repository.ParentRepository;
import com.vusystem.preschool_management_backend.modules.mobile.dto.response.ChildSummaryDTO;
import com.vusystem.preschool_management_backend.modules.mobile.dto.response.ParentDashboardResponse;
import com.vusystem.preschool_management_backend.modules.mobile.service.ParentDashboardService;
import com.vusystem.preschool_management_backend.modules.core.dto.response.AllergyResponse;
import com.vusystem.preschool_management_backend.modules.portal.dto.NewsDto;
import com.vusystem.preschool_management_backend.modules.portal.services.NewsService;
import com.vusystem.preschool_management_backend.common.entity.academic.Enrollment;
import com.vusystem.preschool_management_backend.common.entity.academic.SchoolClass;
import com.vusystem.preschool_management_backend.common.entity.enums.EnrollmentStatus;
import com.vusystem.preschool_management_backend.common.entity.user.Teacher;
import com.vusystem.preschool_management_backend.modules.core.repository.EnrollmentRepository;
import com.vusystem.preschool_management_backend.modules.mobile.dto.request.MobileParentProfileRequest;
import com.vusystem.preschool_management_backend.common.entity.user.User;
import com.vusystem.preschool_management_backend.modules.auth.repository.UserRepository;
import com.vusystem.preschool_management_backend.common.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ParentDashboardServiceImpl implements ParentDashboardService {

    private final ParentRepository parentRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final NewsService newsService;
    private final JwtUtil jwtUtil;

    @Override
    public ParentDashboardResponse getDashboardData(String username) {
        // 1. Lấy thông tin phụ huynh
        Parent parent = parentRepository.findByUserUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ phụ huynh"));

        // 2. Chuyển đổi danh sách con sang DTO
        List<ChildSummaryDTO> childrenDto = parent.getChildren().stream()
                .map(this::mapToChildSummary)
                .collect(Collectors.toList());

        // 3. Lấy top 3 tin tức mới nhất
        Page<NewsDto> newsPage = newsService.getPublishedNews(PageRequest.of(0, 3));
        List<NewsDto> recentNews = newsPage.getContent();

        // 4. Trả về response
        return ParentDashboardResponse.builder()
                .children(childrenDto)
                .recentNews(recentNews)
                .build();
    }

    @Override
    @Transactional
    public String updateProfile(String currentUsername, MobileParentProfileRequest request) {
        Parent parent = parentRepository.findByUserUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ phụ huynh"));
        
        User user = parent.getUser();
        String newToken = null;

        // Cập nhật sđt (username) nếu có thay đổi
        if (!currentUsername.equals(request.getPhone())) {
            if (userRepository.existsByUsername(request.getPhone())) {
                throw new RuntimeException("Số điện thoại đã được đăng ký bởi tài khoản khác!");
            }
            user.setUsername(request.getPhone());
            userRepository.save(user);
            
            // Tạo lại token mới vì username thay đổi
            newToken = jwtUtil.generateToken(user);
        }

        // Cập nhật thông tin cá nhân
        parent.setFullName(request.getFullName());
        parent.setAddress(request.getAddress());
        parentRepository.save(parent);

        return newToken;
    }

    private ChildSummaryDTO mapToChildSummary(Child child) {
        String className = null;
        ChildSummaryDTO.TeacherSummaryDTO teacherSummary = null;

        Optional<Enrollment> enrollmentOpt = enrollmentRepository.findByChildIdAndStatus(child.getId(), EnrollmentStatus.STUDYING);
        if (enrollmentOpt.isPresent()) {
            SchoolClass schoolClass = enrollmentOpt.get().getSchoolClass();
            className = schoolClass.getName();
            
            if (schoolClass.getClassTeachers() != null && !schoolClass.getClassTeachers().isEmpty()) {
                Teacher teacher = schoolClass.getClassTeachers().get(0).getTeacher();
                if (teacher != null && teacher.getUser() != null) {
                    teacherSummary = ChildSummaryDTO.TeacherSummaryDTO.builder()
                            .fullName(teacher.getFullName())
                            .phoneNumber(teacher.getUser().getUsername())
                            .build();
                }
            }
        }

        return ChildSummaryDTO.builder()
                .id(child.getId())
                .fullName(child.getFullName())
                .dob(child.getDob())
                .gender(child.getGender() != null ? child.getGender().name() : null)
                .allergyDeclared(child.getAllergyDeclared())
                .allergies(child.getAllergies() != null ? child.getAllergies().stream().map(a -> 
                    AllergyResponse.builder()
                            .id(a.getId())
                            .allergen(a.getAllergen())
                            .severity(a.getSeverity())
                            .description(a.getDescription())
                            .build()
                ).collect(Collectors.toList()) : java.util.Collections.emptyList())
                .className(className)
                .teacher(teacherSummary)
                .build();
    }
}
