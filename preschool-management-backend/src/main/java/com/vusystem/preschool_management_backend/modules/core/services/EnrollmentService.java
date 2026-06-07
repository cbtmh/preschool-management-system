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

    // Nghiệp vụ 1: Xếp một học sinh vào lớp
    EnrollmentResponse enrollChild(EnrollmentRequest request);

    // Nghiệp vụ 2: Lấy danh sách toàn bộ học sinh của một lớp (để hiển thị)
    List<EnrollmentResponse> getStudentsInClass(Long classId);

    EnrollmentResponse transferClass(Long childId, TransferClassRequest request);

    void dropOut(Long childId, DropOutRequest request);

    void promoteStudents(ClassPromotionRequest request);

    void graduateClass(Long classId);

    AutoEnrollmentResponse autoEnroll(AutoEnrollmentRequest request);
}