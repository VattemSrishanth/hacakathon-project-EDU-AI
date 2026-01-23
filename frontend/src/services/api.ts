import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
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
  ask: async (question: string, mode: string = 'regular', context: any = null, online: boolean = true) => {
    const response = await api.post('/ask', { 
      question, 
      mode, 
      context, // Active file context (type, data, name)
      online 
    });
    return response.data;
  },
  
  explainVideo: async (videoUrl: string, question: string = '', mode: string = 'regular') => {
    const response = await api.post('/explain-video', { 
      videoUrl, 
      question,
      mode,
      online: true 
    });
    return response.data;
  },

  analyzeImage: async (base64Image: string, question: string = '', mode: string = 'regular') => {
    const response = await api.post('/analyze-image', { 
      image: base64Image,
      question,
      mode
    });
    return response.data;
  },

  analyzePdf: async (pdfText: string, question: string = '', mode: string = 'regular') => {
    const response = await api.post('/analyze-pdf', { 
      text: pdfText,
      question,
      mode
    });
    return response.data;
  },
};

// Lessons API
export const lessonsAPI = {
  getAll: async (category?: string, level?: string) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (level) params.append('level', level);
    
    try {
      const response = await api.get(`/lessons${params.toString() ? '?' + params.toString() : ''}`);
      if (response.data) {
        localStorage.setItem(`cached_lessons_${level || 'all'}_${category || 'all'}`, JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      if (!navigator.onLine) {
        const cached = localStorage.getItem(`cached_lessons_${level || 'all'}_${category || 'all'}`);
        if (cached) return JSON.parse(cached);
      }
      throw error;
    }
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/lessons/${id}`);
    return response.data;
  },
  
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
};

// Progress API
export const progressAPI = {
  get: async () => {
    const response = await api.get('/progress');
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

export default api;
