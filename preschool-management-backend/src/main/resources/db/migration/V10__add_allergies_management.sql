-- Thêm cột allergy_declared vào bảng children
ALTER TABLE children ADD COLUMN IF NOT EXISTS allergy_declared BOOLEAN NOT NULL DEFAULT FALSE;

-- Tạo bảng allergies
CREATE TABLE IF NOT EXISTS allergies (
    id BIGSERIAL PRIMARY KEY,
    child_id BIGINT NOT NULL,
    allergen VARCHAR(255) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_allergies_child FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
);

-- Index để tối ưu tìm kiếm dị ứng của học sinh
CREATE INDEX IF NOT EXISTS idx_allergies_child_id ON allergies(child_id);
