// components/marketplace/ChatInterface.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { sendMessage } from '@/app/actions/messages';
import { ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';

// ၁။ Database Structure နှင့် ကိုက်ညီမည့် Type များ သတ်မှတ်ခြင်း
interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

interface Listing {
  id: string;
  title: string | null;
  current_price: number | null;
}

interface Message {
  id: string;
  listing_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  listings: Listing | null;
  sender: Profile | null;
  receiver: Profile | null;
}

interface ThreadItem {
  listing: Listing | null;
  otherUser: Profile | null;
  lastMessage: string;
  listingId: string;
}

// Reduce Accumulator အတွက် Type
interface ThreadAccumulator {
  [key: string]: ThreadItem;
}

interface ChatInterfaceProps {
  initialMessages: Message[];
  currentUserId: string;
}

export default function ChatInterface({ initialMessages, currentUserId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [typedMessage, setTypedMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // စာတွဲများကို Group ဖွဲ့ခြင်း (Listing ID အလိုက် ခွဲထုတ်ခြင်း)
  const threads: ThreadItem[] = Object.values(
    messages.reduce((acc: ThreadAccumulator, msg: Message) => {
      acc[msg.listing_id] = {
        listing: msg.listings,
        otherUser: msg.sender_id === currentUserId ? msg.receiver : msg.sender,
        lastMessage: msg.content,
        listingId: msg.listing_id,
      };
      return acc;
    }, {} as ThreadAccumulator)
  );

  // SUPABASE REAL-TIME WEBSOCKET LISTENER
  useEffect(() => {
    const channel = supabase
      .channel('realtime-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          // စာအသစ်ဝင်လာရင် သက်ဆိုင်ရာ Sender/Receiver Profile Details ပါအောင် ပြန် fetch ပေးခြင်း
          const { data: newMsg } = await supabase
            .from('messages')
            .select(`
              *,
              listings (id, title, current_price),
              sender:profiles!messages_sender_id_fkey (id, username, avatar_url),
              receiver:profiles!messages_receiver_id_fkey (id, username, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single();

          if (newMsg) {
            setMessages((prev) => [...prev, newMsg as unknown as Message]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // စာအသစ်ရောက်ရင် Chat Window ကို အောက်ဆုံးသို့ Auto Scroll ဆွဲပေးခြင်း
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeThread]);

  const filteredMessages = messages.filter((m) => m.listing_id === activeThread);
  const currentActiveThreadObj = threads.find((t) => t.listingId === activeThread);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeThread || !currentActiveThreadObj || !currentActiveThreadObj.otherUser) return;

    const formData = new FormData();
    formData.append('listingId', activeThread);
    formData.append('receiverId', currentActiveThreadObj.otherUser.id);
    formData.append('content', typedMessage);

    setTypedMessage('');
    await sendMessage(formData);
  };

  return (
    <div className="flex w-full h-full border-t border-zinc-200/50 dark:border-zinc-800/50">
      {/* LEFT COLUMN: THREADS LIST */}
      <div className="w-full md:w-80 border-r border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-950 overflow-y-auto">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-900">
          <h1 className="text-xl font-bold tracking-tight">Messages</h1>
        </div>
        <div className="divide-y divide-zinc-50 dark:divide-zinc-900/50">
          {threads.map((thread) => (
            <button
              key={thread.listingId}
              onClick={() => setActiveThread(thread.listingId)}
              className={`w-full p-4 flex items-start gap-3 text-left transition ${
                activeThread === thread.listingId ? 'bg-zinc-100 dark:bg-zinc-900' : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30'
              }`}
            >
              <img 
                src={thread.otherUser?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
                alt="Avatar" 
                className="w-10 h-10 rounded-full object-cover bg-zinc-200" 
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h2 className="text-sm font-semibold truncate">{thread.otherUser?.username || 'Unknown User'}</h2>
                </div>
                <p className="text-xs text-zinc-500 font-medium truncate mt-0.5">{thread.listing?.title}</p>
                <p className="text-xs text-zinc-400 truncate mt-1">{thread.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN: iMESSAGE ACTIVE WINDOW */}
      <div className="flex-1 flex flex-col h-full bg-zinc-50 dark:bg-zinc-900/20">
        {activeThread ? (
          <>
            {/* Header Area */}
            <div className="px-6 py-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50 flex justify-between items-center">
              <div>
                <h2 className="font-semibold text-sm">{currentActiveThreadObj?.otherUser?.username || 'Unknown User'}</h2>
                <p className="text-xs text-zinc-400">
                  {currentActiveThreadObj?.listing?.title} • ${currentActiveThreadObj?.listing?.current_price}
                </p>
              </div>
            </div>

            {/* Chat Bubble List (Apple iMessage Fluid Style) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {filteredMessages.map((msg) => {
                const isMe = msg.sender_id === currentUserId;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                        isMe
                          ? 'bg-blue-500 text-white rounded-br-none shadow-sm'
                          : 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 rounded-bl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form Box */}
            <form onSubmit={handleFormSubmit} className="p-4 bg-white dark:bg-zinc-950 border-t border-zinc-200/50 dark:border-zinc-800/50 flex gap-3 items-center">
              <input
                type="text"
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                placeholder="iMessage"
                className="flex-1 bg-zinc-100 dark:bg-zinc-900 border border-transparent focus:border-zinc-200 rounded-full px-5 py-2.5 text-sm focus:outline-none"
              />
              <button
                type="submit"
                className="p-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full active:scale-95 transition flex items-center justify-center"
              >
                <ArrowUp size={18} strokeWidth={2.5} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-400">
            <p className="text-sm">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}