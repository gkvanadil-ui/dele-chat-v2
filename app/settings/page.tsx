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
      if (!user) throw new Error("로그인이 필요합니다.");
      
      const filePath = `avatars/${user.id}/${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      
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
    
    // 로그인이 안 되어 있을 경우 경고
    if (!user) {
      alert("로그인이 필요합니다. 페이지를 새로고침하거나 다시 접속해주세요.");
      return;
    }

    const { error } = await supabase.from('profiles').upsert({ 
      id: user.id, 
      ...form,
      updated_at: new Date().toISOString()
    });

    if (error) alert("저장 실패: " + error.message);
    else alert("설정 완료!");
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#F2F2F7] font-sans">
      <header className="px-4 pt-12 pb-4 flex justify-between items-center bg-white border-b">
        <Link href="/" className="text-[#007AFF] flex items-center"><ChevronLeft /> 목록</Link>
        <span className="font-bold text-[17px]">설정</span>
        <button onClick={save} className="text-[#007AFF] font-bold text-[17px]">완료</button>
      </header>

      <div className="mt-8 flex flex-col items-center px-4 space-y-6 overflow-y-auto pb-10">
        {/* 프로필 이미지 섹션 */}
        <label className="relative cursor-pointer group">
          <div className="w-24 h-24 bg-gray-300 rounded-full overflow-hidden border-2 border-white shadow-md flex items-center justify-center">
            {form.avatar_url ? (
              <img src={form.avatar_url} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              <Camera className="text-white w-8 h-8" />
            )}
          </div>
          <input type="file" className="hidden" onChange={handleUpload} disabled={loading} />
          {loading && <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center text-[10px] text-white">업로드 중...</div>}
        </label>

        {/* 정보 입력 섹션 */}
        <div className="w-full bg-white rounded-xl border border-gray-200 divide-y">
          <div className="p-4 flex items-center">
            <span className="w-24 text-gray-500 text-sm">내 이름</span>
            <input className="flex-1 outline-none text-[17px]" value={form.user_name} onChange={e => setForm({...form, user_name: e.target.value})} placeholder="홍길동" />
          </div>
          <div className="p-4 flex items-center">
            <span className="w-24 text-gray-500 text-sm">캐릭터 이름</span>
            <input className="flex-1 outline-none text-[17px]" value={form.character_name} onChange={e => setForm({...form, character_name: e.target.value})} placeholder="상대방 이름" />
          </div>
          <div className="p-4 flex flex-col">
            <span className="text-gray-500 text-sm mb-2">프롬프트 (캐릭터 말투/성격)</span>
            <textarea className="w-full h-24 outline-none bg-gray-50 p-2 rounded text-sm resize-none" value={form.system_prompt} onChange={e => setForm({...form, system_prompt: e.target.value})} placeholder="친절하고 다정한 연인 말투로 대답해줘." />
          </div>
        </div>

        {/* API 키 섹션 (복구됨) */}
        <div className="w-full bg-white rounded-xl border border-gray-200 p-4">
          <span className="block text-gray-500 text-sm mb-2">OpenAI API KEY</span>
          <input 
            type="password" 
            className="w-full outline-none text-[15px] bg-gray-50 p-2 rounded" 
            value={form.openai_api_key} 
            onChange={e => setForm({...form, openai_api_key: e.target.value})} 
            placeholder="sk-..." 
          />
        </div>
      </div>
    </div>
  );
}
