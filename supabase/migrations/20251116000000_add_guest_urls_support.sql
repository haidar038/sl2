-- Migration: Add Guest URLs Support
-- Description: Allow unauthenticated users to create temporary demo URLs
-- Date: 2025-11-16

-- =====================================================
-- STEP 1: Modify urls table to support guest users
-- =====================================================

-- Make owner_id nullable to allow guest URLs
ALTER TABLE urls
  ALTER COLUMN owner_id DROP NOT NULL;

-- Add guest-related columns
ALTER TABLE urls
  ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS guest_session_id TEXT,
  ADD COLUMN IF NOT EXISTS guest_created_at TIMESTAMPTZ DEFAULT now();

-- Add comment for documentation
COMMENT ON COLUMN urls.is_guest IS 'Flag to identify guest/demo URLs that will auto-expire';
COMMENT ON COLUMN urls.guest_session_id IS 'Browser fingerprint/session ID for tracking guest URLs';
COMMENT ON COLUMN urls.guest_created_at IS 'Timestamp when guest URL was created (for auto-cleanup)';

-- =====================================================
-- STEP 2: Create indexes for performance
-- =====================================================

-- Index for guest URL cleanup queries
CREATE INDEX IF NOT EXISTS idx_urls_guest_cleanup
  ON urls(guest_created_at)
  WHERE is_guest = true AND deleted_at IS NULL;

-- Index for session-based queries
CREATE INDEX IF NOT EXISTS idx_urls_guest_session
  ON urls(guest_session_id)
  WHERE is_guest = true;

-- =====================================================
-- STEP 3: Update RLS Policies
-- =====================================================

-- Drop existing policies to recreate with guest support
DROP POLICY IF EXISTS "Users can view their own urls" ON urls;
DROP POLICY IF EXISTS "Users can view public urls" ON urls;
DROP POLICY IF EXISTS "Users can create their own urls" ON urls;
DROP POLICY IF EXISTS "Users can update their own urls" ON urls;
DROP POLICY IF EXISTS "Users can delete their own urls" ON urls;

-- Allow SELECT for:
-- 1. Authenticated users viewing their own URLs
-- 2. Anyone viewing public URLs (including guest URLs)
-- 3. Guest users viewing URLs they created (matched by guest_session_id)
CREATE POLICY "Users can view urls" ON urls
  FOR SELECT
  USING (
    -- Authenticated users can see their own URLs
    (auth.uid() = owner_id)
    OR
    -- Anyone can see public, non-deleted URLs
    (is_public = true AND deleted_at IS NULL)
    OR
    -- Guest URLs are viewable by anyone (for demo purposes)
    (is_guest = true AND deleted_at IS NULL)
  );

-- Allow INSERT for:
-- 1. Authenticated users (owner_id must match auth.uid())
-- 2. Guest users (owner_id is NULL and is_guest is true)
CREATE POLICY "Users can create urls" ON urls
  FOR INSERT
  WITH CHECK (
    -- Authenticated users must set owner_id to their own ID
    (auth.uid() = owner_id AND is_guest = false)
    OR
    -- Guest users can create URLs with NULL owner_id
    (owner_id IS NULL AND is_guest = true)
  );

-- Allow UPDATE only for authenticated users on their own URLs
CREATE POLICY "Users can update their own urls" ON urls
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Allow DELETE (soft delete) only for authenticated users on their own URLs
CREATE POLICY "Users can delete their own urls" ON urls
  FOR DELETE
  USING (auth.uid() = owner_id);

-- =====================================================
-- STEP 4: Create function to migrate guest URLs
-- =====================================================

-- Function to transfer guest URLs to authenticated user
CREATE OR REPLACE FUNCTION migrate_guest_urls_to_user(
  p_guest_session_id TEXT,
  p_user_id UUID
)
RETURNS TABLE (
  migrated_count INTEGER,
  url_ids UUID[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_migrated_count INTEGER;
  v_url_ids UUID[];
BEGIN
  -- Validate inputs
  IF p_guest_session_id IS NULL OR p_user_id IS NULL THEN
    RAISE EXCEPTION 'Session ID and User ID are required';
  END IF;

  -- Update guest URLs to be owned by the user
  WITH updated AS (
    UPDATE urls
    SET
      owner_id = p_user_id,
      is_guest = false,
      guest_session_id = NULL,
      guest_created_at = NULL,
      updated_at = now()
    WHERE
      guest_session_id = p_guest_session_id
      AND is_guest = true
      AND deleted_at IS NULL
    RETURNING id
  )
  SELECT
    COUNT(*)::INTEGER,
    ARRAY_AGG(id)
  INTO v_migrated_count, v_url_ids
  FROM updated;

  RETURN QUERY SELECT v_migrated_count, v_url_ids;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION migrate_guest_urls_to_user(TEXT, UUID) TO authenticated;

COMMENT ON FUNCTION migrate_guest_urls_to_user IS 'Transfers guest URLs to authenticated user account after signup';

-- =====================================================
-- STEP 5: Create function to cleanup old guest URLs
-- =====================================================

-- Function to delete guest URLs older than specified days
CREATE OR REPLACE FUNCTION cleanup_old_guest_urls(
  p_days_old INTEGER DEFAULT 7
)
RETURNS TABLE (
  deleted_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Soft delete old guest URLs
  WITH deleted AS (
    UPDATE urls
    SET
      deleted_at = now(),
      updated_at = now()
    WHERE
      is_guest = true
      AND deleted_at IS NULL
      AND guest_created_at < (now() - (p_days_old || ' days')::INTERVAL)
    RETURNING id
  )
  SELECT COUNT(*)::INTEGER
  INTO v_deleted_count
  FROM deleted;

  RETURN QUERY SELECT v_deleted_count;
END;
$$;

-- Grant execute permission to service role (for cron jobs)
GRANT EXECUTE ON FUNCTION cleanup_old_guest_urls(INTEGER) TO service_role;

COMMENT ON FUNCTION cleanup_old_guest_urls IS 'Soft deletes guest URLs older than specified days (default: 7 days)';

-- =====================================================
-- STEP 6: Create helper function to get guest URL count
-- =====================================================

CREATE OR REPLACE FUNCTION get_guest_url_count(
  p_guest_session_id TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER
  INTO v_count
  FROM urls
  WHERE
    guest_session_id = p_guest_session_id
    AND is_guest = true
    AND deleted_at IS NULL;

  RETURN v_count;
END;
$$;

-- Grant execute permission to anon users (for rate limiting)
GRANT EXECUTE ON FUNCTION get_guest_url_count(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_guest_url_count(TEXT) TO authenticated;

COMMENT ON FUNCTION get_guest_url_count IS 'Returns count of active guest URLs for a session (for rate limiting)';

-- =====================================================
-- STEP 7: Add constraint to ensure data integrity
-- =====================================================

-- Ensure guest URLs have session ID and vice versa
ALTER TABLE urls
  ADD CONSTRAINT check_guest_session_id
  CHECK (
    (is_guest = true AND guest_session_id IS NOT NULL AND owner_id IS NULL)
    OR
    (is_guest = false AND guest_session_id IS NULL)
    OR
    (is_guest IS NULL)
  );

-- =====================================================
-- COMPLETED: Guest URLs Support Migration
-- =====================================================

-- Summary of changes:
-- ✅ Modified urls table to support guest users
-- ✅ Added indexes for performance
-- ✅ Updated RLS policies for guest access
-- ✅ Created migration function for guest → user transfer
-- ✅ Created cleanup function for old guest URLs
-- ✅ Added helper functions and constraints
