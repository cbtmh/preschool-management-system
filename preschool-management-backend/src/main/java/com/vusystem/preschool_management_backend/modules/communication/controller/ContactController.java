package com.vusystem.preschool_management_backend.modules.communication.controller;

import com.vusystem.preschool_management_backend.modules.communication.dto.request.ContactRequest;
import com.vusystem.preschool_management_backend.modules.communication.services.MailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/public/contact")
@RequiredArgsConstructor
public class ContactController {

    private final MailService mailService;

    @PostMapping
    public ResponseEntity<?> submitContactForm(@Valid @RequestBody ContactRequest request) {
        mailService.processContactRequest(request);
        return ResponseEntity.ok(Map.of(
            "message", "Contact request submitted successfully",
            "status", "success"
        ));
    }
}
