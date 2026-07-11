// components/marketplace/ReportSection.tsx
'use client';

import { useState, useTransition } from 'react';
import { reportListing } from '@/app/actions/report';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface ReportSectionProps {
  listingId: string;
}

export default function ReportSection({ listingId }: ReportSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
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
        setIsOpen(false);
        setDescription('');
      }
    });
  };

  return (
    <div className="w-full">
      {/* ⚠️ REPORT THIS LISTING BUTTON */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-2.5 border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 font-medium text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <AlertTriangle size={13} />
        Report this listing
      </button>

      {/* MODAL POPUP */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md p-6 rounded-3xl space-y-4 shadow-2xl text-left">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold flex items-center gap-2 text-red-500">
                <AlertTriangle size={16} /> Report Listing
              </h3>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full cursor-pointer text-zinc-400"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Reason</label>
                <select 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)} 
                  className="w-full h-11 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-zinc-900 dark:text-white"
                >
                  <option value="Fake Product / Scam" className="dark:bg-zinc-900">Fake Product / Scam</option>
                  <option value="Inappropriate Content" className="dark:bg-zinc-900">Inappropriate Content</option>
                  <option value="Harassment / Hate Speech" className="dark:bg-zinc-900">Harassment / Hate Speech</option>
                  <option value="Misleading Price" className="dark:bg-zinc-900">Misleading Price</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Details (Optional)</label>
                <textarea 
                  rows={3} 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Provide more details about your report..." 
                  className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-zinc-900 dark:text-white" 
                />
              </div>

              <button 
                type="submit" 
                disabled={isPending} 
                className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isPending && <Loader2 size={16} className="animate-spin" />}
                Submit Report
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}