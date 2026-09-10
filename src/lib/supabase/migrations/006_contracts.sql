-- ====================================================================
-- Migration 006 — in-portal contract signing (ECTA electronic signature)
--
-- Admin generates a contract and sends it to the client's portal. The
-- client signs (typed name + consent, optional drawn signature); a
-- business representative countersigns; the portal then merges the
-- source PDF with a signature certificate and files the executed PDF to
-- the client's Drive folder. Run after migration 005.
-- ====================================================================

DO $$ BEGIN
  CREATE TYPE public.contract_status AS ENUM ('draft', 'sent', 'client_signed', 'executed', 'void');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.contracts (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id            UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id           UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  doc_type             TEXT NOT NULL,                 -- 'sa' | 'hosting' | 'careplan'
  title                TEXT NOT NULL,
  status               public.contract_status NOT NULL DEFAULT 'sent',

  -- unsigned source
  source_drive_file_id TEXT NOT NULL,
  source_pdf_sha256    TEXT NOT NULL,

  -- client signature
  client_signer_name   TEXT,
  client_signed_at     TIMESTAMPTZ,
  client_signed_ip     TEXT,
  client_signature_png TEXT,                          -- optional base64 PNG of a drawn signature

  -- representative signature
  rep_signer_name      TEXT,
  rep_signed_at        TIMESTAMPTZ,
  rep_signed_ip        TEXT,

  -- executed output
  executed_drive_file_id TEXT,
  executed_at          TIMESTAMPTZ,

  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contracts_client ON public.contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.contracts(status);

DROP TRIGGER IF EXISTS trigger_update_contracts ON public.contracts;
CREATE TRIGGER trigger_update_contracts
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Admin: full access. Client: read own only — every write goes through a
-- server action that checks ownership and state, so clients have no direct
-- INSERT/UPDATE grant.
DROP POLICY IF EXISTS "Admin full contracts" ON public.contracts;
CREATE POLICY "Admin full contracts" ON public.contracts
  FOR ALL TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "Client view own contracts" ON public.contracts;
CREATE POLICY "Client view own contracts" ON public.contracts
  FOR SELECT TO authenticated USING (client_id = auth.uid());
