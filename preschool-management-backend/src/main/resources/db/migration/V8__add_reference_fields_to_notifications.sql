-- Thêm 2 cột reference_type và reference_id vào bảng notifications
ALTER TABLE notifications ADD COLUMN reference_type VARCHAR(255);
ALTER TABLE notifications ADD COLUMN reference_id BIGINT;

-- Cập nhật các bản ghi cũ từ loại ALL sang SCHOOL
UPDATE notifications SET type = 'SCHOOL' WHERE type = 'ALL';
