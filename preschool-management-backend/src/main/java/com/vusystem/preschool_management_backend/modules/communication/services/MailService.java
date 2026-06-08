package com.vusystem.preschool_management_backend.modules.communication.services;

import com.vusystem.preschool_management_backend.modules.communication.dto.request.ContactRequest;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String adminEmail;

    @Async
    public void processContactRequest(ContactRequest request) {
        log.info("Processing contact request from: {}", request.getEmail());
        
        // 1. Gửi email thông báo cho Admin
        sendAdminNotification(request);

        // 2. Gửi email tự động phản hồi cho Phụ huynh
        sendParentAutoReply(request);
    }

    private void sendAdminNotification(ContactRequest request) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(adminEmail);
            helper.setTo(adminEmail); // Gửi về chính email admin
            helper.setSubject("🔔 [Web Portal] Có liên hệ mới từ phụ huynh: " + request.getName());

            String htmlContent = String.format(
                "<h2>Có một lời nhắn mới từ Web Portal</h2>" +
                "<p><strong>Tên phụ huynh:</strong> %s</p>" +
                "<p><strong>Email:</strong> %s</p>" +
                "<p><strong>Số điện thoại:</strong> %s</p>" +
                "<p><strong>Lời nhắn:</strong></p>" +
                "<blockquote style=\"border-left: 4px solid #ddd; padding-left: 10px; color: #555;\">%s</blockquote>",
                request.getName(), request.getEmail(), 
                request.getPhone() != null ? request.getPhone() : "Không cung cấp",
                request.getMessage().replace("\n", "<br/>")
            );

            helper.setText(htmlContent, true);
            javaMailSender.send(message);
            log.info("Successfully sent notification email to admin.");

        } catch (MessagingException e) {
            log.error("Failed to send notification email to admin", e);
        }
    }

    private void sendParentAutoReply(ContactRequest request) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(adminEmail);
            helper.setTo(request.getEmail());
            helper.setSubject("✅ Đã nhận được lời nhắn của bạn - Hệ thống Mầm non");

            String htmlContent = String.format(
                "<h2>Chào %s,</h2>" +
                "<p>Cảm ơn bạn đã liên hệ với chúng tôi. Chúng tôi đã nhận được lời nhắn của bạn với nội dung:</p>" +
                "<blockquote style=\"border-left: 4px solid #ddd; padding-left: 10px; color: #555;\">%s</blockquote>" +
                "<p>Đội ngũ của chúng tôi sẽ xem xét và phản hồi lại cho bạn trong thời gian sớm nhất (thường trong vòng 24h làm việc).</p>" +
                "<br/>" +
                "<p>Trân trọng,</p>" +
                "<p><strong>Ban Giám Hiệu Trường Mầm Non</strong></p>",
                request.getName(),
                request.getMessage().replace("\n", "<br/>")
            );

            helper.setText(htmlContent, true);
            javaMailSender.send(message);
            log.info("Successfully sent auto-reply email to parent: {}", request.getEmail());

        } catch (MessagingException e) {
            log.error("Failed to send auto-reply email to parent: {}", request.getEmail(), e);
        }
    }

    @Async
    public void sendAccountCreationEmail(String toEmail, String username, String password, String roleName) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(adminEmail);
            helper.setTo(toEmail);
            helper.setSubject("🔑 Thông tin tài khoản đăng nhập Hệ thống Mầm non");

            String htmlContent = String.format(
                "<h2>Chào bạn,</h2>" +
                "<p>Tài khoản %s của bạn trên Hệ thống Quản lý Mầm non đã được tạo thành công.</p>" +
                "<p>Dưới đây là thông tin đăng nhập của bạn:</p>" +
                "<ul>" +
                "<li><strong>Tên đăng nhập (Số điện thoại):</strong> %s</li>" +
                "<li><strong>Mật khẩu tạm thời:</strong> <code>%s</code></li>" +
                "</ul>" +
                "<p>Vui lòng đăng nhập và <strong>đổi mật khẩu ngay trong lần đăng nhập đầu tiên</strong> để bảo mật tài khoản.</p>" +
                "<br/>" +
                "<p>Trân trọng,</p>" +
                "<p><strong>Ban Giám Hiệu Trường Mầm Non</strong></p>",
                roleName, username, password
            );

            helper.setText(htmlContent, true);
            javaMailSender.send(message);
            log.info("Successfully sent account creation email to: {}", toEmail);

        } catch (MessagingException e) {
            log.error("Failed to send account creation email to: {}", toEmail, e);
        }
    }
}
