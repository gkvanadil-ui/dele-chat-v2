import { createClient } from '@supabase/supabase-js';

// GitHub 빌드 환경에서 환경변수가 없어도 터지지 않도록 빈 문자열 처리
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// URL이 비어있으면 기능은 안 되지만, 빌드 자체는 성공함
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
