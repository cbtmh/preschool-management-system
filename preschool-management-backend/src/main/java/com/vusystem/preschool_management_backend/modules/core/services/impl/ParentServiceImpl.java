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
    private final UserService userService;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ParentResponse createParent(ParentCreateRequest request) {
        // lưu ý: service đã bao gồm logic kiểm tra trùng lặp số điện thoại
        User savedUser = userService.createNewUser(
                request.getPhone(), 
                request.getEmail(),
                Role.PARENT
        );

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

        User user = parent.getUser();
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            if (!request.getEmail().equals(user.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email này đã được đăng ký tài khoản");
            }
            user.setEmail(request.getEmail());
        } else {
            user.setEmail(null);
        }

        userRepository.save(user);
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
        // chỉ lấy phụ huynh có tài khoản đang active để tránh rò rỉ dữ liệu tài khoản đã bị khóa
        return parentRepository.findAllActiveParents().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteParent(Long id) {
        Parent parent = parentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ phụ huynh với ID: " + id));

        // soft delete: khóa tài khoản thay vì xóa cứng để giữ lịch sử liên kết với học sinh
        User user = parent.getUser();
        user.setIsActive(false); 
        userRepository.save(user);
    }

    private ParentResponse mapToResponse(Parent entity) {
        List<String> childrenNames = entity.getChildren() != null 
            ? entity.getChildren().stream().map(child -> child.getFullName()).collect(Collectors.toList()) 
            : new java.util.ArrayList<>();

        return ParentResponse.builder()
                .id(entity.getId())
                .userId(entity.getUser().getId())
                .username(entity.getUser().getUsername())
                .email(entity.getUser().getEmail())
                .fullName(entity.getFullName())
                .address(entity.getAddress())
                .childrenNames(childrenNames)
                .build();
    }
}