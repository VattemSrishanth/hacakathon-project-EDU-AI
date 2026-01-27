export interface User {
  id?: string;
  username?: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  initials?: string;
  role?: 'user' | 'admin';
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
  imageUrl?: string;
  attachmentType?: 'image' | 'pdf' | 'youtube';
  attachmentTitle?: string;
}
