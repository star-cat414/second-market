// app/(auth)/login/page.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
// @/ အစား အစက်လေးတွေသုံးပြီး Folder အဆင့်အလိုက် လှမ်းခေါ်လိုက်ခြင်းဖြစ်ပါတယ်
import { loginAction, signUpAction, verifyOtpAction } from '../../actions/auth';
import { Loader2, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ၁။ Server Action ကနေ ပြန်လာမယ့် Object Structure ကို Type သတ်မှတ်ခြင်း
interface AuthActionResult {
  success?: boolean;
  error?: string;
  needsVerification?: boolean;
  email?: string;
}

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState<string | null>(null); // OTP State Control
  const [otpToken, setOtpToken] = useState('');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // ၁။ SIGN-IN / SIGN-UP SUBMIT
  const handleAuthSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const action = isSignUp ? signUpAction : loginAction;
      // ၂။ ပြန်လာမယ့် Result ကို AuthActionResult Type ဖြစ်ကြောင်း သတ်မှတ်ပေးလိုက်ပါသည်
      const result: AuthActionResult = await action(formData);

      if (result?.error) {
        setErrorMsg(result.error);
      } else if (result?.success) {
        if (isSignUp && result.email) {
          setSuccessMsg('Verification code sent to your email.');
          setVerifyingEmail(result.email); // OTP ဖြည့်ရမည့် Screen သို့ ပြောင်းမည်
        } else {
          router.push('/');
          router.refresh();
        }
      }
    });
  };

  // ၂။ OTP VERIFY SUBMIT
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!verifyingEmail) return;

    startTransition(async () => {
      const result: AuthActionResult = await verifyOtpAction(verifyingEmail, otpToken);

      if (result?.error) {
        setErrorMsg(result.error);
      } else if (result?.success) {
        setSuccessMsg('Email verified successfully! Logging in...');
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1500);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 select-none">
      <motion.div 
        layout
        className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 p-8 rounded-3xl shadow-xl space-y-6"
      >
        <AnimatePresence mode="wait">
          {!verifyingEmail ? (
            // ==========================================
            // SCREEN A: STANDARD LOGIN / SIGNUP FORM
            // ==========================================
            <motion.div
              key="auth-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Second Market</h1>
                <p className="text-xs text-zinc-400">
                  {isSignUp ? 'Create a premium P2P profile' : 'Sign in to access your dashboard'}
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200/50 text-xs text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2">
                  <AlertCircle size={14} /> <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-500">Username</label>
                    <input type="text" name="username" required placeholder="apple_dev" className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition" />
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-500">Email Address</label>
                  <input type="email" name="email" required placeholder="name@example.com" className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-500">Password</label>
                  <input type="password" name="password" required placeholder="••••••••" className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition" />
                </div>

                <button type="submit" disabled={isPending} className="w-full h-11 bg-black dark:bg-white text-white dark:text-black font-semibold text-sm rounded-xl hover:opacity-95 disabled:opacity-50 active:scale-[0.99] transition flex items-center justify-center gap-2">
                  {isPending ? <Loader2 size={16} className="animate-spin" /> : isSignUp ? 'Send OTP Code' : 'Sign In'}
                </button>
              </form>

              <div className="text-center pt-2">
                <button onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(null); }} className="text-xs text-zinc-500 hover:text-black dark:hover:text-white transition underline underline-offset-4">
                  {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
              </div>
            </motion.div>
          ) : (
            // ==========================================
            // SCREEN B: iOS iMESSAGE STYLE OTP VERIFY
            // ==========================================
            <motion.div
              key="otp-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-blue-50 dark:bg-blue-950/40 text-blue-500 rounded-full flex items-center justify-center">
                  <ShieldAlert size={24} />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Enter Secure Code</h1>
                <p className="text-xs text-zinc-400 px-4">
                  We sent a 6-digit security token to <span className="text-zinc-900 dark:text-white font-medium">{verifyingEmail}</span>
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200/50 text-xs text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2">
                  <AlertCircle size={14} /> <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 text-xs text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center gap-2">
                  <CheckCircle2 size={14} /> <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleOtpSubmit} className="space-y-5">
                <div className="space-y-1">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ''))} // နံပါတ်သီးသန့်သာ ရိုက်ခွင့်ပြုမည်
                    placeholder="000000"
                    className="w-full tracking-[1em] text-center font-mono text-2xl px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button type="submit" disabled={isPending || otpToken.length !== 6} className="w-full h-11 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm rounded-xl disabled:opacity-40 transition flex items-center justify-center gap-2 shadow-sm">
                  {isPending ? <Loader2 size={16} className="animate-spin" /> : 'Verify & Activate'}
                </button>
              </form>

              <div className="text-center">
                <button type="button" onClick={() => { setVerifyingEmail(null); setOtpToken(''); setErrorMsg(null); }} className="text-xs text-zinc-400 hover:text-zinc-600 transition">
                  ← Back to Sign Up
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}