import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: '메시지가 비어있습니다.' },
        { status: 400 }
      );
    }

    // 간단한 에코 응답 (실제 AI 연동 시 여기서 fetch 사용)
    const reply = `Edge 서버 응답: "${message}" (Next.js 14.3.0)`;

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
