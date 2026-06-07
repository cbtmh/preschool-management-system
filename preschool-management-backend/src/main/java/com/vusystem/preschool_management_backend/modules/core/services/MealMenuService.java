package com.vusystem.preschool_management_backend.modules.core.services;

import com.vusystem.preschool_management_backend.modules.core.dto.request.MealMenuRequest;
import com.vusystem.preschool_management_backend.modules.core.dto.response.MealMenuResponse;

import java.time.LocalDate;
import java.util.List;

public interface MealMenuService {
    MealMenuResponse createMealMenu(MealMenuRequest request);
    
    MealMenuResponse updateMealMenu(Long id, MealMenuRequest request);
    
    MealMenuResponse getMealMenuById(Long id);
    
    List<MealMenuResponse> getMealMenusByDate(LocalDate date);
    
    List<MealMenuResponse> getMealMenusBetweenDates(LocalDate startDate, LocalDate endDate);
    
    void deleteMealMenu(Long id);
}