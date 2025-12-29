'use client';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const initAuth = async () => {
      // 세션 확인 후 없으면 익명 로그인
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        await supabase.auth.signInAnonymously();
      }
    };
    initAuth();
  }, []);

  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
