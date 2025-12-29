import './globals.css';

export const metadata = {
  title: 'AI Message',
  description: 'Clean start version',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased bg-gray-100">{children}</body>
    </html>
  );
}
