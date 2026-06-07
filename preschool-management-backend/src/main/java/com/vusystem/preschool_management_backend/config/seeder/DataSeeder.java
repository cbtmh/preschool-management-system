package com.vusystem.preschool_management_backend.config.seeder;

import com.vusystem.preschool_management_backend.common.entity.enums.Role;
import com.vusystem.preschool_management_backend.common.entity.user.User;
import com.vusystem.preschool_management_backend.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Hệ thống mầm non thường dùng SĐT làm username. 
        // Mình sẽ tạo 1 số điện thoại giả lập làm tài khoản Super Admin.
        String adminPhone = "0999999999"; 

        // Kiểm tra xem database đã có tài khoản này chưa để tránh tạo trùng lặp mỗi khi restart server
        if (!userRepository.existsByUsername(adminPhone)) {
            
            User admin = User.builder()
                    .username(adminPhone)
                    .passwordHash(passwordEncoder.encode("admin123")) // Hash mật khẩu trước khi lưu
                    .role(Role.ADMIN)
                    .isActive(true)
                    // createdAt và updatedAt sẽ được tự động generate nhờ @EntityListeners trong BaseEntity
                    .build();

            userRepository.save(admin);
            
            log.info("======================================================");
            log.info("Đã khởi tạo tài khoản ADMIN mặc định thành công!");
            log.info("Username: {}", adminPhone);
            log.info("Password: admin123");
            log.info("======================================================");
        } else {
            log.info("Tài khoản ADMIN mặc định đã tồn tại, bỏ qua bước khởi tạo.");
        }
    }
}