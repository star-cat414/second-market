// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { createClient } from '@/utils/supabase/server';
import DynamicIsland from '@/components/layout/DynamicIsland';
import MobileDock from '@/components/layout/MobileDock';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Second Market - Premium P2P Marketplace',
  description: 'An Apple-inspired peer-to-peer marketplace.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  return (
    <html lang="en" className="dark:bg-zinc-950">
      <body className={`${inter.variable} font-sans antialiased bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 min-h-screen`}>
        {/* Apple Glassmorphic Global Components */}
        <DynamicIsland profile={profile} />
        
        <main>{children}</main>
        
        <MobileDock />
      </body>
    </html>
  );
}