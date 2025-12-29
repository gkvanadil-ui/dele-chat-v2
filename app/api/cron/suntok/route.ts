import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';

export async function GET() {
  const { data: users } = await supabase.from('profiles').select('*').eq('is_notification_enabled', true);
  if (!users) return NextResponse.json({ m: "No active users" });

  for (const user of users) {
    if (Math.random() > 0.5) {
      const openai = new OpenAI({ apiKey: user.openai_api_key });
      const mission = `${user.user_title}에게 먼저 자연스럽게 안부 인사를 건네거나 말을 걸어줘.`;
      
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: `당신은 ${user.character_name}입니다. 상대를 ${user.user_title}(이)라고 부릅니다. ${user.system_prompt}` },
            { role: "user", content: mission }
          ],
          response_format: { type: "json_object" }
        });
        const aiRes = JSON.parse(response.choices[0].message.content || '{"m":""}');
        await supabase.from('messages').insert({ user_id: user.id, content: aiRes.m, is_from_user: false });
      } catch (e) { console.error("Error:", user.id); }
    }
  }
  return NextResponse.json({ ok: true });
}
