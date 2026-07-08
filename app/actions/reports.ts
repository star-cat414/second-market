// app/actions/reports.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function reportListingAction(listingId: string, reason: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'You must be logged in to report items.' };

  const { error } = await supabase
    .from('item_reports')
    .insert({
      listing_id: listingId,
      reporter_id: user.id,
      reason: reason.trim(),
      status: 'pending'
    });

  if (error) return { error: error.message };

  revalidatePath('/admin/moderation');
  return { success: true };
}