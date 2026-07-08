// app/(marketplace)/profile/page.tsx
import { createClient } from '@/utils/supabase/server';
import ProductCard from '@/components/marketplace/ProductCard';
import ListingManageButtons from '@/components/marketplace/ListingManageButtons';
import EditProfileModal from '@/components/marketplace/EditProfileModal';
import { logoutAction } from '@/app/actions/auth';
import { LogOut, MapPin, Star, Heart, Store } from 'lucide-react';

export const dynamic = 'force-dynamic';

// 💡 TypeScript Interfaces
interface ReviewWithProfile {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  } | null;
}

interface FavoriteWithListing {
  id: string;
  listings: {
    id: string;
    title: string;
    current_price: number;
    original_price: number;
    images: string[] | null;
    category: string;
    status?: string;
  } | null;
}

interface ProfilePageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // URL parameters မှ လက်ရှိ ရောက်နေသည့် tab အား ဖတ်ခြင်း
  const resolvedSearchParams = await searchParams;
  const currentTab = resolvedSearchParams.tab || 'shop';

  if (!user) {
    return <div className="pt-32 text-center text-sm text-zinc-400">Please log in to view your profile.</div>;
  }

  // ၁။ Fetch Profile Info
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  // ၂။ Fetch User's Own Listings (My Shop)
  const { data: myListings } = await supabase.from('listings').select('*').eq('seller_id', user.id);

  // ၃။ Fetch User's Saved Items (Favorites)
  const { data: favoritesData } = await supabase
    .from('favorites')
    .select(`id, listings (*)`)
    .eq('user_id', user.id);

  const favorites = (favoritesData as unknown as FavoriteWithListing[]) || [];

  // ၄။ Fetch Reviews
  const { data: reviewsData } = await supabase
    .from('reviews')
    .select(`
      id, 
      rating, 
      comment, 
      created_at,
      profiles:reviewer_id ( username, avatar_url )
    `)
    .eq('seller_id', user.id);

  const reviews = (reviewsData as unknown as ReviewWithProfile[]) || [];

  // ၅။ Calculate Average Rating
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((acc, item) => acc + item.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  return (
    <div className="pt-28 pb-24 max-w-5xl mx-auto px-4 space-y-8 select-none">
      
      {/* Profile Header Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img 
              src={profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'} 
              alt="Avatar" 
              className="w-20 h-20 rounded-full object-cover border-2 border-zinc-200 dark:border-zinc-800 shadow-inner" 
            />
            <div className="space-y-1">
              <h1 className="text-xl font-bold tracking-tight">{profile?.username}</h1>
              
              <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                <Star size={13} fill="currentColor" />
                <span>{avgRating}</span>
                <span className="text-zinc-400 font-normal">({totalReviews} reviews)</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 pt-0.5">
                <MapPin size={13} className="text-zinc-400" />
                <span>Location: <strong className="text-zinc-700 dark:text-zinc-300">{profile?.location || 'Not Specified'}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:w-auto">
            {profile && <EditProfileModal profile={profile} />}
            
            <form action={logoutAction}>
              <button type="submit" className="px-4 h-9 bg-zinc-50 hover:bg-red-50 dark:bg-zinc-800/40 dark:hover:bg-red-950/20 text-zinc-700 hover:text-red-600 dark:text-zinc-300 dark:hover:text-red-400 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2">
                <LogOut size={13} /> <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/60 max-w-xl">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">About Me / Bio</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed italic">
            {profile?.bio || 'No bio added yet.'}
          </p>
        </div>
      </div>

      {/* 💡 TABS NAVIGATION SYSTEM */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-6">
        <a 
          href="?tab=shop" 
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${currentTab === 'shop' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}
        >
          <Store size={16} /> My Shop ({myListings?.length || 0})
        </a>
        <a 
          href="?tab=favorites" 
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${currentTab === 'favorites' ? 'border-red-500 text-red-500' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}
        >
          <Heart size={16} fill={currentTab === 'favorites' ? 'currentColor' : 'none'} /> Saved Items ({favorites.length})
        </a>
      </div>

      {/* 💡 TABS CONTENT LOGIC */}
      <div>
        {currentTab === 'shop' ? (
          /* ---------- MY SHOP TAB ---------- */
          <div className="space-y-4">
            {myListings && myListings.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {myListings.map((item) => (
                  <div key={item.id} className="flex flex-col bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 p-3 rounded-2xl shadow-sm">
                    <ProductCard product={item} />
                    <ListingManageButtons listingId={item.id} status={item.status} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                <p className="text-sm text-zinc-400">You have not listed any products yet.</p>
              </div>
            )}
          </div>
        ) : (
          /* ---------- FAVORITES TAB ---------- */
          <div className="space-y-4">
            {favorites.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {favorites.map((fav) => {
                  const item = fav.listings;
                  if (!item) return null;
                  return (
                    <ProductCard 
                      key={fav.id} 
                      product={item} 
                      initialFavorited={true} 
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-2">
                <Heart size={28} className="text-zinc-300 mx-auto" />
                <p className="text-sm text-zinc-400">Your watchlist is empty.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* REVIEWS DISPLAY SECTION */}
      <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Customer Reviews</h2>
          <p className="text-xs text-zinc-400">What buyers say about this seller</p>
        </div>

        {reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl flex gap-3">
                <img 
                  src={rev.profiles?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'} 
                  className="w-8 h-8 rounded-full object-cover shrink-0" 
                  alt="Reviewer"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">{rev.profiles?.username || 'Buyer'}</span>
                    <div className="flex text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={10} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300">{rev.comment}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-400 italic">No reviews yet.</p>
        )}
      </div>

    </div>
  );
}