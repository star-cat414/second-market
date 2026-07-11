// app/(admin)/admin/settings/page.tsx
import { createClient } from '@/utils/supabase/server';
import SettingsForm from '@/components/admin/SettingsForm';

export const dynamic = 'force-dynamic';

// System Settings အတွက် TypeScript Interface သတ်မှတ်ခြင်း
interface SystemSettings {
  maintenance_mode: boolean;
  platform_fee: number;
  allowed_categories: string[];
}

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  // Database ထဲမှ လက်ရှိ System Settings အား Fetch လုပ်ခြင်း
  const { data } = await supabase
    .from('system_settings')
    .select('*')
    .eq('id', 'system')
    .single();

  /**
   * 💡 Defensive Check (ကာကွယ်ရေးစနစ်):
   * Row ရှိနေခဲ့ရင်တောင် 'allowed_categories' column က null ဖြစ်နေခြင်း သို့မဟုတ် 
   * empty array [] ဖြစ်နေခြင်းတို့ကိုပါ စစ်ထုတ်ပြီး Default Categories ဝင်သွားအောင် လုပ်ဆောင်ထားသည်။
   */
  const defaultSettings: SystemSettings = {
    maintenance_mode: data?.maintenance_mode ?? false,
    platform_fee: data?.platform_fee ?? 2.5,
    allowed_categories: data?.allowed_categories && Array.isArray(data.allowed_categories) && data.allowed_categories.length > 0
      ? data.allowed_categories 
      : ['Electronics', 'Fashion', 'Home', 'Books', 'Toys'],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-sm text-zinc-400">Configure marketplace behavior, business logic, and platform controls.</p>
      </div>

      {/* ⚙️ Full Data အသင့်ဖြစ်သော SYSTEM SETTINGS FORM */}
      <SettingsForm initialSettings={defaultSettings} />
    </div>
  );
}