package com.vusystem.preschool_management_backend.modules.auth.services.impl;

import com.vusystem.preschool_management_backend.modules.auth.services.SmsService;
import com.vusystem.preschool_management_backend.modules.communication.services.TwilioSmsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MockSmsServiceImpl implements SmsService {

    private final TwilioSmsService twilioSmsService;

    @Override
    public void sendTemporaryPassword(String phone, String password) {
        // in thông tin ra console để debug hỗ trợ môi trường local
        System.err.println("\n=========================================================");
        System.err.println("[MOCK SMS] Đã yêu cầu gửi tin nhắn tới số điện thoại: " + phone);
        System.err.println("[MOCK SMS] TÀI KHOẢN: " + phone);
        System.err.println("[MOCK SMS] MẬT KHẨU TẠM THỜI: " + password);
        System.err.println("=========================================================\n");
        
        // gọi dịch vụ twilio sms để gửi tin nhắn thực tế
        String messageBody = String.format("Trường Mầm non thông báo: Tài khoản của bạn là %s. Mật khẩu đăng nhập tạm thời: %s. Vui lòng đổi mật khẩu sau khi đăng nhập.", phone, password);
        twilioSmsService.sendSms(phone, messageBody);
    }
}
