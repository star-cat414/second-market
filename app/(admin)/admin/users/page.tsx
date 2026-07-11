// app/(admin)/admin/users/page.tsx
import { createClient } from '@/utils/supabase/server';
import UserTable from '@/components/admin/UserTable';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const supabase = await createClient();

  // Profiles အားလုံးကို နောက်ဆုံး Join တဲ့သူအရင်ပြရန် Fetch လုပ်ခြင်း (Read)
  const { data: users } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, role, is_banned, created_at')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-sm text-zinc-400">Manage user roles, application bans, and account states.</p>
      </div>

      {/* 👥 USER CRUD TABLE */}
      <UserTable users={users || []} />
    </div>
  );
}