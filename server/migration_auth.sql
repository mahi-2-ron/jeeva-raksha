-- ============================================================
--  Jeeva Raksha — Auth Migration (Safe Version)
--  Adds login tracking columns and log table
-- ============================================================

-- 1. Add auth columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;

-- 2. Login activity log table
CREATE TABLE IF NOT EXISTS login_logs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    email       VARCHAR(200),
    action      VARCHAR(20) NOT NULL CHECK (action IN ('login_success','login_failed','logout','demo_login','locked')),
    ip_address  VARCHAR(45),
    user_agent  TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_logs_user ON login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_created ON login_logs(created_at DESC);
