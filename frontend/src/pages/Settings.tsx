import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import type { 
  LearningLevel, 
  ContentPreference, 
  AnswerStyle, 
  ReminderFrequency, 
  ThemeMode, 
  FontSize,
  SupportedLanguage
} from '../context/SettingsContext';

const Settings = () => {
  const navigate = useNavigate();
  const { auth, updateUser: updateAuthUser } = useAuth();
  const { 
    settings, 
    t, 
    updateProfile, 
    updateLearning, 
    updateAiTutor, 
    updateNotifications, 
    updateThemeAccessibility,
    clearChatHistory 
  } = useSettings();
  
  const [saveMessage, setSaveMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(settings.profile.name);
  const [editEmail, setEditEmail] = useState(settings.profile.email);
  const [error, setError] = useState('');

  // Sync local state when settings change and we're not editing
  useEffect(() => {
    if (!isEditing) {
      setEditName(settings.profile.name);
      setEditEmail(settings.profile.email);
    }
  }, [settings.profile.name, settings.profile.email, isEditing]);

  const showSaveMessage = (message: string) => {
    setSaveMessage(message);
    setTimeout(() => setSaveMessage(''), 1500);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Validation
      if (!editName.trim()) {
        setError('Name cannot be empty');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editEmail)) {
        setError('Please enter a valid email address');
        return;
      }

      // 1. Update Settings Context (persists to localStorage 'settings')
      updateProfile({ name: editName, email: editEmail });
      
      // 2. Update Auth Context (persists to localStorage 'auth')
      updateAuthUser({ name: editName, email: editEmail });

      setIsEditing(false);
      setError('');
      showSaveMessage(t.settings.changesSaved);
    } else {
      // Enter editing mode
      setError('');
      setIsEditing(true);
    }
  };

  const initials = useMemo(() => {
    const source = settings.profile.name || settings.profile.email;
    if (!source) return 'U';
    return source
      .split(/\s+|@/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U';
  }, [settings.profile.name, settings.profile.email]);

  const handleAvatarChange = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      updateProfile({ avatarDataUrl: result });
      showSaveMessage(t.settings.changesSaved);
    };
    reader.readAsDataURL(file);
  };

  const handleClearChatHistory = () => {
    clearChatHistory();
    showSaveMessage(t.settings.aiTutorSettings.chatHistoryCleared);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t.settings.title}</h1>
            <p className="text-gray-900 mt-2">{t.settings.subtitle}</p>
          </div>
          {saveMessage && (
            <div className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800">
              {saveMessage}
            </div>
          )}
        </div>

        <div className="grid gap-6">
          {/* Profile Settings */}
          <section className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.settings.profile.title}</h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center gap-3">
                <div className="h-24 w-24 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold overflow-hidden">
                  {settings.profile.avatarDataUrl ? (
                    <img
                      src={settings.profile.avatarDataUrl}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <label className="text-sm font-medium text-gray-700">
                  {t.settings.profile.uploadAvatar}
                  <input
                    type="file"
                    accept="image/*"
                    className="mt-2 block w-full text-sm text-gray-600"
                    onChange={(e) => handleAvatarChange(e.target.files?.[0])}
                  />
                </label>
                {settings.profile.avatarDataUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      updateProfile({ avatarDataUrl: '' });
                      showSaveMessage(t.settings.changesSaved);
                    }}
                    className="text-sm text-red-600 hover:underline"
                  >
                    {t.settings.profile.removeAvatar}
                  </button>
                )}
              </div>
              <div className="flex-1 grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.settings.profile.name}</label>
                  <input
                    type="text"
                    value={isEditing ? editName : settings.profile.name}
                    onChange={(e) => setEditName(e.target.value)}
                    readOnly={!isEditing}
                    className={`w-full rounded-lg border px-4 py-2 transition-colors ${
                      isEditing 
                      ? 'border-primary bg-white focus:ring-2 focus:ring-primary/20 outline-none' 
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.settings.profile.email}</label>
                  <input
                    type="email"
                    value={isEditing ? editEmail : settings.profile.email}
                    onChange={(e) => setEditEmail(e.target.value)}
                    readOnly={!isEditing}
                    className={`w-full rounded-lg border px-4 py-2 transition-colors ${
                      isEditing 
                      ? 'border-primary bg-white focus:ring-2 focus:ring-primary/20 outline-none' 
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                    }`}
                  />
                </div>
                
                {error && (
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                )}

                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={handleEditToggle}
                    className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                      isEditing 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-primary text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Learning Preferences */}
          <section className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.settings.learning.title}</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.settings.learning.language}</label>
                <select
                  value={settings.learning.language}
                  onChange={(e) => {
                    updateLearning({ language: e.target.value as SupportedLanguage });
                    showSaveMessage(t.settings.changesSaved);
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="English">English</option>
                  <option value="Telugu">తెలుగు (Telugu)</option>
                  <option value="Hindi">हिंदी (Hindi)</option>
                  <option value="Spanish">Español (Spanish)</option>
                  <option value="French">Français (French)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.settings.learning.level}</label>
                <select
                  value={settings.learning.level}
                  onChange={(e) => {
                    updateLearning({ level: e.target.value as LearningLevel });
                    showSaveMessage(t.settings.changesSaved);
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="Beginner">{t.lessons.beginner}</option>
                  <option value="Intermediate">{t.lessons.intermediate}</option>
                  <option value="Advanced">{t.lessons.advanced}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.settings.learning.contentPreference}</label>
                <select
                  value={settings.learning.contentPreference}
                  onChange={(e) => {
                    updateLearning({ contentPreference: e.target.value as ContentPreference });
                    showSaveMessage(t.settings.changesSaved);
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="Text">{t.settings.learning.text}</option>
                  <option value="Video">{t.settings.learning.video}</option>
                  <option value="Both">{t.settings.learning.both}</option>
                </select>
              </div>
            </div>
          </section>

          {/* AI Tutor Settings */}
          <section className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.settings.aiTutorSettings.title}</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={settings.aiTutor.enabled}
                  onChange={(e) => {
                    updateAiTutor({ enabled: e.target.checked });
                    showSaveMessage(t.settings.changesSaved);
                  }}
                />
                {t.settings.aiTutorSettings.enabled}
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.settings.aiTutorSettings.answerStyle}</label>
                <select
                  value={settings.aiTutor.answerStyle}
                  onChange={(e) => {
                    updateAiTutor({ answerStyle: e.target.value as AnswerStyle });
                    showSaveMessage(t.settings.changesSaved);
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="Short">{t.settings.aiTutorSettings.short}</option>
                  <option value="Detailed">{t.settings.aiTutorSettings.detailed}</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={settings.aiTutor.showChatHistory}
                  onChange={(e) => {
                    updateAiTutor({ showChatHistory: e.target.checked });
                    showSaveMessage(t.settings.changesSaved);
                  }}
                />
                {t.settings.aiTutorSettings.showChatHistory}
              </label>
            </div>
            <button
              type="button"
              onClick={handleClearChatHistory}
              className="mt-4 inline-flex items-center rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              {t.settings.aiTutorSettings.clearChatHistory}
            </button>
          </section>

          {/* Notification Settings */}
          <section className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.settings.notifications.title}</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={settings.notifications.assignmentReminders}
                  onChange={(e) => {
                    updateNotifications({ assignmentReminders: e.target.checked });
                    showSaveMessage(t.settings.changesSaved);
                  }}
                />
                {t.settings.notifications.assignmentReminders}
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={settings.notifications.newLessonNotifications}
                  onChange={(e) => {
                    updateNotifications({ newLessonNotifications: e.target.checked });
                    showSaveMessage(t.settings.changesSaved);
                  }}
                />
                {t.settings.notifications.newLessonNotifications}
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.settings.notifications.reminderFrequency}</label>
                <select
                  value={settings.notifications.reminderFrequency}
                  onChange={(e) => {
                    updateNotifications({ reminderFrequency: e.target.value as ReminderFrequency });
                    showSaveMessage(t.settings.changesSaved);
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="Daily">{t.settings.notifications.daily}</option>
                  <option value="Weekly">{t.settings.notifications.weekly}</option>
                  <option value="Off">{t.settings.notifications.off}</option>
                </select>
              </div>
            </div>
          </section>

          {/* Theme & Accessibility */}
          <section className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.settings.themeAccessibility.title}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.settings.themeAccessibility.theme}</label>
                <select
                  value={settings.themeAccessibility.theme}
                  onChange={(e) => {
                    updateThemeAccessibility({ theme: e.target.value as ThemeMode });
                    showSaveMessage(t.settings.changesSaved);
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="Light">{t.settings.themeAccessibility.light}</option>
                  <option value="Dark">{t.settings.themeAccessibility.dark}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.settings.themeAccessibility.fontSize}</label>
                <select
                  value={settings.themeAccessibility.fontSize}
                  onChange={(e) => {
                    updateThemeAccessibility({ fontSize: e.target.value as FontSize });
                    showSaveMessage(t.settings.changesSaved);
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="Small">{t.settings.themeAccessibility.small}</option>
                  <option value="Medium">{t.settings.themeAccessibility.medium}</option>
                  <option value="Large">{t.settings.themeAccessibility.large}</option>
                </select>
              </div>
              
              <div className="space-y-4">
                <label className="flex items-center gap-3 text-sm font-medium text-gray-700 cursor-pointer">
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.themeAccessibility.highContrast}
                      onChange={(e) => {
                        updateThemeAccessibility({ highContrast: e.target.checked });
                        showSaveMessage(t.settings.changesSaved);
                      }}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                  {t.settings.themeAccessibility.highContrast}
                </label>

                <label className="flex items-center gap-3 text-sm font-medium text-gray-700 cursor-pointer">
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.themeAccessibility.reduceMotion}
                      onChange={(e) => {
                        updateThemeAccessibility({ reduceMotion: e.target.checked });
                        showSaveMessage(t.settings.changesSaved);
                      }}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                  {t.settings.themeAccessibility.reduceMotion}
                </label>
              </div>

              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex flex-col justify-center">
                <label className="flex items-center gap-3 text-sm font-bold text-indigo-900 cursor-pointer mb-1">
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.themeAccessibility.lowPowerMode}
                      onChange={(e) => {
                        updateThemeAccessibility({ lowPowerMode: e.target.checked });
                        showSaveMessage(t.settings.changesSaved);
                      }}
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </div>
                  {t.settings.themeAccessibility.lowPowerMode}
                </label>
                <p className="text-[11px] text-indigo-700 font-medium leading-tight">
                  {t.settings.themeAccessibility.lowPowerModeDesc}
                </p>
              </div>
            </div>
          </section>

          {/* Navigation */}
          <section className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.settings.navigation.title}</h2>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/accessibility')}
                className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-indigo-700"
              >
                {t.settings.navigation.accessibilitySettings}
              </button>
              <button
                type="button"
                onClick={() => navigate('/support')}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                {t.settings.navigation.supportPage}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
