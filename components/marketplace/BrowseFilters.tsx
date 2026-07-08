// components/marketplace/BrowseFilters.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { Search } from 'lucide-react';

const CATEGORIES = ['All', 'Electronics', 'Vehicles', 'Clothing', 'Home', 'Books', 'Others'];

export default function BrowseFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentCategory = searchParams.get('category') || 'All';
  const currentSearch = searchParams.get('search') || '';

  // URL Params ကို Update လုပ်ပေးမည့် အထွေထွေ Function
  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'All') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Page Refresh မဖြစ်ဘဲ Server ထံ ဒေတာအသစ် Live လှမ်းတောင်းခြင်း
    startTransition(() => {
      router.push(`/browse?${params.toString()}`);
    });
  };

  return (
    <div className="space-y-6 select-none">
      {/* 🔍 Search Input Box */}
      <div className="relative max-w-md w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
        <input
          type="text"
          placeholder="Search products, brands, or keywords..."
          defaultValue={currentSearch}
          onChange={(e) => updateParams('search', e.target.value)}
          className="w-full h-11 pl-11 pr-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white/20 transition shadow-2xs"
        />
        {isPending && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-400 animate-pulse">
            Loading...
          </span>
        )}
      </div>

      {/* 💊 Category Pills Horizon Grid */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isActive = currentCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => updateParams('category', cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border border-zinc-200/40 dark:border-zinc-800/60'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}