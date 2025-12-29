import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';

export async function GET() {
  const now = new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' });

  // 1. 지금 시간이 선톡 시간이고 ON 상태인 유저들 찾기
  const { data: targets } = await supabase
    .from('timeline_settings')
    .select('*, profiles(*)')
    .eq('is_enabled', true)
    .eq('suntok_time', now);

  if (!targets || targets.length === 0) return NextResponse.json({ message: "No targets" });

  for (const target of targets) {
    const openai = new OpenAI({ apiKey: target.profiles.openai_api_key });
    
    // 2. AI 선톡 문구 생성
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: target.profiles.system_prompt + " 지금은 " + now + "이야. 상대방에게 먼저 다정한 선톡을 보내줘." }
      ],
    });

    const aiMsg = completion.choices[0].message.content;

    // 3. 메시지 DB 저장
    await supabase.from('messages').insert([
      { user_id: target.id, content: aiMsg, is_from_user: false }
    ]);
  }

  return NextResponse.json({ success: true, count: targets.length });
}
