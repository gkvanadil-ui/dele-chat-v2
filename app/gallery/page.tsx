'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Plus, Image as ImageIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function GalleryPage() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadPhotos(); }, []);

  const loadPhotos = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from('character_photos').select('*').eq('user_id', user?.id).order('created_at', { ascending: false });
    if (data) setPhotos(data);
  };

  const uploadPhoto = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const filePath = `${user?.id}/${Date.now()}.${file.name.split('.').pop()}`;
    
    await supabase.storage.from('photos').upload(filePath, file);
    const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filePath);
    
    await supabase.from('character_photos').insert([{ user_id: user?.id, photo_url: publicUrl }]);
    loadPhotos();
    setLoading(false);
  };

  const deletePhoto = async (id: number, url: string) => {
    const path = url.split('photos/').pop();
    if (path) await supabase.storage.from('photos').remove([path]);
    await supabase.from('character_photos').delete().eq('id', id);
    loadPhotos();
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white font-sans">
      <header className="px-4 pt-12 pb-4 flex justify-between items-center border-b bg-white sticky top-0 z-10">
        <Link href="/" className="text-[#007AFF] flex items-center"><ChevronLeft /> 목록</Link>
        <span className="font-bold text-[17px]">사진첩</span>
        <label className="cursor-pointer text-[#007AFF]">
          {loading ? "..." : <Plus size={24} />}
          <input type="file" className="hidden" onChange={uploadPhoto} disabled={loading} />
        </label>
      </header>

      <div className="grid grid-cols-3 gap-1 p-1 overflow-y-auto">
        {photos.map((p) => (
          <div key={p.id} className="aspect-square relative group">
            <img src={p.photo_url} className="w-full h-full object-cover" />
            <button onClick={() => deletePhoto(p.id, p.photo_url)} className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
