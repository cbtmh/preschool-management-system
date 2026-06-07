package com.vusystem.preschool_management_backend.modules.core.repository;

import com.vusystem.preschool_management_backend.common.entity.enums.MealType;
import com.vusystem.preschool_management_backend.common.entity.operation.MealRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MealRegistrationRepository extends JpaRepository<MealRegistration, Long> {

    // 1. Kiểm tra xem bé đã có record đăng ký/cắt cơm cho 1 bữa cụ thể trong ngày chưa
    Optional<MealRegistration> findByChildIdAndDateAndMealType(Long childId, LocalDate date, MealType mealType);

    // 2. Dành cho Phụ huynh: Lấy danh sách đăng ký suất ăn của 1 bé trong 1 khoảng thời gian (VD: Xem trong tuần/tháng)
    List<MealRegistration> findByChildIdAndDateBetweenOrderByDateAsc(Long childId, LocalDate startDate, LocalDate endDate);

    // 3. Dành cho Giáo viên/Nhà bếp: Lấy danh sách suất ăn của MỘT LỚP trong 1 ngày cụ thể
    // Bắt buộc phải JOIN qua Enrollment để check Class hiện tại và trạng thái học của bé
    @Query("SELECT mr FROM MealRegistration mr " +
           "JOIN Enrollment e ON mr.child.id = e.child.id " +
           "WHERE e.schoolClass.id = :classId " +
           "AND mr.date = :date " +
           "AND e.academicYear.isCurrent = true " + 
           "AND e.status = 'STUDYING' " +
           "ORDER BY mr.child.fullName ASC")
    List<MealRegistration> findMealRegistrationsByClassAndDate(@Param("classId") Long classId, @Param("date") LocalDate date);
    
    // 4. Thống kê tổng số suất ăn theo loại (Sáng, Trưa, Xế) của toàn trường trong 1 khoảng thời gian (Dành cho Admin/Nhà bếp)
    @Query("SELECT mr.mealType, COUNT(mr) FROM MealRegistration mr " +
           "WHERE mr.date >= :startDate AND mr.date <= :endDate AND mr.status = com.vusystem.preschool_management_backend.common.entity.enums.MealRegStatus.REGISTERED " +
           "GROUP BY mr.mealType")
    List<Object[]> countRegisteredMealsByDateRangeGroupByType(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    //5. thống kê suất ăn
    @Query("SELECT mr.child.id, mr.child.fullName, mr.status, mr.mealType, COUNT(mr.id) " +
           "FROM MealRegistration mr " +
           "WHERE mr.child.id IN (SELECT e.child.id FROM Enrollment e WHERE e.schoolClass.id = :classId) " +
           "AND mr.date >= :startDate AND mr.date <= :endDate " +
           "GROUP BY mr.child.id, mr.child.fullName, mr.status, mr.mealType")
    List<Object[]> countMonthlyMealStatsForClass(
            @Param("classId") Long classId,
            @Param("startDate") java.time.LocalDate startDate,
            @Param("endDate") java.time.LocalDate endDate);
}