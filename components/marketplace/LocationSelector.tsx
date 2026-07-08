// components/marketplace/LocationSelector.tsx
'use client';

import { useState, useTransition } from 'react';
import { updateProfileDetails } from '@/app/actions/profile';
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
      const res = await updateProfileDetails(currentUsername, currentAvatarUrl, selectedCity);
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
          className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-[11px] rounded-lg px-2 py-0.5 focus:outline-none"
        >
          <option value="" disabled>Select City</option>
          {MYANMAR_CITIES.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
        {isPending && <Loader2 size={11} className="animate-spin text-zinc-400" />}
        <button onClick={() => setIsEditing(false)} className="text-[10px] text-zinc-400 underline ml-1">Cancel</button>
      </div>
    );
  }

  return (
    <span 
      onClick={() => setIsEditing(true)} 
      className="font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer hover:underline bg-zinc-100 dark:bg-zinc-800/60 px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1"
    >
      {initialLocation} <span className="text-[9px]">✏️</span>
    </span>
  );
}