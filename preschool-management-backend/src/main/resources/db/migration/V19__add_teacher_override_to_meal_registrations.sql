ALTER TABLE meal_registrations
ADD COLUMN is_teacher_override BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN original_status VARCHAR(20) NULL;
