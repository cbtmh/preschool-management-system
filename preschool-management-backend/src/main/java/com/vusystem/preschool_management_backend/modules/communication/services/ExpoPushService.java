package com.vusystem.preschool_management_backend.modules.communication.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class ExpoPushService {

    private static final String EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
    private final RestTemplate restTemplate;

    public ExpoPushService() {
        this.restTemplate = new RestTemplate();
    }

    public void sendPushNotifications(List<String> pushTokens, String title, String body, Map<String, Object> data) {
        if (pushTokens == null || pushTokens.isEmpty()) {
            return;
        }

        List<Map<String, Object>> messages = new ArrayList<>();

        for (String token : pushTokens) {
            // Validate token format if needed
            if (token != null && token.startsWith("ExponentPushToken")) {
                Map<String, Object> message = new HashMap<>();
                message.put("to", token);
                message.put("title", title);
                message.put("body", body);
                message.put("sound", "default");
                if (data != null) {
                    message.put("data", data);
                }
                messages.add(message);
            }
        }

        if (messages.isEmpty()) {
            return;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        headers.set("Accept-Encoding", "gzip, deflate");

        HttpEntity<List<Map<String, Object>>> request = new HttpEntity<>(messages, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(EXPO_PUSH_URL, request, String.class);
            log.info("Sent push notifications successfully. Response: {}", response.getBody());
        } catch (Exception e) {
            log.error("Failed to send Expo push notifications: {}", e.getMessage());
        }
    }
}
