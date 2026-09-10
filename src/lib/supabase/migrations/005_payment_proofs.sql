-- ====================================================================
-- Migration 005 — client-submitted proof of payment
--
-- For EFT / ATM deposits: the client uploads a screenshot or PDF against
-- an invoice with a note; an admin reviews it and records the payment.
-- Run after migration 004.
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.payment_proofs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id    UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  client_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  drive_file_id TEXT NOT NULL,
  file_name     TEXT NOT NULL,
  mime_type     TEXT NOT NULL,
  view_link     TEXT,
  note          TEXT,
  amount_zar    DECIMAL(10, 2),                    -- what the client says they paid
  reviewed      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_proofs_invoice ON public.payment_proofs(invoice_id);

ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full payment_proofs" ON public.payment_proofs;
CREATE POLICY "Admin full payment_proofs" ON public.payment_proofs
  FOR ALL TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "Client view own payment_proofs" ON public.payment_proofs;
CREATE POLICY "Client view own payment_proofs" ON public.payment_proofs
  FOR SELECT TO authenticated USING (client_id = auth.uid());

DROP POLICY IF EXISTS "Client add own payment_proofs" ON public.payment_proofs;
CREATE POLICY "Client add own payment_proofs" ON public.payment_proofs
  FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid());
