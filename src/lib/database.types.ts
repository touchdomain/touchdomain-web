// Types for the Touch Domain Client Portal database (see supabase/schema.sql).
//
// Written to match the shape `supabase gen types typescript` produces, so it
// can be swapped for the generated file later without touching call sites.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'admin' | 'client';
export type InvoiceStatus = 'unpaid' | 'paid' | 'overdue' | 'cancelled';
export type ProjectStatus = 'discovery' | 'in_progress' | 'review' | 'completed' | 'paused';
export type OnboardingStatus = 'not_started' | 'in_progress' | 'submitted' | 'reviewed';
export type PaymentStatus = 'pending' | 'invoiced' | 'partial' | 'paid' | 'waived';
export type ContractStatus = 'draft' | 'sent' | 'client_signed' | 'executed' | 'void';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          email: string;
          phone: string | null;
          company_name: string | null;
          drive_folder_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          full_name: string;
          email: string;
          phone?: string | null;
          company_name?: string | null;
          drive_folder_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [
          { foreignKeyName: 'profiles_id_fkey'; columns: ['id']; referencedRelation: 'users'; referencedColumns: ['id'] },
        ];
      };
      projects: {
        Row: {
          id: string;
          client_id: string;
          title: string;
          description: string | null;
          status: ProjectStatus;
          progress_percentage: number;
          google_drive_folder_id: string | null;
          target_launch_date: string | null;
          total_fee_zar: number | null;
          playbooks: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          title: string;
          description?: string | null;
          status?: ProjectStatus;
          progress_percentage?: number;
          google_drive_folder_id?: string | null;
          target_launch_date?: string | null;
          total_fee_zar?: number | null;
          playbooks?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
        Relationships: [
          { foreignKeyName: 'projects_client_id_fkey'; columns: ['client_id']; referencedRelation: 'profiles'; referencedColumns: ['id'] },
        ];
      };
      project_onboarding: {
        Row: {
          id: string;
          project_id: string | null;
          client_id: string;
          status: OnboardingStatus;
          business_name: string | null;
          business_goals: string | null;
          brand_identity: string | null;
          content_strategy: string | null;
          tech_infrastructure: string | null;
          design_preferences: string | null;
          primary_goal: string | null;
          target_audience: string | null;
          unique_value_prop: string | null;
          competitors: string | null;
          brand_colors: string | null;
          brand_fonts: string | null;
          brand_vibe: string | null;
          copywriting_status: string | null;
          photography_status: string | null;
          primary_cta: string | null;
          domain_status: string | null;
          secure_credential_links: string | null;
          third_party_integrations: string | null;
          design_likes: string | null;
          design_dislikes: string | null;
          must_have_features: string | null;
          discovery: Json;
          submitted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          client_id: string;
          status?: OnboardingStatus;
          discovery?: Json;
          business_name?: string | null;
          business_goals?: string | null;
          brand_identity?: string | null;
          content_strategy?: string | null;
          tech_infrastructure?: string | null;
          design_preferences?: string | null;
          primary_goal?: string | null;
          target_audience?: string | null;
          unique_value_prop?: string | null;
          competitors?: string | null;
          brand_colors?: string | null;
          brand_fonts?: string | null;
          brand_vibe?: string | null;
          copywriting_status?: string | null;
          photography_status?: string | null;
          primary_cta?: string | null;
          domain_status?: string | null;
          secure_credential_links?: string | null;
          third_party_integrations?: string | null;
          design_likes?: string | null;
          design_dislikes?: string | null;
          must_have_features?: string | null;
          submitted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['project_onboarding']['Insert']>;
        Relationships: [
          { foreignKeyName: 'project_onboarding_project_id_fkey'; columns: ['project_id']; referencedRelation: 'projects'; referencedColumns: ['id'] },
          { foreignKeyName: 'project_onboarding_client_id_fkey'; columns: ['client_id']; referencedRelation: 'profiles'; referencedColumns: ['id'] },
        ];
      };
      milestones: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          due_date: string | null;
          is_completed: boolean;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          due_date?: string | null;
          is_completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['milestones']['Insert']>;
        Relationships: [
          { foreignKeyName: 'milestones_project_id_fkey'; columns: ['project_id']; referencedRelation: 'projects'; referencedColumns: ['id'] },
        ];
      };
      invoices: {
        Row: {
          id: string;
          client_id: string;
          project_id: string | null;
          invoice_number: string;
          amount_zar: number;
          status: InvoiceStatus;
          due_date: string;
          description: string | null;
          reference: string | null;
          is_tax_invoice: boolean;
          pdf_drive_file_id: string | null;
          pdf_storage_path: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          project_id?: string | null;
          invoice_number: string;
          amount_zar: number;
          status?: InvoiceStatus;
          due_date: string;
          description?: string | null;
          reference?: string | null;
          is_tax_invoice?: boolean;
          pdf_drive_file_id?: string | null;
          pdf_storage_path?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>;
        Relationships: [
          { foreignKeyName: 'invoices_client_id_fkey'; columns: ['client_id']; referencedRelation: 'profiles'; referencedColumns: ['id'] },
          { foreignKeyName: 'invoices_project_id_fkey'; columns: ['project_id']; referencedRelation: 'projects'; referencedColumns: ['id'] },
        ];
      };
      contracts: {
        Row: {
          id: string;
          client_id: string;
          project_id: string | null;
          doc_type: string;
          title: string;
          sow_reference: string | null;
          status: ContractStatus;
          source_drive_file_id: string;
          source_pdf_sha256: string;
          client_signer_name: string | null;
          client_signed_at: string | null;
          client_signed_ip: string | null;
          client_signature_png: string | null;
          rep_signer_name: string | null;
          rep_signed_at: string | null;
          rep_signed_ip: string | null;
          executed_drive_file_id: string | null;
          executed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          project_id?: string | null;
          doc_type: string;
          title: string;
          sow_reference?: string | null;
          status?: ContractStatus;
          source_drive_file_id: string;
          source_pdf_sha256: string;
          client_signer_name?: string | null;
          client_signed_at?: string | null;
          client_signed_ip?: string | null;
          client_signature_png?: string | null;
          rep_signer_name?: string | null;
          rep_signed_at?: string | null;
          rep_signed_ip?: string | null;
          executed_drive_file_id?: string | null;
          executed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['contracts']['Insert']>;
        Relationships: [
          { foreignKeyName: 'contracts_client_id_fkey'; columns: ['client_id']; referencedRelation: 'profiles'; referencedColumns: ['id'] },
          { foreignKeyName: 'contracts_project_id_fkey'; columns: ['project_id']; referencedRelation: 'projects'; referencedColumns: ['id'] },
        ];
      };
      payment_proofs: {
        Row: {
          id: string;
          invoice_id: string;
          client_id: string;
          drive_file_id: string;
          file_name: string;
          mime_type: string;
          view_link: string | null;
          note: string | null;
          amount_zar: number | null;
          reviewed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          client_id: string;
          drive_file_id: string;
          file_name: string;
          mime_type: string;
          view_link?: string | null;
          note?: string | null;
          amount_zar?: number | null;
          reviewed?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['payment_proofs']['Insert']>;
        Relationships: [
          { foreignKeyName: 'payment_proofs_invoice_id_fkey'; columns: ['invoice_id']; referencedRelation: 'invoices'; referencedColumns: ['id'] },
          { foreignKeyName: 'payment_proofs_client_id_fkey'; columns: ['client_id']; referencedRelation: 'profiles'; referencedColumns: ['id'] },
        ];
      };
      payment_milestones: {
        Row: {
          id: string;
          project_id: string;
          label: string;
          sort_order: number;
          percentage: number | null;
          amount_zar: number;
          amount_paid_zar: number;
          due_date: string | null;
          status: PaymentStatus;
          invoice_id: string | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          label: string;
          sort_order?: number;
          percentage?: number | null;
          amount_zar: number;
          amount_paid_zar?: number;
          due_date?: string | null;
          status?: PaymentStatus;
          invoice_id?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['payment_milestones']['Insert']>;
        Relationships: [
          { foreignKeyName: 'payment_milestones_project_id_fkey'; columns: ['project_id']; referencedRelation: 'projects'; referencedColumns: ['id'] },
          { foreignKeyName: 'payment_milestones_invoice_id_fkey'; columns: ['invoice_id']; referencedRelation: 'invoices'; referencedColumns: ['id'] },
        ];
      };
      client_files: {
        Row: {
          id: string;
          client_id: string;
          project_id: string | null;
          file_name: string;
          mime_type: string;
          drive_file_id: string;
          file_size_bytes: number | null;
          view_link: string | null;
          download_link: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          project_id?: string | null;
          file_name: string;
          mime_type: string;
          drive_file_id: string;
          file_size_bytes?: number | null;
          view_link?: string | null;
          download_link?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['client_files']['Insert']>;
        Relationships: [
          { foreignKeyName: 'client_files_client_id_fkey'; columns: ['client_id']; referencedRelation: 'profiles'; referencedColumns: ['id'] },
          { foreignKeyName: 'client_files_project_id_fkey'; columns: ['project_id']; referencedRelation: 'projects'; referencedColumns: ['id'] },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      user_role: UserRole;
      invoice_status: InvoiceStatus;
      project_status: ProjectStatus;
      onboarding_status: OnboardingStatus;
      payment_status: PaymentStatus;
      contract_status: ContractStatus;
    };
    CompositeTypes: { [_ in never]: never };
  };
}

// ── Convenience row aliases ──────────────────────────────────────────
type Tables = Database['public']['Tables'];
export type Profile = Tables['profiles']['Row'];
export type Project = Tables['projects']['Row'];
export type ProjectOnboarding = Tables['project_onboarding']['Row'];
export type Milestone = Tables['milestones']['Row'];
export type Invoice = Tables['invoices']['Row'];
export type ClientFile = Tables['client_files']['Row'];
export type PaymentMilestone = Tables['payment_milestones']['Row'];
export type PaymentProof = Tables['payment_proofs']['Row'];
export type Contract = Tables['contracts']['Row'];
