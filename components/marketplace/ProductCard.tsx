// components/marketplace/ProductCard.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useState, useTransition } from 'react';
import { toggleFavorite } from '@/app/actions/favorites';

interface Product {
  id: string;
  title: string;
  current_price: number;
  original_price: number;
  images: string[] | null; // 💡 ဒေတာဘေ့စ်တွင် null ဖြစ်နိုင်ခြေကိုပါ ကာကွယ်ရန် ပြင်ဆင်ခြင်း
  category: string;
  status?: string;
}

interface ProductCardProps {
  product: Product;
  isDeal?: boolean;
  initialFavorited?: boolean; // 💡 ကနဦး Favorite အခြေအနေ (Saved/Unsaved) ကို လက်ခံရန် ထည့်သွင်းခြင်း
}

export default function ProductCard({ product, isDeal = false, initialFavorited = false }: ProductCardProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  const hasPriceDrop = product.current_price < product.original_price;
  const discountPercentage = hasPriceDrop 
    ? Math.round(((product.original_price - product.current_price) / product.original_price) * 100) 
    : 0;

  const isSold = product.status === 'sold';

  // 💡 Heart Icon နှိပ်လိုက်သည့်အခါ Server Action သို့ လှမ်းပို့မည့် Function
  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Card တစ်ခုလုံးကို Link ချိတ်ထားသဖြင့် စာမျက်နှာအသစ်သို့ မရောက်သွားစေရန် တားဆီးခြင်း
    if (isPending) return;

    startTransition(async () => {
      const res = await toggleFavorite(product.id);
      if (res?.error) {
        alert(res.error);
      } else if (res?.success) {
        setIsFavorited(res.favorited ?? false);
      }
    });
  };

  return (
    <motion.div
      whileHover={!isSold ? { y: -6 } : {}} // ရောင်းထွက်ပြီးသားပစ္စည်းဆိုလျှင် Hover Animation ပိတ်ထားမည်
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow select-none"
    >
      {/* 💡 HEART BUTTON (FAVORITE TOGGLE) - ရောင်းထွက်သွားပါက နှိပ်ခွင့်ပိတ်ထားမည် */}
      {!isSold && (
        <button
          onClick={handleFavoriteToggle}
          disabled={isPending}
          className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-full shadow-sm text-zinc-400 hover:text-red-500 transition-colors z-20 cursor-pointer"
        >
          <Heart 
            size={16} 
            fill={isFavorited ? '#ef4444' : 'none'} 
            className={`transition-transform duration-200 ${isFavorited ? 'text-red-500 scale-110' : ''}`} 
          />
        </button>
      )}

      {/* 🔗 Dynamic Route လမ်းကြောင်းအသစ်သို့ ချိတ်ဆက်ခြင်း */}
      <Link href={`/products/${product.id}`}>
        
        {/* Product Image Area */}
        <div className="aspect-square w-full bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500'}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Discount Pill */}
          {isDeal && hasPriceDrop && !isSold && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm z-10">
              -{discountPercentage}% OFF
            </span>
          )}

          {/* 🔴 SOLD OUT OVERLAY (ရောင်းထွက်သွားပါက Blur ပုံစံဖြင့် အုပ်ထားမည်) */}
          {isSold && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-10">
              <span className="px-3 py-1.5 bg-white text-black font-extrabold text-[10px] uppercase tracking-wider rounded-lg shadow-md">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Info Content Area */}
        <div className={`p-4 space-y-1.5 ${isSold ? 'opacity-50' : ''}`}>
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
            {product.category}
          </span>
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">
            {product.title}
          </h3>
          
          {/* Prices Logic */}
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              ${product.current_price.toLocaleString()}
            </span>
            {hasPriceDrop && (
              <span className="text-xs text-zinc-400 line-through">
                ${product.original_price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}