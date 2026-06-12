package com.vusystem.preschool_management_backend.modules.core.services.impl;

import com.vusystem.preschool_management_backend.common.entity.operation.MealMenu;
import com.vusystem.preschool_management_backend.modules.core.dto.request.MealMenuRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.response.MealMenuResponse;
import com.vusystem.preschool_management_backend.modules.core.repository.MealMenuRepository;
import com.vusystem.preschool_management_backend.modules.core.services.MealMenuService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MealMenuServiceImpl implements MealMenuService {

    private final MealMenuRepository mealMenuRepository;

    @Override
    @Transactional
    public MealMenuResponse createMealMenu(MealMenuRequest request) {
        // ngăn chặn tạo thực đơn trùng lặp loại bữa ăn trong cùng một ngày
        if (mealMenuRepository.existsByDateAndMealType(request.getDate(), request.getMealType())) {
            throw new RuntimeException("Thực đơn cho bữa " + request.getMealType() + " ngày " + request.getDate() + " đã tồn tại.");
        }

        MealMenu mealMenu = MealMenu.builder()
                .date(request.getDate())
                .mealType(request.getMealType())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .build();

        MealMenu savedMenu = mealMenuRepository.save(mealMenu);
        return mapToResponse(savedMenu);
    }

    @Override
    @Transactional
    public MealMenuResponse updateMealMenu(Long id, MealMenuRequest request) {
        MealMenu mealMenu = mealMenuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thực đơn với ID: " + id));

        // kiểm tra trùng lặp nếu có thay đổi ngày hoặc loại bữa ăn
        boolean isChangingDateOrType = !mealMenu.getDate().equals(request.getDate()) 
                                    || !mealMenu.getMealType().equals(request.getMealType());
        
        if (isChangingDateOrType && mealMenuRepository.existsByDateAndMealType(request.getDate(), request.getMealType())) {
            throw new RuntimeException("Thực đơn cho bữa " + request.getMealType() + " ngày " + request.getDate() + " đã tồn tại.");
        }

        mealMenu.setDate(request.getDate());
        mealMenu.setMealType(request.getMealType());
        mealMenu.setDescription(request.getDescription());
        mealMenu.setImageUrl(request.getImageUrl());

        MealMenu updatedMenu = mealMenuRepository.save(mealMenu);
        return mapToResponse(updatedMenu);
    }

    @Override
    public MealMenuResponse getMealMenuById(Long id) {
        MealMenu mealMenu = mealMenuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thực đơn với ID: " + id));
        return mapToResponse(mealMenu);
    }

    @Override
    public List<MealMenuResponse> getMealMenusByDate(LocalDate date) {
        return mealMenuRepository.findByDate(date).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<MealMenuResponse> getMealMenusBetweenDates(LocalDate startDate, LocalDate endDate) {
        if (startDate.isAfter(endDate)) {
            throw new RuntimeException("Ngày bắt đầu không thể lớn hơn ngày kết thúc.");
        }
        return mealMenuRepository.findByDateBetweenOrderByDateAsc(startDate, endDate).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteMealMenu(Long id) {
        MealMenu mealMenu = mealMenuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thực đơn với ID: " + id));
        mealMenuRepository.delete(mealMenu);
    }

    private MealMenuResponse mapToResponse(MealMenu mealMenu) {
        return MealMenuResponse.builder()
                .id(mealMenu.getId())
                .date(mealMenu.getDate())
                .mealType(mealMenu.getMealType())
                .description(mealMenu.getDescription())
                .imageUrl(mealMenu.getImageUrl())
                .createdAt(mealMenu.getCreatedAt())
                .updatedAt(mealMenu.getUpdatedAt())
                .build();
    }
}