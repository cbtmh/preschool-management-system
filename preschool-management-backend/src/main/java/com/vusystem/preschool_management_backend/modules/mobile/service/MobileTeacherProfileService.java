package com.vusystem.preschool_management_backend.modules.mobile.service;

import com.vusystem.preschool_management_backend.modules.mobile.dto.request.MobileTeacherProfileRequest;

public interface MobileTeacherProfileService {
    String updateProfile(String currentUsername, MobileTeacherProfileRequest request);
}
