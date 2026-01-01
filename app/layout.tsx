import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // globals.css가 없다면 이 줄을 지우세요.

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Chat App',
  description: 'Next.js Supabase Chat',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
