-- ========================================
-- SUPABASE CLEANUP SCRIPT
-- Run this to delete all tables before a fresh setup
-- ========================================

-- This script will drop tables in the correct order to respect foreign key constraints.

DROP TABLE IF EXISTS public.forum_replies CASCADE;
DROP TABLE IF EXISTS public.forum_posts CASCADE;
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.chat_sessions CASCADE;
DROP TABLE IF EXISTS public.mood_entries CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.assessments CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.counselors CASCADE;
DROP TABLE IF EXISTS public.resources CASCADE;
DROP TABLE IF EXISTS public.crisis_contacts CASCADE;
DROP TABLE IF EXISTS public.user_sessions CASCADE; -- Added from original schema
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop any custom types (enums) as well
DROP TYPE IF EXISTS public.appointment_status;
DROP TYPE IF EXISTS public.appointment_type;
DROP TYPE IF EXISTS public.notification_type;
DROP TYPE IF EXISTS public.session_type;
DROP TYPE IF EXISTS public.session_status;
DROP TYPE IF EXISTS public.message_type;
DROP TYPE IF EXISTS public.resource_type;


-- Verification query: Check if any tables remain
-- This should return an empty result
SELECT tablename FROM pg_tables WHERE schemaname = 'public';


