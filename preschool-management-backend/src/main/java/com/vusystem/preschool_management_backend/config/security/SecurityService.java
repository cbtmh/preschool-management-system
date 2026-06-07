package com.vusystem.preschool_management_backend.config.security;

import com.vusystem.preschool_management_backend.common.entity.enums.Role;
import com.vusystem.preschool_management_backend.common.entity.user.Child;
import com.vusystem.preschool_management_backend.common.entity.user.User;
import com.vusystem.preschool_management_backend.modules.auth.repository.UserRepository;
import com.vusystem.preschool_management_backend.modules.core.repository.ChildRepository;
import com.vusystem.preschool_management_backend.modules.core.repository.ClassTeacherRepository;
import com.vusystem.preschool_management_backend.modules.core.repository.EnrollmentRepository;
import com.vusystem.preschool_management_backend.modules.core.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service("securityService")
@RequiredArgsConstructor
public class SecurityService {

    private final UserRepository userRepository;
    private final ChildRepository childRepository;
    private final TeacherRepository teacherRepository;
    private final ClassTeacherRepository classTeacherRepository;
    private final EnrollmentRepository enrollmentRepository;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Không tìm thấy thông tin đăng nhập");
        }
        Object principal = authentication.getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"));
    }

    public void verifyParentOwnsChild(Long childId) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() == Role.ADMIN) {
            return;
        }
        
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy học sinh với ID: " + childId));

        if (child.getParent() == null || child.getParent().getUser() == null || 
            !child.getParent().getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Truy cập bị từ chối. Bạn chỉ có quyền xem/sửa dữ liệu của con mình.");
        }
    }

    public void verifyTeacherTeachesClass(Long classId) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() == Role.ADMIN) {
            return;
        }

        var teacherOpt = teacherRepository.findByUserId(currentUser.getId());
        if (teacherOpt.isPresent()) {
            boolean teaches = classTeacherRepository.findByTeacherId(teacherOpt.get().getId())
                    .stream()
                    .anyMatch(ct -> ct.getSchoolClass().getId().equals(classId));
            if (!teaches) {
                throw new RuntimeException("Truy cập bị từ chối. Bạn không được phân công phụ trách lớp này.");
            }
        } else {
            throw new RuntimeException("Truy cập bị từ chối.");
        }
    }

    public void verifyTeacherTeachesChild(Long childId) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() == Role.ADMIN) {
            return;
        }

        var enrollmentOpt = enrollmentRepository.findByChildIdAndStatus(childId, com.vusystem.preschool_management_backend.common.entity.enums.EnrollmentStatus.STUDYING);
        if (enrollmentOpt.isEmpty()) {
            throw new RuntimeException("Truy cập bị từ chối. Học sinh chưa được xếp lớp.");
        }
        
        verifyTeacherTeachesClass(enrollmentOpt.get().getSchoolClass().getId());
    }

    public void verifyAccessToChild(Long childId) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() == Role.ADMIN) {
            return;
        }
        if (currentUser.getRole() == Role.PARENT) {
            verifyParentOwnsChild(childId);
        } else if (currentUser.getRole() == Role.TEACHER) {
            verifyTeacherTeachesChild(childId);
        }
    }
}
