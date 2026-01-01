export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  created_at?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  user_id: string;
  created_at: string;
  // 필요한 경우 이미지 URL 등 확장
  image_url?: string; 
}

export interface ChatRequest {
  message: string;
  history: Message[];
}

export interface ChatResponse {
  reply: string;
  error?: string;
}
