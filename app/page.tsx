'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Settings, Image as ImageIcon, Clock, ChevronRight, SquarePen } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MessageListPage() {
  const [profile, setProfile] = useState<any>(null);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(prof);
      const { data: msgs } = await supabase.from('messages').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1);
      if (msgs && msgs.length > 0) setLastMessage(msgs[0]);
    };
    loadData();
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col max-w-md mx-auto bg-white font-sans text-black overflow-hidden">
      {/* 1. 최상단 헤더 영역 (클릭 보장) */}
      <header className="h-[120px] pt-12 px-4 flex flex-col justify-between bg-white/80 backdrop-blur-md z-[100] border-b border-gray-100">
        <div className="flex justify-between items-center w-full">
          <button 
            onClick={() => router.push('/settings')}
            className="text-[#007AFF] text-[17px] active:opacity-50"
          >
            편집
          </button>
          <button 
            onClick={() => router.push('/settings')}
            className="text-[#007AFF] active:opacity-50"
          >
            <Settings size={22} />
          </button>
        </div>
        <h1 className="text-[34px] font-bold tracking-tight pb-1">메시지</h1>
      </header>

      {/* 2. 스크롤 가능한 본문 영역 */}
      <main className="flex-1 overflow-y-auto bg-white pt-2">
        {/* 검색바 */}
        <div className="px-4 mb-4">
          <div className="flex items-center bg-[#E9E9EB] rounded-lg px-2 py-1.5">
            <Search size={18} className="text-[#8E8E93] mr-1.5" />
            <input className="bg-transparent outline-none text-[17px] w-full" placeholder="검색" />
          </div>
        </div>

        {/* 바로가기 버튼 섹션 (그리드 레이아웃 고정) */}
        <div className="grid grid-cols-2 gap-3 px-4 mb-6">
          <button 
            onClick={() => router.push('/gallery')}
            className="flex flex-col items-center justify-center p-4 bg-[#F2F2F7] rounded-2xl active:bg-gray-200 transition-colors border border-gray-100"
          >
            <ImageIcon className="text-[#007AFF] mb-1" size={24} />
            <span className="text-[13px] font-semibold">사진첩 관리</span>
          </button>
          <button 
            onClick={() => router.push('/timeline')}
            className="flex flex-col items-center justify-center p-4 bg-[#F2F2F7] rounded-2xl active:bg-gray-200 transition-colors border border-gray-100"
          >
            <Clock className="text-[#34C759] mb-1" size={24} />
            <span className="text-[13px] font-semibold">선톡 설정</span>
          </button>
        </div>

        {/* 대화방 리스트 (가장 중요한 클릭 영역) */}
        <div 
          onClick={() => router.push('/chat')}
          className="flex items-center px-4 py-3 active:bg-gray-100 cursor-pointer transition-colors relative"
        >
          <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-black/5">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} className="w-full h-full object-cover" alt="avatar" />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500 font-bold text-xl">
                {profile?.character_name?.charAt(0) || '?'}
              </div>
            )}
          </div>
          <div className="ml-3 flex-1 border-b border-gray-100 pb-3">
            <div className="flex justify-between items-baseline mb-0.5">
              <span className="font-bold text-[16px]">{profile?.character_name || '대화 상대'}</span>
              <span className="text-[13px] text-gray-500">
                {lastMessage ? new Date(lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[14px] text-gray-500 line-clamp-2 leading-snug pr-4">
                {lastMessage?.content || '새로운 대화를 시작해보세요.'}
              </p>
              <ChevronRight size={16} className="text-gray-300" />
            </div>
          </div>
        </div>
      </main>

      {/* 3. 플로팅 글쓰기 버튼 */}
      <div className="absolute bottom-8 right-6">
        <button 
          onClick={() => router.push('/chat')}
          className="w-14 h-14 bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-gray-100 flex items-center justify-center text-[#007AFF] active:scale-95 transition-transform z-[110]"
        >
          <SquarePen size={28} />
        </button>
      </div>
    </div>
  );
}
