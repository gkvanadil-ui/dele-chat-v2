'use client';
import { useState, useEffect } from 'react';
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

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const filePath = `${user?.id}/${Date.now()}.${file.name.split('.').pop()}`;
    
    // Supabase Storage 업로드 (버킷 이름: avatars)
    const { error } = await supabase.storage.from('avatars').upload(filePath, file);
    if (error) { alert('업로드 실패: ' + error.message); setLoading(false); return; }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
    setForm(prev => ({ ...prev, avatar_url: publicUrl }));
    setLoading(false);
  };

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('profiles').upsert({ id: user?.id, ...form });
    if (error) alert("저장 실패: " + error.message);
    else alert("모든 설정이 저장되었습니다!");
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#F2F2F7] font-sans">
      <header className="px-4 pt-12 pb-4 flex justify-between items-center bg-white border-b">
        <Link href="/" className="text-[#007AFF] flex items-center"><ChevronLeft /> 목록</Link>
        <span className="font-bold">이름 및 사진 설정</span>
        <button onClick={save} className="text-[#007AFF] font-bold">완료</button>
      </header>

      <div className="mt-8 flex flex-col items-center px-4 space-y-6">
        {/* 프로필 사진 업로드 부분 */}
        <label className="relative cursor-pointer group">
          <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-md flex items-center justify-center">
            {form.avatar_url ? <img src={form.avatar_url} className="w-full h-full object-cover" /> : <Camera className="text-gray-400" />}
          </div>
          <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <span className="text-white text-[10px] font-bold">변경</span>
          </div>
          <input type="file" className="hidden" onChange={handleUpload} disabled={loading} />
        </label>

        <div className="w-full bg-white rounded-xl border">
          <div className="p-4 border-b flex items-center">
            <span className="w-24 text-[15px] text-gray-500">내 이름</span>
            <input className="flex-1 outline-none text-[17px]" value={form.user_name} onChange={e => setForm({...form, user_name: e.target.value})} placeholder="본인 이름" />
          </div>
          <div className="p-4 border-b flex items-center">
            <span className="w-24 text-[15px] text-gray-500">상대 이름</span>
            <input className="flex-1 outline-none text-[17px]" value={form.character_name} onChange={e => setForm({...form, character_name: e.target.value})} placeholder="캐릭터 이름" />
          </div>
          <div className="p-4 flex flex-col">
            <span className="text-[15px] text-gray-500 mb-2">대화 프롬프트</span>
            <textarea className="w-full h-24 outline-none bg-gray-50 p-2 rounded text-sm" value={form.system_prompt} onChange={e => setForm({...form, system_prompt: e.target.value})} placeholder="말투나 성격을 입력하세요." />
          </div>
        </div>

        <div className="w-full bg-white rounded-xl p-4 border flex items-center">
          <span className="w-24 text-[15px] text-gray-500">API KEY</span>
          <input type="password" className="flex-1 outline-none text-sm" value={form.openai_api_key} onChange={e => setForm({...form, openai_api_key: e.target.value})} placeholder="sk-..." />
        </div>
      </div>
    </div>
  );
}
