-- ====================================================================
-- Migration 009 — WHMCS (HostAfrica reseller) linkage
--
-- WHMCS stays the provisioning engine for the actual hosting account;
-- these columns just remember which WHMCS client/service a portal
-- profile/project maps to, so the admin action and the client's read-only
-- hosting card can look the account back up. Run after migration 008.
-- ====================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS whmcs_client_id TEXT;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS whmcs_service_id TEXT,
  ADD COLUMN IF NOT EXISTS whmcs_product_id TEXT,
  ADD COLUMN IF NOT EXISTS whmcs_domain TEXT,
  ADD COLUMN IF NOT EXISTS whmcs_status TEXT;              -- last-known status string from WHMCS (Active/Suspended/Terminated/…)
