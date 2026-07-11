// app/actions/admin-products.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// ၁။ Product ကို Delete လုပ်ရန် Action
export async function deleteProductByAdmin(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/products');
  revalidatePath('/admin/dashboard');
  return { success: true };
}

// ၂။ Product Status (Active / Sold) ကို Update လုပ်ရန် Action
export async function updateProductStatusByAdmin(id: string, status: 'active' | 'sold') {
  const supabase = await createClient();

  const { error } = await supabase
    .from('listings')
    .update({ status })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/products');
  return { success: true };
}