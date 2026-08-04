import axios from 'axios';
import { offlineSyncService } from './offlineSync';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  try {
    const stored = window.localStorage.getItem('auth');
    const auth = stored ? JSON.parse(stored) : null;
    const token = auth?.token;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore storage errors
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      try {
        window.localStorage.removeItem('auth');
      } catch (e) {}
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (name: string, email: string, password: string, role: string = 'student') => {
    const response = await api.post('/auth/register', { name, email, password, role });
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  getDevCredentials: async () => {
    const response = await api.get('/auth/dev-credentials');
    return response.data;
  },
};

// AI Tutor API
export const aiAPI = {
  /**
   * Universal ask method that supports standard questions and persistent file context (Image/PDF).
   */
  ask: async (question: string, mode: string = 'regular', context: any = null, online: boolean = true, language: string = 'English', answerStyle: string = 'Detailed') => {
    const response = await api.post('/ask', { 
      question, 
      mode, 
      context, // Active file context (type, data, name)
      online,
      language,
      answerStyle
    });
    return response.data;
  },
  
  explainVideo: async (videoUrl: string, question: string = '', mode: string = 'regular', language: string = 'English', answerStyle: string = 'Detailed') => {
    const response = await api.post('/explain-video', { 
      videoUrl, 
      question,
      mode,
      online: true,
      language,
      answerStyle
    });
    return response.data;
  },

  analyzeImage: async (base64Image: string, question: string = '', mode: string = 'regular', language: string = 'English', answerStyle: string = 'Detailed') => {
    const response = await api.post('/analyze-image', { 
      image: base64Image,
      question,
      mode,
      language,
      answerStyle
    });
    return response.data;
  },

  analyzePdf: async (pdfText: string, question: string = '', mode: string = 'regular', language: string = 'English', answerStyle: string = 'Detailed') => {
    const response = await api.post('/analyze-pdf', { 
      text: pdfText,
      question,
      mode,
      language,
      answerStyle
    });
    return response.data;
  },
};

// Lessons API
export const lessonsAPI = {
  getAll: async (category?: string, level?: string) => {
    const response = await api.get('/lessons', { params: { category, level } });
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/lessons/${id}`);
    return response.data;
  },

  getContent: async (id: string) => {
    const response = await api.get(`/lessons/${id}/content`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
};

// Lesson generation via Blackbox (proxied through backend to keep key secret)
export const lessonGeneratorAPI = {
  generate: async (params: {
    topic: string;
    subject: string;
    unit?: string;
    grade?: string | null;
    mode?: 'simple' | 'detailed';
    language?: string;
  }) => {
    const response = await api.post('/lessons/generate', params);
    return response.data;
  },
};

// User Data API
export const userDataAPI = {
  getProfile: async (userId: string) => {
    const response = await api.get('/profile', { params: { user_id: userId } });
    return response.data;
  },
  updateProfile: async (id: string, data: any) => {
    if (!navigator.onLine) {
      offlineSyncService.queueAction('PROFILE_UPDATE', { id, ...data });
      return { success: true, offline: true };
    }
    const response = await api.post('/profile', { id, ...data });
    return response.data;
  },
  getProgress: async (userId: string) => {
    const response = await api.get('/progress', { params: { user_id: userId } });
    return response.data;
  },
  updateProgress: async (userId: string, data: any) => {
    if (!navigator.onLine) {
      offlineSyncService.queueAction('PROGRESS_UPDATE', { userId, ...data });
      return { success: true, offline: true };
    }
    const response = await api.post('/progress', data, { params: { user_id: userId } });
    return response.data;
  },
  saveChatHistory: async (userId: string, messages: any[], sessionId?: string) => {
    if (!navigator.onLine) {
      offlineSyncService.queueAction('CHAT_HISTORY', { userId, messages, sessionId });
      return { success: true, offline: true };
    }
    const response = await api.post('/history', { messages, sessionId }, { params: { user_id: userId } });
    return response.data;
  },
  getChatHistory: async (userId: string) => {
    const response = await api.get('/history', { params: { user_id: userId } });
    return response.data;
  },
  clearChatHistory: async (userId: string, sessionId?: string) => {
    const params: any = { user_id: userId };
    if (sessionId) params.session_id = sessionId;
    const response = await api.delete('/history', { params });
    return response.data;
  },
  submitFeedback: async (feedback: any) => {
    if (!navigator.onLine) {
      offlineSyncService.queueAction('FEEDBACK', feedback);
      return { success: true, offline: true };
    }
    const response = await api.post('/feedback', feedback);
    return response.data;
  },
  getNotifications: async (userId: string) => {
    const response = await api.get('/notifications', { params: { user_id: userId } });
    return response.data;
  },
  updateNotificationsRead: async (userId: string) => {
    const response = await api.put('/notifications/read', {}, { params: { user_id: userId } });
    return response.data;
  },
  getEducationNews: async () => {
    const response = await api.get('/education-news');
    return response.data;
  },
  getAssignments: async () => {
    const response = await api.get('/assignments');
    return response.data;
  }
};

// Admin API
export const adminAPI = {
  getStats: async (adminId: string) => {
    const response = await api.get(`/admin/${adminId}/stats`);
    return response.data;
  },

  getUsersList: async (params: any) => {
    const response = await api.get('/admin/users/list', { params });
    return response.data;
  },

  performUserBulkAction: async (userIds: string[], action: string) => {
    const response = await api.post('/admin/users/bulk', { userIds, action });
    return response.data;
  },

  getTeacherVerifications: async () => {
    const response = await api.get('/admin/verifications');
    return response.data;
  },

  verifyTeacher: async (id: string, action: string, feedback?: string) => {
    const response = await api.post(`/admin/verifications/${id}/verify`, { action, feedback });
    return response.data;
  },

  getLiveMentorLogs: async () => {
    const response = await api.get('/admin/live-mentor/logs');
    return response.data;
  },

  getModerationLogs: async () => {
    const response = await api.get('/admin/moderation/logs');
    return response.data;
  },

  respondToAppeal: async (logId: string, action: string) => {
    const response = await api.post('/admin/moderation/appeal', { logId, action });
    return response.data;
  },

  scheduleNotification: async (data: any) => {
    const response = await api.post('/admin/notifications/schedule', data);
    return response.data;
  },

  getReportsData: async () => {
    const response = await api.get('/admin/analytics/reports');
    return response.data;
  },

  getSystemHealthStatus: async () => {
    const response = await api.get('/admin/system/health');
    return response.data;
  },

  getAdminSettings: async () => {
    const response = await api.get('/admin/settings/config');
    return response.data;
  },

  saveAdminSettings: async (settingsData: any) => {
    const response = await api.post('/admin/settings/config', settingsData);
    return response.data;
  },

  createLesson: async (lessonData: any) => {
    const response = await api.post('/admin/lessons', lessonData);
    return response.data;
  },

  updateLesson: async (lessonId: string, lessonData: any) => {
    const response = await api.put(`/admin/lessons/${lessonId}`, lessonData);
    return response.data;
  },

  deleteLesson: async (lessonId: string) => {
    const response = await api.delete(`/admin/lessons/${lessonId}`);
    return response.data;
  },

  createUser: async (userData: any) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  updateUser: async (userId: string, userData: any) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  resetUserPassword: async (userId: string, password: any) => {
    const response = await api.post(`/admin/users/${userId}/reset-password`, { password });
    return response.data;
  },

  // New: Syllabus content management
  saveSyllabusContent: async (data: any) => {
    const response = await api.post('/admin/syllabus-content', data);
    return response.data;
  },
  deleteSyllabusContent: async (id: string) => {
    const response = await api.delete('/admin/syllabus-content', { params: { id } });
    return response.data;
  },
};

export const syllabusAPI = {
  getBoard: async (board: string) => {
    const response = await api.get(`/syllabus/board/${encodeURIComponent(board)}`);
    return response.data;
  },
  getContent: async (board: string, classLevel: string, subject: string, topic: string) => {
    const response = await api.get('/syllabus-content', { 
      params: { 
        board, 
        class_level: classLevel, 
        subject, 
        topic 
      } 
    });
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

// Voice API
export const voiceAPI = {
  tts: async (text: string) => {
    const response = await api.post('/tts', { text }, { responseType: 'arraybuffer' });
    return response.data;
  },
};

// Quiz API
export const quizAPI = {
  generateFromPdf: async (pdfBase64: string, pdfName?: string, language: string = 'English', count: number = 15) => {
    const response = await api.post('/quiz/generate', {
      pdf_base64: pdfBase64,
      pdf_name: pdfName,
      language,
      count,
    });
    return response.data;
  },
};

export default api;
