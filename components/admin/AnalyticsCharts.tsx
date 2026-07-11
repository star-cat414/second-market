// components/admin/AnalyticsCharts.tsx
'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend } from 'recharts';

interface ChartData {
  name: string;
  products: number;
  users: number;
  reports: number;
}

interface AnalyticsChartsProps {
  data: ChartData[];
}

export default function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-4">
      
      {/* CHART 1: PRODUCT & USER GROWTH (AREA CHART) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">Ecosystem Growth</h3>
          <p className="text-xs text-zinc-400">Monthly registration of users and product listings.</p>
        </div>
        
        <div className="h-72 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorProducts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-100 dark:stroke-zinc-800" />
              <XAxis dataKey="name" stroke="#a1a1aa" tickLine={false} />
              <YAxis stroke="#a1a1aa" tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(24, 24, 27, 0.95)', 
                  border: '1px solid #3f3f46',
                  borderRadius: '12px',
                  color: '#fff'
                }} 
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Area type="monotone" dataKey="products" name="Products" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProducts)" />
              <Area type="monotone" dataKey="users" name="Users" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART 2: REPORTS TREND (BAR CHART) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">Complaints & Reports Trend</h3>
          <p className="text-xs text-zinc-400">Overview of monthly incoming item complaints.</p>
        </div>

        <div className="h-72 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-100 dark:stroke-zinc-800" />
              <XAxis dataKey="name" stroke="#a1a1aa" tickLine={false} />
              <YAxis stroke="#a1a1aa" tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(24, 24, 27, 0.95)', 
                  border: '1px solid #3f3f46',
                  borderRadius: '12px',
                  color: '#fff'
                }} 
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar dataKey="reports" name="Reports" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}