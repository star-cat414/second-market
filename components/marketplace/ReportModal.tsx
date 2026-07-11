// components/marketplace/ReportModal.tsx
'use client';

import { useState, useTransition } from 'react';
import { reportListing } from '@/app/actions/report';
import { AlertTriangle, Loader2, X } from 'lucide-react';

export default function ReportModal({ listingId, onClose }: { listingId: string; onClose: () => void }) {
  const [reason, setReason] = useState('Fake Product / Scam');
  const [description, setDescription] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await reportListing(listingId, reason, description);
      if (res?.error) {
        alert(res.error);
      } else {
        alert('Thank you. This listing has been reported to admins.');
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md p-6 rounded-3xl space-y-4 shadow-2xl">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold flex items-center gap-2 text-red-500">
            <AlertTriangle size={16} /> Report Content
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Reason</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full h-11 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm cursor-pointer">
              <option value="Fake Product / Scam">Fake Product / Scam</option>
              <option value="Inappropriate Content">Inappropriate Content</option>
              <option value="Harassment / Hate Speech">Harassment / Hate Speech</option>
              <option value="Misleading Price">Misleading Price</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Details (Optional)</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide more details about your report..." className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none" />
          </div>

          <button type="submit" disabled={isPending} className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
            {isPending && <Loader2 size={16} className="animate-spin" />}
            Submit Report
          </button>
        </form>
      </div>
    </div>
  );
}