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

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  priority?: 'low' | 'normal' | 'high';
  is_read: boolean;
  created_at: string;
}

export interface EducationNews {
  id: string;
  title: string;
  description: string;
  source: string;
  publishedAt: string;
  url: string;
  image?: string;
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

export interface Certificate {
  id: string;
  courseName: string;
  completionDate: string;
  score: string | number;
  grade?: string;
  pdfUrl?: string;
  courseImage?: string;
}

export interface InProgressCertificate {
  id: string;
  courseName: string;
  progress: number;
  lessonsRemaining: number;
  totalLessons: number;
  courseImage?: string;
}

export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  earnedDate?: string;
  isUnlocked: boolean;
}

export interface LearningMilestones {
  lessonsCompleted: number;
  quizAccuracy: number;
  learningStreak: number;
}
