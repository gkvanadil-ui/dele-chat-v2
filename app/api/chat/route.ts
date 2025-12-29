import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const { userId, message, history } = await req.json();
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (!profile?.openai_api_key) return NextResponse.json({ error: "No Key" }, { status: 400 });

  const openai = new OpenAI({ apiKey: profile.openai_api_key });
  const prompt = `이름:${profile.character_name}, 호칭:${profile.user_title}, 말투:${profile.system_prompt}. JSON {"m": "응답"}으로만 답해.`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: prompt }, { role: "user", content: message }],
    response_format: { type: "json_object" }
  });

  return NextResponse.json(JSON.parse(res.choices[0].message.content || '{"m":""}'));
}
