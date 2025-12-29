'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Camera } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    user_name: '', 
    character_name: '', 
    system_prompt: '', 
    avatar_url: '', 
    openai_api_key: '' 
  });

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setForm(data);
    };
    loadProfile();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const filePath = `avatars/${user?.id}/${Date.now()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('avatars').upload(filePath, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setForm(prev => ({ ...prev, avatar_url: publicUrl }));
    } catch (err: any) {
      alert('업로드 실패: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("로그인이 필요합니다.");

    const { error } = await supabase.from('profiles').upsert({ 
      id: user.id, 
      ...form 
    });

    if (error) alert("저장 실패: " + error.message);
    else alert("설정 완료!");
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#F2F2F7] font-sans">
      <header className="px-4 pt-12 pb-4 flex justify-between items-center bg-white border-b">
        <Link href="/" className="text-[#007AFF] flex items-center"><ChevronLeft /> 목록</Link>
        <span className="font-bold">설정</span>
        <button onClick={save} className="text-[#007AFF] font-bold">완료</button>
      </header>

      <div className="mt-8 flex flex-col items-center px-4 space-y-6 overflow-y-auto pb-10">
        <label className="relative cursor-pointer group">
          <div className="w-24 h-24 bg-gray-300 rounded-full overflow-hidden border-2 border-white shadow-md flex items-center justify-center">
            {form.avatar_url ? <img src={form.avatar_url} className="w-full h-full object-cover" alt="Profile" /> : <Camera className="text-white" />}
          </div>
          <input type="file" className="hidden" onChange={handleUpload} disabled={loading} />
        </label>

        <div className="w-full bg-white rounded-xl border border-gray-200 divide-y">
          <div className="p-4 flex items-center">
            <span className="w-24 text-gray-500 text-sm">내 이름</span>
            <input className="flex-1 outline-none text-[17px]" value={form.user_name} onChange={e => setForm({...form, user_name: e.target.value})} />
          </div>
          <div className="p-4 flex items-center">
            <span className="w-24 text-gray-500 text-sm">캐릭터 이름</span>
            <input className="flex-1 outline-none text-[17px]" value={form.character_name} onChange={e => setForm({...form, character_name: e.target.value})} />
          </div>
          <div className="p-4 flex flex-col">
            <span className="text-gray-500 text-sm mb-2">프롬프트</span>
            <textarea className="w-full h-24 outline-none bg-gray-50 p-2 rounded text-sm" value={form.system_prompt} onChange={e => setForm({...form, system_prompt: e.target.value})} />
          </div>
        </div>
      </div>
    </div>
  );
}
