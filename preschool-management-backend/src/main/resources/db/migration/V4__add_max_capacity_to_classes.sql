-- Thêm giới hạn sĩ số chuẩn cho các lớp học (Mặc định là 30 trẻ)
ALTER TABLE classes 
ADD COLUMN max_capacity INT NOT NULL DEFAULT 30;