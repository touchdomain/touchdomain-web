-- ====================================================================
-- Touch Domain Client Portal — database schema
--
-- Source of truth for the Supabase Postgres schema. Kept in the repo so
-- src/lib/database.types.ts and the portal code can be reviewed against it.
-- Apply changes in the Supabase SQL editor, then regenerate types:
--   npx supabase gen types typescript --project-id <ref> > src/lib/database.types.ts
-- ====================================================================

-- ====================================================================
-- 1. EXTENSIONS & ENUMS
-- ====================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE public.user_role AS ENUM ('admin', 'client');
CREATE TYPE public.invoice_status AS ENUM ('unpaid', 'paid', 'overdue', 'cancelled');
CREATE TYPE public.project_status AS ENUM ('discovery', 'in_progress', 'review', 'completed', 'paused');
CREATE TYPE public.onboarding_status AS ENUM ('not_started', 'in_progress', 'submitted', 'reviewed');
-- Added in migration 002:
CREATE TYPE public.payment_status AS ENUM ('pending', 'invoiced', 'partial', 'paid', 'waived');

-- ====================================================================
-- 2. TABLE DEFINITIONS
-- ====================================================================

-- PROFILES (Extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'client',
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  company_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PROJECTS
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status public.project_status NOT NULL DEFAULT 'discovery',
  progress_percentage INT NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  google_drive_folder_id TEXT,
  target_launch_date DATE,
  total_fee_zar DECIMAL(10, 2),                          -- added in migration 002
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ONBOARDING QUESTIONNAIRE (1:1 relation with Projects)
CREATE TABLE public.project_onboarding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE UNIQUE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  status public.onboarding_status NOT NULL DEFAULT 'not_started',

  -- Questionnaire Fields matching our frontend state
  business_name TEXT,
  business_goals TEXT,
  brand_identity TEXT,
  content_strategy TEXT,
  tech_infrastructure TEXT,
  design_preferences TEXT,

  -- Additional fields for advanced project metrics
  primary_goal TEXT,
  target_audience TEXT,
  unique_value_prop TEXT,
  competitors TEXT,
  brand_colors TEXT,
  brand_fonts TEXT,
  brand_vibe TEXT,
  copywriting_status TEXT,
  photography_status TEXT,
  primary_cta TEXT,
  domain_status TEXT,
  secure_credential_links TEXT,
  third_party_integrations TEXT,
  design_likes TEXT,
  design_dislikes TEXT,
  must_have_features TEXT,

  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- MILESTONES
CREATE TABLE public.milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INVOICES
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,   -- migration 002
  invoice_number TEXT NOT NULL UNIQUE,
  amount_zar DECIMAL(10, 2) NOT NULL,
  status public.invoice_status NOT NULL DEFAULT 'unpaid',
  due_date DATE NOT NULL,
  description TEXT,                                                   -- migration 002: what this invoice bills
  reference TEXT,                                                     -- migration 002: SOW / plan ref on the PDF
  is_tax_invoice BOOLEAN NOT NULL DEFAULT FALSE,                      -- migration 002
  pdf_drive_file_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PAYMENT MILESTONES — the installment schedule for a project (migration 002)
CREATE TABLE public.payment_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  percentage NUMERIC(5, 2),
  amount_zar DECIMAL(10, 2) NOT NULL,
  amount_paid_zar DECIMAL(10, 2) NOT NULL DEFAULT 0,
  due_date DATE,
  status public.payment_status NOT NULL DEFAULT 'pending',
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CLIENT FILES METADATA (Google Drive Links)
CREATE TABLE public.client_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  drive_file_id TEXT NOT NULL,
  file_size_bytes BIGINT,
  view_link TEXT,
  download_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 3. AUTOMATION TRIGGERS
-- ====================================================================

-- A. Auto-create a Profile when a user is provisioned in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, company_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Client'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'client'::public.user_role),
    NEW.raw_user_meta_data->>'company_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- B. Auto-create a blank Onboarding record when a project is created
CREATE OR REPLACE FUNCTION public.handle_new_project_onboarding()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.project_onboarding (project_id, client_id)
  VALUES (NEW.id, NEW.client_id)
  ON CONFLICT (client_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_project_created
  AFTER INSERT ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_project_onboarding();

-- C. Auto-update "updated_at" timestamps on modification
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trigger_update_projects BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trigger_update_onboarding BEFORE UPDATE ON public.project_onboarding FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trigger_update_payment_milestones BEFORE UPDATE ON public.payment_milestones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ====================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Helper function to identify Admins securely (SECURITY DEFINER runs as the
-- owner, which bypasses RLS on the inner SELECT — no policy recursion).
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_milestones ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Admin full profiles" ON public.profiles FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Client view own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());

-- PROJECTS
CREATE POLICY "Admin full projects" ON public.projects FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Client view own projects" ON public.projects FOR SELECT TO authenticated USING (client_id = auth.uid());

-- ONBOARDING
CREATE POLICY "Admin full onboarding" ON public.project_onboarding FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Client view own onboarding" ON public.project_onboarding FOR SELECT TO authenticated USING (client_id = auth.uid());
CREATE POLICY "Client update own onboarding" ON public.project_onboarding FOR UPDATE TO authenticated USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());
CREATE POLICY "Client insert own onboarding" ON public.project_onboarding FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid());

-- MILESTONES  (clients read-only via project ownership)
CREATE POLICY "Admin full milestones" ON public.milestones FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Client view own milestones" ON public.milestones FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.projects
  WHERE projects.id = milestones.project_id AND projects.client_id = auth.uid()
));

-- INVOICES  (clients read-only)
CREATE POLICY "Admin full invoices" ON public.invoices FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Client view own invoices" ON public.invoices FOR SELECT TO authenticated USING (client_id = auth.uid());

-- CLIENT FILES  (clients read + insert own)
CREATE POLICY "Admin full files" ON public.client_files FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Client view own files" ON public.client_files FOR SELECT TO authenticated USING (client_id = auth.uid());
CREATE POLICY "Client insert own files" ON public.client_files FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid());

-- PAYMENT MILESTONES  (clients read-only via project ownership)
CREATE POLICY "Admin full payment_milestones" ON public.payment_milestones FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Client view own payment_milestones" ON public.payment_milestones FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.projects
  WHERE projects.id = payment_milestones.project_id AND projects.client_id = auth.uid()
));
