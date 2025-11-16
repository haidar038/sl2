-- Migration: Fix Mixed Guest URLs
-- Description: Cleanup URLs that are in inconsistent state (guest URLs with owner_id, etc.)
-- Date: 2025-11-16

-- =====================================================
-- STEP 1: Fix guest URLs that have owner_id set
-- =====================================================

-- These are URLs that were created via demo form while user was logged in
-- They should be converted to normal user URLs
UPDATE urls
SET
  is_guest = false,
  guest_session_id = NULL,
  guest_created_at = NULL,
  expiry_at = NULL,  -- Remove expiry for user URLs
  updated_at = now()
WHERE
  is_guest = true
  AND owner_id IS NOT NULL;

-- =====================================================
-- STEP 2: Fix user URLs that are marked as guest
-- =====================================================

-- Ensure all URLs with owner_id are NOT marked as guest
UPDATE urls
SET
  is_guest = false,
  guest_session_id = NULL,
  guest_created_at = NULL,
  updated_at = now()
WHERE
  owner_id IS NOT NULL
  AND is_guest = true;

-- =====================================================
-- STEP 3: Fix guest URLs without session ID
-- =====================================================

-- Guest URLs must have a session ID
-- If they don't, soft delete them as they're invalid
UPDATE urls
SET
  deleted_at = now(),
  updated_at = now()
WHERE
  is_guest = true
  AND guest_session_id IS NULL
  AND deleted_at IS NULL;

-- =====================================================
-- STEP 4: Verify data integrity
-- =====================================================

-- This query should return 0 rows if everything is fixed
-- Run this to verify:
-- SELECT * FROM urls
-- WHERE (is_guest = true AND owner_id IS NOT NULL)
--    OR (is_guest = true AND guest_session_id IS NULL AND deleted_at IS NULL)
--    OR (owner_id IS NOT NULL AND is_guest = true);

-- =====================================================
-- COMPLETED: Mixed Guest URLs Fixed
-- =====================================================
