import { createClient } from '@supabase/supabase-js';

// process.env가 undefined일 경우를 대비해 빈 문자열 할당 (빌드 에러 방지)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// 클라이언트 생성 (URL이 비어있으면 기능은 안되지만 빌드는 통과함 -> 런타임에러로 격리)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
