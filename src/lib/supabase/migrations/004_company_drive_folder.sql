-- ====================================================================
-- Migration 004 — per-client Drive folder
--
-- Files are organised in the Shared Drive as:
--   <Shared Drive>/<Company or client name>/<Project title>/
-- This column caches the client's company-level folder id. Run after 003.
-- ====================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS drive_folder_id TEXT;
