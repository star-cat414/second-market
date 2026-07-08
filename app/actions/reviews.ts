// app/actions/reviews.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createReview(sellerId: string, rating: number, comment: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized. Please log in.' };
  if (user.id === sellerId) return { error: "You cannot review yourself!" };

  const { error } = await supabase
    .from('reviews')
    .insert({
      reviewer_id: user.id,
      seller_id: sellerId,
      rating: rating,
      comment: comment.trim(),
    });

  if (error) {
    if (error.code === '23505') return { error: 'You have already reviewed this seller.' };
    return { error: error.message };
  }

  // 💡 ပြင်ဆင်လိုက်သည့်အပိုင်း: ဒေတာပြောင်းလဲမှုကို နေရာအနှံ့ Live ဖြစ်သွားစေရန် အဓိက လမ်းကြောင်းအားလုံးကို Revalidate လုပ်ခိုင်းခြင်း
  revalidatePath('/profile'); // ရောင်းသူကိုယ်တိုင် သူ့ profile ကိုကြည့်လျှင် ချက်ချင်းပြောင်းလဲရန်
  revalidatePath('/products/[id]', 'layout'); // Product Detail Page တွင် ကြယ်ပွင့်များ ချက်ချင်း အပ်ဒိတ်ဖြစ်ရန်
  revalidatePath('/', 'layout'); // App တစ်ခုလုံးရှိ Layout များကိုပါ Cache ရှင်းပေးရန်

  return { success: true };
}