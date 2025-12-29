'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Search, MoreHorizontal, UserCircle, MessageSquare, Image, Clock, Edit } from 'lucide-react';

export default function MessageListPage() {
  const [profile, setProfile] = useState<any>(null);
  const [lastMsg, setLastMsg] = useState<any>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(p);
      const { data: m } = await supabase.from('messages').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single();
      setLastMsg(m);
    };
    init();
  }, []);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white shadow-2xl border-x font-sans relative overflow-hidden">
      <header className="px-4 pt-12 pb-2 flex justify-between items-center bg-white sticky top-0 z-30">
        <button onClick={() => {setShowLeft(!showLeft); setShowRight(false);}} className="text-[#007AFF] text-[17px]">편집</button>
        <button onClick={() => {setShowRight(!showRight); setShowLeft(false);}} className="bg-[#F2F2F7] p-2 rounded-full text-[#007AFF]">
          <MoreHorizontal size={20} />
        </button>
      </header>

      {showLeft && (
        <div className="absolute top-24 left-4 w-64 bg-white/95 backdrop-blur-xl border shadow-2xl rounded-2xl z-40 overflow-hidden">
          <Link href="/settings" className="flex items-center justify-between p-4 border-b active:bg-gray-100">
            <span className="text-[15px] font-medium">이름 및 프로필 설정</span>
            <UserCircle size={20} className="text-gray-400" />
          </Link>
        </div>
      )}

      {showRight && (
        <div className="absolute top-24 right-4 w-48 bg-white/95 backdrop-blur-xl border shadow-2xl rounded-2xl z-40 overflow-hidden">
          <button className="flex items-center justify-between p-4 border-b w-full active:bg-gray-100">
            <span className="text-[15px]">메시지</span><MessageSquare size={18} className="text-gray-400" />
          </button>
          <button className="flex items-center justify-between p-4 border-b w-full text-gray-400 cursor-not-allowed">
            <span className="text-[15px]">사진첩</span><Image size={18} />
          </button>
          <button className="flex items-center justify-between p-4 w-full active:bg-gray-100">
            <span className="text-[15px]">타임라인</span><Clock size={18} className="text-gray-400" />
          </button>
        </div>
      )}

      <div className="px-4 pb-4" onClick={() => {setShowLeft(false); setShowRight(false);}}>
        <h1 className="text-[34px] font-bold mb-2">메시지</h1>
        <div className="bg-[#E9E9EB] rounded-lg p-2 flex items-center gap-2 text-gray-500"><Search size={16} /><span>검색</span></div>
      </div>

      <div className="flex-1 overflow-y-auto" onClick={() => {setShowLeft(false); setShowRight(false);}}>
        <Link href="/chat">
          <div className="flex px-4 py-3 active:bg-gray-100 border-b border-gray-100 items-center gap-3">
            <div className="w-14 h-14 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
              {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <span className="text-xl font-bold text-white">{profile?.character_name?.[0]}</span>}
            </div>
            <div className="flex-1">
              <div className="flex justify-between font-bold text-[17px]"><span>{profile?.character_name || '캐릭터'}</span><span className="text-gray-400 font-normal text-[15px]">오후 12:14</span></div>
              <p className="text-gray-500 text-[15px] line-clamp-2">{lastMsg?.content || '새로운 메시지'}</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="p-6 flex justify-end sticky bottom-0 pointer-events-none">
        <button className="bg-white p-3 rounded-full shadow-xl border pointer-events-auto active:scale-95"><Edit size={24} className="text-[#007AFF]" /></button>
      </div>
    </div>
  );
}
