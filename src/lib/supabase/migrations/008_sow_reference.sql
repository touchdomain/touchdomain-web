-- ====================================================================
-- Migration 008 — SOW reference on contracts, linkable to a project
--
-- Lets a Service Agreement / Hosting / Care Plan contract carry a stable,
-- auto-numbered SOW reference, and be associated with a specific project so
-- invoices raised against that project can auto-fill the reference. Run
-- after migration 007.
-- ====================================================================

ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS sow_reference TEXT;

CREATE INDEX IF NOT EXISTS idx_contracts_project ON public.contracts(project_id);
