'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 접속 시 바로 채팅 화면으로 이동
    router.replace('/chat');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="animate-pulse text-gray-500">Loading...</p>
    </div>
  );
}
