// components/marketplace/LocationSelector.tsx
'use client';

import { useState, useTransition } from 'react';
import { updateProfile } from '@/app/actions/profile';
import { Loader2 } from 'lucide-react';

const MYANMAR_CITIES = ['Yangon', 'Mandalay', 'Naypyidaw', 'Taunggyi', 'Mawlamyine', 'Bago', 'Myeik', 'Myitkyina', 'Hpa-An', 'Pathein'];

interface LocationSelectorProps {
  currentUsername: string;
  currentAvatarUrl: string;
  initialLocation: string;
}

export default function LocationSelector({ currentUsername, currentAvatarUrl, initialLocation }: LocationSelectorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCity = e.target.value;
    
    startTransition(async () => {
      // 💡 ပြင်ဆင်လိုက်သည့်အပိုင်း: Server Action ၏ FormData စနစ်နှင့် တိုက်ရိုက်ကိုက်ညီစေရန် ဖန်တီးခြင်း
      const formData = new FormData();
      formData.append('username', currentUsername);
      formData.append('avatar_url', currentAvatarUrl);
      formData.append('location', selectedCity);

      const res = await updateProfile(formData);
      
      if (res?.error) {
        alert(res.error);
      } else {
        setIsEditing(false);
      }
    });
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <select
          disabled={isPending}
          defaultValue={initialLocation === 'Not Specified' ? '' : initialLocation}
          onChange={handleLocationChange}
          className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-[11px] rounded-lg px-2 py-0.5 focus:outline-none cursor-pointer"
        >
          <option value="" disabled>Select City</option>
          {MYANMAR_CITIES.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
        {isPending && <Loader2 size={11} className="animate-spin text-zinc-400" />}
        <button 
          onClick={() => setIsEditing(false)} 
          disabled={isPending}
          className="text-[10px] text-zinc-400 hover:text-zinc-600 underline ml-1 cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <span 
      onClick={() => setIsEditing(true)} 
      className="font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer hover:underline bg-zinc-100 dark:bg-zinc-800/60 px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1 shadow-2xs"
    >
      {initialLocation} <span className="text-[9px]">✏️</span>
    </span>
  );
}