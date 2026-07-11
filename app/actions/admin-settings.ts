// app/actions/admin-settings.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateSystemSettings(formData: {
  maintenance_mode: boolean;
  platform_fee: number;
  allowed_categories: string;
}) {
  const supabase = await createClient();

  // database ထဲက settings id 'system' (သို့မဟုတ် row id 1) ကို update လုပ်ခြင်း
  const { error } = await supabase
    .from('system_settings')
    .upsert({
      id: 'system',
      maintenance_mode: formData.maintenance_mode,
      platform_fee: formData.platform_fee,
      allowed_categories: formData.allowed_categories.split(',').map(c => c.trim()),
      updated_at: new Date().toISOString(),
    });

  if (error) return { error: error.message };

  revalidatePath('/admin/settings');
  return { success: true };
}