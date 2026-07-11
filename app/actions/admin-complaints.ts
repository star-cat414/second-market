// app/actions/admin-complaints.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// ၁။ Complaint ကို Dismiss လုပ်ရန် (အရေးမယူဘဲ ပယ်ဖျက်ရန်)
export async function dismissReport(reportId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('complaints')
    .update({ status: 'resolved' }) // သို့မဟုတ် 'dismissed' (သင့် Schema အပေါ်မူတည်၍)
    .eq('id', reportId);

  if (error) return { error: error.message };

  revalidatePath('/admin/complaints');
  revalidatePath('/admin/dashboard');
  return { success: true };
}

// ၂။ Complaint ကို အတည်ပြုပြီး ထိုကုန်ပစ္စည်းကို တစ်ခါတည်း ဖြုတ်ချရန် (Resolve & Delete)
export async function resolveAndDeleteProduct(reportId: string, listingId: string) {
  const supabase = await createClient();

  // ကုန်ပစ္စည်းကို အရင်ဖျက်ပါမည်
  const { error: productError } = await supabase
    .from('listings')
    .delete()
    .eq('id', listingId);

  if (productError) return { error: productError.message };

  // တိုင်ကြားစာ Status ကို Resolved ပြောင်းပါမည်
  const { error: reportError } = await supabase
    .from('item_reports')
    .update({ status: 'resolved' })
    .eq('id', reportId);

  if (reportError) return { error: reportError.message };

  revalidatePath('/admin/complaints');
  revalidatePath('/admin/products');
  revalidatePath('/admin/dashboard');
  return { success: true };
}