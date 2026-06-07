package com.vusystem.preschool_management_backend.modules.core.services;

import com.vusystem.preschool_management_backend.modules.core.dto.request.ParentCreateRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.request.ParentUpdateRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.response.ParentResponse;

import java.util.List;

public interface ParentService {
    ParentResponse createParent(ParentCreateRequest request);
    ParentResponse updateParent(Long id, ParentUpdateRequest request);
    ParentResponse getParentById(Long id);
    List<ParentResponse> getAllParents();
    void deleteParent(Long id);
}