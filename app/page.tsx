'use client';
import Link from 'next/link';
import { MessageCircle, Settings as SettingsIcon } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white max-w-md mx-auto shadow-2xl border-x">
      {/* 상단 시계 감성 여백 */}
      <div className="h-20 w-full flex items-center justify-center pt-10">
        <h1 className="text-4xl font-black text-black tracking-tighter">Messages</h1>
      </div>

      <div className="flex-1 w-full px-6 flex flex-col justify-center space-y-4">
        <Link href="/chat" className="group">
          <div className="flex items-center p-5 bg-[#F2F2F7] rounded-[22px] transition-all active:scale-95 hover:bg-gray-200">
            <div className="w-14 h-14 bg-[#34C759] rounded-[14px] flex items-center justify-center shadow-lg shadow-green-200">
              <MessageCircle size={32} color="white" fill="white" />
            </div>
            <div className="ml-4">
              <p className="text-lg font-bold text-black">채팅 시작하기</p>
              <p className="text-xs text-gray-400 font-medium">대화를 이어가세요</p>
            </div>
          </div>
        </Link>

        <Link href="/settings" className="group">
          <div className="flex items-center p-5 bg-[#F2F2F7] rounded-[22px] transition-all active:scale-95 hover:bg-gray-200">
            <div className="w-14 h-14 bg-[#8E8E93] rounded-[14px] flex items-center justify-center shadow-lg shadow-gray-200">
              <SettingsIcon size={32} color="white" />
            </div>
            <div className="ml-4">
              <p className="text-lg font-bold text-black">설정</p>
              <p className="text-xs text-gray-400 font-medium">캐릭터 및 말투 변경</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="pb-10 text-gray-300 text-[10px] font-bold tracking-widest uppercase">
        Designed for iPhone Style
      </div>
    </div>
  );
}
