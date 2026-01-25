import React, { createContext, useContext, useEffect, useMemo, useCallback, useState } from 'react';
import translations from '../i18n/translations';
import type { SupportedLanguage, TranslationKeys } from '../i18n/translations';

// ==================== Types ====================
export type LearningLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type ContentPreference = 'Text' | 'Video' | 'Both';
export type AnswerStyle = 'Short' | 'Detailed';
export type ReminderFrequency = 'Daily' | 'Weekly' | 'Off';
export type ThemeMode = 'Light' | 'Dark';
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
    theme: 'Light',
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
        name: storedSettings?.profile?.name || fallbackName,
        email: storedSettings?.profile?.email || fallbackEmail,
        avatarDataUrl: storedSettings?.profile?.avatarDataUrl || fallbackAvatar,
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
        ...storedSettings?.themeAccessibility,
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
  if (theme === 'Dark') {
    root.classList.add('dark');
    root.style.setProperty('--bg-primary', '#1a1a2e');
    root.style.setProperty('--bg-secondary', '#16213e');
    root.style.setProperty('--bg-card', '#1e293b');
    root.style.setProperty('--text-primary', '#f8fafc');
    root.style.setProperty('--text-secondary', '#cbd5e1');
    root.style.setProperty('--border-color', '#334155');
  } else {
    root.classList.remove('dark');
    root.style.setProperty('--bg-primary', '#ffffff');
    root.style.setProperty('--bg-secondary', '#f8fafc');
    root.style.setProperty('--bg-card', '#ffffff');
    root.style.setProperty('--text-primary', '#0f172a');
    root.style.setProperty('--text-secondary', '#475569');
    root.style.setProperty('--border-color', '#e2e8f0');
  }
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
  const [settings, setSettings] = useState<SettingsState>(() => loadSettingsFromStorage());

  // Apply effects on mount and settings change
  useEffect(() => {
    applyAllEffects(settings);
    saveSettingsToStorage(settings);
  }, [settings]);

  // Get translations based on current language
  const t = useMemo<TranslationKeys>(() => {
    return translations[settings.learning.language] || translations.English;
  }, [settings.learning.language]);

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
      updateProfile,
      updateLearning,
      updateAiTutor,
      updateNotifications,
      updateThemeAccessibility,
      clearChatHistory,
      resetSettings,
    }),
    [settings, t, updateProfile, updateLearning, updateAiTutor, updateNotifications, updateThemeAccessibility, clearChatHistory, resetSettings]
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
