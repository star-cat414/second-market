// components/admin/SettingsForm.tsx
'use client';

import { useState, useTransition } from 'react';
import { updateSystemSettings } from '@/app/actions/admin-settings';
import { Save, Sliders, ShieldAlert, Percent, Tag, Loader2 } from 'lucide-react';

interface SettingsProps {
  initialSettings: {
    maintenance_mode: boolean;
    platform_fee: number;
    allowed_categories: string[];
  };
}

export default function SettingsForm({ initialSettings }: SettingsProps) {
  const [maintenance, setMaintenance] = useState(initialSettings.maintenance_mode);
  const [fee, setFee] = useState(initialSettings.platform_fee);
  // initialSettings.allowed_categories က null ဖြစ်နေရင် သို့မဟုတ် array မဟုတ်ရင် default array သုံးခိုင်းခြင်း
const [categories, setCategories] = useState(
  Array.isArray(initialSettings.allowed_categories) 
    ? initialSettings.allowed_categories.join(', ') 
    : 'Electronics, Fashion, Home, Books'
);
  const [isPending, startTransition] = useTransition();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateSystemSettings({
        maintenance_mode: maintenance,
        platform_fee: Number(fee),
        allowed_categories: categories
      });

      if (res?.error) {
        alert(`Error: ${res.error}`);
      } else {
        alert('System settings updated successfully! 🚀');
      }
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
        
        {/* 1. Maintenance Mode Switch */}
        <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-850/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
          <div className="space-y-0.5 pr-4">
            <label className="text-sm font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
              <ShieldAlert size={16} className={maintenance ? "text-amber-500" : "text-zinc-400"} />
              Maintenance Mode
            </label>
            <p className="text-xs text-zinc-400">ဖွင့်ထားပါက User များ App ကို ခေတ္တ အသုံးပြု၍ ရမည်မဟုတ်ပါ။</p>
          </div>
          <button
            type="button"
            onClick={() => setMaintenance(!maintenance)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 cursor-pointer ${
              maintenance ? 'bg-amber-500' : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
          >
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
              maintenance ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* 2. Platform Fee Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Percent size={13} /> Platform Transaction Fee (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={fee}
            onChange={(e) => setFee(Number(e.target.value))}
            className="w-full h-11 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* 3. Allowed Product Categories */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Tag size={13} /> Marketplace Categories
          </label>
          <textarea
            rows={3}
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
            placeholder="Electronics, Fashion, Books, Vehicles"
            className="w-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <p className="text-[11px] text-zinc-400">အမျိုးအစားတစ်ခုချင်းစီကို ကော်မာ ( , ) ခံပြီး ရေးပေးပါ။</p>
        </div>

      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save System Settings
        </button>
      </div>
    </form>
  );
}