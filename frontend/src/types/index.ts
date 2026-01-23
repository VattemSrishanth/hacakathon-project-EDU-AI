export interface User {
  id?: string | number;
  username?: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  initials?: string;
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
