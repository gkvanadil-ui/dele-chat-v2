'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const [config, setConfig] = useState({ key: '', prompt: '', name: '' });

  const saveSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('profiles').upsert({
      id: user?.id,
      openai_api_key: config.key,
      system_prompt: config.prompt,
      character_name: config.name
    });
    alert("설정이 저장되었습니다!");
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">개인 설정</h1>
      <input placeholder="캐릭터 이름" className="w-full border p-2" 
        onChange={e => setConfig({...config, name: e.target.value})} />
      <input placeholder="OpenAI API Key" className="w-full border p-2" type="password"
        onChange={e => setConfig({...config, key: e.target.value})} />
      <textarea placeholder="나만의 프롬프트(말투 등)" className="w-full border p-2 h-32"
        onChange={e => setConfig({...config, prompt: e.target.value})} />
      <button onClick={saveSettings} className="w-full bg-green-500 text-white p-3 rounded">저장하기</button>
    </div>
  );
}
