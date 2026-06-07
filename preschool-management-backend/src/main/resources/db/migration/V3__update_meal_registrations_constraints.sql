-- 1. (Tùy chọn) Xóa hoặc cập nhật các dòng lỡ bị lưu là 'ATTENDED' trước đó (nếu có)
-- Để đảm bảo lệnh ADD CONSTRAINT bên dưới không bị lỗi do data rác
UPDATE meal_registrations 
SET status = 'REGISTERED' 
WHERE status = 'ATTENDED';

-- 2. Thêm ràng buộc Check để đồng bộ tuyệt đối với Enum MealRegStatus.java
ALTER TABLE meal_registrations
ADD CONSTRAINT chk_meal_reg_status CHECK (status IN ('REGISTERED', 'CANCELLED'));

-- 3. Thêm ràng buộc Unique để 1 bé không thể đăng ký 2 suất cùng loại trong cùng 1 ngày
ALTER TABLE meal_registrations
ADD CONSTRAINT uk_meal_registration UNIQUE (child_id, date, meal_type);