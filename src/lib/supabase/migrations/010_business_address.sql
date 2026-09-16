-- ====================================================================
-- Migration 010 — client business address on onboarding
--
-- Onboarding never asked for a physical/registered address, so contracts
-- had no source to auto-fill "Client address" from — the admin had to type
-- it by hand every time. Run after migration 009.
-- ====================================================================

ALTER TABLE public.project_onboarding
  ADD COLUMN IF NOT EXISTS business_address TEXT;
