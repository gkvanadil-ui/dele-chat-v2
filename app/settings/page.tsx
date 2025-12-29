'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// 환경변수 직접 주입 (에러 방지)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState({ 
    character_name: '', user_name: '', system_prompt: '', avatar_url: '' 
  });

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile(data);
    };
    load();
  }, []);

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('profiles').upsert({ id: user?.id, ...profile });
    alert("저장완료");
    router.push('/'); // 탈출 로직
  };

  return (
    <div style={{ padding: '20px', background: '#F2F2F7', minHeight: '100vh', color: 'black' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button onClick={() => router.push('/')} style={{ color: '#007AFF', border: 'none', background: 'none', fontSize: '17px' }}>목록</button>
        <b style={{ fontSize: '17px' }}>설정</b>
        <button onClick={save} style={{ color: '#007AFF', border: 'none', background: 'none', fontWeight: 'bold', fontSize: '17px' }}>완료</button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div onClick={() => fileInputRef.current?.click()} style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#CCC', margin: '0 auto 10px', overflow: 'hidden' }}>
          {profile.avatar_url && <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectCover: 'cover' }} />}
        </div>
        <button onClick={() => fileInputRef.current?.click()} style={{ color: '#007AFF', border: 'none', background: 'none' }}>사진 수정</button>
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const { data: { user } } = await supabase.auth.getUser();
          const path = `${user?.id}/${Date.now()}`;
          await supabase.storage.from('photos').upload(path, file);
          const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(path);
          setProfile({ ...profile, avatar_url: publicUrl });
        }} />
      </div>

      <div style={{ background: 'white', borderRadius: '10px', padding: '10px' }}>
        <div style={{ borderBottom: '1px solid #EEE', padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
          <span>내 이름</span>
          <input value={profile.user_name} onChange={e => setProfile({...profile, user_name: e.target.value})} style={{ textAlign: 'right', border: 'none', outline: 'none' }} />
        </div>
        <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
          <span>상대 이름</span>
          <input value={profile.character_name} onChange={e => setProfile({...profile, character_name: e.target.value})} style={{ textAlign: 'right', border: 'none', outline: 'none' }} />
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <p style={{ fontSize: '13px', color: '#666', marginLeft: '10px' }}>페르소나 (프롬프트)</p>
        <textarea 
          value={profile.system_prompt} 
          onChange={e => setProfile({...profile, system_prompt: e.target.value})}
          style={{ width: '100%', height: '150px', borderRadius: '10px', border: 'none', padding: '15px', marginTop: '5px', outline: 'none' }} 
        />
      </div>
    </div>
  );
}
