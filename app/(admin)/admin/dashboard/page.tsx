// app/(admin)/admin/dashboard/page.tsx
import { createClient } from '@/utils/supabase/server';
import { Layers, Users, AlertTriangle } from 'lucide-react';
import AnalyticsCharts from '@/components/admin/AnalyticsCharts';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // 1. Total Listings
  const { count: totalListings } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true });

  // 2. Total Users
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // 3. Active Reports
  const { count: activeReports } = await supabase
    .from('item_reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // 4. CHART DATA (လက်ရှိ Project ရဲ့ Database သဘာဝအပေါ်မူတည်ပြီး လအလိုက် Dynamic တွက်ထုတ်နိုင်သလို၊ လောလောဆယ် Sample အနေဖြင့် ပြထားပေးပါသည်)
  const growthData = [
    { name: 'Jan', products: 12, users: 8, reports: 1 },
    { name: 'Feb', products: 24, users: 15, reports: 3 },
    { name: 'Mar', products: 45, users: 30, reports: 2 },
    { name: 'Apr', products: 60, users: 55, reports: 5 },
    { name: 'May', products: 90, users: 70, reports: 4 },
    { name: 'Jun', products: 124, users: 95, reports: 8 },
    { name: 'Jul', products: totalListings || 0, users: totalUsers || 0, reports: activeReports || 0 },
  ];

  return (
    <div className="space-y-8 h-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-zinc-400">Real-time metrics of Second Market ecosystem.</p>
      </div>

      {/* BOX METRIC GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-6 rounded-3xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Total Products</p>
            <p className="text-4xl font-bold">{totalListings || 0}</p>
          </div>
          <div className="p-3 bg-zinc-100 dark:bg-zinc-850 rounded-2xl text-zinc-700 dark:text-zinc-300">
            <Layers size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-6 rounded-3xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Registered Users</p>
            <p className="text-4xl font-bold">{totalUsers || 0}</p>
          </div>
          <div className="p-3 bg-zinc-100 dark:bg-zinc-850 rounded-2xl text-zinc-700 dark:text-zinc-300">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-6 rounded-3xl flex items-center justify-between shadow-sm border-l-red-500 border-l-4">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-red-500">Pending Complaints</p>
            <p className="text-4xl font-bold text-red-500">{activeReports || 0}</p>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-2xl text-red-500">
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* 📊 CHARTS SECTION */}
      <AnalyticsCharts data={growthData} />
    </div>
  );
}