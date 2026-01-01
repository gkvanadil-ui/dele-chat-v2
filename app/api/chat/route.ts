import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    // [TODO] 실제 AI 연결 부분
    const reply = `Echo: ${message}`;

    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
