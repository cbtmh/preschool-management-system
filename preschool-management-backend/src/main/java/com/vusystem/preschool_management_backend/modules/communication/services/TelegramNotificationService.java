package com.vusystem.preschool_management_backend.modules.communication.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class TelegramNotificationService {

    @Value("${telegram.bot.token}")
    private String botToken;

    @Value("${telegram.chat.id}")
    private String chatId;

    private final RestTemplate restTemplate;

    public TelegramNotificationService() {
        this.restTemplate = new RestTemplate();
    }

    public void sendIncidentAlert(String title, String description, String className, String teacherName, String severity, java.util.List<String> imageUrls) {
        if (botToken == null || botToken.isEmpty() || "your_bot_token_here".equals(botToken) || 
            chatId == null || chatId.isEmpty() || "your_chat_id_here".equals(chatId)) {
            System.out.println("Telegram bot token or chat ID is not configured. Skipping telegram notification.");
            return;
        }

        CompletableFuture.runAsync(() -> {
            String url = "https://api.telegram.org/bot" + botToken + "/sendMessage";

            String emoji = "🚨"; 
            if ("LOW".equalsIgnoreCase(severity) || "THẤP".equalsIgnoreCase(severity)) {
                emoji = "ℹ️";
            } else if ("MEDIUM".equalsIgnoreCase(severity) || "TRUNG_BÌNH".equalsIgnoreCase(severity)) {
                emoji = "⚠️";
            }

            String text = String.format(
                    "%s *[CẢNH BÁO SỰ CỐ MỚI]* %s\n\n" +
                    "👤 *Giáo viên báo cáo:* %s\n" +
                    "🏫 *Lớp:* %s\n" +
                    "📝 *Tiêu đề:* %s\n" +
                    "📄 *Mô tả:* %s\n\n" +
                    "👉 _Vui lòng truy cập Admin Dashboard để xem chi tiết và xử lý._",
                    emoji, emoji, teacherName, className, title, description
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = new HashMap<>();
            body.put("chat_id", chatId);
            body.put("text", text);
            body.put("parse_mode", "Markdown");

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            try {
                restTemplate.postForObject(url, request, String.class);
                System.out.println("Successfully sent telegram alert for incident: " + title);
                
                // đính kèm hình ảnh nếu có
                if (imageUrls != null && !imageUrls.isEmpty()) {
                    String photoApiUrl = "https://api.telegram.org/bot" + botToken + "/sendPhoto";
                    for (String imgUrl : imageUrls) {
                        Map<String, Object> photoBody = new HashMap<>();
                        photoBody.put("chat_id", chatId);
                        photoBody.put("photo", imgUrl);
                        HttpEntity<Map<String, Object>> photoRequest = new HttpEntity<>(photoBody, headers);
                        try {
                            restTemplate.postForObject(photoApiUrl, photoRequest, String.class);
                        } catch (Exception photoEx) {
                            System.err.println("Failed to send photo to Telegram: " + photoEx.getMessage());
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("Failed to send telegram alert: " + e.getMessage());
            }
        });
    }
}
