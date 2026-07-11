// components/admin/ProductTable.tsx
'use client';

import { useTransition } from 'react';
import { deleteProductByAdmin, updateProductStatusByAdmin } from '@/app/actions/admin-products';
import { Trash2, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  current_price: number;
  category: string;
  status: 'active' | 'sold';
  images: string[];
  created_at: string;
}

export default function ProductTable({ products }: { products: Product[] }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      startTransition(async () => {
        const res = await deleteProductByAdmin(id);
        if (res?.error) alert(res.error);
      });
    }
  };

  const handleToggleStatus = (id: string, currentStatus: 'active' | 'sold') => {
    const nextStatus = currentStatus === 'active' ? 'sold' : 'active';
    startTransition(async () => {
      const res = await updateProductStatusByAdmin(id, nextStatus);
      if (res?.error) alert(res.error);
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-zinc-500 dark:text-zinc-400">
          <thead className="bg-zinc-50 dark:bg-zinc-850 text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date Added</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-zinc-400">No products found.</td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850/30 transition">
                  {/* Product Details (Image + Title) */}
                  <td className="px-6 py-4 flex items-center gap-3 font-medium text-zinc-900 dark:text-white">
                    <img 
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80'} 
                      alt={product.title} 
                      className="w-10 h-10 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800"
                    />
                    <div className="max-w-[200px] truncate">
                      <span className="block truncate">{product.title}</span>
                      <Link 
                        href={`/products/${product.id}`} 
                        target="_blank" 
                        className="text-xs text-emerald-500 hover:underline inline-flex items-center gap-0.5 mt-0.5"
                      >
                        View <ExternalLink size={10} />
                      </Link>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4 text-xs font-semibold">{product.category}</td>

                  {/* Price */}
                  <td className="px-6 py-4 font-bold text-zinc-900 dark:text-white">${product.current_price}</td>

                  {/* Status Badge */}
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${
                      product.status === 'active' 
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                    }`}>
                      {product.status}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-xs">{new Date(product.created_at).toLocaleDateString()}</td>

                  {/* Action Buttons (CRUD) */}
                  <td className="px-6 py-4 text-right space-x-2">
                    {/* Toggle Status (Update) */}
                    <button
                      disabled={isPending}
                      onClick={() => handleToggleStatus(product.id, product.status)}
                      title={product.status === 'active' ? 'Mark as Sold' : 'Mark as Active'}
                      className={`p-2 rounded-xl border transition cursor-pointer inline-flex items-center ${
                        product.status === 'active'
                          ? 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500'
                          : 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/10 text-emerald-500'
                      }`}
                    >
                      {product.status === 'active' ? <XCircle size={15} /> : <CheckCircle2 size={15} />}
                    </button>

                    {/* Delete Product (Delete) */}
                    <button
                      disabled={isPending}
                      onClick={() => handleDelete(product.id, product.title)}
                      title="Delete Listing"
                      className="p-2 border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-xl transition cursor-pointer inline-flex items-center"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}