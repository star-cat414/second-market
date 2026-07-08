// components/marketplace/EditProfileModal.tsx
'use client';

import { useState, useTransition } from 'react';
import { updateProfile } from '@/app/actions/profile';
import { Edit3, X, Loader2 } from 'lucide-react';

const MYANMAR_CITIES = ['Yangon', 'Mandalay', 'Naypyidaw', 'Taunggyi', 'Mawlamyine', 'Bago'];

// 💡 ဤနေရာတွင် profiles table ၏ ဒေတာအမျိုးအစားများကို TypeScript ထံ တိကျစွာ အသိပေးလိုက်ခြင်းဖြစ်သည်
interface ProfileData {
  id: string;
  username: string;
  avatar_url: string | null;
  location: string | null;
  bio: string | null;
  role?: string;
}

// 💡 any အစား { profile: ProfileData } ကို ပြောင်းလဲအသုံးပြုလိုက်ပါသည်
export default function EditProfileModal({ profile }: { profile: ProfileData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updateProfile(formData);
      if (res?.error) {
        alert(`Error: ${res.error}`);
      } else {
        setIsOpen(false);
      }
    });
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 h-9 bg-black text-white dark:bg-white dark:text-black text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
      >
        <Edit3 size={13} /> Edit Profile
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl max-w-md w-full relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsOpen(false)} className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600">
              <X size={18} />
            </button>

            <h3 className="text-base font-bold mb-4">Edit Your Profile</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="currentAvatarUrl" value={profile?.avatar_url || ''} />

              {/* 📷 AVATAR UPLOAD FIELD */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5">Profile Picture</label>
                <input 
                  type="file" 
                  name="avatar" 
                  accept="image/*"
                  className="w-full text-xs text-zinc-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-zinc-100 file:text-zinc-700 dark:file:bg-zinc-800 dark:file:text-zinc-300 cursor-pointer" 
                />
              </div>

              {/* 👤 USERNAME FIELD */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Username</label>
                <input 
                  type="text" 
                  name="username" 
                  required
                  defaultValue={profile?.username || ''}
                  className="w-full h-9 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 px-3 text-xs focus:outline-none focus:border-zinc-400"
                />
              </div>

              {/* 📍 LOCATION FIELD */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Location</label>
                <select 
                  name="location"
                  defaultValue={profile?.location || ''}
                  className="w-full h-9 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 px-2 text-xs focus:outline-none focus:border-zinc-400"
                >
                  <option value="" disabled>Select Location</option>
                  {MYANMAR_CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* 📝 BIO FIELD */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Bio (About Me)</label>
                <textarea 
                  name="bio" 
                  maxLength={160}
                  placeholder="Describe yourself in a few words..."
                  defaultValue={profile?.bio || ''}
                  rows={3}
                  className="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 p-3 text-xs focus:outline-none focus:border-zinc-400 resize-none"
                />
                <span className="text-[10px] text-zinc-400 block text-right mt-1">Max 160 characters</span>
              </div>

              {/* SUBMIT BUTTON */}
              <button 
                type="submit" 
                disabled={isPending}
                className="w-full h-10 bg-black text-white dark:bg-white dark:text-black text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}