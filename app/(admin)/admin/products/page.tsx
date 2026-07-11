// app/(admin)/admin/products/page.tsx
import { createClient } from '@/utils/supabase/server';
import ProductTable from '@/components/admin/ProductTable';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const supabase = await createClient();

  // Supabase မှ ပစ္စည်းအားလုံးကို ရက်စွဲအလိုက် နောက်ဆုံးတင်ထားတာ အရင်ပြရန် Fetch လုပ်ခြင်း (Read)
  const { data: products } = await supabase
    .from('listings')
    .select('id, title, current_price, category, status, images, created_at')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
        <p className="text-sm text-zinc-400">Review, update status, or remove marketplace listings.</p>
      </div>

      {/* 📊 PRODUCT CRUD TABLE */}
      <ProductTable products={products || []} />
    </div>
  );
}