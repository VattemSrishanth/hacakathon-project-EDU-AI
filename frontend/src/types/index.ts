export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  thumbnail?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
