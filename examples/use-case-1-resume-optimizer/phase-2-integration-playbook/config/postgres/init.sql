-- =============================================================================
-- PostgreSQL Initialization Script
-- =============================================================================
-- Resumax - AI Resume Optimization App
-- Blueprint C: AI Platform / AI Webapp
-- =============================================================================

-- Note: This script runs automatically on first container start
-- The main 'resumax' database is created by POSTGRES_DB env var

-- Create additional databases for other services
CREATE DATABASE keycloak;
CREATE DATABASE temporal;
CREATE DATABASE temporal_visibility;

-- Connect to main resumax database and set up extensions
\c resumax;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Optional: Enable pgvector for semantic search (P2 feature)
-- Requires pgvector extension to be installed in the container
-- CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================================================
-- SCHEMA DEFINITIONS
-- =============================================================================

-- Users table (synced from Keycloak)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keycloak_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan VARCHAR(50) NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'lifetime')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Resumes table
CREATE TABLE IF NOT EXISTS resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    original_file_url TEXT,
    parsed_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resume versions table
CREATE TABLE IF NOT EXISTS resume_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content JSONB NOT NULL,
    source VARCHAR(50) NOT NULL DEFAULT 'upload' CHECK (source IN ('upload', 'optimization', 'manual_edit')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(resume_id, version_number)
);

-- Optimization runs table
CREATE TABLE IF NOT EXISTS optimization_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    input_version_id UUID REFERENCES resume_versions(id),
    output_version_id UUID REFERENCES resume_versions(id),
    job_description_text TEXT,
    run_type VARCHAR(50) NOT NULL CHECK (run_type IN ('optimize', 'roast', 'cover_letter')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    resumax_score INTEGER CHECK (resumax_score >= 0 AND resumax_score <= 100),
    ai_feedback JSONB,
    workflow_id VARCHAR(255),
    tokens_used INTEGER DEFAULT 0,
    duration_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Export jobs table
CREATE TABLE IF NOT EXISTS export_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version_id UUID NOT NULL REFERENCES resume_versions(id) ON DELETE CASCADE,
    format VARCHAR(50) NOT NULL CHECK (format IN ('pdf', 'docx', 'txt')),
    template_id VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    output_url TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    preview_url TEXT,
    template_type VARCHAR(50) NOT NULL CHECK (template_type IN ('latex', 'html')),
    template_content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_keycloak_id ON users(keycloak_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

-- Resumes indexes
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON resumes(created_at DESC);

-- Resume versions indexes
CREATE INDEX IF NOT EXISTS idx_resume_versions_resume_id ON resume_versions(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_versions_created_at ON resume_versions(created_at DESC);

-- Optimization runs indexes
CREATE INDEX IF NOT EXISTS idx_optimization_runs_resume_id ON optimization_runs(resume_id);
CREATE INDEX IF NOT EXISTS idx_optimization_runs_status ON optimization_runs(status);
CREATE INDEX IF NOT EXISTS idx_optimization_runs_created_at ON optimization_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_optimization_runs_workflow_id ON optimization_runs(workflow_id);

-- Export jobs indexes
CREATE INDEX IF NOT EXISTS idx_export_jobs_version_id ON export_jobs(version_id);
CREATE INDEX IF NOT EXISTS idx_export_jobs_status ON export_jobs(status);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Apply updated_at trigger to tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resumes_updated_at
    BEFORE UPDATE ON resumes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SEED DATA (Development Only)
-- =============================================================================

-- Insert default templates
INSERT INTO templates (id, name, description, template_type, template_content, is_active, is_premium)
VALUES 
    ('professional-classic', 'Professional Classic', 'A clean, traditional resume format perfect for corporate roles', 'latex', 
     '% Professional Classic Template
\documentclass[11pt,a4paper]{article}
\usepackage[margin=1in]{geometry}
\usepackage{enumitem}
\usepackage{titlesec}

\titleformat{\section}{\large\bfseries}{\thesection}{1em}{}[\titlerule]

\begin{document}
% Template content placeholder
\end{document}',
     true, false),
    
    ('modern-minimal', 'Modern Minimal', 'A sleek, minimalist design with clean lines', 'latex',
     '% Modern Minimal Template
\documentclass[11pt,a4paper]{article}
\usepackage[margin=0.75in]{geometry}
\usepackage{fontspec}
\usepackage{titlesec}

\setmainfont{Helvetica Neue}
\titleformat{\section}{\large\bfseries}{}{0em}{}

\begin{document}
% Template content placeholder
\end{document}',
     true, false),
    
    ('ats-optimized', 'ATS Optimized', 'Designed to pass Applicant Tracking Systems with high compatibility', 'html',
     '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.4; }
        h1 { font-size: 18pt; margin-bottom: 5px; }
        h2 { font-size: 14pt; border-bottom: 1px solid #333; margin-top: 15px; }
        ul { margin: 5px 0; padding-left: 20px; }
    </style>
</head>
<body>
<!-- Template content placeholder -->
</body>
</html>',
     true, false)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- GRANTS (for service accounts if needed)
-- =============================================================================

-- If using separate service account, uncomment and modify:
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO resumax_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO resumax_app;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE users IS 'User profiles synced from Keycloak';
COMMENT ON TABLE subscriptions IS 'User subscription and billing information';
COMMENT ON TABLE resumes IS 'User uploaded resumes';
COMMENT ON TABLE resume_versions IS 'Version history for each resume';
COMMENT ON TABLE optimization_runs IS 'AI optimization, roast, and cover letter runs';
COMMENT ON TABLE export_jobs IS 'PDF/DOCX export job tracking';
COMMENT ON TABLE templates IS 'Resume templates for PDF generation';
COMMENT ON TABLE audit_logs IS 'Audit trail for user actions';

-- Print success message
DO $$
BEGIN
    RAISE NOTICE 'Resumax database initialization completed successfully!';
END $$;
