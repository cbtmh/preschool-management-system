package com.vusystem.preschool_management_backend.modules.auth.services.impl;

import com.vusystem.preschool_management_backend.modules.auth.services.SmsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class MockSmsServiceImpl implements SmsService {

    @Override
    public void sendTemporaryPassword(String phone, String password) {
        // In ra console bằng System.err (thường sẽ có màu đỏ trong IDE) để dễ dàng nhìn thấy giữa một rừng log SQL
        System.err.println("\n=========================================================");
        System.err.println("[MOCK SMS] Đã gửi tin nhắn tới số điện thoại: " + phone);
        System.err.println("[MOCK SMS] TÀI KHOẢN: " + phone);
        System.err.println("[MOCK SMS] MẬT KHẨU TẠM THỜI: " + password);
        System.err.println("[MOCK SMS] Vui lòng đổi mật khẩu ở lần đăng nhập đầu tiên.");
        System.err.println("=========================================================\n");
        
        // Log info thông thường
        log.info("[MOCK SMS] Sent to {}: Password is {}", phone, password);
    }
}
