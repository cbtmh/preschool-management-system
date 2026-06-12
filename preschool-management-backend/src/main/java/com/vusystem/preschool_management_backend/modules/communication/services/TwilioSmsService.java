package com.vusystem.preschool_management_backend.modules.communication.services;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class TwilioSmsService {

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.phone-number}")
    private String fromPhoneNumber;

    @PostConstruct
    public void init() {
        if (!"dummy".equals(accountSid) && !"dummy".equals(authToken)) {
            Twilio.init(accountSid, authToken);
            log.info("Twilio SDK initialized successfully.");
        } else {
            log.warn("Twilio credentials not configured properly. SMS fallback will fail.");
        }
    }

    public void sendSms(String toPhone, String messageBody) {
        try {
            if ("dummy".equals(accountSid) || "dummy".equals(authToken) || "dummy".equals(fromPhoneNumber)) {
                log.warn("Cannot send SMS: Twilio credentials not configured.");
                return;
            }

            // chuẩn hóa định dạng số điện thoại
            String normalizedPhone = normalizePhoneNumber(toPhone);

            Message message = Message.creator(
                    new PhoneNumber(normalizedPhone),
                    new PhoneNumber(fromPhoneNumber),
                    messageBody
            ).create();

            log.info("SMS Fallback sent successfully to {}. Twilio Message SID: {}", normalizedPhone, message.getSid());
        } catch (Exception e) {
            log.error("Failed to send SMS Fallback to {}: {}", toPhone, e.getMessage());
        }
    }

    private String normalizePhoneNumber(String phone) {
        if (phone == null || phone.isEmpty()) {
            return phone;
        }
        // loại bỏ khoảng trắng hoặc dấu gạch ngang
        phone = phone.replaceAll("\\s+", "").replaceAll("-", "");
        
        // giữ nguyên nếu đã đúng chuẩn e.164
        if (phone.startsWith("+")) {
            return phone;
        }
        
        // chuyển đổi định dạng số điện thoại nội địa việt nam
        if (phone.startsWith("0")) {
            return "+84" + phone.substring(1);
        }
        
        return "+" + phone;
    }
}
