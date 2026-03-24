-- Run this in Neon dashboard to create tables

CREATE TABLE IF NOT EXISTS speed_tests (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  connection_type VARCHAR(50),
  effective_type VARCHAR(50),
  ping_ms NUMERIC,
  jitter_ms NUMERIC,
  download_mbps NUMERIC,
  upload_mbps NUMERIC,
  ip_address VARCHAR(50),
  user_agent TEXT,
  score NUMERIC,
  quiz_results JSONB,
  min_ping_ms NUMERIC,
  max_ping_ms NUMERIC,
  school_name VARCHAR(255)
);

CREATE INDEX idx_speed_tests_created_at ON speed_tests(created_at DESC);
