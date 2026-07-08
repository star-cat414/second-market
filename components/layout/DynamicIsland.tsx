// components/layout/DynamicIsland.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link'; // သို့မဟုတ် 'next/link'
import { createClient } from '@/utils/supabase/client';
import { Home, Compass, Search, MessageSquare, User, ShieldCheck, PlusCircle } from 'lucide-react';

interface ProfileProps {
  avatar_url?: string | null;
  role?: string | null;
  [key: string]: unknown;
}

export default function DynamicIsland({ profile }: { profile: ProfileProps | null }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const supabase = createClient();

  // ၁။ အကောင့်ဝင်ထားသော User ID ကို ရယူခြင်း
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    fetchSession();
  }, []);

  // 🔄 ၂။ GLOBAL REAL-TIME LISTENER: မက်ဆေ့ခ်ျအသစ်ဝင်လျှင် Notification Badge တိုးပြရန်
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel('global-navbar-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const newMsg = payload.new;
          // ဝင်လာသော မက်ဆေ့ခ်ျသည် မိမိထံသို့ ပို့ခြင်းဖြစ်ပါက ကောင်တာ တိုးမည်
          if (newMsg.receiver_id === currentUserId) {
            setUnreadCount((prev) => prev + 1);
            
            // Notification Sound လေးပါ မြည်စေခြင်း
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2357/2357-84.wav');
            audio.volume = 0.3;
            audio.play().catch(() => {});
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 hidden md:block select-none">
      <motion.div
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        layout
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] flex items-center justify-center overflow-hidden"
        style={{
          // Admin Panel နှင့် Chat Badge ဆံ့စေရန် Width ကို လိုအပ်သလို အလိုအလျောက် ညှိပေးပါသည်
          width: isExpanded ? (profile?.role === 'admin' ? '580px' : '520px') : (unreadCount > 0 ? '190px' : '160px'),
          height: isExpanded ? '56px' : '44px',
          borderRadius: isExpanded ? '24px' : '9999px',
        }}
      >
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            // ==========================================
            // MINIMALIST COMPACT STATE (ကျုံ့နေသည့် ပုံစံ)
            // ==========================================
            <motion.div
              key="compact"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center justify-between w-full px-6 text-zinc-400 dark:text-zinc-500"
            >
              <Home size={18} className="hover:text-black dark:hover:text-white transition" />
              <Compass size={18} className="hover:text-black dark:hover:text-white transition" />
              <Search size={18} className="hover:text-black dark:hover:text-white transition" />
              
              {/* 🔔 မက်ဆေ့ခ်ျအသစ်ရှိလျှင် ကျုံ့နေစဉ်မှာပါ အနီရောင် Dot ဖြင့် ပြသခြင်း */}
              {unreadCount > 0 && (
                <div className="relative flex items-center justify-center">
                  <MessageSquare size={18} className="text-zinc-800 dark:text-zinc-200 animate-pulse" />
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-500 rounded-full shadow-xs" />
                </div>
              )}
            </motion.div>
          ) : (
            // ==========================================
            // EXPANDED NAVIGATION STATE WITH NOTIFICATION
            // ==========================================
            <motion.div
              key="expanded"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="flex items-center justify-between w-full px-6 text-sm font-medium text-zinc-600 dark:text-zinc-300"
            >
              {/* 1. Home */}
              <Link href="/" className="hover:text-black dark:hover:text-white flex items-center gap-1.5 transition">
                <Home size={16} /> Home
              </Link>

              {/* 2. Browse */}
              <Link href="/browse" className="hover:text-black dark:hover:text-white flex items-center gap-1.5 transition">
                <Compass size={16} /> Browse
              </Link>

              {/* 3. SELL BUTTON */}
              <Link 
                href="/sell" 
                className="px-3.5 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-full text-xs font-bold hover:opacity-85 active:scale-95 transition flex items-center gap-1 shadow-sm"
              >
                <PlusCircle size={14} strokeWidth={2.5} /> Sell
              </Link>

              {/* 4. Chat (🔔 Unread Count Badge အား စာသားဘေးတွင် ထည့်သွင်းခြင်း) */}
              <Link 
                href="/inbox" 
                onClick={() => setUnreadCount(0)} // Inbox နှိပ်ဝင်ပါက ကောင်တာ သုည ပြန်လုပ်ခြင်း
                className="hover:text-black dark:hover:text-white flex items-center gap-1.5 transition relative"
              >
                <MessageSquare size={16} /> 
                <span>Chat</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-extrabold rounded-full leading-none animate-bounce shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* 5. Profile */}
              <Link href="/profile" className="hover:text-black dark:hover:text-white flex items-center gap-1.5 transition">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-5 h-5 rounded-full object-cover border border-zinc-200" />
                ) : (
                  <User size={16} />
                )}
                Profile
              </Link>

              {/* 6. Admin Control Shield */}
              {profile?.role === 'admin' && (
                <Link href="/admin/dashboard" className="text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2.5 py-1 rounded-xl flex items-center gap-1 hover:bg-red-100 dark:hover:bg-red-950/60 transition text-xs border border-red-200/40 dark:border-red-900/40 whitespace-nowrap">
                  <ShieldCheck size={14} /> Admin
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}