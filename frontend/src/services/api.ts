import axios from 'axios';

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

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
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
    const response = await api.post('/profile', { id, ...data });
    return response.data;
  },
  getProgress: async (userId: string) => {
    const response = await api.get('/progress', { params: { user_id: userId } });
    return response.data;
  },
  updateProgress: async (userId: string, data: any) => {
    const response = await api.post('/progress', data, { params: { user_id: userId } });
    return response.data;
  },
  saveChatHistory: async (userId: string, messages: any[]) => {
    const response = await api.post('/history', { messages }, { params: { user_id: userId } });
    return response.data;
  },
  getChatHistory: async (userId: string) => {
    const response = await api.get('/history', { params: { user_id: userId } });
    return response.data;
  },
  submitFeedback: async (feedback: any) => {
    const response = await api.post('/feedback', feedback);
    return response.data;
  },
  getNotifications: async (userId: string) => {
    const response = await api.get('/notifications', { params: { user_id: userId } });
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
