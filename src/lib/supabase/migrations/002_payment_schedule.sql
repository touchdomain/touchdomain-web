-- ====================================================================
-- Migration 002 — Payment schedules & installment-aware invoices
--
-- Run this in the Supabase SQL editor AFTER the base schema.sql.
-- Safe to re-run: uses IF NOT EXISTS / DROP ... IF EXISTS guards where it can.
-- ====================================================================

-- 1. New enum for the state of a scheduled payment ---------------------
DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('pending', 'invoiced', 'partial', 'paid', 'waived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Projects gain a headline fee ------------------------------------
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS total_fee_zar DECIMAL(10, 2);

-- 3. Invoices become project- and installment-aware ------------------
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS description TEXT,           -- what this invoice bills, e.g. "Deposit (50%)"
  ADD COLUMN IF NOT EXISTS reference TEXT,             -- SOW / plan reference printed on the PDF
  ADD COLUMN IF NOT EXISTS is_tax_invoice BOOLEAN NOT NULL DEFAULT FALSE;

-- 4. The payment schedule -------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_milestones (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id      UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  label           TEXT NOT NULL,                       -- "Deposit on signature", "Staging sign-off"
  sort_order      INT  NOT NULL DEFAULT 0,
  percentage      NUMERIC(5, 2),                       -- 50.00 — informational, may be null for fixed amounts
  amount_zar      DECIMAL(10, 2) NOT NULL,
  amount_paid_zar DECIMAL(10, 2) NOT NULL DEFAULT 0,
  due_date        DATE,                                -- resolved calendar date
  status          public.payment_status NOT NULL DEFAULT 'pending',
  invoice_id      UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_milestones_project ON public.payment_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_project ON public.invoices(project_id);

DROP TRIGGER IF EXISTS trigger_update_payment_milestones ON public.payment_milestones;
CREATE TRIGGER trigger_update_payment_milestones
  BEFORE UPDATE ON public.payment_milestones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. RLS — admin full, client read-only via project ownership --------
ALTER TABLE public.payment_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full payment_milestones" ON public.payment_milestones;
CREATE POLICY "Admin full payment_milestones" ON public.payment_milestones
  FOR ALL TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "Client view own payment_milestones" ON public.payment_milestones;
CREATE POLICY "Client view own payment_milestones" ON public.payment_milestones
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = payment_milestones.project_id
      AND projects.client_id = auth.uid()
  ));
