-- Create audit logs table for security monitoring
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    userId VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resourceId VARCHAR(255),
    details JSONB,
    ipAddress INET,
    userAgent TEXT,
    success BOOLEAN NOT NULL DEFAULT false,
    errorMessage TEXT,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(userId);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(createdAt);
CREATE INDEX IF NOT EXISTS idx_audit_logs_success ON audit_logs(success);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ipAddress);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(userId, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_action ON audit_logs(resource, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_failed_attempts ON audit_logs(success, createdAt) WHERE success = false;