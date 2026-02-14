import React, { createContext, useContext, useEffect, useMemo, useCallback, useState } from 'react';
import translations from '../i18n/translations';
import type { SupportedLanguage, TranslationKeys } from '../i18n/translations';
import { userDataAPI } from '../services/api';
import { useAuth } from './AuthContext';

// ==================== Types ====================
export type LearningLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type EducationBoard = 'NCERT' | 'Telangana' | 'Andhra Pradesh';
export type ContentPreference = 'Text' | 'Video' | 'Both';
export type AnswerStyle = 'Short' | 'Detailed';
export type ReminderFrequency = 'Daily' | 'Weekly' | 'Off';
export type ThemeMode = 
  | 'Academic Maroon' 
  | 'Sunrise Amber' 
  | 'Institutional White' 
  | 'Harry Potter' 
  | 'Premium Dark'
  | 'Midnight Void' 
  | 'Crystal Light' 
  | 'Sunset Ember' 
  | 'Hogwarts'
  | 'STRANGER THINGS' 
  | 'WEDNESDAY' 
  | 'GAME OF THRONES';
export type FontSize = 'Small' | 'Medium' | 'Large';
export type AccessibilityMode = 'Normal' | 'Deaf' | 'Dumb' | 'Blind';

export interface ProfileSettings {
  name: string;
  email: string;
  avatarDataUrl: string;
}

export interface LearningPreferences {
  language: SupportedLanguage;
  level: LearningLevel;
  board: EducationBoard;
  contentPreference: ContentPreference;
}

export interface AiTutorSettings {
  enabled: boolean;
  answerStyle: AnswerStyle;
  showChatHistory: boolean;
}

export interface NotificationSettings {
  assignmentReminders: boolean;
  newLessonNotifications: boolean;
  reminderFrequency: ReminderFrequency;
}

export interface ThemeAccessibilitySettings {
  theme: ThemeMode;
  fontSize: FontSize;
  highContrast: boolean;
  reduceMotion: boolean;
  lowPowerMode: boolean;
  voiceLanguage: SupportedLanguage;
  accessibilityMode: AccessibilityMode;
}

export interface SettingsState {
  profile: ProfileSettings;
  learning: LearningPreferences;
  aiTutor: AiTutorSettings;
  notifications: NotificationSettings;
  themeAccessibility: ThemeAccessibilitySettings;
}

// ==================== Constants ====================
const SETTINGS_KEY = 'settings';
const AUTH_KEY = 'auth';
const CHAT_HISTORY_KEY = 'ai_chat_history';
const CHAT_HISTORY_KEY_ALT = 'aiChatHistory';

export const defaultSettings: SettingsState = {
  profile: {
    name: 'Student',
    email: 'student@example.com',
    avatarDataUrl: '',
  },
  learning: {
    language: 'English',
    level: 'Beginner',
    board: 'NCERT',
    contentPreference: 'Both',
  },
  aiTutor: {
    enabled: true,
    answerStyle: 'Detailed',
    showChatHistory: true,
  },
  notifications: {
    assignmentReminders: true,
    newLessonNotifications: true,
    reminderFrequency: 'Weekly',
  },
  themeAccessibility: {
    theme: 'Institutional White',
    fontSize: 'Medium',
    highContrast: false,
    reduceMotion: false,
    lowPowerMode: false,
    voiceLanguage: 'English',
    accessibilityMode: 'Normal',
  },
};

