// app/actions/admin-users.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// ၁။ အသုံးပြုသူအား Delete လုပ်ရန် Action
export async function deleteUserByAdmin(userId: string) {
  const supabase = await createClient();

  // profiles table မှ အရင်ဖျက်ပါမည် (auth.users ကိုတော့ Supabase Admin API ဖြင့်သာ ဖျက်နိုင်ပါသည်)
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) return { error: error.message };

  revalidatePath('/admin/users');
  revalidatePath('/admin/dashboard');
  return { success: true };
}

// ၂။ Role (User <-> Admin) ပြောင်းလဲရန် Action
export async function updateUserRoleByAdmin(userId: string, newRole: 'user' | 'admin') {
  const supabase = await createClient();

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) return { error: error.message };

  revalidatePath('/admin/users');
  return { success: true };
}

// ၃။ User အား Ban / Unban လုပ်ရန် Action
export async function toggleUserBanStatus(userId: string, currentBanStatus: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('profiles')
    .update({ is_banned: !currentBanStatus })
    .eq('id', userId);

  if (error) return { error: error.message };

  revalidatePath('/admin/users');
  return { success: true };
}