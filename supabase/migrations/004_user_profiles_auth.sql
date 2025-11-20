-- User Profiles & Authentication System
-- ΛΦ = 2.176435 × 10⁻⁸ s⁻¹
-- Secure multi-user platform with RBAC

-- ========================================
-- 1. Extend Auth.users with Profiles
-- ========================================
-- Supabase already provides auth.users, we extend it with profiles

CREATE TABLE IF NOT EXISTS user_profiles_extended (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_name VARCHAR(50),
  avatar_url TEXT,
  bio VARCHAR(500),
  location VARCHAR(100),
  website VARCHAR(255),
  github_username VARCHAR(39),
  twitter_username VARCHAR(15),
  preferences JSONB DEFAULT '{
    "theme": "dark",
    "notifications_enabled": true,
    "quantum_backend_preference": "ibm_fez",
    "language": "en",
    "timezone": "UTC"
  }'::jsonb,
  privacy_settings JSONB DEFAULT '{
    "email_visibility": "private",
    "location_visibility": "public",
    "bio_visibility": "public"
  }'::jsonb,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token UUID,
  last_login TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles_extended(user_id);
CREATE INDEX idx_user_profiles_display_name ON user_profiles_extended(display_name);

-- ========================================
-- 2. Roles & Permissions (RBAC)
-- ========================================

