package com.vusystem.preschool_management_backend.modules.mobile.repository;

import com.vusystem.preschool_management_backend.common.entity.operation.DailyLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyLogRepository extends JpaRepository<DailyLog, Long> {

    // Lấy toàn bộ sổ tay của một lớp trong một ngày, gộp luôn thông tin Child để tránh N+1 Query
    @Query("SELECT d FROM DailyLog d JOIN FETCH d.child c WHERE d.schoolClass.id = :classId AND d.date = :date")
    List<DailyLog> findByClassIdAndDate(@Param("classId") Long classId, @Param("date") LocalDate date);

    // Dùng để tra cứu nhanh 1 bé (khi cần)
    Optional<DailyLog> findByChildIdAndDate(Long childId, LocalDate date);

    // Lấy lịch sử điểm danh của 1 bé trong khoảng thời gian
    List<DailyLog> findByChildIdAndDateBetweenOrderByDateAsc(Long childId, LocalDate startDate, LocalDate endDate);

    // Thống kê điểm danh của cả lớp trong 1 tháng
    @Query("SELECT d.child.id, d.attendanceStatus, COUNT(d.id) " +
           "FROM DailyLog d " +
           "WHERE d.schoolClass.id = :classId " +
           "AND d.date >= :startDate AND d.date <= :endDate " +
           "GROUP BY d.child.id, d.attendanceStatus")
    List<Object[]> countAttendanceStatsForClass(
            @Param("classId") Long classId,
            @Param("startDate") java.time.LocalDate startDate,
            @Param("endDate") java.time.LocalDate endDate);
}