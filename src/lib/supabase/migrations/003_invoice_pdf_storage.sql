-- ====================================================================
-- Migration 003 — store invoice/contract PDFs in Supabase Storage
--
-- Google service accounts have no Drive quota, so Drive filing is
-- best-effort only. Supabase Storage is the reliable store the client
-- downloads from. Run AFTER migration 002.
-- ====================================================================

-- 1. Private bucket for generated PDFs -----------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Column pointing at the stored object (path within the bucket) --
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS pdf_storage_path TEXT;

-- 3. Storage RLS — path convention is "<client_id>/<invoice_id>.pdf" --
DROP POLICY IF EXISTS "Admin all invoice pdfs" ON storage.objects;
CREATE POLICY "Admin all invoice pdfs" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'invoices' AND public.is_admin())
  WITH CHECK (bucket_id = 'invoices' AND public.is_admin());

DROP POLICY IF EXISTS "Client read own invoice pdfs" ON storage.objects;
CREATE POLICY "Client read own invoice pdfs" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'invoices'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
