// app/actions/messages.ts
'use server';

import { createClient } from '@/utils/supabase/server';

export async function sendMessage(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const listingId = formData.get('listingId') as string;
  const receiverId = formData.get('receiverId') as string;
  const content = formData.get('content') as string;

  if (!content.trim()) return;

  const { error } = await supabase.from('messages').insert({
    listing_id: listingId,
    sender_id: user.id,
    receiver_id: receiverId,
    content: content.trim(),
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}