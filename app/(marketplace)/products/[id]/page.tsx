// app/(marketplace)/products/[id]/page.tsx
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Star, Tag, Calendar, MessageSquare } from 'lucide-react';
import AddReviewForm from '@/components/marketplace/AddReviewForm';
import ReportSection from '@/components/marketplace/ReportSection';

export const dynamic = 'force-dynamic';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const supabase = await createClient();
  const { id } = await params;

  // ၁။ ကုန်ပစ္စည်းအချက်အလက်ကို ဆွဲထုတ်ခြင်း
  const { data: product } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single();

  if (!product) return notFound();

  // ၂။ ရောင်းသူ (Seller) ၏ Profile အချက်အလက်ကို ဆွဲထုတ်ခြင်း
  const { data: sellerProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', product.seller_id)
    .single();

  // ၃။ ရောင်းသူ ရရှိထားသော Review များကို တွက်ချက်ရန် Fetch လုပ်ခြင်း
  const { data: sellerReviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('seller_id', product.seller_id);

  const totalReviews = sellerReviews?.length || 0;
  const avgRating = totalReviews > 0
    ? (sellerReviews!.reduce((acc, item) => acc + item.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  // လက်ရှိ Login ဝင်ထားသော အသုံးပြုသူ ID ကို ယူခြင်း (မိမိပစ္စည်းကိုယ်တိုင် ပြန် review ပေးခြင်း ကာကွယ်ရန်)
  const { data: { user } } = await supabase.auth.getUser();
  const isOwnProduct = user?.id === product.seller_id;

  return (
    <div className="pt-28 pb-24 max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 select-none">
      
      {/* LEFT & CENTER: PRODUCT IMAGES & DETAILS (Column 1 & 2) */}
      <div className="md:col-span-2 space-y-6">
        {/* Product Image Carousel / Display */}
        <div className="aspect-video w-full bg-zinc-100 dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-200/60 dark:border-zinc-800/60 relative">
          <img 
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'} 
            alt={product.title}
            className="w-full h-full object-cover"
          />
          {product.status === 'sold' && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
              <span className="px-6 py-2 bg-red-600 text-white font-black text-sm rounded-full tracking-wider uppercase">Sold Out</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold rounded-md flex items-center gap-1">
              <Tag size={10} /> {product.category}
            </span>
            <span className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold rounded-md flex items-center gap-1">
              <Calendar size={10} /> {new Date(product.created_at).toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">{product.title}</h1>
          
          {/* Price Tag */}
          <div className="flex items-baseline gap-3 pt-1">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">${product.current_price}</span>
            {product.original_price && (
              <span className="text-sm text-zinc-400 line-through">${product.original_price}</span>
            )}
          </div>

          {/* Description */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Product Description</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{product.description}</p>
          </div>
        </div>
      </div>

      {/* RIGHT: SELLER INFO, CHAT BUTTON & ADD REVIEW FORM (Column 3) */}
      <div className="space-y-6">
        {/* Seller Info Card */}
        <div className="p-5 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/60 rounded-3xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">About the Seller</h4>
            
            <div className="flex items-center gap-3">
              <img 
                src={sellerProfile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'} 
                alt="Seller Avatar" 
                className="w-12 h-12 rounded-full object-cover border border-zinc-200"
              />
              <div>
                <h5 className="text-sm font-bold text-zinc-900 dark:text-white">{sellerProfile?.username || 'Unknown Seller'}</h5>
                
                {/* Seller's Aggregate Rating */}
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500 mt-0.5">
                  <Star size={12} fill="currentColor" />
                  <span>{avgRating}</span>
                  <span className="text-zinc-400 font-normal">({totalReviews} reviews)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-zinc-500 border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
              <MapPin size={13} className="text-zinc-400" />
              <span>Ships from: <strong className="text-zinc-700 dark:text-zinc-300">{sellerProfile?.location || 'Not Specified'}</strong></span>
            </div>
            
            {sellerProfile?.bio && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 italic bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800/40">
                `{sellerProfile.bio}`
              </p>
            )}

            {/* 💡 CHAT WITH SELLER BUTTON - မိမိပစ္စည်းမဟုတ်မှသာ ပြမည် */}
            {user && !isOwnProduct && (
              <Link 
                href={`/inbox?seller=${product.seller_id}&listing=${product.id}`}
                className="w-full py-3 mt-4 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-xl hover:opacity-90 active:scale-[0.99] transition flex items-center justify-center gap-2 shadow-xs"
              >
                <MessageSquare size={16} />
                <span className="text-sm">Chat with Seller</span>
              </Link>
            )}
          </div>

          {/* 💡 REPORT LISTING BUTTON - တိုင်ကြားရန်နေရာ (မိမိပစ္စည်းမဟုတ်က သိမ်းဆည်းပြသမည်) */}
          {user && !isOwnProduct && (
            <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
              <ReportSection listingId={product.id} />
            </div>
          )}
        </div>

        {/* 💡 ဝယ်သူများ Review ပေးနိုင်မည့်နေရာ (မိမိပစ္စည်းမဟုတ်မှသာ ပြပါမည်) */}
        {user && !isOwnProduct ? (
          <AddReviewForm sellerId={product.seller_id} />
        ) : user && isOwnProduct ? (
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400 rounded-2xl">
            This is your own listing.
          </div>
        ) : (
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400 rounded-2xl flex flex-col gap-2">
            <span>Please log in to chat, review or report this seller.</span>
            <Link href="/login" className="text-black dark:text-white font-semibold underline">Login Here</Link>
          </div>
        )}
      </div>

    </div>
  );
}