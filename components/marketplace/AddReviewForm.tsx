// components/marketplace/AddReviewForm.tsx
'use client';

import { useState, useTransition } from 'react';
import { createReview } from '@/app/actions/reviews';
import { Star, Loader2 } from 'lucide-react';

export default function AddReviewForm({ sellerId }: { sellerId: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    startTransition(async () => {
      const res = await createReview(sellerId, rating, comment);
      if (res?.error) {
        alert(res.error);
      } else {
        alert('Review submitted successfully!');
        setComment('');
      }
    });
  };

  return (
    <form onSubmit={handleReviewSubmit} className="p-5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl space-y-4 shadow-sm">
      <div>
        <h4 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Rate this Seller</h4>
        <p className="text-[11px] text-zinc-400">Share your trading experience with the community</p>
      </div>

      {/* STAR SELECTION */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => setRating(star)}
            className={`transition ${star <= rating ? 'text-amber-500' : 'text-zinc-200 dark:text-zinc-700'}`}
          >
            <Star size={18} fill={star <= rating ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>

      {/* COMMENT TEXTAREA */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
        placeholder="Excellent seller! Polite and fast communication..."
        rows={2}
        className="w-full border border-zinc-100 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 p-3 text-xs focus:outline-none focus:border-zinc-400 resize-none"
      />

      <button
        type="submit"
        disabled={isPending}
        className="w-full h-9 bg-black text-white dark:bg-white dark:text-black text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isPending ? <Loader2 size={12} className="animate-spin" /> : 'Submit Review'}
      </button>
    </form>
  );
}