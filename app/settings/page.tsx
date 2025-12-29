'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Settings() {
  const [profile, setProfile] = useState({ character_name: '', openai_api_key: '', system_prompt: '' });

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) setProfile(data);
      }
    };
    getProfile();
  }, []);

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('profiles').upsert({ id: user?.id, ...profile });
    alert("설정이 저장되었습니다.");
  };

  return (
    <div className="p-6 max-w-md mx-auto space-y-6">
      <h2 className="text-2xl font-bold border-b pb-2">개인 설정</h2>
      
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-500">캐릭터 이름</label>
          <input className="w-full border-b p-2 outline-none focus:border-green-500" 
            value={profile.character_name} onChange={e => setProfile({...profile, character_name: e.target.value})} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500">OpenAI API Key</label>
          <input className="w-full border-b p-2 outline-none focus:border-green-500" type="password"
            value={profile.openai_api_key} onChange={e => setProfile({...profile, openai_api_key: e.target.value})} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500">시스템 프롬프트 (성격/말투)</label>
          <textarea className="w-full border rounded p-2 h-32 text-sm"
            value={profile.system_prompt} onChange={e => setProfile({...profile, system_prompt: e.target.value})} />
        </div>
        <button onClick={save} className="w-full bg-green-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-100">설정 저장</button>
      </div>
    </div>
  );
}
