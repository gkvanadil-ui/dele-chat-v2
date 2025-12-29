'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Info } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(p);
      const { data: m } = await supabase.from('messages').select('*').eq('user_id', user.id).order('created_at', { ascending: true });
      if (m) setMessages(m);
    };
    init();
  }, []);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || !profile) return;
    const userMsg = { content: input, is_from_user: true, user_id: profile.id };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    const res = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ userId: profile.id, message: input, history: messages.slice(-10) }) });
    const data = await res.json();
    const aiMsg = { content: data.m, is_from_user: false, user_id: profile.id };
    setMessages(prev => [...prev, aiMsg]);
    await supabase.from('messages').insert([userMsg, aiMsg]);
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white border-x shadow-2xl font-sans">
      <header className="pt-10 pb-2 border-b bg-white/95 sticky top-0 z-20 flex flex-col items-center">
        <div className="w-full flex justify-between items-center px-4">
          <Link href="/"><ChevronLeft className="text-[#007AFF]" size={32} /></Link>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden mb-1">
              {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">{profile?.character_name?.[0]}</div>}
            </div>
            <span className="text-[11px] font-semibold">{profile?.character_name} 〉</span>
          </div>
          <Link href="/settings"><Info className="text-[#007AFF]" size={22} /></Link>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.map((m, i) => {
          const isNewDay = i === 0 || new Date(messages[i-1].created_at).toDateString() !== new Date(m.created_at).toDateString();
          return (
            <div key={i}>
              {isNewDay && <div className="text-center my-6"><span className="text-[11px] font-bold text-gray-400 uppercase">{new Date(m.created_at).toLocaleDateString('ko-KR', { weekday: 'long', month: 'long', day: 'numeric' })}</span></div>}
              <div className={`flex flex-col ${m.is_from_user ? 'items-end' : 'items-start'} mb-1`}>
                <div className={`px-4 py-2 rounded-[20px] text-[15px] max-w-[75%] leading-tight ${m.is_from_user ? 'bg-[#007AFF] text-white rounded-br-[4px]' : 'bg-[#E9E9EB] text-black rounded-bl-[4px]'}`}>{m.content}</div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <div className="p-3 bg-white border-t pb-10 flex items-center gap-2">
        <div className="flex-1 bg-[#F2F2F7] border rounded-full px-4 py-2 flex items-center">
          <input className="flex-1 bg-transparent outline-none text-[15px]" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="iMessage" />
          <button onClick={send} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${input ? 'bg-[#34C759]' : 'bg-gray-300'}`}><span className="text-white font-bold">↑</span></button>
        </div>
      </div>
    </div>
  );
}
