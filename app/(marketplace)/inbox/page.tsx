// app/(marketplace)/inbox/page.tsx
'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { sendChatMessage } from '@/app/actions/chat';
import { Send, Loader2, MessageSquare, Tag } from 'lucide-react';

// ၁။ TYPE SAFETY: Error ကင်းစင်စေရန် TypeScript Interfaces များ တိကျစွာ သတ်မှတ်ခြင်း
interface ChatMessage {
  id: string;
  listing_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
}

interface SupabaseUser {
  id: string;
  email?: string;
}

interface ActiveChatRoom {
  listing_id: string;
  partner_id: string;
  partner_name: string;
  last_message: string;
}

// Supabase Join Query Error မတက်စေရန် Structure ပုံစံ သတ်မှတ်ခြင်း
interface ChatJoinPayload {
  id: string;
  listing_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  listings: {
    title: string;
  } | null;
}

function ChatRoomEngine() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const targetSellerId = searchParams.get('seller');
  const targetListingId = searchParams.get('listing');

  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [chatRooms, setChatRooms] = useState<ActiveChatRoom[]>([]); 
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ၂။ သက်ဆိုင်သမျှ Chat Rooms အားလုံးကို ရှာဖွေခြင်း
  useEffect(() => {
    const fetchRoomsAndSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUser({ id: user.id, email: user.email });

      const { data: allMsgs } = await supabase
        .from('chat_messages')
        .select('id, listing_id, sender_id, receiver_id, message, created_at, listings(title)')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (allMsgs) {
        // any အစား ၎င်းတုံ့ပြန်ချက်ကို ChatJoinPayload Array ဖြစ်ကြောင်း ညွှန်ပြခြင်း
        const typedMessages = allMsgs as unknown as ChatJoinPayload[];
        const uniqueRooms: Record<string, ActiveChatRoom> = {};
        
        typedMessages.forEach((msg) => {
          const isMsgSender = msg.sender_id === user.id;
          const partner_id = isMsgSender ? msg.receiver_id : msg.sender_id;
          const roomKey = `${msg.listing_id}-${partner_id}`;

          if (!uniqueRooms[roomKey]) {
            uniqueRooms[roomKey] = {
              listing_id: msg.listing_id,
              partner_id: partner_id,
              partner_name: msg.listings?.title || 'Product Chat',
              last_message: msg.message,
            };
          }
        });
        setChatRooms(Object.values(uniqueRooms));
      }
      setLoading(false);
    };

    fetchRoomsAndSession();
  }, [targetListingId, targetSellerId]);

  // ၃။ လက်ရှိ ရွေးချယ်ထားသော Chat Room ၏ မက်ဆေ့ခ်ျများကိုသာ ဆွဲယူခြင်း
  useEffect(() => {
    if (!currentUser || !targetListingId || !targetSellerId) return;

    const fetchCurrentMessages = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('listing_id', targetListingId)
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${targetSellerId}),and(sender_id.eq.${targetSellerId},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });
      
      setMessages((data as ChatMessage[]) || []);
    };

    fetchCurrentMessages();
  }, [targetListingId, targetSellerId, currentUser]);

  // 🔄 ၄။ Real-time Channel ချိတ်ဆက်ခြင်း
  useEffect(() => {
    if (!targetListingId) return;

    const channel = supabase
      .channel('realtime-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `listing_id=eq.${targetListingId}` },
        (payload) => {
          const insertedMessage = payload.new as ChatMessage;
          setMessages((prev) => [...prev, insertedMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [targetListingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !targetListingId || !targetSellerId) return;

    const msg = newMessage;
    setNewMessage(''); 

    const res = await sendChatMessage(targetListingId, targetSellerId, msg);
    if (res?.error) alert(res.error);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center text-zinc-400 text-sm py-20">
        <Loader2 className="animate-spin mr-2" size={16} /> Loading secure inbox...
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-10rem)]">
      
      {/* LEFT SIDEBAR: ACTIVE CHAT ROOMS LIST */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 pr-0 md:pr-4 overflow-y-auto space-y-2">
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider px-2 mb-3">Active Messages</h2>
        {chatRooms.length > 0 ? (
          chatRooms.map((room) => {
            const isActive = targetListingId === room.listing_id && targetSellerId === room.partner_id;
            return (
              <button
                key={`${room.listing_id}-${room.partner_id}`}
                onClick={() => router.push(`/inbox?seller=${room.partner_id}&listing=${room.listing_id}`)}
                className={`w-full text-left p-3.5 rounded-2xl transition flex flex-col gap-1 ${
                  isActive 
                    ? 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50' 
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/40'
                }`}
              >
                <span className="text-xs font-bold truncate text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Tag size={12} className="text-zinc-400" /> {room.partner_name}
                </span>
                <span className="text-[11px] text-zinc-400 truncate mt-0.5">{room.last_message}</span>
              </button>
            );
          })
        ) : (
          <div className="text-xs text-zinc-400 text-center py-6">No chat history available.</div>
        )}
      </div>

      {/* RIGHT COLUMN: CURRENT CHAT WINDOW */}
      <div className="flex-1 flex flex-col justify-between h-full">
        {targetSellerId && targetListingId ? (
          <>
            {/* MESSAGES DISPLAY */}
            <div className="flex-1 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-4 overflow-y-auto space-y-4 no-scrollbar shadow-inner">
              {messages.length > 0 ? (
                messages.map((msg) => {
                  const isMe = msg.sender_id === currentUser?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm font-medium ${
                        isMe 
                          ? 'bg-black text-white dark:bg-white dark:text-black rounded-tr-none' 
                          : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/50 dark:border-zinc-700/50 rounded-tl-none'
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-xs text-zinc-400">Loading chat thread...</div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT FORM */}
            <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 h-12 px-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm focus:outline-hidden focus:ring-2 focus:ring-black"
              />
              <button type="submit" className="h-12 w-12 bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center">
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 bg-zinc-50 dark:bg-zinc-900/20 border border-dashed rounded-3xl flex flex-col items-center justify-center p-8 text-center text-zinc-400 text-sm">
            <MessageSquare className="mb-2 text-zinc-300" size={32} />
            Select a conversation from the sidebar to view messages.
          </div>
        )}
      </div>

    </div>
  );
}

export default function InboxPage() {
  return (
    <div className="pt-24 pb-12 max-w-5xl mx-auto px-4 select-none">
      <Suspense fallback={<div className="text-center py-20 text-sm text-zinc-400">Loading Engine...</div>}>
        <ChatRoomEngine />
      </Suspense>
    </div>
  );
}