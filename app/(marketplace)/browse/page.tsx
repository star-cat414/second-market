// app/(marketplace)/browse/page.tsx
import { createClient } from '@/utils/supabase/server';
import ProductCard from '@/components/marketplace/ProductCard';
import BrowseSidebar from '@/components/marketplace/BrowseSidebar';

interface SearchParams {
  q?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createClient();
  const filters = await searchParams;

  // ၁။ Base Supabase Query စတင်တည်ဆောက်ခြင်း 
  // 💡 ပြင်ဆင်လိုက်သည့်အပိုင်း: ရောင်းထွက်သွားသော (sold) ပစ္စည်းများ မပါဝင်စေရန် status အား 'active' ဖြစ်သည်များကိုသာ ယူခိုင်းထားပါသည်
  let query = supabase
    .from('listings')
    .select('*')
    .eq('status', 'active');

  // ၂။ URL Filters Processing (ဝင်လာသော Params များနှင့် ဒေတာဘေ့စ်ကို Live ညှိနှိုင်းခြင်း)
  
  // စာသားဖြင့် ရှာဖွေခြင်း (Title ကို Case-Insensitive ဖြင့် စစ်ထုတ်ခြင်း)
  if (filters.q) {
    query = query.ilike('title', `%${filters.q}%`);
  }
  
  // အမျိုးအစားအလိုက် စစ်ထုတ်ခြင်း 
  // (Case Sensitivity ကြောင့် ဒေတာပျောက်ဆုံးမှု မရှိစေရန် ilike ကို အသုံးပြုထားပါသည်)
  if (filters.category && filters.category !== 'All') {
    query = query.ilike('category', filters.category);
  }
  
  // အနည်းဆုံး ဈေးနှုန်း ကန့်သတ်ချက် စစ်ဆေးခြင်း
  if (filters.minPrice) {
    query = query.gte('current_price', parseFloat(filters.minPrice));
  }
  
  // အများဆုံး ဈေးနှုန်း ကန့်သတ်ချက် စစ်ဆေးခြင်း
  if (filters.maxPrice) {
    query = query.lte('current_price', parseFloat(filters.maxPrice));
  }

  // လတ်တလောတင်ထားသော ပစ္စည်းများကို အပေါ်ဆုံးမှ ပြသရန် စီစဉ်ခြင်း
  const { data: listings } = await query.order('created_at', { ascending: false });

  return (
    <div className="pt-20 min-h-screen flex flex-col md:flex-row select-none">
      
      {/* Left Column: Filter Sidebar (ဈေးနှုန်းနှင့် အမျိုးအစား ရွေးချယ်ရန် ဘေးဘား) */}
      <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-zinc-200/60 dark:border-zinc-800/60 p-6 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md">
        <BrowseSidebar currentFilters={filters} />
      </aside>

      {/* Right Column: Dynamic Results Grid (ရှာဖွေတွေ့ရှိသော ရလဒ်များ ပြသရန်နေရာ) */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Browse Results
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Found {listings?.length || 0} items available on Second Market
              </p>
            </div>
          </div>
          
          {/* ရလဒ်များအား Grid ပုံစံဖြင့် ထုတ်ပြခြင်း */}
          {listings && listings.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {listings.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
              <p className="text-sm font-medium text-zinc-400">
                No listings found matching the criteria.
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Try adjusting your price range or check a different category.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}