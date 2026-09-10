'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ProjectOnboarding } from '@/lib/database.types';

// Columns a client is allowed to write from the questionnaire. Anything else
// (client_id, status, submitted_at, timestamps) is managed server-side.
const EDITABLE_FIELDS = [
  'business_name', 'business_goals', 'brand_identity', 'content_strategy',
  'tech_infrastructure', 'design_preferences', 'primary_goal', 'target_audience',
  'unique_value_prop', 'competitors', 'brand_colors', 'brand_fonts', 'brand_vibe',
  'copywriting_status', 'photography_status', 'primary_cta', 'domain_status',
  'secure_credential_links', 'third_party_integrations', 'design_likes',
  'design_dislikes', 'must_have_features',
] as const satisfies readonly (keyof ProjectOnboarding)[];

export type OnboardingInput = Partial<Record<(typeof EDITABLE_FIELDS)[number], string>>;

// Flat shape (not a discriminated union) — this project builds with
// `strict: false`, which disables union narrowing on the `success` flag.
type ActionResult<T = undefined> = {
  success: boolean;
  data?: T;
  error?: string;
};

// POPIA: don't let raw credentials get persisted in free-text answers.
const SECRET_PATTERNS: RegExp[] = [
  /\bpass(word|wd|phrase)?\s*[:=]/i,
  /\bapi[\s_-]?key\s*[:=]/i,
  /\b(secret|token|credential)s?\s*[:=]/i,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
];

function looksLikeCredential(value: string): boolean {
  return SECRET_PATTERNS.some((re) => re.test(value));
}

export async function getOnboardingProgress(): Promise<ActionResult<ProjectOnboarding | null>> {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    const { data, error } = await supabase
      .from('project_onboarding')
      .select('*')
      .eq('client_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return { success: true, data: data ?? null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load onboarding';
    console.error('Get Onboarding Error:', error);
    return { success: false, error: message };
  }
}

export async function saveOnboardingProgress(input: OnboardingInput): Promise<ActionResult> {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    // Keep only known columns.
    const payload: Record<string, string> = {};
    for (const key of EDITABLE_FIELDS) {
      const v = input[key];
      if (typeof v === 'string') payload[key] = v;
    }

    for (const [key, value] of Object.entries(payload)) {
      if (key !== 'secure_credential_links' && looksLikeCredential(value)) {
        return {
          success: false,
          error:
            "Please don't paste passwords or keys into the answers. Share them as a one-time secret link (e.g. onetimesecret.com) in the “Secure credential links” field instead.",
        };
      }
    }

    const { error } = await supabase
      .from('project_onboarding')
      .upsert(
        { client_id: user.id, status: 'in_progress', ...payload },
        { onConflict: 'client_id' }
      );

    if (error) throw error;

    revalidatePath('/dashboard/onboarding');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save onboarding';
    console.error('Save Onboarding Error:', error);
    return { success: false, error: message };
  }
}

export async function submitOnboarding(): Promise<ActionResult> {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    const { error } = await supabase
      .from('project_onboarding')
      .update({ status: 'submitted', submitted_at: new Date().toISOString() })
      .eq('client_id', user.id);

    if (error) throw error;

    revalidatePath('/dashboard/onboarding');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit onboarding';
    console.error('Submit Onboarding Error:', error);
    return { success: false, error: message };
  }
}
