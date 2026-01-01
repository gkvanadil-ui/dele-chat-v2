'use client';

import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../utils/supabase'; // 상대 경로 표준화
import type { Message, Profile } from '../types'; // 타입 import 통합

// UUID 생성 폴백 (브라우저 호환성 확보)
const generateUUID = () => {
  if (typeof self !== 'undefined' && self.crypto && self.crypto.randomUUID) {
    return self.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export default function ChatPage() {
  const router = useRouter();
  
  // 상태 관리
  const [user, setUser] = useState<any>(null); // Supabase User 타입 사용 권장
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true); // 초기 로딩
  const [isSending, setIsSending] = useState(false); // 메시지 전송 중

  // 스크롤 ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. 세션 체크 및 초기 데이터 로드
  useEffect(() => {
    const initialize = async () => {
      try {
        // getUser가 getSession보다 보안상 권장됨
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace('/'); // 세션 없으면 홈으로 리다이렉트
          return;
        }

        setUser(user);

        // 메시지 로드
        const { data: msgData, error: msgError } = await supabase
          .from('messages')
          .select('*')
          .eq('user_id', user.id) // 본인 메시지만 로드
          .order('created_at', { ascending: true });

        if (msgError) throw msgError;
        setMessages(msgData || []);

      } catch (error) {
        console.error('초기화 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [router]);

  // 2. 스크롤 자동 이동 (메시지 추가 시)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // 3. 메시지 전송 핸들러
  const handleSendMessage = async () => {
    if (!inputText.trim() || isSending || !user) return;

    const currentText = inputText.trim();
    setInputText(''); // 입력창 즉시 비움 (UX)
    setIsSending(true);

    // 낙관적 업데이트용 ID 및 Timestamp
    const tempId = generateUUID();
    const now = new Date().toISOString();

    const newUserMsg: Message = {
      id: tempId,
      role: 'user',
      content: currentText,
      user_id: user.id,
      created_at: now,
    };

    // UI 낙관적 업데이트
    setMessages((prev) => [...prev, newUserMsg]);

    try {
      // 3-1. 사용자 메시지 DB 저장 (필수)
      const { error: insertError } = await supabase
        .from('messages')
        .insert([
          {
            // id는 DB에서 자동 생성되거나, UUID를 직접 지정 가능. 
            // 여기서는 일관성을 위해 DB가 생성하게 하거나 위에서 만든 ID 사용.
            // 보통 DB default uuid_generate_v4()를 쓴다면 제외, 아니면 포함.
            role: 'user',
            content: currentText,
            user_id: user.id,
          }
        ]);

      if (insertError) throw new Error('메시지 저장 실패');

      // 3-2. AI 응답 요청
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentText, history: messages }),
      });

      if (!response.ok) throw new Error('AI 응답 실패');

      const data = await response.json();
      const aiContent = data.reply;

      const newAiMsg: Message = {
        id: generateUUID(),
        role: 'assistant',
        content: aiContent,
        user_id: user.id,
        created_at: new Date().toISOString(),
      };

      // 3-3. AI 메시지 UI 업데이트
      setMessages((prev) => [...prev, newAiMsg]);

      // 3-4. AI 메시지 DB 저장 (필수)
      // 클라이언트가 저장하는 방식 (RLS 정책상 본인 row insert 허용 필요)
      await supabase.from('messages').insert([
        {
          role: 'assistant',
          content: aiContent,
          user_id: user.id,
        }
      ]);

    } catch (error) {
      console.error('전송 에러:', error);
      // 에러 시 롤백 또는 알림 처리
      alert('메시지 전송 중 오류가 발생했습니다.');
      // 선택적: 실패한 메시지를 제거하거나 재시도 버튼 표시
      setMessages((prev) => prev.filter(msg => msg.id !== tempId));
      setInputText(currentText); // 입력 내용 복구
    } finally {
      setIsSending(false);
    }
  };

  // 4. 엔터키 핸들러 (IME 중복 입력 방지)
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return; // 한글 조합 중이면 무시
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">로딩 중...</div>;
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white border-x border-gray-200 shadow-sm">
      {/* 헤더 */}
      <header className="p-4 border-b flex justify-between items-center bg-white z-10">
        <h1 className="text-lg font-bold text-gray-800">Chat</h1>
        <button 
          onClick={() => router.push('/')} 
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          나가기
        </button>
      </header>

      {/* 메시지 리스트 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id} // idx 대신 고유 id 사용 (필수)
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm whitespace-pre-wrap ${
                  isUser
                    ? 'bg-blue-500 text-white rounded-tr-none'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        {isSending && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-500 text-xs px-3 py-1.5 rounded-full animate-pulse">
              AI가 생각 중...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors disabled:bg-gray-100"
            placeholder="메시지를 입력하세요..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            autoComplete="off"
          />
          <button
            onClick={handleSendMessage}
            disabled={isSending || !inputText.trim()}
            className="bg-blue-500 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
          >
            {/* 전송 아이콘 (SVG) */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="w-5 h-5"
            >
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
