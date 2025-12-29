import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const { userId, message, imageUrl, history, photoContext } = await req.json();

  // 1. 프로필 정보(개인 API 키, 프롬프트) 가져오기
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!profile?.openai_api_key) return NextResponse.json({ error: "API KEY MISSING" }, { status: 400 });

  const openai = new OpenAI({ apiKey: profile.openai_api_key });

  // 2. 시스템 프롬프트 구성 (iOS의 PersonaConfig 기능)
  const systemMessage = `${profile.system_prompt}\n대화기록:\n${history}\n${photoContext || ""}`;

  // 3. 메시지 페이로드 구성
  const userContent: any[] = [{ type: "text", text: message }];
  if (imageUrl) userContent.push({ type: "image_url", image_url: { url: imageUrl } });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: userContent }
    ],
    response_format: { type: "json_object" }
  });

  const aiRes = JSON.parse(response.choices[0].message.content || '{"m":""}');
  return NextResponse.json({ m: aiRes.m });
}
