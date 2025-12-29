'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Search, 
  MoreHorizontal, 
  MessageSquare, 
  Image as ImageIcon, 
  Clock, 
  SquarePen,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function MessageListPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 캐릭터 프로필 정보 로드
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(prof);

      // 마지막 메시지 1개 로드
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (msgs && msgs.length > 0) {
        setLastMessage(msgs[0]);
      }
    };
    loadData();
  }, []);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white font-sans overflow-hidden">
      {/* 상단 헤더 */}
      <header className="px-4 pt-12 pb-2 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <button className="text-[#007AFF] text-[17px]">편집</button>
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-8 h-8 bg-[#F2F2F7] rounded-full flex items-center justify-center text-[#007AFF]"
          >
            <MoreHorizontal size={20} />
          </button>

          {/* 팝업 메뉴 로직 (수정된 부분) */}
          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 py-1 z-40 animate-in fade-in zoom-in duration-200 origin-top-right overflow-hidden">
                <Link href="/chat" className="w-full px-4 py-3 flex items-center justify-between active:bg-gray-200/50 transition-colors border-b border-gray-100">
                  <span className="text-[16px]">메시지</span>
                  <MessageSquare size={18} className="text-gray-400" />
                </Link>
                <Link href="/gallery" className="w-full px-4 py-3 flex items-center justify-between active:bg-gray-200/50 transition-colors border-b border-gray-100">
                  <span className="text-[16px]">사진첩</span>
                  <ImageIcon size={18} className="text-gray-400" />
                </Link>
                <Link href="/timeline" className="w-full px-4 py-3 flex items-center justify-between active:bg-gray-200/50 transition-colors">
                  <span className="text-[16px]">타임라인</span>
                  <Clock size={18} className="text-gray-400" />
                </Link>
              </div>
            </>
          )}
        </div>
      </header>

      {/* 제목 및 검색창 */}
      <div className="px-4 pb-4 bg-white">
        <h1 className="text-[34px] font-bold tracking-tight mb-2">메시지</h1>
        <div className="relative flex items-center bg-[#E9E9EB] rounded-lg px-2 py-1.5">
          <Search size={18} className="text-gray-500 mr-1.5" />
          <input 
            className="bg-transparent outline-none text-[17px] w-full"
            placeholder="검색"
          />
        </div>
      </div>

      {/* 대화 리스트 */}
      <main className="flex-1 overflow-y-auto">
        <Link href="/chat" className="flex items-center px-4 py-3 active:bg-gray-100 transition-colors group">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden border border-black/5">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="pfp" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl bg-gray-300">
                  {profile?.character_name?.charAt(0) || '히'}
                </div>
              )}
            </div>
          </div>
          <div className="ml-3 flex-1 border-b border-gray-100 pb-3 group-last:border-none">
            <div className="flex justify-between items-baseline mb-0.5">
              <span className="font-bold text-[16px]">{profile?.character_name || '히요리'}</span>
              <span className="text-[14px] text-gray-500">
                {lastMessage ? new Date(lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[14px] text-gray-500 line-clamp-2 leading-snug pr-4">
                {lastMessage?.content || '새로운 대화를 시작해보세요.'}
              </p>
              <ChevronRight size={16} className="text-gray-300 shrink-0" />
            </div>
          </div>
        </Link>
      </main>

      {/* 하단 작성 버튼 */}
      <div className="p-4 flex justify-end sticky bottom-0 pointer-events-none">
        <Link href="/chat" className="pointer-events-auto w-12 h-12 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-[#007AFF] active:scale-95 transition-transform">
          <SquarePen size={24} />
        </Link>
      </div>
    </div>
  );
}
