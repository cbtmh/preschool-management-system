package com.vusystem.preschool_management_backend.modules.auth.services;

public interface SmsService {
    void sendTemporaryPassword(String phone, String password);
}
