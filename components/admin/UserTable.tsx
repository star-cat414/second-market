// components/admin/UserTable.tsx
'use client';

import { useTransition } from 'react';
import { deleteUserByAdmin, updateUserRoleByAdmin, toggleUserBanStatus } from '@/app/actions/admin-users';
import { Trash2, ShieldAlert, ShieldCheck, UserCheck, UserX } from 'lucide-react';

interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  is_banned: boolean;
  created_at: string;
}

export default function UserTable({ users }: { users: Profile[] }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete profile for "${name}"?`)) {
      startTransition(async () => {
        const res = await deleteUserByAdmin(id);
        if (res?.error) alert(res.error);
      });
    }
  };

  const handleToggleRole = (id: string, currentRole: 'user' | 'admin') => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    if (confirm(`Change this user's role to ${nextRole.toUpperCase()}?`)) {
      startTransition(async () => {
        const res = await updateUserRoleByAdmin(id, nextRole);
        if (res?.error) alert(res.error);
      });
    }
  };

  const handleToggleBan = (id: string, isBanned: boolean) => {
    const action = isBanned ? 'UNBAN' : 'BAN';
    if (confirm(`Are you sure you want to ${action} this user?`)) {
      startTransition(async () => {
        const res = await toggleUserBanStatus(id, isBanned);
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
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Joined Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-zinc-400">No registered users found.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850/30 transition">
                  {/* User Profile Info */}
                  <td className="px-6 py-4 flex items-center gap-3 font-medium text-zinc-900 dark:text-white">
                    <img 
                      src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'} 
                      alt={user.username || 'User'} 
                      className="w-9 h-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                    />
                    <div>
                      <span className="block font-bold">{user.username || 'Anonymous'}</span>
                      <span className="block text-[10px] text-zinc-400 font-normal truncate max-w-[150px]">{user.id}</span>
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md ${
                      user.role === 'admin' 
                        ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30' 
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                    }`}>
                      {user.role}
                    </span>
                  </td>

                  {/* Account Status Badge (Banned/Active) */}
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${
                      user.is_banned 
                        ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400' 
                        : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {user.is_banned ? 'Banned' : 'Active'}
                    </span>
                  </td>

                  {/* Joined Date */}
                  <td className="px-6 py-4 text-xs">{new Date(user.created_at).toLocaleDateString()}</td>

                  {/* Action Buttons */}
                  <td className="px-6 py-4 text-right space-x-2">
                    {/* Toggle Admin Role */}
                    <button
                      disabled={isPending}
                      onClick={() => handleToggleRole(user.id, user.role)}
                      title={user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                      className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 rounded-xl transition cursor-pointer inline-flex items-center"
                    >
                      {user.role === 'admin' ? <UserX size={15} /> : <UserCheck size={15} />}
                    </button>

                    {/* Ban / Unban User */}
                    <button
                      disabled={isPending}
                      onClick={() => handleToggleBan(user.id, user.is_banned)}
                      title={user.is_banned ? 'Unban User' : 'Ban User'}
                      className={`p-2 border rounded-xl transition cursor-pointer inline-flex items-center ${
                        user.is_banned
                          ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/10 text-emerald-500'
                          : 'border-amber-200 dark:border-amber-900/40 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-amber-500'
                      }`}
                    >
                      {user.is_banned ? <ShieldCheck size={15} /> : <ShieldAlert size={15} />}
                    </button>

                    {/* Delete Profile */}
                    <button
                      disabled={isPending}
                      onClick={() => handleDelete(user.id, user.username || 'this user')}
                      title="Delete Profile"
                      className="p-2 border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-xl transition cursor-pointer inline-flex items-center"
                    >
                      <Trash2 size={15} />
                    </button>
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