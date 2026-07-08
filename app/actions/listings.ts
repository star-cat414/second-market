// app/actions/listings.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * ၁။ CREATE LISTING ACTION (သင်အသုံးပြုထားသော ကုဒ်ဟောင်း)
 * ကုန်ပစ္စည်းအသစ် တင်ရောင်းရန်အတွက် ဒေတာဘေ့စ်ထဲသို့ ထည့်သွင်းခြင်း
 */
export async function createListing(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as string;
  const originalPrice = parseFloat(formData.get('originalPrice') as string);
  const currentPrice = parseFloat(formData.get('currentPrice') as string);
  const imageUrls = formData.getAll('images') as string[];

  const { error } = await supabase.from('listings').insert({
    seller_id: user.id,
    title,
    description,
    category,
    original_price: originalPrice,
    current_price: currentPrice,
    images: imageUrls,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/');
  redirect('/');
}

/**
 * ၂။ UPDATE LISTING STATUS ACTION (အသစ်ဖြည့်စွက်ထားသောအပိုင်း)
 * ကုန်ပစ္စည်းအား ရောင်းထွက်သွားကြောင်း (Sold) သို့မဟုတ် ပြန်လည်ရောင်းချမည် (Active) ဖြစ်ကြောင်း ပြောင်းလဲခြင်း
 */
export async function updateListingStatus(listingId: string, status: 'active' | 'sold') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('listings')
    .update({ status: status })
    .eq('id', listingId)
    .eq('seller_id', user.id); // မိမိပစ္စည်းကိုသာ ပြင်ခွင့်ရှိစေရန် လုံခြုံရေးအရ ကန့်သတ်ခြင်း

  if (error) return { error: error.message };

  // ရလဒ်များကို ချက်ချင်း Update ဖြစ်စေရန် Cache ရှင်းပေးခြင်း
  revalidatePath('/profile');
  revalidatePath('/browse');
  return { success: true };
}

/**
 * ၃။ DELETE USER LISTING ACTION (အသစ်ဖြည့်စွက်ထားသောအပိုင်း)
 * အသုံးပြုသူမှ မိမိတင်ထားသော ကုန်ပစ္စည်းအား လုံးဝ (Permanent) ပြန်လည်ဖျက်သိမ်းခြင်း
 */
export async function deleteUserListing(listingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', listingId)
    .eq('seller_id', user.id); // မိမိပစ္စည်းကိုသာ ဖျက်ခွင့်ရှိစေရန် ကန့်သတ်ခြင်း

  if (error) return { error: error.message };

  revalidatePath('/profile');
  revalidatePath('/browse');
  return { success: true };
}