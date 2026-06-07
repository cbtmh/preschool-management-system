package com.vusystem.preschool_management_backend.modules.core.repository;

import com.vusystem.preschool_management_backend.common.entity.operation.MealMenu;
import com.vusystem.preschool_management_backend.common.entity.enums.MealType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MealMenuRepository extends JpaRepository<MealMenu, Long> {

    // 1. Lấy toàn bộ thực đơn trong 1 ngày cụ thể (Dành cho màn hình "Thực đơn hôm nay")
    List<MealMenu> findByDate(LocalDate date);

    // 2. Lấy thực đơn trong một khoảng thời gian (Dành cho màn hình "Thực đơn tuần/tháng")
    // Sắp xếp tăng dần theo ngày để Client dễ render UI
    List<MealMenu> findByDateBetweenOrderByDateAsc(LocalDate startDate, LocalDate endDate);

    // 3. Lấy chính xác 1 bữa ăn trong 1 ngày (VD: Lấy thông tin bữa trưa ngày 15/05)
    Optional<MealMenu> findByDateAndMealType(LocalDate date, MealType mealType);

    // 4. Validate nghiệp vụ: Tránh trường hợp Admin tạo trùng 2 bữa sáng trong cùng 1 ngày
    boolean existsByDateAndMealType(LocalDate date, MealType mealType);
}