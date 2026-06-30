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

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vusystem.preschool_management_backend.modules.auth.repository.UserRepository;

@Service
@Slf4j
public class ExpoPushService {

    private static final String EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
    private final RestTemplate restTemplate;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public ExpoPushService(UserRepository userRepository) {
        this.restTemplate = new RestTemplate();
        this.userRepository = userRepository;
        this.objectMapper = new ObjectMapper();
    }

    public boolean sendPushNotifications(List<String> pushTokens, String title, String body, Map<String, Object> data) {
        if (pushTokens == null || pushTokens.isEmpty()) {
            return false;
        }

        List<Map<String, Object>> messages = new ArrayList<>();

        for (String token : pushTokens) {
            if (token != null && (token.startsWith("ExponentPushToken") || token.startsWith("ExpoPushToken"))) {
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
            return false;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        headers.set("Accept-Encoding", "gzip, deflate");

        HttpEntity<List<Map<String, Object>>> request = new HttpEntity<>(messages, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(EXPO_PUSH_URL, request, String.class);
            String responseBody = response.getBody();
            log.info("Sent push notifications successfully. Response: {}", responseBody);
            
            if (responseBody != null) {
                try {
                    JsonNode root = objectMapper.readTree(responseBody);
                    JsonNode dataNode = root.path("data");
                    if (dataNode.isArray()) {
                        for (int i = 0; i < dataNode.size(); i++) {
                            JsonNode resultNode = dataNode.get(i);
                            if ("error".equals(resultNode.path("status").asText())) {
                                JsonNode detailsNode = resultNode.path("details");
                                if ("DeviceNotRegistered".equals(detailsNode.path("error").asText())) {
                                    if (i < messages.size()) {
                                        String tokenToRemove = (String) messages.get(i).get("to");
                                        if (tokenToRemove != null) {
                                            userRepository.removeDeviceToken(tokenToRemove);
                                            log.info("Removed stale push token: {}", tokenToRemove);
                                        }
                                    }
                                }
                            }
                        }
                    }
                } catch (Exception parseEx) {
                    log.error("Failed to parse Expo response or clean stale tokens: {}", parseEx.getMessage());
                }
            }
            
            return true;
        } catch (Exception e) {
            log.error("Failed to send Expo push notifications: {}", e.getMessage());
            return false;
        }
    }
}
