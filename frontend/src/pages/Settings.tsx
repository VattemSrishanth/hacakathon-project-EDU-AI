import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  BookOpen, 
  MessageSquare, 
  Bell, 
  Monitor, 
  Navigation as NavIcon, 
  Camera,
  Trash2,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import Button from '../components/Button';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateUser: updateAuthUser } = useAuth();
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
    setTimeout(() => setSaveMessage(''), 2000);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      if (!editName.trim()) {
        setError('Name cannot be empty');
        return;
      }
      updateProfile({ name: editName, email: editEmail });
      updateAuthUser({ name: editName, email: editEmail });
      setIsEditing(false);
      setError('');
      showSaveMessage(t.settings.changesSaved);
    } else {
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
    if (window.confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
      clearChatHistory();
      showSaveMessage(t.settings.aiTutorSettings.chatHistoryCleared);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg text-app-text-main py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-app-text-main tracking-tight uppercase">{t.settings.title}</h1>
              <p className="text-app-text-sub font-bold text-sm uppercase tracking-widest">{t.settings.subtitle}</p>
            </div>
          </div>
          {saveMessage && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-2xl border border-emerald-500/20 animate-in fade-in slide-in-from-top-4">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-wider">{saveMessage}</span>
            </div>
          )}
        </header>

        <div className="space-y-10">
          {/* Section: Profile */}
          <section className="bg-app-bg-alt rounded-3xl border border-app-border overflow-hidden shadow-sm">
            <div className="p-8 border-b border-app-border flex items-center gap-4 bg-app-bg/50">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-app-text-main tracking-tight uppercase">{t.settings.profile.title}</h2>
                <p className="text-xs text-app-text-sub font-bold uppercase tracking-tight">Manage your personal identity</p>
              </div>
            </div>
            
            <div className="p-8">
              <div className="flex flex-col md:flex-row gap-10 items-start">
                <div className="flex flex-col items-center gap-4 shrink-0 mx-auto md:mx-0">
                  <div className="relative group p-1 rounded-full border-4 border-app-border">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-app-bg flex items-center justify-center relative shadow-inner">
                      {settings.profile.avatarDataUrl ? (
                        <img src={settings.profile.avatarDataUrl} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl font-black text-blue-600 bg-blue-500/5 uppercase">
                          {initials}
                        </div>
                      )}
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-app-text-main/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full text-app-bg pointer-events-auto"
                      >
                        <Camera className="w-8 h-8" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleAvatarChange(e.target.files?.[0])}
                  />
                  {settings.profile.avatarDataUrl && (
                    <button
                      type="button"
                      onClick={() => { updateProfile({ avatarDataUrl: '' }); showSaveMessage(t.settings.changesSaved); }}
                      className="text-xs font-black text-red-500 hover:text-red-600 transition-colors uppercase tracking-widest bg-red-500/5 px-4 py-2 rounded-xl"
                    >
                      {t.settings.profile.removeAvatar}
                    </button>
                  )}
                </div>

                <div className="flex-1 w-full space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-app-text-sub uppercase tracking-widest ml-1">{t.settings.profile.name}</label>
                    <input
                      type="text"
                      placeholder="Your Full Name"
                      value={isEditing ? editName : settings.profile.name}
                      onChange={(e) => setEditName(e.target.value)}
                      disabled={!isEditing}
                      className="w-full bg-app-bg border border-app-border rounded-2xl px-5 py-4 text-app-text-main focus:bg-app-bg focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-black text-app-text-sub uppercase tracking-widest ml-1">{t.settings.profile.email}</label>
                    <input
                      type="email"
                      value={settings.profile.email}
                      disabled
                      className="w-full bg-app-bg border border-app-border rounded-2xl px-5 py-4 text-app-text-muted cursor-not-allowed font-bold shadow-inner"
                    />
                    <p className="text-[10px] text-app-text-muted font-black ml-1 uppercase tracking-widest">Email cannot be changed for security.</p>
                  </div>

                  {error && (
                    <div className="text-sm text-red-600 font-bold bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleEditToggle}
                      variant={isEditing ? 'success' : 'primary'}
                      className="px-10 py-4 rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-500/10"
                    >
                      {isEditing ? 'Save Changes' : 'Edit Profile'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Learning */}
          <section className="bg-app-bg-alt rounded-3xl border border-app-border overflow-hidden shadow-sm">
            <div className="p-8 border-b border-app-border flex items-center gap-4 bg-app-bg/50">
              <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-600">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-app-text-main tracking-tight uppercase">{t.settings.learning.title}</h2>
                <p className="text-xs text-app-text-sub font-bold uppercase tracking-tight">Customize your educational journey</p>
              </div>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div className="space-y-2">
                  <label className="text-xs font-black text-app-text-sub uppercase tracking-widest ml-1">{t.settings.learning.language}</label>
                  <select
                    value={settings.learning.language}
                    onChange={(e) => {
                      updateLearning({ language: e.target.value as SupportedLanguage });
                      showSaveMessage(t.settings.changesSaved);
                    }}
                    className="w-full bg-app-bg border border-app-border rounded-2xl px-5 py-4 text-app-text-main focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all cursor-pointer font-bold"
                  >
                    <option value="English">English</option>
                    <option value="Telugu">తెలుగు (Telugu)</option>
                    <option value="Hindi">हिंदी (Hindi)</option>
                    <option value="Spanish">Español (Spanish)</option>
                    <option value="French">Français (French)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-app-text-sub uppercase tracking-widest ml-1">{t.settings.learning.level}</label>
                  <select
                    value={settings.learning.level}
                    onChange={(e) => {
                      updateLearning({ level: e.target.value as LearningLevel });
                      showSaveMessage(t.settings.changesSaved);
                    }}
                    className="w-full bg-app-bg border border-app-border rounded-2xl px-5 py-4 text-app-text-main focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all cursor-pointer font-bold"
                  >
                    <option value="Beginner">{t.lessons.beginner}</option>
                    <option value="Intermediate">{t.lessons.intermediate}</option>
                    <option value="Advanced">{t.lessons.advanced}</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-black text-app-text-sub uppercase tracking-widest ml-1">{t.settings.learning.contentPreference}</label>
                  <select
                    value={settings.learning.contentPreference}
                    onChange={(e) => {
                      updateLearning({ contentPreference: e.target.value as ContentPreference });
                      showSaveMessage(t.settings.changesSaved);
                    }}
                    className="w-full bg-app-bg border border-app-border rounded-2xl px-5 py-4 text-app-text-main focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all cursor-pointer font-bold"
                  >
                    <option value="Text">{t.settings.learning.text}</option>
                    <option value="Video">{t.settings.learning.video}</option>
                    <option value="Both">{t.settings.learning.both}</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Section: AI Tutor */}
          <section className="bg-app-bg-alt rounded-3xl border border-app-border overflow-hidden shadow-sm">
            <div className="p-8 border-b border-app-border flex items-center gap-4 bg-app-bg/50">
              <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-600">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-app-text-main tracking-tight uppercase">{t.settings.aiTutorSettings.title}</h2>
                <p className="text-xs text-app-text-sub font-bold uppercase tracking-tight">Configure your AI assistant engine</p>
              </div>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="flex flex-col gap-6">
                <label className="flex items-center justify-between p-6 bg-app-bg rounded-2xl border border-app-border cursor-pointer group transition-all hover:border-purple-500/50 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-app-bg-alt border border-app-border text-purple-600 shadow-sm transition-transform group-hover:scale-110">
                      <Monitor className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-app-text-main uppercase tracking-tight">{t.settings.aiTutorSettings.enabled}</p>
                      <p className="text-[10px] text-app-text-sub font-black uppercase tracking-widest opacity-60">AI Assistant Status</p>
                    </div>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.aiTutor.enabled}
                      onChange={(e) => {
                        updateAiTutor({ enabled: e.target.checked });
                        showSaveMessage(t.settings.changesSaved);
                      }}
                    />
                    <div className="w-14 h-8 bg-app-bg-alt border border-app-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:start-1 after:bg-white after:border-gray-200 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                  </div>
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-app-text-sub uppercase tracking-widest ml-1">{t.settings.aiTutorSettings.answerStyle}</label>
                    <select
                      value={settings.aiTutor.answerStyle}
                      onChange={(e) => {
                        updateAiTutor({ answerStyle: e.target.value as AnswerStyle });
                        showSaveMessage(t.settings.changesSaved);
                      }}
                      className="w-full bg-app-bg border border-app-border rounded-2xl px-5 py-4 text-app-text-main focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all cursor-pointer font-bold"
                    >
                      <option value="Short">{t.settings.aiTutorSettings.short}</option>
                      <option value="Detailed">{t.settings.aiTutorSettings.detailed}</option>
                    </select>
                  </div>
                  
                  <div className="flex flex-col justify-center px-4">
                    <label className="flex items-center gap-4 cursor-pointer select-none group">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.aiTutor.showChatHistory}
                          onChange={(e) => {
                            updateAiTutor({ showChatHistory: e.target.checked });
                            showSaveMessage(t.settings.changesSaved);
                          }}
                          className="w-6 h-6 rounded-lg border-2 border-app-border bg-app-bg text-purple-600 focus:ring-purple-500 transition-all cursor-pointer"
                        />
                      </div>
                      <span className="text-xs font-black text-app-text-sub group-hover:text-purple-600 transition-colors uppercase tracking-widest">{t.settings.aiTutorSettings.showChatHistory}</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-start pt-6 border-t border-app-border">
                  <button
                    type="button"
                    onClick={handleClearChatHistory}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-500/5 text-red-600 font-black hover:bg-red-500 text-[10px] uppercase tracking-widest hover:text-white transition-all shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t.settings.aiTutorSettings.clearChatHistory}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Notifications */}
          <section className="bg-app-bg-alt rounded-3xl border border-app-border overflow-hidden shadow-sm">
            <div className="p-8 border-b border-app-border flex items-center gap-4 bg-app-bg/50">
              <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-600">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-app-text-main tracking-tight uppercase">{t.settings.notifications.title}</h2>
                <p className="text-xs text-app-text-sub font-bold uppercase tracking-tight">Stay updated with your progress</p>
              </div>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex items-center justify-between p-6 bg-app-bg rounded-2xl border border-app-border cursor-pointer hover:border-orange-500/50 transition-all shadow-sm group">
                  <span className="text-xs font-black text-app-text-sub uppercase tracking-widest group-hover:text-orange-600 transition-colors">{t.settings.notifications.assignmentReminders}</span>
                  <input
                    type="checkbox"
                    className="w-6 h-6 rounded-lg border-2 border-app-border bg-app-bg text-orange-600 focus:ring-orange-500 shadow-sm"
                    checked={settings.notifications.assignmentReminders}
                    onChange={(e) => {
                      updateNotifications({ assignmentReminders: e.target.checked });
                      showSaveMessage(t.settings.changesSaved);
                    }}
                  />
                </label>
                <label className="flex items-center justify-between p-6 bg-app-bg rounded-2xl border border-app-border cursor-pointer hover:border-orange-500/50 transition-all shadow-sm group">
                  <span className="text-xs font-black text-app-text-sub uppercase tracking-widest group-hover:text-orange-600 transition-colors">{t.settings.notifications.newLessonNotifications}</span>
                  <input
                    type="checkbox"
                    className="w-6 h-6 rounded-lg border-2 border-app-border bg-app-bg text-orange-600 focus:ring-orange-500 shadow-sm"
                    checked={settings.notifications.newLessonNotifications}
                    onChange={(e) => {
                      updateNotifications({ newLessonNotifications: e.target.checked });
                      showSaveMessage(t.settings.changesSaved);
                    }}
                  />
                </label>
              </div>

              <div className="p-6 bg-app-bg rounded-2xl border border-app-border space-y-4">
                <label className="text-xs font-black text-app-text-sub uppercase tracking-widest ml-1">{t.settings.notifications.reminderFrequency}</label>
                <select
                  value={settings.notifications.reminderFrequency}
                  onChange={(e) => {
                    updateNotifications({ reminderFrequency: e.target.value as ReminderFrequency });
                    showSaveMessage(t.settings.changesSaved);
                  }}
                  className="w-full sm:max-w-xs bg-app-bg-alt border border-app-border rounded-2xl px-5 py-4 text-app-text-main focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all cursor-pointer font-bold shadow-sm"
                >
                  <option value="Daily">{t.settings.notifications.daily}</option>
                  <option value="Weekly">{t.settings.notifications.weekly}</option>
                  <option value="Off">{t.settings.notifications.off}</option>
                </select>
              </div>
            </div>
          </section>

          {/* Section: Theme */}
          <section className="bg-app-bg-alt rounded-3xl border border-app-border overflow-hidden shadow-sm">
            <div className="p-8 border-b border-app-border flex items-center gap-4 bg-app-bg/50">
              <div className="p-3 bg-teal-500/10 rounded-2xl text-teal-600">
                <Monitor className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-app-text-main tracking-tight uppercase">{t.settings.themeAccessibility.title}</h2>
                <p className="text-xs text-app-text-sub font-bold uppercase tracking-tight">Appearance and support tools</p>
              </div>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-medium">
                <div className="space-y-2">
                  <label className="text-xs font-black text-app-text-sub uppercase tracking-widest ml-1">{t.settings.themeAccessibility.theme}</label>
                  <select
                    value={settings.themeAccessibility.theme}
                    onChange={(e) => {
                      updateThemeAccessibility({ theme: e.target.value as ThemeMode });
                      showSaveMessage(t.settings.changesSaved);
                    }}
                    className="w-full bg-app-bg border border-app-border rounded-2xl px-5 py-4 text-app-text-main focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none cursor-pointer font-bold"
                  >
                    <option value="Light">{t.settings.themeAccessibility.light}</option>
                    <option value="Dark">{t.settings.themeAccessibility.dark}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-app-text-sub uppercase tracking-widest ml-1">{t.settings.themeAccessibility.fontSize}</label>
                  <select
                    value={settings.themeAccessibility.fontSize}
                    onChange={(e) => {
                      updateThemeAccessibility({ fontSize: e.target.value as FontSize });
                      showSaveMessage(t.settings.changesSaved);
                    }}
                    className="w-full bg-app-bg border border-app-border rounded-2xl px-5 py-4 text-app-text-main focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none cursor-pointer font-bold"
                  >
                    <option value="Small">{t.settings.themeAccessibility.small}</option>
                    <option value="Medium">{t.settings.themeAccessibility.medium}</option>
                    <option value="Large">{t.settings.themeAccessibility.large}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-app-text-sub uppercase tracking-widest ml-1">{t.settings.themeAccessibility.voiceLanguage}</label>
                  <select
                    value={settings.themeAccessibility.voiceLanguage}
                    onChange={(e) => {
                      updateThemeAccessibility({ voiceLanguage: e.target.value as SupportedLanguage });
                      showSaveMessage(t.settings.changesSaved);
                    }}
                    className="w-full bg-app-bg border border-app-border rounded-2xl px-5 py-4 text-app-text-main focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none cursor-pointer font-bold"
                  >
                    <option value="English">English</option>
                    <option value="Telugu">తెలుగు (Telugu)</option>
                    <option value="Hindi">हिंदी (Hindi)</option>
                    <option value="Spanish">Español (Spanish)</option>
                    <option value="French">Français (French)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-app-text-sub uppercase tracking-widest ml-1">Accessibility Mode</label>
                  <select
                    value={settings.themeAccessibility.accessibilityMode}
                    onChange={(e) => {
                      updateThemeAccessibility({ accessibilityMode: e.target.value as any });
                      showSaveMessage(t.settings.changesSaved);
                    }}
                    className="w-full bg-blue-500/10 border border-blue-500/20 rounded-2xl px-5 py-4 text-blue-600 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none cursor-pointer font-black uppercase tracking-widest"
                  >
                    <option value="Normal">Normal Mode</option>
                    <option value="Deaf">Deaf Mode</option>
                    <option value="Blind">Blind Mode</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex items-center justify-between p-6 bg-app-bg rounded-2xl border border-app-border cursor-pointer hover:border-blue-500/50 transition-all shadow-sm group">
                  <span className="text-xs font-black text-app-text-sub uppercase tracking-widest group-hover:text-blue-600 transition-colors">{t.settings.themeAccessibility.highContrast}</span>
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
                    <div className="w-14 h-8 bg-app-bg-alt border border-app-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:start-1 after:bg-white after:border-gray-200 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                  </div>
                </label>

                <label className="flex items-center justify-between p-6 bg-app-bg rounded-2xl border border-app-border cursor-pointer hover:border-blue-500/50 transition-all shadow-sm group">
                  <span className="text-xs font-black text-app-text-sub uppercase tracking-widest group-hover:text-blue-600 transition-colors">{t.settings.themeAccessibility.reduceMotion}</span>
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
                    <div className="w-14 h-8 bg-app-bg-alt border border-app-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:start-1 after:bg-white after:border-gray-200 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                  </div>
                </label>
              </div>

              <div className="bg-blue-600/5 p-8 rounded-3xl border border-blue-500/10 shadow-inner relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Monitor className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded-full bg-blue-500 animate-pulse ring-4 ring-blue-500/20" />
                      <span className="text-sm font-black text-app-text-main uppercase tracking-widest">{t.settings.themeAccessibility.lowPowerMode}</span>
                    </div>
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
                      <div className="w-14 h-8 bg-app-bg-alt border border-app-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:start-1 after:bg-white after:border-gray-100 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                    </div>
                  </div>
                  <p className="text-xs text-app-text-sub font-bold leading-relaxed uppercase tracking-tight max-w-md">
                    {t.settings.themeAccessibility.lowPowerModeDesc}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Quick Links */}
          <section className="bg-app-bg-alt rounded-3xl border border-app-border overflow-hidden mb-20 shadow-sm transition-all hover:shadow-md">
            <div className="p-8 border-b border-app-border flex items-center gap-4 bg-app-bg/50">
              <div className="p-3 bg-app-bg rounded-2xl text-app-text-muted border border-app-border">
                <NavIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-app-text-main tracking-tight uppercase">{t.settings.navigation.title}</h2>
                <p className="text-xs text-app-text-sub font-bold uppercase tracking-tight">Quick navigation to related resources</p>
              </div>
            </div>
            
            <div className="divide-y divide-app-border">
              <button
                type="button"
                onClick={() => navigate('/accessibility')}
                className="w-full flex items-center justify-between p-8 hover:bg-app-bg transition-colors group"
              >
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 group-hover:scale-110 transition-transform shadow-sm">
                    <Monitor className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-app-text-main text-lg tracking-tight uppercase">{t.settings.navigation.accessibilitySettings}</p>
                    <p className="text-[10px] text-app-text-muted font-black uppercase tracking-widest">Configure Global Accessibility</p>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-app-bg border border-app-border group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/support')}
                className="w-full flex items-center justify-between p-8 hover:bg-app-bg transition-colors group"
              >
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-green-500/10 text-green-600 group-hover:scale-110 transition-transform shadow-sm">
                    <Bell className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-app-text-main text-lg tracking-tight uppercase">{t.settings.navigation.supportPage}</p>
                    <p className="text-[10px] text-app-text-muted font-black uppercase tracking-widest">Get Help & Support</p>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-app-bg border border-app-border group-hover:bg-green-500 group-hover:text-white transition-all">
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Settings;

