-- ========================================
-- SUPABASE DATABASE SETUP QUERIES
-- Run these queries in your Supabase SQL Editor
-- ========================================

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. USERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('student', 'counselor', 'admin')),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    medical_history TEXT,
    profile_picture_url TEXT,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. COUNSELORS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS counselors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(100),
    specialization TEXT[],
    years_of_experience INTEGER,
    education TEXT,
    bio TEXT,
    availability_schedule JSONB,
    hourly_rate DECIMAL(10,2),
    is_verified BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_sessions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. APPOINTMENTS TABLE (with enum)
-- ========================================
-- Create appointment status enum
DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create appointment type enum
DO $$ BEGIN
    CREATE TYPE appointment_type AS ENUM ('individual', 'group', 'emergency');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS appointments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    counselor_id UUID REFERENCES counselors(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status appointment_status DEFAULT 'scheduled',
    type appointment_type DEFAULT 'individual',
    notes TEXT,
    session_notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    meeting_link TEXT,
    reminder_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 4. ASSESSMENTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS assessments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assessment_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    questions JSONB NOT NULL,
    responses JSONB NOT NULL,
    score INTEGER,
    max_score INTEGER,
    severity_level VARCHAR(50),
    recommendations TEXT,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 5. NOTIFICATIONS TABLE
-- ========================================
-- Create notification type enum
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('info', 'warning', 'success', 'error', 'reminder');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 6. MOOD ENTRIES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS mood_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mood_level INTEGER CHECK (mood_level >= 1 AND mood_level <= 10),
    emotions TEXT[],
    notes TEXT,
    activities TEXT[],
    sleep_hours DECIMAL(3,1),
    stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    entry_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 7. CHAT SESSIONS TABLE
-- ========================================
-- Create session type enum
DO $$ BEGIN
    CREATE TYPE session_type AS ENUM ('ai_chat', 'peer_support', 'counselor_chat');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create session status enum
DO $$ BEGIN
    CREATE TYPE session_status AS ENUM ('active', 'ended', 'paused');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    counselor_id UUID REFERENCES counselors(id) ON DELETE SET NULL,
    session_type session_type DEFAULT 'ai_chat',
    status session_status DEFAULT 'active',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 8. CHAT MESSAGES TABLE
-- ========================================
-- Create message type enum
DO $$ BEGIN
    CREATE TYPE message_type AS ENUM ('text', 'image', 'file', 'system');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message_type message_type DEFAULT 'text',
    content TEXT NOT NULL,
    metadata JSONB,
    is_ai_response BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 9. FORUM POSTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS forum_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    tags TEXT[],
    is_anonymous BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 10. FORUM REPLIES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS forum_replies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 11. RESOURCES TABLE
-- ========================================
-- Create resource type enum
DO $$ BEGIN
    CREATE TYPE resource_type AS ENUM ('article', 'video', 'audio', 'pdf', 'link', 'exercise');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS resources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    resource_type resource_type,
    category VARCHAR(100),
    tags TEXT[],
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    file_url TEXT,
    external_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 12. CRISIS CONTACTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS crisis_contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    website TEXT,
    description TEXT,
    availability VARCHAR(100),
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- ========================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_counselor_id ON appointments(counselor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON forum_posts(category);
CREATE INDEX IF NOT EXISTS idx_forum_replies_post_id ON forum_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_date ON mood_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- ========================================
-- CREATE UPDATED_AT TRIGGER FUNCTION
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ========================================
-- CREATE TRIGGERS FOR UPDATED_AT
-- ========================================
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_counselors_updated_at ON counselors;
CREATE TRIGGER update_counselors_updated_at BEFORE UPDATE ON counselors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_forum_posts_updated_at ON forum_posts;
CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON forum_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_forum_replies_updated_at ON forum_replies;
CREATE TRIGGER update_forum_replies_updated_at BEFORE UPDATE ON forum_replies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_resources_updated_at ON resources;
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_crisis_contacts_updated_at ON crisis_contacts;
CREATE TRIGGER update_crisis_contacts_updated_at BEFORE UPDATE ON crisis_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- INSERT DEFAULT DATA
-- ========================================

-- Insert default crisis contacts
INSERT INTO crisis_contacts (name, phone, email, description, availability) VALUES
('National Suicide Prevention Lifeline', '988', 'help@suicidepreventionlifeline.org', '24/7 crisis support for people in suicidal crisis or emotional distress', '24/7'),
('Crisis Text Line', '741741', 'help@crisistextline.org', 'Text HOME to 741741 for crisis support', '24/7'),
('SAMHSA National Helpline', '1-800-662-4357', 'help@samhsa.gov', 'Treatment referral and information service', '24/7'),
('National Alliance on Mental Illness', '1-800-950-6264', 'info@nami.org', 'Support and information for mental health conditions', 'Mon-Fri 10am-10pm ET')
ON CONFLICT DO NOTHING;

-- Insert default admin user (password: admin123 - CHANGE THIS!)
INSERT INTO users (name, email, role, password, is_active, email_verified) VALUES
('System Admin', 'admin@mindcare.ai', 'admin', '$2b$10$rQZ9vKKQZ9vKKQZ9vKKQZ9vKKQZ9vKKQZ9vKKQZ9vKKQZ9vKKQZ9vK', true, true)
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check if all tables were created successfully
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check enum types
SELECT 
    t.typname as enum_name, 
    e.enumlabel as allowed_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE t.typname IN ('appointment_status', 'appointment_type', 'notification_type', 'session_type', 'session_status', 'message_type', 'resource_type')
ORDER BY t.typname, e.enumsortorder;
