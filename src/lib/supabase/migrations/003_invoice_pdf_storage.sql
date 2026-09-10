-- ====================================================================
-- Migration 003 — invoice PDF pointer column
--
-- Invoice/contract PDFs are stored in the Google Shared Drive (canonical).
-- The client downloads them via GET /api/invoices/[id], which proxies the
-- bytes from Drive through the service account.
--
-- pdf_storage_path is reserved for an optional future Supabase Storage
-- fallback; nothing writes it today. Run after migration 002.
-- ====================================================================

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS pdf_storage_path TEXT;
