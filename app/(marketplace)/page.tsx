// app/(marketplace)/page.tsx
import { createClient } from '@/utils/supabase/server';
import ProductCard from '../../components/marketplace/ProductCard';
import CategoryBar from '../../components/marketplace/CategoryBar';

export default async function HomePage() {
  const supabase = await createClient();
  
  // Fetch All Products
  const { data: allProducts } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false });

  // Fetch Top Deals (Logic: current_price < original_price)
  const { data: topDeals } = await supabase
    .from('listings')
    .select('*')
    .filter('current_price', 'lt', 'original_price')
    .limit(6);

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 space-y-12">
      {/* 1. Category Horizontal Pills Bar */}
      <CategoryBar />

      {/* 2. Top Deals Carousel */}
      {topDeals && topDeals.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Top Deals</h2>
            <p className="text-sm text-zinc-500">Premium items at dropped prices.</p>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 pt-2 snap-x scrollbar-none">
            {topDeals.map((item) => (
              <div key={item.id} className="snap-start min-w-[260px] sm:min-w-[300px]">
                <ProductCard product={item} isDeal={true} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. All Products Grid */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">All Listings</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {allProducts?.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
    </div>
  );
}