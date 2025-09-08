ALTER TABLE todos ADD COLUMN position INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS todos_list_position_idx ON todos(list_id, position);
