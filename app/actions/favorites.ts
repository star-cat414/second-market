// app/actions/favorites.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleFavorite(listingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Please log in to add favorites.' };

  // ရှိ/မရှိ အရင်စစ်ဆေးခြင်း
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('listing_id', listingId)
    .maybeSingle();

  if (existing) {
    // ရှိပြီးသားဆိုလျှင် ပြန်ဖျက် (Unfavorite) မည်
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', existing.id);

    if (error) return { error: error.message };
    
    revalidatePath('/', 'layout');
    return { success: true, favorited: false };
  } else {
    // မရှိသေးလျှင် အသစ်ထည့် (Favorite) မည်
    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: user.id, listing_id: listingId });

    if (error) return { error: error.message };

    revalidatePath('/', 'layout');
    return { success: true, favorited: true };
  }
}