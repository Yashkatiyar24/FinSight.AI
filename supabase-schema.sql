-- FinSight.AI Supabase Database Schema
-- Production SaaS Schema for Financial Transaction Management

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE plan_tier AS ENUM ('free', 'pro', 'business');
CREATE TYPE file_type AS ENUM ('csv', 'xls', 'xlsx', 'pdf');
CREATE TYPE upload_status AS ENUM ('received', 'parsing', 'parsed', 'failed');
CREATE TYPE report_type AS ENUM ('expense', 'tax', 'pnl');
CREATE TYPE subscription_status AS ENUM ('active', 'trialing', 'canceled', 'past_due');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR UNIQUE NOT NULL,
    full_name VARCHAR,
    company_name VARCHAR,
    gstin VARCHAR(15),
    address TEXT,
    phone VARCHAR(20),
    plan_tier plan_tier DEFAULT 'free',
    verified BOOLEAN DEFAULT false,
    notification_email BOOLEAN DEFAULT true,
    notification_sms BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Uploads table
CREATE TABLE uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type file_type NOT NULL,
    size_bytes INTEGER NOT NULL,
    status upload_status DEFAULT 'received',
    parsed_rows INTEGER DEFAULT 0,
    failed_rows INTEGER DEFAULT 0,
    error_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tx_date DATE NOT NULL,
    description TEXT NOT NULL,
    merchant TEXT,
    amount NUMERIC(14,2) NOT NULL,
    gst_rate NUMERIC(5,2),
    gst_amount NUMERIC(14,2),
    gstin VARCHAR(15),
    category TEXT,
    final_category TEXT,
    ml_confidence NUMERIC(4,2),
    ml_predicted_category TEXT,
    source_upload_id UUID REFERENCES uploads(id),
    rule_applied_id UUID,
    is_income BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rules table
CREATE TABLE rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    enabled BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    match_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type report_type NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    file_url TEXT,
    file_path TEXT,
    metrics JSONB,
    parameters JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Billing table
CREATE TABLE billing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    razorpay_subscription_id TEXT UNIQUE,
    razorpay_customer_id TEXT,
    plan plan_tier NOT NULL DEFAULT 'free',
    status subscription_status DEFAULT 'active',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    trial_ends_at TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Category feedback for ML training
CREATE TABLE category_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    original_category TEXT,
    corrected_category TEXT NOT NULL,
    confidence_score NUMERIC(4,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_plan_tier ON users(plan_tier);

CREATE INDEX idx_uploads_user_id ON uploads(user_id);
CREATE INDEX idx_uploads_status ON uploads(status);
CREATE INDEX idx_uploads_created_at ON uploads(created_at);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_tx_date ON transactions(tx_date);
CREATE INDEX idx_transactions_category ON transactions(final_category);
CREATE INDEX idx_transactions_amount ON transactions(amount);
CREATE INDEX idx_transactions_upload_id ON transactions(source_upload_id);

CREATE INDEX idx_rules_user_id ON rules(user_id);
CREATE INDEX idx_rules_enabled ON rules(enabled);
CREATE INDEX idx_rules_priority ON rules(priority);

CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_reports_created_at ON reports(created_at);

CREATE INDEX idx_billing_user_id ON billing(user_id);
CREATE INDEX idx_billing_subscription_id ON billing(razorpay_subscription_id);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rules_updated_at BEFORE UPDATE ON rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_updated_at BEFORE UPDATE ON billing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_feedback ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Uploads policies
CREATE POLICY "Users can view own uploads" ON uploads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own uploads" ON uploads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own uploads" ON uploads
    FOR UPDATE USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Rules policies
CREATE POLICY "Users can view own rules" ON rules
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rules" ON rules
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rules" ON rules
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rules" ON rules
    FOR DELETE USING (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Users can view own reports" ON reports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports" ON reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Billing policies
CREATE POLICY "Users can view own billing" ON billing
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own billing" ON billing
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own billing" ON billing
    FOR UPDATE USING (auth.uid() = user_id);

-- Audit logs policies
CREATE POLICY "Users can view own audit logs" ON audit_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own audit logs" ON audit_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Category feedback policies
CREATE POLICY "Users can view own feedback" ON category_feedback
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback" ON category_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Storage buckets setup (Run these in Supabase Dashboard -> Storage)
-- bucket: uploads-raw (private)
-- bucket: reports-export (private)

-- Create storage policies
-- These need to be created in Supabase Dashboard -> Storage -> Policies

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    );
    
    -- Create default billing record with free plan
    INSERT INTO billing (user_id, plan, status)
    VALUES (NEW.id, 'free', 'active');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to get user usage stats
CREATE OR REPLACE FUNCTION get_user_usage_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'uploads_count', (SELECT COUNT(*) FROM uploads WHERE user_id = user_uuid),
        'transactions_count', (SELECT COUNT(*) FROM transactions WHERE user_id = user_uuid),
        'rules_count', (SELECT COUNT(*) FROM rules WHERE user_id = user_uuid),
        'reports_count', (SELECT COUNT(*) FROM reports WHERE user_id = user_uuid),
        'current_month_uploads', (
            SELECT COUNT(*) FROM uploads 
            WHERE user_id = user_uuid 
            AND created_at >= date_trunc('month', NOW())
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get dashboard metrics
CREATE OR REPLACE FUNCTION get_dashboard_metrics(user_uuid UUID, start_date DATE DEFAULT NULL, end_date DATE DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
    result JSON;
    filter_start DATE;
    filter_end DATE;
BEGIN
    -- Default to current month if no dates provided
    filter_start := COALESCE(start_date, date_trunc('month', CURRENT_DATE)::DATE);
    filter_end := COALESCE(end_date, CURRENT_DATE);
    
    SELECT json_build_object(
        'total_revenue', COALESCE(SUM(CASE WHEN is_income = true THEN amount ELSE 0 END), 0),
        'total_expenses', COALESCE(SUM(CASE WHEN is_income = false THEN amount ELSE 0 END), 0),
        'net_profit', COALESCE(SUM(CASE WHEN is_income = true THEN amount ELSE -amount END), 0),
        'total_transactions', COUNT(*),
        'total_gst', COALESCE(SUM(gst_amount), 0),
        'categories', (
            SELECT json_agg(
                json_build_object(
                    'category', final_category,
                    'amount', SUM(amount),
                    'count', COUNT(*)
                )
            )
            FROM transactions 
            WHERE user_id = user_uuid 
            AND tx_date BETWEEN filter_start AND filter_end
            AND final_category IS NOT NULL
            GROUP BY final_category
            ORDER BY SUM(amount) DESC
            LIMIT 10
        )
    ) INTO result
    FROM transactions 
    WHERE user_id = user_uuid 
    AND tx_date BETWEEN filter_start AND filter_end;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
