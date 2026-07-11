// components/admin/ComplaintTable.tsx
'use client';

import { useTransition } from 'react';
import { dismissReport, resolveAndDeleteProduct } from '@/app/actions/admin-complaints';
import { ShieldCheck, AlertOctagon, Eye } from 'lucide-react';
import Link from 'next/link';

interface Complaint {
  id: string;
  listing_id: string;
  reason: string;
  description: string | null;
  status: 'pending' | 'resolved';
  created_at: string;
  listings: {
    title: string;
  } | null;
}

export default function ComplaintTable({ complaints }: { complaints: Complaint[] }) {
  const [isPending, startTransition] = useTransition();

  const handleDismiss = (id: string) => {
    if (confirm('Dismiss this report? No action will be taken against the listing.')) {
      startTransition(async () => {
        const res = await dismissReport(id);
        if (res?.error) alert(res.error);
      });
    }
  };

  const handleResolveDelete = (id: string, listingId: string, title: string) => {
    if (confirm(`⚠️ Warning!\nThis will PERMANENTLY DELETE "${title}" and close this report. Proceed?`)) {
      startTransition(async () => {
        const res = await resolveAndDeleteProduct(id, listingId);
        if (res?.error) alert(res.error);
      });
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-zinc-500 dark:text-zinc-400">
          <thead className="bg-zinc-50 dark:bg-zinc-850 text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-4">Target Listing</th>
              <th className="px-6 py-4">Reason</th>
              <th className="px-6 py-4">Details</th>
              <th className="px-6 py-4">Date Reported</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {complaints.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-zinc-400">No pending complaints found. Good job! ✨</td>
              </tr>
            ) : (
              complaints.map((report) => (
                <tr key={report.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850/30 transition">
                  {/* Target Product */}
                  <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                    {report.listings ? (
                      <div>
                        <span className="block truncate max-w-[180px] font-bold">{report.listings.title}</span>
                        <Link 
                          href={`/products/${report.listing_id}`} 
                          target="_blank"
                          className="text-[11px] text-emerald-500 hover:underline inline-flex items-center gap-0.5 mt-0.5"
                        >
                          <Eye size={10} /> Inspect Product
                        </Link>
                      </div>
                    ) : (
                      <span className="text-zinc-400 italic text-xs">Deleted Product</span>
                    )}
                  </td>

                  {/* Reason */}
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-100 dark:border-red-900/30">
                      {report.reason}
                    </span>
                  </td>

                  {/* Detailed Description */}
                  <td className="px-6 py-4 text-xs max-w-[220px] truncate" title={report.description || ''}>
                    {report.description || <span className="text-zinc-400 italic">No details provided</span>}
                  </td>

                  {/* Created Date */}
                  <td className="px-6 py-4 text-xs">{new Date(report.created_at).toLocaleDateString()}</td>

                  {/* Action Buttons */}
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    {/* Dismiss Button */}
                    <button
                      disabled={isPending}
                      onClick={() => handleDismiss(report.id)}
                      title="Dismiss Report (Safe)"
                      className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 rounded-xl transition cursor-pointer inline-flex items-center"
                    >
                      <ShieldCheck size={15} />
                    </button>

                    {/* Ban & Delete Product Button */}
                    {report.listings && (
                      <button
                        disabled={isPending}
                        onClick={() => handleResolveDelete(report.id, report.listing_id, report.listings!.title)}
                        title="Delete Product (Take Action)"
                        className="p-2 border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/10 hover:bg-red-100 text-red-600 rounded-xl transition cursor-pointer inline-flex items-center"
                      >
                        <AlertOctagon size={15} />
                      </button>
                    )}
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