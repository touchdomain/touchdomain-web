-- ====================================================================
-- Migration 007 — product-specific discovery questions in onboarding
--
-- Each project is tagged with the playbooks that apply (Web Design, Brand
-- Identity, …). The client onboarding then shows that playbook's intake
-- questions, and the answers are stored as JSON on project_onboarding.
-- Run after migration 006.
-- ====================================================================

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS playbooks TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE public.project_onboarding
  ADD COLUMN IF NOT EXISTS discovery JSONB NOT NULL DEFAULT '{}'::jsonb;
