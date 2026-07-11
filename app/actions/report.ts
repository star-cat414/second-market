// app/actions/report.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function reportListing(listingId: string, reason: string, description: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Please log in to report this listing.' };

  const { error } = await supabase
    .from('complaints')
    .insert({
      listing_id: listingId,
      reporter_id: user.id,
      reason: reason,
      description: description,
    });

  if (error) return { error: error.message };

  revalidatePath('/admin/dashboard');
  return { success: true };
}