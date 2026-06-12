package com.vusystem.preschool_management_backend.modules.core.services;

import com.vusystem.preschool_management_backend.modules.core.dto.request.EnrollmentRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.request.TransferClassRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.response.EnrollmentResponse;
import com.vusystem.preschool_management_backend.modules.core.dto.request.ClassPromotionRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.request.DropOutRequest;

import java.util.List;
import com.vusystem.preschool_management_backend.modules.core.dto.request.AutoEnrollmentRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.response.AutoEnrollmentResponse;

public interface EnrollmentService {

    EnrollmentResponse enrollChild(EnrollmentRequest request);

    List<EnrollmentResponse> getStudentsInClass(Long classId);

    EnrollmentResponse transferClass(Long childId, TransferClassRequest request);

    void dropOut(Long childId, DropOutRequest request);

    void promoteStudents(ClassPromotionRequest request);

    void graduateClass(Long classId);

    AutoEnrollmentResponse autoEnroll(AutoEnrollmentRequest request);
}