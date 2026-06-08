package com.vusystem.preschool_management_backend.modules.core.services.impl;

import com.vusystem.preschool_management_backend.common.entity.enums.Role;
import com.vusystem.preschool_management_backend.common.entity.user.Parent;
import com.vusystem.preschool_management_backend.common.entity.user.User;
import com.vusystem.preschool_management_backend.modules.auth.repository.UserRepository;
import com.vusystem.preschool_management_backend.modules.auth.services.UserService;
import com.vusystem.preschool_management_backend.modules.core.dto.request.ParentCreateRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.request.ParentUpdateRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.response.ParentResponse;
import com.vusystem.preschool_management_backend.modules.core.repository.ParentRepository;
import com.vusystem.preschool_management_backend.modules.core.services.ParentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ParentServiceImpl implements ParentService {

    private final ParentRepository parentRepository;
    private final UserService userService; // Tiêm UserService để xử lý tạo tài khoản
    private final UserRepository userRepository; // Dùng để update trạng thái User khi xóa

    @Override
    @Transactional // Quan trọng: Đảm bảo tính toàn vẹn dữ liệu
    public ParentResponse createParent(ParentCreateRequest request) {
        // Bước 1: Gọi UserService để tạo tài khoản User trước
        // Logic bên trong UserService đã check trùng username (số điện thoại) rồi
        User savedUser = userService.createNewUser(
                request.getUsername(), 
                request.getEmail(),
                Role.PARENT
        );

        // Bước 2: Tạo hồ sơ Parent liên kết với User vừa tạo
        Parent parent = Parent.builder()
                .user(savedUser)
                .fullName(request.getFullName())
                .address(request.getAddress())
                .build();

        Parent savedParent = parentRepository.save(parent);
        return mapToResponse(savedParent);
    }

    @Override
    @Transactional
    public ParentResponse updateParent(Long id, ParentUpdateRequest request) {
        Parent parent = parentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ phụ huynh với ID: " + id));

        parent.setFullName(request.getFullName());
        parent.setAddress(request.getAddress());

        Parent updatedParent = parentRepository.save(parent);
        return mapToResponse(updatedParent);
    }

    @Override
    public ParentResponse getParentById(Long id) {
        Parent parent = parentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ phụ huynh với ID: " + id));
        return mapToResponse(parent);
    }

    @Override
    public List<ParentResponse> getAllParents() {
        // Sử dụng custom query findAllActiveParents để lấy Phụ huynh có User còn hoạt động
        return parentRepository.findAllActiveParents().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteParent(Long id) {
        Parent parent = parentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ phụ huynh với ID: " + id));

        // Soft Delete: Khóa tài khoản User của phụ huynh này
        User user = parent.getUser();
        user.setIsActive(false); 
        userRepository.save(user);
    }

    // --- Helper Method: Map Entity sang Response DTO ---
    private ParentResponse mapToResponse(Parent entity) {
        List<String> childrenNames = entity.getChildren() != null 
            ? entity.getChildren().stream().map(child -> child.getFullName()).collect(Collectors.toList()) 
            : new java.util.ArrayList<>();

        return ParentResponse.builder()
                .id(entity.getId())
                .userId(entity.getUser().getId())
                .username(entity.getUser().getUsername())
                .fullName(entity.getFullName())
                .address(entity.getAddress())
                .childrenNames(childrenNames)
                .build();
    }
}