'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Camera, Save } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    character_name: '',
    system_prompt: '',
    avatar_url: '',
    openai_api_key: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) setProfile(data);
  };

  // 사진 수정 버튼 로직 (실제로 작동하게 수정)
  const handleAvatarUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const filePath = `${user?.id}/avatar.${file.name.split('.').pop()}`;
      
      // 기존 사진 덮어쓰기 위해 upsert: true 사용
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filePath);
      
      setProfile({ ...profile, avatar_url: publicUrl });
      alert("사진이 변경되었습니다. 저장 버튼을 눌러 확정해주세요.");
    } catch (err: any) {
      alert("사진 업로드 실패: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('profiles').update(profile).eq('id', user?.id);
    
    if (error) alert("저장 실패: " + error.message);
    else alert("설정이 저장되었습니다.");
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#F2F2F7] font-sans">
      <header className="px-4 pt-12 pb-4 flex justify-between items-center bg-white border-b sticky top-0 z-10">
        <Link href="/" className="text-[#007AFF] flex items-center"><ChevronLeft /> 목록</Link>
        <span className="font-bold text-[17px]">설정</span>
        <button onClick={saveProfile} disabled={loading} className="text-[#007AFF] font-bold">
          {loading ? '...' : '저장'}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* 프로필 사진 수정 섹션 */}
        <div className="flex flex-col items-center py-4">
          <div className="relative w-24 h-24">
            <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="avatar" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-2xl">?</div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-[#007AFF] p-2 rounded-full text-white shadow-lg cursor-pointer active:scale-90 transition-transform">
              <Camera size={18} />
              <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
            </label>
          </div>
          <p className="text-[13px] text-gray-500 mt-2">사진 수정</p>
        </div>

        {/* 기본 정보 설정 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center">
            <span className="w-24 text-[15px] text-gray-600">이름</span>
            <input 
              className="flex-1 outline-none text-[15px] text-black"
              value={profile.character_name}
              onChange={(e) => setProfile({...profile, character_name: e.target.value})}
              placeholder="캐릭터 이름"
            />
          </div>
          <div className="px-4 py-3 border-b border-gray-100 flex items-center">
            <span className="w-24 text-[15px] text-gray-600">API 키</span>
            <input 
              type="password"
              className="flex-1 outline-none text-[15px] text-black"
              value={profile.openai_api_key}
              onChange={(e) => setProfile({...profile, openai_api_key: e.target.value})}
              placeholder="sk-..."
            />
          </div>
        </div>

        {/* 프롬프트 설정 (복구됨) */}
        <div className="space-y-2">
          <span className="px-4 text-[13px] text-gray-500 uppercase tracking-wider">캐릭터 페르소나 (프롬프트)</span>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <textarea 
              className="w-full h-40 outline-none text-[15px] text-black resize-none"
              value={profile.system_prompt}
              onChange={(e) => setProfile({...profile, system_prompt: e.target.value})}
              placeholder="AI 캐릭터의 성격과 말투를 상세히 입력하세요."
            />
          </div>
        </div>

        {/* 알람 설정 바로가기 (단어 수정) */}
        <Link href="/timeline" className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 active:bg-gray-100 transition-colors">
          <span className="text-[15px] text-black">알람 설정 (구 선톡)</span>
          <ChevronLeft className="rotate-180 text-gray-300" size={20} />
        </Link>
      </div>
    </div>
  );
}