// ==================== Context Interface ====================
interface SettingsContextValue {
  settings: SettingsState;
  t: TranslationKeys;
  isDark: boolean;
  updateProfile: (profile: Partial<ProfileSettings>) => void;
  updateLearning: (learning: Partial<LearningPreferences>) => void;
  updateAiTutor: (aiTutor: Partial<AiTutorSettings>) => void;
  updateNotifications: (notifications: Partial<NotificationSettings>) => void;
  updateThemeAccessibility: (themeAccessibility: Partial<ThemeAccessibilitySettings>) => void;
  clearChatHistory: () => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

// ==================== Helper Functions ====================
const loadSettingsFromStorage = (): SettingsState => {
  try {
    const stored = window.localStorage.getItem(SETTINGS_KEY);
    const storedSettings = stored ? (JSON.parse(stored) as Partial<SettingsState>) : null;
    const authRaw = window.localStorage.getItem(AUTH_KEY);
    const auth = authRaw ? JSON.parse(authRaw) : null;

    const fallbackName = auth?.user?.name || auth?.user?.username || defaultSettings.profile.name;
    const fallbackEmail = auth?.user?.email || defaultSettings.profile.email;
    const fallbackAvatar = auth?.user?.avatarUrl || '';

    return {
      profile: {
        ...defaultSettings.profile,
        ...storedSettings?.profile,
        name: fallbackName,
        email: fallbackEmail,
        avatarDataUrl: fallbackAvatar || storedSettings?.profile?.avatarDataUrl || '',
      },
      learning: {
        ...defaultSettings.learning,
        ...storedSettings?.learning,
      },
      aiTutor: {
        ...defaultSettings.aiTutor,
        ...storedSettings?.aiTutor,
      },
      notifications: {
        ...defaultSettings.notifications,
        ...storedSettings?.notifications,
      },
      themeAccessibility: {
        ...defaultSettings.themeAccessibility,
        ...(storedSettings?.themeAccessibility || {}),
        // Fallback for valid themes only
        theme: ([
          'Academic Maroon', 'Sunrise Amber', 'Institutional White', 'Harry Potter', 'Premium Dark',
          'Midnight Void', 'Crystal Light', 'Sunset Ember', 'HARRY POTTER', 'STRANGER THINGS', 'WEDNESDAY', 'GAME OF THRONES'
        ].includes(storedSettings?.themeAccessibility?.theme as any)
          ? storedSettings?.themeAccessibility?.theme 
          : defaultSettings.themeAccessibility.theme) as ThemeMode,
      },
    };
  } catch {
    return defaultSettings;
  }
};

const saveSettingsToStorage = (settings: SettingsState): void => {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage errors
  }
};

// ==================== Apply Global Effects ====================
const applyTheme = (theme: ThemeMode): void => {
  const root = document.documentElement;
  const body = document.body;
  
  // Remove all potential theme classes and dark mode
  const themeClasses = [
    'dark', 
    'theme-harry-potter', 
    'theme-hogwarts',
    'theme-premium-dark',
    'theme-midnight',
    'theme-crystal',
    'theme-sunset',
    'theme-stranger',
    'theme-wednesday',
    'theme-thrones-winter'
  ];
  root.classList.remove(...themeClasses);
  body.classList.remove(...themeClasses);

  if (theme === 'Academic Maroon' || theme === 'Midnight Void' || theme === 'Premium Dark') {
    root.classList.add('dark');
    body.classList.add('dark');
  }

  if (theme === 'Midnight Void') root.classList.add('theme-midnight');
  if (theme === 'Crystal Light') root.classList.add('theme-crystal');
  if (theme === 'Sunset Ember') root.classList.add('theme-sunset');
  if (theme === 'Harry Potter') root.classList.add('theme-harry-potter');
  if (theme === 'Hogwarts') root.classList.add('theme-hogwarts');
  if (theme === 'STRANGER THINGS') root.classList.add('theme-stranger');
  if (theme === 'WEDNESDAY') root.classList.add('theme-wednesday');
  if (theme === 'GAME OF THRONES') root.classList.add('theme-thrones-winter');
  if (theme === 'Premium Dark') root.classList.add('theme-premium-dark');
};

const applyFontSize = (fontSize: FontSize): void => {
  const root = document.documentElement;
  const sizes: Record<FontSize, string> = {
    Small: '14px',
    Medium: '16px',
    Large: '18px',
  };
  root.style.setProperty('--font-size-base', sizes[fontSize]);
  root.style.fontSize = sizes[fontSize];
};

const applyHighContrast = (enabled: boolean): void => {
  const root = document.documentElement;
  if (enabled) {
    root.classList.add('high-contrast');
  } else {
    root.classList.remove('high-contrast');
  }
};

const applyReduceMotion = (enabled: boolean): void => {
  const root = document.documentElement;
  if (enabled) {
    root.classList.add('reduce-motion');
  } else {
    root.classList.remove('reduce-motion');
  }
};

const applyLowPowerMode = (enabled: boolean): void => {
  const root = document.documentElement;
  if (enabled) {
    root.classList.add('low-power');
  } else {
    root.classList.remove('low-power');
  }
};

