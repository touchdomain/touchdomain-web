'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/auth-helpers';

/** Mark the one-time portal welcome walkthrough as seen for the current user. */
export async function dismissPortalIntro(): Promise<{ success: boolean }> {
  try {
    const user = await getAuthedUser();
    if (!user) return { success: false };

    const supabase = createClient();
    await supabase
      .from('profiles')
      .update({ portal_intro_seen_at: new Date().toISOString() })
      .eq('id', user.id);

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Failed to dismiss portal intro:', error);
    return { success: false };
  }
}
