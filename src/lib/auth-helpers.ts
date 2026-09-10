import 'server-only';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/database.types';
import type { User } from '@supabase/supabase-js';

/** The signed-in user, or throw. */
export async function requireUser(): Promise<User> {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  return user;
}

/** The signed-in user, guaranteed to be an admin, or throw. */
export async function requireAdmin(): Promise<User> {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'admin') throw new Error('Forbidden — admin access required');
  return user;
}

/** Service-role client (bypasses RLS). Only use after requireAdmin(). */
export function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase service-role environment variables');
  return createServiceClient<Database>(url, key, { auth: { persistSession: false } });
}

// Flat shape rather than a discriminated union: this project builds with
// `strict: false`, under which TypeScript will not narrow a union on the
// `success` boolean. A flat interface keeps `.error` / `.data` always safe.
export interface ActionResult<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}

export function fail(error: unknown, fallback: string): ActionResult<never> {
  const message = error instanceof Error ? error.message : fallback;
  console.error(fallback, error);
  return { success: false, error: message };
}
