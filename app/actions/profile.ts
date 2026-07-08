// app/actions/profile.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const username = formData.get('username') as string;
  const location = formData.get('location') as string;
  const bio = formData.get('bio') as string;
  const avatarFile = formData.get('avatar') as File;

  let avatarUrl = formData.get('currentAvatarUrl') as string;

  // 💡 ပုံအသစ် တင်ထားခြင်း ရှိမရှိ စစ်ဆေးပြီး Supabase Storage သို့ Upload တင်ခြင်း
  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile, { upsert: true });

    if (uploadError) return { error: uploadError.message };

    // Public URL အား ပြန်လည်ရယူခြင်း
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    avatarUrl = data.publicUrl;
  }

  // Profiles Table အား ဒေတာအသစ်များဖြင့် Update လုပ်ခြင်း
  const { error } = await supabase
    .from('profiles')
    .update({
      username: username.trim(),
      location: location,
      bio: bio.trim(),
      avatar_url: avatarUrl,
    })
    .eq('id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/profile');
  return { success: true };
}