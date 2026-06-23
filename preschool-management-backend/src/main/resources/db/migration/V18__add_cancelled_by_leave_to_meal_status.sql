-- Cập nhật ràng buộc (Constraint) cho bảng meal_registrations để hỗ trợ trạng thái mới
ALTER TABLE meal_registrations DROP CONSTRAINT IF EXISTS chk_meal_reg_status;
ALTER TABLE meal_registrations ADD CONSTRAINT chk_meal_reg_status CHECK (status IN ('REGISTERED', 'CANCELLED', 'CANCELLED_BY_LEAVE'));
