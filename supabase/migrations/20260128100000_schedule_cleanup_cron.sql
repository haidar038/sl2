-- Migration: Enable pg_cron and schedule cleanup
-- Description: Enables pg_cron extension and schedules daily cleanup of guest URLs
-- Date: 2026-01-28

-- 1. Enable the pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- 2. Grant usage to postgres role (Supabase default admin)
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- 3. Schedule the cleanup job
-- Run every day at 03:00 UTC
-- Job name: 'cleanup-guest-urls'
-- Command: call cleanup_old_guest_urls(7)
SELECT cron.schedule(
    'cleanup-guest-urls',
    '0 3 * * *',
    $$SELECT cleanup_old_guest_urls(7)$$
);

-- Note regarding Keep-Alive:
-- Running this internal cron job DOES NOT prevent Supabase from pausing the project.
-- Supabase requires "API requests" (external traffic) to stay active.
-- That is why we use the Vercel Cron (HTTP Request) for the Keep-Alive mechanism.
