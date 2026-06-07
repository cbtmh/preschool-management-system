package com.vusystem.preschool_management_backend.modules.core.services;

import com.vusystem.preschool_management_backend.modules.core.dto.request.ChildRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.response.ChildResponse;
import com.vusystem.preschool_management_backend.modules.core.dto.request.AllergyRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ChildService {
    ChildResponse createChild(ChildRequest request);
    ChildResponse updateChild(Long id, ChildRequest request);
    ChildResponse getChildById(Long id);
    List<ChildResponse> getChildrenByParentId(Long parentId); // Lấy danh sách con theo Phụ huynh
    List<ChildResponse> getAllChildren();
    void deleteChild(Long id);
    void importChildrenAndParents(MultipartFile file);
    ChildResponse updateChildAllergies(Long childId, List<AllergyRequest> allergies);
}