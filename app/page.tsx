'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Search, MoreHorizontal, ImageIcon, Clock, SquarePen, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

// lib 폴더를 참조하지 않고 직접 선언해서 경로 에러를 원천 차단
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function MessageListPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white font-sans overflow-hidden text-black">
      <header className="px-4 pt-12 pb-2 flex justify-between items-center bg-white sticky top-0 z-[100]">
        <button onClick={() => router.push('/settings')} className="text-[#007AFF] text-[17px]">편집</button>
        <div className="relative">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="w-8 h-8 bg-[#F2F2F7] rounded-full flex items-center justify-center text-[#007AFF]">
            <MoreHorizontal size={20} />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-200 py-1 z-[120]">
              <button onClick={() => router.push('/gallery')} className="w-full px-4 py-3 flex justify-between border-b border-gray-100">
                <span>사진첩</span><ImageIcon size={18} />
              </button>
              <button onClick={() => router.push('/timeline')} className="w-full px-4 py-3 flex justify-between">
                <span>알람 설정</span><Clock size={18} />
              </button>
            </div>
          )}
        </div>
      </header>
      <div className="px-4 pb-4 bg-white">
        <h1 className="text-[34px] font-bold tracking-tight mb-2">메시지</h1>
        <div className="flex items-center bg-[#E9E9EB] rounded-lg px-2 py-1.5">
          <Search size={18} className="text-[#8E8E93] mr-1.5" />
          <input className="bg-transparent outline-none text-[17px] w-full" placeholder="검색" />
        </div>
      </div>
      <main className="flex-1 overflow-y-auto">
        <div onClick={() => router.push('/chat')} className="flex items-center px-4 py-3 active:bg-gray-100">
          <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden shrink-0">
            {profile?.avatar_url && <img src={profile.avatar_url} className="w-full h-full object-cover" />}
          </div>
          <div className="ml-3 flex-1 border-b border-gray-100 pb-3">
            <div className="flex justify-between items-baseline">
              <span className="font-bold text-[16px]">{profile?.character_name || '대화 상대'}</span>
              <span className="text-[13px] text-gray-500">{lastMessage ? '오후 4:41' : ''}</span>
            </div>
            <p className="text-gray-500 line-clamp-2 text-[14px]">{lastMessage?.content || '새 메시지 없음'}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
