// app/(marketplace)/sell/page.tsx
'use client';

import { useState, useTransition } from 'react';
import { createClient } from '@/utils/supabase/client';
import { createListing } from '@/app/actions/listings';
import { UploadCloud, X, Loader2 } from 'lucide-react';

export default function SellPage() {
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition(); // 💡 Form တင်နေစဉ် Loading ပြရန်
  const supabase = createClient();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);

    try {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `listings/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('listings-bucket')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('listings-bucket').getPublicUrl(filePath);
      setImages((prev) => [...prev, data.publicUrl]);
    } catch (err) {
      alert('Image upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="pt-28 pb-24 max-w-2xl mx-auto px-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 p-8 rounded-2xl shadow-sm space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Listing</h1>
          <p className="text-sm text-zinc-500">List your item on Second Market instantly.</p>
        </div>

        {/* 💡 ပြင်ဆင်လိုက်သည့်အပိုင်း: TypeScript Error ကင်းစင်စေရန် Inline Wrapper ဖြင့် Server Action ကို ချိတ်ဆက်ခြင်း */}
        <form 
          action={(formData: FormData) => {
            startTransition(async () => {
              const res = await createListing(formData);
              if (res?.error) {
                alert(res.error); // Error ရှိပါက alert ပြမည်
              }
            });
          }} 
          className="space-y-5"
        >
          {/* Hidden Inputs for Streamed Images */}
          {images.map((url, idx) => (
            <input key={idx} type="hidden" name="images" value={url} />
          ))}

          {/* Drag & Drop Streaming Zone */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Item Images</label>
            <div className="grid grid-cols-3 gap-4">
              {images.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-zinc-200">
                  <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                    className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black rounded-full text-white cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              
              <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition">
                {uploading ? (
                  <Loader2 size={24} className="animate-spin text-zinc-400" />
                ) : (
                  <>
                    <UploadCloud size={24} className="text-zinc-400" />
                    <span className="text-xs text-zinc-400 mt-1">Upload</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
          </div>

          {/* Title & Metadata Inputs */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Title</label>
            <input type="text" name="title" required className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-black" placeholder="iPhone 15 Pro Max, MacBook Air..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Original Price ($)</label>
              <input type="number" name="originalPrice" required className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Selling Price ($)</label>
              <input type="number" name="currentPrice" required className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Category</label>
            <select name="category" required className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-black">
              <option value="Electronics">Electronics</option>
              <option value="Apparel">Apparel</option>
              <option value="Home Goods">Home Goods</option>
              <option value="Vehicles">Vehicles</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <textarea name="description" rows={4} required className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-black" placeholder="Describe the condition, usage, and key details..."></textarea>
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full py-3 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-xl hover:opacity-90 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isPending && <Loader2 size={16} className="animate-spin" />}
            {isPending ? 'Publishing...' : 'Publish Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}