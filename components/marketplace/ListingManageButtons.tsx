// components/marketplace/ListingManageButtons.tsx
'use client';

import { useTransition } from 'react';
import { updateListingStatus, deleteUserListing } from '@/app/actions/listings';
import { CheckCircle2, Trash2, Loader2 } from 'lucide-react';

interface ManageButtonsProps {
  listingId: string;
  status: string;
}

export default function ListingManageButtons({ listingId, status }: ManageButtonsProps) {
  const [isPending, startTransition] = useTransition();

  // ၁။ ရောင်းထွက်သွားကြောင်း အမှတ်အသားပြုလုပ်ခြင်း
  const handleMarkAsSold = () => {
    if (confirm('Are you sure this item is sold?')) {
      startTransition(async () => {
        // 💡 ပြင်ဆင်လိုက်သည့် အပိုင်း- as 'sold' အစား as const ဟု ပြောင်းလဲပေးလိုက်ခြင်းဖြင့် အဆင်ပြေသွားပါမည်။
        await updateListingStatus(listingId, 'sold' as const);
      });
    }
  };

  // ၂။ ပစ္စည်းအား ပြန်လည်ဖျက်သိမ်းခြင်း
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this listing? This cannot be undone.')) {
      startTransition(async () => {
        await deleteUserListing(listingId);
      });
    }
  };

  return (
    <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 mt-2">
      {status !== 'sold' ? (
        <button
          onClick={handleMarkAsSold}
          disabled={isPending}
          className="flex-1 py-1.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 text-[11px] font-semibold rounded-xl text-zinc-700 dark:text-zinc-300 flex items-center justify-center gap-1 transition disabled:opacity-50"
        >
          {isPending ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
          Mark as Sold
        </button>
      ) : (
        <span className="flex-1 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-center text-[11px] font-bold rounded-xl">
          Sold Out ✓
        </span>
      )}

      <button
        onClick={handleDelete}
        disabled={isPending}
        className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 rounded-xl transition disabled:opacity-50"
        title="Delete Listing"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}