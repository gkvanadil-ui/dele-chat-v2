export const runtime = 'edge';

import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Cloudflare Pages 배포 성공</h1>
      <p className="mb-8 text-lg">Next.js 14.3.0 + Edge Runtime</p>
      <Link 
        href="/chat"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        채팅방 입장하기
      </Link>
    </main>
  );
}
