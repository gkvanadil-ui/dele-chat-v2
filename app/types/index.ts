export interface User {
  id: string;
  email?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  user_id: string;
  created_at: string;
}

export interface ChatRequest {
  message: string;
  history: Message[];
}
