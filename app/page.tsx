'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 앱 접속 시 채팅 페이지로 자동 리다이렉트
    router.push('/chat');
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="animate-pulse text-lg font-medium">Loading...</div>
    </main>
  );
}
