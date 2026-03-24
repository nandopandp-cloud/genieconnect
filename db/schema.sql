-- Run this against your Neon database to create the required table

CREATE TABLE IF NOT EXISTS speed_tests (
  id              BIGSERIAL PRIMARY KEY,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  connection_type TEXT,
  effective_type  TEXT,
  ping_ms         FLOAT NOT NULL,
  jitter_ms       FLOAT NOT NULL,
  download_mbps   FLOAT NOT NULL,
  upload_mbps     FLOAT NOT NULL,
  ip_address      TEXT,
  user_agent      TEXT
);

CREATE INDEX IF NOT EXISTS idx_speed_tests_created_at
  ON speed_tests (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_speed_tests_connection_type
  ON speed_tests (connection_type);
