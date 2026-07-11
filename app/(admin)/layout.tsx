// app/(admin)/layout.tsx
import Link from 'next/link';
import { LayoutDashboard, Users, ShoppingBag, AlertTriangle, Settings, Home } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: ShoppingBag },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Complaints', href: '/admin/complaints', icon: AlertTriangle },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 flex gap-6">
      {/* FLOATING SIDEBAR */}
      <aside className="w-64 flex-shrink-0">
        <div className="sticky top-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm h-[calc(100vh-48px)] flex flex-col justify-between">
          <div>
            <div className="px-3 mb-8">
              <h2 className="text-xl font-black tracking-tight text-emerald-600">Admin Panel</h2>
            </div>
            
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-3 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
                >
                  <item.icon size={18} />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <Link href="/" className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-400 hover:text-emerald-500 transition">
             <Home size={14} /> Back to Market
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}