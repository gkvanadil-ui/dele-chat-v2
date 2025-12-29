import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">나만의 캐릭터 채팅</h1>
      <div className="flex gap-4">
        <Link href="/chat" className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg">채팅 시작</Link>
        <Link href="/settings" className="bg-gray-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg">설정 변경</Link>
      </div>
    </div>
  );
}