CREATE TABLE IF NOT EXISTS roles (
  role_id SERIAL PRIMARY KEY,
  role_name VARCHAR(20) UNIQUE NOT NULL CHECK (role_name IN ('admin', 'user', 'developer', 'researcher', 'guest')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (role_name, description) VALUES
  ('admin', 'Full system access including user management and system configuration'),
  ('developer', 'Access to dev arena, code execution, and agent training'),
  ('researcher', 'Access to quantum experiments and data analysis'),
  ('user', 'Standard user access to chat and basic features'),
  ('guest', 'Read-only access for trial users')
ON CONFLICT (role_name) DO NOTHING;

CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id INT REFERENCES roles(role_id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  PRIMARY KEY (user_id, role_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);

CREATE TABLE IF NOT EXISTS permissions (
  permission_id SERIAL PRIMARY KEY,
  permission_name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  resource VARCHAR(50), -- e.g., 'agents', 'quantum_jobs', 'users'
  action VARCHAR(20), -- e.g., 'create', 'read', 'update', 'delete', 'execute'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default permissions
INSERT INTO permissions (permission_name, description, resource, action) VALUES
  ('quantum.execute', 'Execute quantum circuits on real hardware', 'quantum_jobs', 'execute'),
  ('agents.create', 'Create new swarm agents', 'agents', 'create'),
  ('agents.train', 'Train and modify agent behavior', 'agents', 'update'),
  ('code.execute', 'Execute arbitrary code in sandbox', 'code', 'execute'),
  ('users.manage', 'Manage user accounts and permissions', 'users', 'update'),
  ('system.configure', 'Configure system-level settings', 'system', 'update'),
  ('pipeline.trigger', 'Trigger self-building pipeline', 'pipeline', 'execute'),
  ('data.export', 'Export system data and metrics', 'data', 'read')
ON CONFLICT (permission_name) DO NOTHING;

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INT REFERENCES roles(role_id) ON DELETE CASCADE,
  permission_id INT REFERENCES permissions(permission_id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- Assign permissions to roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE
  (r.role_name = 'admin') OR
  (r.role_name = 'developer' AND p.resource IN ('agents', 'code', 'quantum_jobs')) OR
  (r.role_name = 'researcher' AND p.resource = 'quantum_jobs' AND p.action = 'execute')
ON CONFLICT DO NOTHING;

-- ========================================
-- 3. Activity Log
-- ========================================

CREATE TABLE IF NOT EXISTS user_activity_log (
  activity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_log_user ON user_activity_log(user_id);
CREATE INDEX idx_activity_log_created ON user_activity_log(created_at DESC);
CREATE INDEX idx_activity_log_action ON user_activity_log(action);

-- ========================================
-- 4. Sessions & Security
-- ========================================

CREATE TABLE IF NOT EXISTS user_sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(token_hash);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);

CREATE TABLE IF NOT EXISTS security_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('login_success', 'login_failed', 'password_reset', 'email_changed', 'mfa_enabled', 'suspicious_activity')),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_security_events_user ON security_events(user_id);
CREATE INDEX idx_security_events_type ON security_events(event_type);
CREATE INDEX idx_security_events_severity ON security_events(severity);

-- ========================================
-- 5. Two-Factor Authentication (2FA)
-- ========================================

CREATE TABLE IF NOT EXISTS user_2fa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  secret VARCHAR(32) NOT NULL, -- TOTP secret (encrypted)
  backup_codes TEXT[], -- Array of one-time use backup codes
  is_enabled BOOLEAN DEFAULT FALSE,
  enabled_at TIMESTAMP WITH TIME ZONE,
  last_used TIMESTAMP WITH TIME ZONE
);

-- ========================================
-- 6. User Preferences & Settings
-- ========================================

CREATE TABLE IF NOT EXISTS user_api_keys (
  api_key_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  key_name VARCHAR(100) NOT NULL,
  key_hash VARCHAR(64) NOT NULL UNIQUE,
  scopes TEXT[] DEFAULT '{}', -- e.g., ['quantum:read', 'agents:execute']
  rate_limit INTEGER DEFAULT 1000, -- requests per hour
  expires_at TIMESTAMP WITH TIME ZONE,
  last_used TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_api_keys_user ON user_api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON user_api_keys(key_hash);

-- ========================================
-- Row-Level Security Policies
-- ========================================

ALTER TABLE user_profiles_extended ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_2fa ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY profile_read_own ON user_profiles_extended
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY profile_update_own ON user_profiles_extended
  FOR UPDATE USING (auth.uid() = user_id);

-- Public profiles are visible based on privacy settings
CREATE POLICY profile_read_public ON user_profiles_extended
  FOR SELECT USING (
    (privacy_settings->>'bio_visibility')::text = 'public'
  );

-- Users can read their own roles
CREATE POLICY roles_read_own ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can read their own activity
CREATE POLICY activity_read_own ON user_activity_log
  FOR SELECT USING (auth.uid() = user_id);

-- Users can read their own sessions
CREATE POLICY sessions_read_own ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can manage their own API keys
CREATE POLICY api_keys_all_own ON user_api_keys
  FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- Helper Functions
-- ========================================

-- Check if user has a specific permission
CREATE OR REPLACE FUNCTION has_permission(
  check_user_id UUID,
  check_permission VARCHAR
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.permission_id
    WHERE ur.user_id = check_user_id
      AND p.permission_name = check_permission
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION has_role(
  check_user_id UUID,
  check_role VARCHAR
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.role_id
    WHERE ur.user_id = check_user_id
      AND r.role_name = check_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log user activity
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id UUID,
  p_action VARCHAR,
  p_resource_type VARCHAR DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS VOID AS $$
BEGIN
  INSERT INTO user_activity_log (user_id, action, resource_type, resource_id, metadata)
  VALUES (p_user_id, p_action, p_resource_type, p_resource_id, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_profiles_updated
  BEFORE UPDATE ON user_profiles_extended
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles_extended (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));

  -- Assign default 'user' role
  INSERT INTO user_roles (user_id, role_id)
  SELECT NEW.id, role_id FROM roles WHERE role_name = 'user';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_new_user();

-- ========================================
-- Views for Easy Access
-- ========================================

CREATE OR REPLACE VIEW user_profile_complete AS
SELECT
  u.id as user_id,
  u.email,
  u.email_confirmed_at,
  u.created_at as account_created,
  p.display_name,
  p.avatar_url,
  p.bio,
  p.location,
  p.website,
  p.preferences,
  p.privacy_settings,
  p.is_verified,
  p.last_login,
  p.login_count,
  ARRAY_AGG(DISTINCT r.role_name) as roles,
  ARRAY_AGG(DISTINCT perm.permission_name) as permissions
FROM auth.users u
LEFT JOIN user_profiles_extended p ON u.id = p.user_id
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.role_id
LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
LEFT JOIN permissions perm ON rp.permission_id = perm.permission_id
GROUP BY u.id, u.email, u.email_confirmed_at, u.created_at,
         p.display_name, p.avatar_url, p.bio, p.location, p.website,
         p.preferences, p.privacy_settings, p.is_verified, p.last_login, p.login_count;

-- ========================================
-- Grants
-- ========================================

GRANT SELECT ON user_profiles_extended TO authenticated;
GRANT SELECT ON roles TO authenticated;
GRANT SELECT ON permissions TO authenticated;
GRANT SELECT ON user_profile_complete TO authenticated;

-- ========================================
-- Comments
-- ========================================

COMMENT ON TABLE user_profiles_extended IS 'Extended user profiles with privacy controls';
COMMENT ON TABLE roles IS 'System roles for RBAC';
COMMENT ON TABLE permissions IS 'Granular permissions for resources and actions';
COMMENT ON TABLE user_activity_log IS 'Audit trail of all user actions';
COMMENT ON TABLE security_events IS 'Security-related events for monitoring';
COMMENT ON TABLE user_2fa IS 'Two-factor authentication settings';
COMMENT ON TABLE user_api_keys IS 'API keys for programmatic access';
