-- Wellness Tracker Database Schema
-- HIPAA-Compliant with Row-Level Security (RLS)
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('client', 'therapist')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============================================
-- INVITE CODES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invite_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    therapist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    used_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- Index for code lookups
CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_therapist ON invite_codes(therapist_id);

-- ============================================
-- THERAPIST-CLIENT ASSIGNMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS therapist_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    therapist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(therapist_id, client_id)
);

-- Indexes for relationship lookups
CREATE INDEX IF NOT EXISTS idx_therapist_clients_therapist ON therapist_clients(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapist_clients_client ON therapist_clients(client_id);

-- ============================================
-- DAILY ENTRIES (Consolidated Wellness Journal)
-- ============================================
CREATE TABLE IF NOT EXISTS daily_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,

    -- Journal
    journal_text TEXT,

    -- Mood (1-5 scale)
    mood INTEGER CHECK (mood >= 1 AND mood <= 5),

    -- Sleep
    sleep_hours DECIMAL(3,1) CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
    sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5),

    -- Time Outside (minutes)
    time_outside_minutes INTEGER CHECK (time_outside_minutes >= 0),

    -- Water Intake (glasses)
    water_glasses INTEGER CHECK (water_glasses >= 0),

    -- Exercise
    exercise_type TEXT,
    exercise_minutes INTEGER CHECK (exercise_minutes >= 0),
    exercise_notes TEXT,

    -- Meals (stored as JSON array)
    meals JSONB DEFAULT '[]'::jsonb,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- One entry per day per user
    UNIQUE(user_id, entry_date)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_daily_entries_user ON daily_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_entries_date ON daily_entries(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_entries_user_date ON daily_entries(user_id, entry_date DESC);

-- ============================================
-- THERAPIST COMMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS therapist_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID NOT NULL REFERENCES daily_entries(id) ON DELETE CASCADE,
    therapist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for comment queries
CREATE INDEX IF NOT EXISTS idx_therapist_comments_entry ON therapist_comments(entry_id);
CREATE INDEX IF NOT EXISTS idx_therapist_comments_therapist ON therapist_comments(therapist_id);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_comments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (during registration)
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Therapists can view profiles of their assigned clients
CREATE POLICY "Therapists can view assigned client profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM therapist_clients tc
            WHERE tc.therapist_id = auth.uid()
            AND tc.client_id = profiles.id
        )
    );

-- ============================================
-- INVITE CODES POLICIES
-- ============================================

-- Therapists can create invite codes
CREATE POLICY "Therapists can create invite codes" ON invite_codes
    FOR INSERT WITH CHECK (
        auth.uid() = therapist_id
        AND EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'therapist'
        )
    );

-- Therapists can view their own invite codes
CREATE POLICY "Therapists can view own invite codes" ON invite_codes
    FOR SELECT USING (therapist_id = auth.uid());

-- Therapists can delete their unused invite codes
CREATE POLICY "Therapists can delete unused invite codes" ON invite_codes
    FOR DELETE USING (
        therapist_id = auth.uid() AND used_by IS NULL
    );

-- Anyone can check if an invite code is valid (for registration)
CREATE POLICY "Anyone can validate invite codes" ON invite_codes
    FOR SELECT USING (
        used_by IS NULL
        AND expires_at > NOW()
    );

-- Allow updating invite codes when being used
CREATE POLICY "Invite codes can be marked as used" ON invite_codes
    FOR UPDATE USING (
        used_by IS NULL
        AND expires_at > NOW()
    );

-- ============================================
-- THERAPIST-CLIENT POLICIES
-- ============================================

-- Therapists can view their client assignments
CREATE POLICY "Therapists can view own assignments" ON therapist_clients
    FOR SELECT USING (therapist_id = auth.uid());

-- Clients can view their therapist assignment
CREATE POLICY "Clients can view own assignment" ON therapist_clients
    FOR SELECT USING (client_id = auth.uid());

-- Allow creating assignments (during registration with invite code)
CREATE POLICY "Allow creating assignments" ON therapist_clients
    FOR INSERT WITH CHECK (client_id = auth.uid());

-- ============================================
-- DAILY ENTRIES POLICIES
-- ============================================

-- Clients can CRUD their own entries
CREATE POLICY "Clients can view own entries" ON daily_entries
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Clients can insert own entries" ON daily_entries
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Clients can update own entries" ON daily_entries
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Clients can delete own entries" ON daily_entries
    FOR DELETE USING (user_id = auth.uid());

-- Therapists can view entries of their assigned clients
CREATE POLICY "Therapists can view assigned client entries" ON daily_entries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM therapist_clients tc
            WHERE tc.therapist_id = auth.uid()
            AND tc.client_id = daily_entries.user_id
        )
    );

-- ============================================
-- THERAPIST COMMENTS POLICIES
-- ============================================

-- Therapists can create comments on their clients' entries
CREATE POLICY "Therapists can create comments" ON therapist_comments
    FOR INSERT WITH CHECK (
        therapist_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM daily_entries de
            JOIN therapist_clients tc ON tc.client_id = de.user_id
            WHERE de.id = entry_id
            AND tc.therapist_id = auth.uid()
        )
    );

-- Therapists can view their own comments
CREATE POLICY "Therapists can view own comments" ON therapist_comments
    FOR SELECT USING (therapist_id = auth.uid());

-- Therapists can update their own comments
CREATE POLICY "Therapists can update own comments" ON therapist_comments
    FOR UPDATE USING (therapist_id = auth.uid());

-- Therapists can delete their own comments
CREATE POLICY "Therapists can delete own comments" ON therapist_comments
    FOR DELETE USING (therapist_id = auth.uid());

-- Clients can view comments on their entries
CREATE POLICY "Clients can view comments on own entries" ON therapist_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM daily_entries de
            WHERE de.id = entry_id
            AND de.user_id = auth.uid()
        )
    );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to generate random invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_entries_updated_at
    BEFORE UPDATE ON daily_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_therapist_comments_updated_at
    BEFORE UPDATE ON therapist_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- AUDIT LOG (Optional but recommended for HIPAA)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);

-- Enable RLS on audit log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only allow inserts to audit log
CREATE POLICY "Allow audit log inserts" ON audit_log
    FOR INSERT WITH CHECK (true);

-- Users can view their own audit entries
CREATE POLICY "Users can view own audit entries" ON audit_log
    FOR SELECT USING (user_id = auth.uid());