const applyAllEffects = (settings: SettingsState): void => {
  applyTheme(settings.themeAccessibility.theme);
  applyFontSize(settings.themeAccessibility.fontSize);
  applyHighContrast(settings.themeAccessibility.highContrast);
  applyReduceMotion(settings.themeAccessibility.reduceMotion);
  applyLowPowerMode(settings.themeAccessibility.lowPowerMode);
};

// ==================== Provider Component ====================
export const SettingsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { auth } = useAuth();
  const [settings, setSettings] = useState<SettingsState>(() => loadSettingsFromStorage());

  // Keep profile in sync with Auth
  useEffect(() => {
    if (auth?.status === 'logged_in' && auth.user) {
      setSettings(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          name: auth.user?.name || auth.user?.username || prev.profile.name,
          email: auth.user?.email || prev.profile.email,
          avatarDataUrl: auth.user?.avatarUrl || prev.profile.avatarDataUrl,
        }
      }));
    }
  }, [auth?.user, auth?.status]);

  // Apply effects on mount and settings change
  useEffect(() => {
    applyAllEffects(settings);
    saveSettingsToStorage(settings);
    
    // Sync with backend if logged in
    const syncToBackend = async () => {
      try {
        const authData = localStorage.getItem('auth');
        if (authData) {
          const { user } = JSON.parse(authData);
          if (user?.id) {
            if (!navigator.onLine) {
              const { offlineSyncService } = await import('../services/offlineSync');
              offlineSyncService.queueAction('SETTINGS', settings);
              return;
            }
            // We use the profile API to save accessibility and learning settings too
            await userDataAPI.updateProfile(String(user.id), {
              settings: settings 
            });
          }
        }
      } catch (e) {
        console.warn('Backend settings sync failed, queuing for retry...');
        try {
          const { offlineSyncService } = await import('../services/offlineSync');
          offlineSyncService.queueAction('SETTINGS', settings);
        } catch (err) {
          console.error('Offline sync failed completely');
        }
      }
    };
    
    // Low frequency sync to avoid hitting API on every keystroke
    const timer = setTimeout(syncToBackend, 5000);
    return () => clearTimeout(timer);
  }, [settings]);

  // Get translations based on current language
  const t = useMemo<TranslationKeys>(() => {
    return translations[settings.learning.language] || translations.English;
  }, [settings.learning.language]);

  const isDark = useMemo(() => {
    return settings.themeAccessibility.theme === 'Academic Maroon';
  }, [settings.themeAccessibility.theme]);

  const updateProfile = useCallback((profile: Partial<ProfileSettings>) => {
    setSettings((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...profile },
    }));
  }, []);

  const updateLearning = useCallback((learning: Partial<LearningPreferences>) => {
    setSettings((prev) => ({
      ...prev,
      learning: { ...prev.learning, ...learning },
    }));
  }, []);

  const updateAiTutor = useCallback((aiTutor: Partial<AiTutorSettings>) => {
    setSettings((prev) => ({
      ...prev,
      aiTutor: { ...prev.aiTutor, ...aiTutor },
    }));
  }, []);

  const updateNotifications = useCallback((notifications: Partial<NotificationSettings>) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, ...notifications },
    }));
  }, []);

  const updateThemeAccessibility = useCallback((themeAccessibility: Partial<ThemeAccessibilitySettings>) => {
    setSettings((prev) => ({
      ...prev,
      themeAccessibility: { ...prev.themeAccessibility, ...themeAccessibility },
    }));
  }, []);

  const clearChatHistory = useCallback(() => {
    try {
      window.localStorage.removeItem(CHAT_HISTORY_KEY);
      window.localStorage.removeItem(CHAT_HISTORY_KEY_ALT);
    } catch {
      // Ignore errors
    }
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      t,
      isDark,
      updateProfile,
      updateLearning,
      updateAiTutor,
      updateNotifications,
      updateThemeAccessibility,
      clearChatHistory,
      resetSettings,
    }),
    [settings, t, isDark, updateProfile, updateLearning, updateAiTutor, updateNotifications, updateThemeAccessibility, clearChatHistory, resetSettings]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

// ==================== Hook ====================
export const useSettings = (): SettingsContextValue => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

// Export translation type for components
export type { TranslationKeys, SupportedLanguage };
