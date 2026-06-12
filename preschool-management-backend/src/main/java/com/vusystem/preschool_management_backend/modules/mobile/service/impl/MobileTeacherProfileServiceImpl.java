package com.vusystem.preschool_management_backend.modules.mobile.service.impl;

import com.vusystem.preschool_management_backend.common.entity.user.Teacher;
import com.vusystem.preschool_management_backend.common.entity.user.User;
import com.vusystem.preschool_management_backend.modules.auth.repository.UserRepository;
import com.vusystem.preschool_management_backend.modules.core.repository.TeacherRepository;
import com.vusystem.preschool_management_backend.modules.mobile.dto.request.MobileTeacherProfileRequest;
import com.vusystem.preschool_management_backend.modules.mobile.service.MobileTeacherProfileService;
import com.vusystem.preschool_management_backend.common.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MobileTeacherProfileServiceImpl implements MobileTeacherProfileService {

    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Override
    @Transactional
    public String updateProfile(String currentUsername, MobileTeacherProfileRequest request) {
        Teacher teacher = teacherRepository.findByUserId(
            userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hiện tại"))
                .getId()
        ).orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ giáo viên"));

        User user = teacher.getUser();
        String newToken = null;

        // vì hệ thống dùng số điện thoại làm username để đăng nhập, nên khi đổi sđt phải kiểm tra trùng lặp
        if (!currentUsername.equals(request.getPhone())) {
            if (userRepository.existsByUsername(request.getPhone())) {
                throw new RuntimeException("Số điện thoại đã được đăng ký bởi tài khoản khác!");
            }
            user.setUsername(request.getPhone());
            userRepository.save(user);

            // cấp phát lại jwt token để app không bị văng ra ngoài sau khi đổi số điện thoại
            newToken = jwtUtil.generateToken(user);
        }

        teacher.setFullName(request.getFullName());
        teacher.setAddress(request.getAddress());
        teacherRepository.save(teacher);

        return newToken;
    }
}
