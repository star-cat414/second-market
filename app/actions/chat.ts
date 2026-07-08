// app/actions/chat.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function sendChatMessage(listingId: string, receiverId: string, message: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };
  if (!message.trim()) return { error: 'Message cannot be empty' };

  const { error } = await supabase
    .from('chat_messages')
    .insert({
      listing_id: listingId,
      sender_id: user.id,
      receiver_id: receiverId,
      message: message.trim()
    });

  if (error) return { error: error.message };

  revalidatePath('/inbox');
  return { success: true };
}