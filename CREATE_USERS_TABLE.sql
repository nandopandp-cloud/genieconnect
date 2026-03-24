-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert demo user
INSERT INTO users (name, email, password_hash, created_at)
VALUES
  ('Fernando', 'fernando@jovensgenios.com', 'seedsalt99:c4b2f5078c890cc56729b0eb4423eb3f33b303ae4600c66703fc0c96d962c27d', CURRENT_TIMESTAMP),
  ('Nathália', 'nathalia@gmail.com', 'seedsalt99:c4b2f5078c890cc56729b0eb4423eb3f33b303ae4600c66703fc0c96d962c27d', CURRENT_TIMESTAMP),
  ('João', 'joao.figueroa@jovensgenios.com', 'seedsalt99:c4b2f5078c890cc56729b0eb4423eb3f33b303ae4600c66703fc0c96d962c27d', CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;
