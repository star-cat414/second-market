// app/actions/auth.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * ၁။ SIGN IN / LOGIN SERVER ACTION
 * အသုံးပြုသူ ရိုက်ထည့်လိုက်သော အီးမေးလ်နှင့် စကားဝှက်ဖြင့် အကောင့်ထဲသို့ ဝင်ရောက်ခြင်း
 */
export async function loginAction(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // ဝင်လာသော အချက်အလက်များ ရှိမရှိ စစ်ဆေးခြင်း
  if (!email || !password) {
    return { error: 'Please enter both email and password.' };
  }

  // Supabase Authentication Engine သို့ လှမ်းပို့ခြင်း
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Error တက်ပါက Message String သက်သက်ကိုသာ Client ဘက်သို့ ပြန်ပို့မည်
    return { error: error.message };
  }

  // Layout နှင့် Dynamic Island တို့တွင် အကောင့်ဝင်သွားကြောင်း ချက်ချင်းသိစေရန် Cache ရှင်းခြင်း
  revalidatePath('/', 'layout');
  return { success: true };
}

/**
 * ၂။ SIGN UP WITH EMAIL OTP ACTION
 * အကောင့်အသစ်ဆောက်ပြီး အီးမေးလ်ထဲသို့ OTP 6-Digit ကုဒ်လှမ်းပို့ခြင်း
 */
export async function signUpAction(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const username = formData.get('username') as string;

  // Input Validation စစ်ဆေးခြင်း
  if (!email || !password || !username) {
    return { error: 'All fields (Username, Email, Password) are strictly required.' };
  }

  // Supabase Auth ထဲသို့ စာရင်းသွင်းခြင်း (Metadata ထဲသို့ Username အသေအချာ ထည့်ပေးရမည်)
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { 
        username: username.trim() 
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // အောင်မြင်ပါက ဒုတိယ အဆင့်ဖြစ်သော OTP ရိုက်သည့် Screen သို့ ကူးရန် အီးမေးလ်ပါ ပူးတွဲပေးလိုက်မည်
  return { success: true, email }; 
}

/**
 * ၃။ VERIFY OTP CODE ACTION
 * အသုံးပြုသူ၏ အီးမေးလ်ထဲသို့ ရောက်သွားသော 6-Digit Token အား အတည်ပြုပြီး အကောင့်အား Active ဖြစ်စေခြင်း
 */
export async function verifyOtpAction(email: string, token: string) {
  const supabase = await createClient();

  // OTP စာလုံးအရေအတွက် စစ်ဆေးခြင်း
  if (!token || token.length !== 6) {
    return { error: 'Please enter a valid 6-digit code.' };
  }

  // Supabase Verification Engine ဖြင့် Token အား စစ်ဆေးခြင်း
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'signup', // Sign Up အဆင့်အတွက် အတည်ပြုခြင်းဖြစ်ကြောင်း သတ်မှတ်ခြင်း
  });

  if (error) {
    return { error: error.message };
  }

  // အောင်မြင်စွာ အတည်ပြုပြီးပါက Layout အား Live Update လုပ်ခိုင်းမည်
  revalidatePath('/', 'layout');
  return { success: true };
}

// app/actions/auth.ts ထဲတွင် ထပ်မံဖြည့်စွက်ရန်
export async function logoutAction() {
  const supabase = await createClient();
  
  // Supabase Auth Session ကို ဖျက်ချခြင်း (ကွတ်ကီးများကိုပါ Auto ရှင်းလင်းပေးမည်)
  await supabase.auth.signOut();

  // အကောင့်ထွက်ပြီးကြောင်း Layout တစ်ခုလုံး သိစေရန် ရာဖရက်ရှ်လုပ်ပြီး Login Page သို့ မောင်းထုတ်ခြင်း
  revalidatePath('/', 'layout');
}