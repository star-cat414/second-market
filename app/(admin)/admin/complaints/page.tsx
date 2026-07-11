// app/(admin)/admin/complaints/page.tsx
import { createClient } from '@/utils/supabase/server';
import ComplaintTable from '@/components/admin/ComplaintTable';

export const dynamic = 'force-dynamic';

// ၁။ ဒေတာဘေ့စ်ကလာမယ့် ပုံစံအတိုင်း Type Interface တစ်ခု သတ်မှတ်ပေးခြင်း
interface DBComplaint {
  id: string;
  listing_id: string;
  reason: string;
  description: string | null;
  status: 'pending' | 'resolved';
  created_at: string;
  listings: {
    title: string;
  } | { title: string }[] | null; // Supabase Relation ကြောင့် array သို့မဟုတ် object ဖြစ်နိုင်သည်ကို သတ်မှတ်ခြင်း
}

export default async function AdminComplaintsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('complaints')
    .select(`
      id,
      listing_id,
      reason,
      description,
      status,
      created_at,
      listings (
        title
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  // ၂။ ရလာတဲ့ data ကို map လုပ်ပြီး Table က မျှော်လင့်ထားတဲ့ Object ပုံစံဖြစ်အောင် သန့်စင်ပေးခြင်း
  const formattedComplaints = ((data as DBComplaint[]) || []).map(report => ({
    ...report,
    listings: Array.isArray(report.listings) 
      ? report.listings[0] || null 
      : report.listings
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Complaints & Moderation</h1>
        <p className="text-sm text-zinc-400">Review user-submitted reports and take actions on listings.</p>
      </div>

      {/* ⚠️ Type-safe ဖြစ်သွားသော စာရင်းကို ပို့ပေးခြင်း */}
      <ComplaintTable complaints={formattedComplaints} />
    </div>
  );
}