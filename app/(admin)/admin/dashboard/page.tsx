// app/(admin)/admin/dashboard/page.tsx
import { createClient } from '@/utils/supabase/server';
import { Layers, Users, AlertTriangle } from 'lucide-react';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // 1. Total Listings Count Fetch
  const { count: totalListings } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true });

  // 2. Total Users Count Fetch
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // 3. Active Reports (Pending) Count Fetch
  const { count: activeReports } = await supabase
    .from('item_reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-zinc-400">Real-time metrics of Second Market ecosystem.</p>
      </div>

      {/* APPLE BENTO-BOX METRIC GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Box 1: Total Listings */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Total Products</p>
            <p className="text-4xl font-bold">{totalListings || 0}</p>
          </div>
          <div className="p-3 bg-zinc-100 dark:bg-zinc-850 rounded-xl text-zinc-700 dark:text-zinc-300">
            <Layers size={24} />
          </div>
        </div>

        {/* Box 2: Total Users */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Registered Users</p>
            <p className="text-4xl font-bold">{totalUsers || 0}</p>
          </div>
          <div className="p-3 bg-zinc-100 dark:bg-zinc-850 rounded-xl text-zinc-700 dark:text-zinc-300">
            <Users size={24} />
          </div>
        </div>

        {/* Box 3: Active Reports */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 p-6 rounded-2xl flex items-center justify-between shadow-sm border-l-red-500 border-l-4">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-red-500">Pending Complaints</p>
            <p className="text-4xl font-bold text-red-500">{activeReports || 0}</p>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl text-red-500">
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}