// app/(admin)/admin/moderation/page.tsx
import { createClient } from '@/utils/supabase/server';
import { dismissReport, deleteListingFromReport } from '@/app/actions/moderation';
import { Trash2, CheckCircle } from 'lucide-react';

// ၁။ Supabase Relationship Query အတွက် တိကျသော Type များ သတ်မှတ်ခြင်း
interface Listing {
  id: string;
  title: string | null;
  current_price: number | null;
  images: string[] | null;
}

interface ReporterProfile {
  username: string | null;
}

interface ReportItem {
  id: string;
  listing_id: string;
  reason: string | null;
  status: string | null;
  created_at: string;
  listings: Listing | null;
  reporter: ReporterProfile | null;
}

export default async function ModerationPage() {
  const supabase = await createClient();

  // Pending ဖြစ်နေသော တိုင်ကြားစာများကို Product Details နှင့်တကွ ဆွဲယူခြင်း
  const { data: reports } = await supabase
    .from('item_reports')
    .select(`
      *,
      listings (id, title, current_price, images),
      reporter:profiles!item_reports_reporter_id_fkey (username)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  // Supabase က လာတဲ့ data ကို ReportItem[] Type အဖြစ် သတ်မှတ်ပေးခြင်း
  const typedReports = reports as unknown as ReportItem[];

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Moderation Queue</h1>
        <p className="text-sm text-zinc-400">Review user complaints and take actions.</p>
      </div>

      <div className="border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl overflow-hidden bg-white dark:bg-zinc-950">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200/60 font-semibold text-zinc-500">
              <th className="p-4">Item Details</th>
              <th className="p-4">Reporter</th>
              <th className="p-4">Reason for Report</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
            {typedReports && typedReports.length > 0 ? (
              // any နေရာတွင် သတ်မှတ်ထားသော ReportItem Type ကို သုံးထားပါသည်
              typedReports.map((report: ReportItem) => (
                <tr key={report.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20 transition">
                  <td className="p-4 flex items-center gap-3">
                    <img 
                      src={(report.listings?.images && report.listings.images[0]) || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=80'} 
                      alt="Item" 
                      className="w-10 h-10 rounded-lg object-cover" 
                    />
                    <div>
                      <p className="font-semibold">{report.listings?.title || 'Unknown Item'}</p>
                      <p className="text-xs text-zinc-400">${report.listings?.current_price || 0}</p>
                    </div>
                  </td>
                  <td className="p-4 text-zinc-500">@{report.reporter?.username || 'unknown'}</td>
                  <td className="p-4 italic text-zinc-600 dark:text-zinc-300">`{report.reason}`</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      {/* Action 1: Dismiss Report */}
                      <form action={dismissReport.bind(null, report.id)}>
                        <button type="submit" className="p-2 text-zinc-400 hover:text-emerald-500 transition hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-xl" title="Dismiss Report">
                          <CheckCircle size={18} />
                        </button>
                      </form>

                      {/* Action 2: Delete Listing */}
                      <form action={deleteListingFromReport.bind(null, report.listing_id, report.id)}>
                        <button type="submit" className="p-2 text-zinc-400 hover:text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl" title="Delete Content">
                          <Trash2 size={18} />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-8 text-center text-zinc-400">
                  Great job! The moderation queue is empty.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}