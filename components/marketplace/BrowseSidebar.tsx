// components/marketplace/BrowseSidebar.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

// ၁။ currentFilters အတွက် တိကျတဲ့ Type Structure တစ်ခု သတ်မှတ်ပေးခြင်း
interface FilterProps {
  q?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
}

export default function BrowseSidebar({ currentFilters }: { currentFilters: FilterProps }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(currentFilters.q || '');
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice || '');

  // Live Sync Search Parameter
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) params.set('q', search.toString());
      else params.delete('q');
      router.push(`/browse?${params.toString()}`);
    }, 400); // 400ms Debounce Rate

    return () => clearTimeout(delayDebounce);
  }, [search, searchParams, router]); // Dependency array တွင် လိုအပ်သည်များ ဖြည့်စွက်ထားသည်

  const applyPriceFilter = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set('minPrice', minPrice.toString());
    else params.delete('minPrice');
    
    if (maxPrice) params.set('maxPrice', maxPrice.toString());
    else params.delete('maxPrice');
    
    router.push(`/browse?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold tracking-tight">Filters</h2>
        <p className="text-xs text-zinc-400">Refine marketplace items instantly.</p>
      </div>

      {/* Text Keyword Input Search */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Search Key</label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="What are you buying?"
          className="w-full px-3.5 py-2 rounded-xl text-sm border border-zinc-200 dark:border-zinc-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
        />
      </div>

      {/* Price Form Range */}
      <form onSubmit={applyPriceFilter} className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Price Range ($)</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl text-sm border border-zinc-200 dark:border-zinc-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-black"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl text-sm border border-zinc-200 dark:border-zinc-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-medium text-xs rounded-xl hover:opacity-90 active:scale-[0.98] transition"
        >
          Apply Limit
        </button>
      </form>
    </div>
  );
}