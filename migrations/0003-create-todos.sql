CREATE TABLE todos (
  id UUID PRIMARY KEY,
  list_id UUID REFERENCES lists(id),
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);
