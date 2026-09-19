-- ====================================================================
-- Migration 011 — client portal welcome/intro tracking
--
-- A one-time walkthrough shown to a client the first time they land in
-- the portal (explains onboarding, contracts, files, invoices). Tracked
-- per-profile so it only shows once, and so support can see whether/when
-- a given client actually saw it. Run after migration 010.
-- ====================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS portal_intro_seen_at TIMESTAMPTZ;
