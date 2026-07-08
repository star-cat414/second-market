// components/marketplace/CategoryBar.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

const CATEGORIES = ['All', 'Electronics', 'Apparel', 'Home Goods', 'Vehicles'];

export default function CategoryBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') || 'All';

  const handleCategorySelect = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === 'All') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    router.push(`/browse?${params.toString()}`);
  };

  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-none">
      <div className="flex gap-2.5">
        {CATEGORIES.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              onClick={() => handleCategorySelect(category)}
              className={cn(
                "px-5 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all duration-200",
                "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:scale-105 active:scale-95",
                isActive && "bg-black dark:bg-white text-white dark:text-black shadow-sm"
              )}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}