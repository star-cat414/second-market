// components/layout/MobileDock.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, PlusCircle, MessageSquare, User } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function MobileDock() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Browse', href: '/browse', icon: Compass },
    { label: 'Sell', href: '/sell', icon: PlusCircle },
    { label: 'Chat', href: '/inbox', icon: MessageSquare },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 md:hidden">
      <div className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl rounded-2xl px-4 py-3 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-zinc-400 transition-all duration-200 active:scale-90",
                isActive && "text-black dark:text-white font-medium"
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}