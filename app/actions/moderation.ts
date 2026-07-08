// app/actions/moderation.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// တိုင်ကြားစာအား ပယ်ဖျက်ခြင်း (Dismiss/Reviewed ပြောင်းခြင်း)
export async function dismissReport(reportId: string) {
  const supabase = await createClient();
  await supabase
    .from('item_reports')
    .update({ status: 'reviewed' })
    .eq('id', reportId);

  revalidatePath('/admin/moderation');
}

// ပြဿနာရှိသော Product Listing အား ဒေတာဘေ့စ်မှ လုံးဝ ဖျက်ထုတ်ခြင်း
export async function deleteListingFromReport(listingId: string, reportId: string) {
  const supabase = await createClient();
  
  // Cascade Delete ကြောင့် Listing ဖျက်လျှင် Report ပါ အလိုအလျောက် ပျက်မည်ဖြစ်သည်
  await supabase.from('listings').delete().eq('id', listingId);

  revalidatePath('/admin/moderation');
}