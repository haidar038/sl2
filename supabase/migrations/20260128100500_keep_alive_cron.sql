-- Migration: Setup Keep Alive Cron in Supabase
-- Description: Uses pg_cron and pg_net to ping the Vercel endpoint, creating network activity.
-- Date: 2026-01-28

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- 2. Schedule the Keep-Alive Ping
-- Runs every day at 09:00 UTC (Matching the Vercel schedule, or can be different)
-- This makes Supabase send a request TO Vercel.
-- Vercel then processes the request and (optionally) queries Supabase back.
-- Ideally, we ping the 'keep-alive' endpoint which is public (or protected, if we add headers).

-- Note: We use net.http_get to fetch the URL.
-- Replace 'https://sl2.my.id' with your actual production domain if different.
SELECT cron.schedule(
    'keep-alive-ping',
    '0 9 * * *', -- Daily at 09:00
    $$
    SELECT net.http_get(
        url:='https://sl2.my.id/api/keep-alive',
        headers:='{"Content-Type": "application/json"}'::jsonb
    )
    $$
);

-- Explanation:
-- This job ensures Supabase generates OUTBOUND traffic.
-- The Vercel endpoint receiving this will generate INBOUND traffic (if it queries DB).
-- This 2-way traffic is the best attempt to prevent pausing from within the DB.
