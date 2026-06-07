-- Xóa các bản tin đang sử dụng file ảnh lưu trữ ở local server
DELETE FROM news WHERE image_url LIKE '/uploads/%';
