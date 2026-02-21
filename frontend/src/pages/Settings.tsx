import { useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Bookmark, 
  Images,
  Check,
  ChevronRight,
  Lock,
  Layout,
  MessageSquare,
  Trash2,
  Zap,
  Moon,
  Bell,
  Palette,
  Eye,
  Shield,
  WifiOff,
  Cloud,
  Database,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useOffline } from '../context/OfflineContext';
import Button from '../components/Button';
import type { 
  LearningLevel, 
  ReminderFrequency, 
  ThemeMode, 
  FontSize,
  SupportedLanguage,
  EducationBoard,
  AnswerStyle
} from '../context/SettingsContext';

type TabId = 'account' | 'security' | 'visibility' | 'privacy' | 'advertising' | 'notifications' | 'aitutor' | 'appearance' | 'offline';

interface SidebarItemProps {
  id: TabId;
  label: string;
  icon: LucideIcon;
  colorClass: string;
  activeTab: TabId;
  setActiveTab: (id: TabId) => void;
}

const SidebarItem = ({ 
  id, 
  label, 
  icon: Icon, 
  colorClass,
  activeTab,
  setActiveTab
}: SidebarItemProps) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`w-full flex items-center gap-3 px-1 py-3 rounded-xl transition-all duration-300 transform hover:translate-x-1 ${
      activeTab === id 
        ? 'bg-app-bg/10 text-primary shadow-sm translate-x-1' 
        : 'text-app-text-sub hover:bg-app-bg/50'
    }`}
  >
    <Icon className={`w-5 h-5 shrink-0 ${activeTab === id ? colorClass : 'text-app-text-muted opacity-60'}`} />
    <span className={`text-sm font-bold truncate ${activeTab === id ? 'text-primary' : ''}`}>{label}</span>
  </button>
);

const Settings = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  const { isOffline, syncInProgress, triggerSync } = useOffline();
  
  const [activeTab, setActiveTab] = useState<TabId>('account');
  const [saveMessage, setSaveMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Derived current values prioritizing auth for real-time accuracy
  const currentName = auth?.user?.name || auth?.user?.username || settings.profile.name;
  const currentEmail = auth?.user?.email || settings.profile.email;

  const [editName, setEditName] = useState(currentName);
  const [editEmail, setEditEmail] = useState(currentEmail);
  const [error, setError] = useState('');

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
      setEditName(currentName);
      setEditEmail(currentEmail);
      setError('');
      setIsEditing(true);
    }
  };

  const initials = useMemo(() => {
    const source = currentName || currentEmail;
    if (!source) return 'U';
    return source
      .split(/\s+|@/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U';
  }, [currentName, currentEmail]);

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
    <div className="min-h-screen bg-app-bg text-app-text-main py-6 px-2 sm:px-4 lg:px-6 transition-colors duration-300">
      <div className="w-full">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-10">
          
          {/* Sidebar - Matching Image 2 */}
          <aside className="w-full md:w-64 shrink-0 space-y-0.5">
            <SidebarItem id="account" label="Account preferences" icon={User} colorClass="text-primary" activeTab={activeTab} setActiveTab={setActiveTab} />
            <SidebarItem id="security" label="Sign in & security" icon={Shield} colorClass="text-primary" activeTab={activeTab} setActiveTab={setActiveTab} />
            <SidebarItem id="visibility" label="Visibility" icon={Eye} colorClass="text-primary" activeTab={activeTab} setActiveTab={setActiveTab} />
            <SidebarItem id="privacy" label="Data privacy" icon={Lock} colorClass="text-primary" activeTab={activeTab} setActiveTab={setActiveTab} />
            <SidebarItem id="advertising" label="Advertising data" icon={Images} colorClass="text-primary" activeTab={activeTab} setActiveTab={setActiveTab} />
            <SidebarItem id="notifications" label="Notifications" icon={Bell} colorClass="text-primary" activeTab={activeTab} setActiveTab={setActiveTab} />
            <SidebarItem id="aitutor" label="AI Tutor Settings" icon={MessageSquare} colorClass="text-primary" activeTab={activeTab} setActiveTab={setActiveTab} />
            <SidebarItem id="appearance" label="Appearance & Theme" icon={Palette} colorClass="text-primary" activeTab={activeTab} setActiveTab={setActiveTab} />
            <SidebarItem id="offline" label="Offline Data" icon={WifiOff} colorClass="text-primary" activeTab={activeTab} setActiveTab={setActiveTab} />
            
            <div className="pt-8 mt-8 border-t border-app-border">
              <button
                onClick={() => navigate('/accessibility')}
                className="w-full flex items-center justify-between px-2 py-3 rounded-xl text-app-text-sub hover:bg-primary/5 hover:text-primary transition-all duration-300 transform hover:translate-x-1 font-bold group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center opacity-60 group-hover:opacity-100">
                    <Layout size={20} />
                  </div>
                  <span className="text-sm">Accessibility Center</span>
                </div>
                <ChevronRight size={16} />
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {saveMessage && (
              <div className="mb-6 flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-2xl border border-secondary/20 animate-in fade-in slide-in-from-top-4 w-fit">
                <Check size={16} />
                <span className="text-xs font-black uppercase tracking-wider">{saveMessage}</span>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <header>
                  <h1 className="text-3xl font-black text-app-text-main tracking-tight uppercase">Account Preferences</h1>
                  <p className="text-app-text-sub font-bold text-sm uppercase tracking-widest mt-1">Manage your basic settings</p>
                </header>

                <div className="grid grid-cols-1 gap-8">
                  {/* Profile Summary */}
                  <div className="bg-app-bg-alt rounded-3xl border border-app-border p-8 flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-app-bg flex items-center justify-center border-4 border-app-border">
                      {settings.profile.avatarDataUrl ? (
                         <img src={settings.profile.avatarDataUrl} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <div className="text-2xl font-black text-primary">{initials}</div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-black truncate">{currentName}</h3>
                      <p className="text-app-text-sub font-medium">{currentEmail}</p>
                      <button onClick={() => setActiveTab('security')} className="text-xs font-black text-primary uppercase tracking-widest mt-2 hover:underline">Change</button>
                    </div>
                  </div>

                  {/* Learning Preferences */}
                  <div className="bg-app-bg-alt rounded-3xl border border-app-border p-8 space-y-8">
                    <div className="flex items-center gap-3">
                      <Bookmark size={20} className="text-primary" />
                      <h4 className="font-black uppercase tracking-widest text-sm">Learning Controls</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-app-text-sub uppercase tracking-widest ml-1">{t.settings.learning.language}</label>
                        <select
                          value={settings.learning.language}
                          onChange={(e) => {
                            updateLearning({ language: e.target.value as SupportedLanguage });
                            showSaveMessage(t.settings.changesSaved);
                          }}
                          className="w-full bg-app-bg border border-app-border rounded-xl px-4 py-3 text-app-text-main outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                        >
                          <option value="English">English</option>
                          <option value="Telugu">తెలుగు (Telugu)</option>
                          <option value="Hindi">हिंदी (Hindi)</option>
                          <option value="Spanish">Español (Spanish)</option>
                          <option value="French">Français (French)</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-app-text-sub uppercase tracking-widest ml-1">{t.settings.learning.level}</label>
                        <select
                          value={settings.learning.level}
                          onChange={(e) => {
                            updateLearning({ level: e.target.value as LearningLevel });
                            showSaveMessage(t.settings.changesSaved);
                          }}
                          className="w-full bg-app-bg border border-app-border rounded-xl px-4 py-3 text-app-text-main outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                        >
                          <option value="Beginner">{t.lessons.beginner}</option>
                          <option value="Intermediate">{t.lessons.intermediate}</option>
                          <option value="Advanced">{t.lessons.advanced}</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-app-text-sub uppercase tracking-widest ml-1">Education Board</label>
                        <select
                          value={settings.learning.board}
                          onChange={(e) => {
                            updateLearning({ board: e.target.value as EducationBoard });
                            showSaveMessage(t.settings.changesSaved);
                          }}
                          className="w-full bg-app-bg border border-app-border rounded-xl px-4 py-3 text-app-text-main outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                        >
                          <option value="NCERT">NCERT (National)</option>
                          <option value="Telangana">TS Board (Telangana)</option>
                          <option value="Andhra Pradesh">AP Board (Andhra Pradesh)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <header>
                  <h1 className="text-3xl font-black text-app-text-main tracking-tight uppercase">Sign In & Security</h1>
                  <p className="text-app-text-sub font-bold text-sm uppercase tracking-widest mt-1">Manage your credentials</p>
                </header>

                <div className="bg-app-bg-alt rounded-3xl border border-app-border p-8 space-y-8">
                  <div className="flex flex-col md:flex-row gap-10 items-start">
                    <div className="flex flex-col items-center gap-4 shrink-0">
                      <div className="relative group p-1 rounded-full border-4 border-app-border">
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-app-bg flex items-center justify-center relative shadow-inner">
                          {settings.profile.avatarDataUrl ? (
                            <img src={settings.profile.avatarDataUrl} alt="Avatar" className="h-full w-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-black text-primary bg-primary/5 uppercase">
                              {initials}
                            </div>
                          )}
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-app-text-main/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full text-app-bg pointer-events-auto"
                          >
                            <Images size={32} />
                          </button>
                        </div>
                      </div>
                      <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={(e) => handleAvatarChange(e.target.files?.[0])} />
                    </div>

                    <div className="flex-1 w-full space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-app-text-sub uppercase tracking-widest ml-1">{t.settings.profile.name}</label>
                        <input
                          type="text"
                          value={isEditing ? editName : currentName}
                          onChange={(e) => setEditName(e.target.value)}
                          disabled={!isEditing}
                          className="w-full bg-app-bg border border-app-border rounded-xl px-4 py-3 text-app-text-main outline-none focus:ring-2 focus:ring-primary/20 font-bold disabled:opacity-50"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-app-text-sub uppercase tracking-widest ml-1">{t.settings.profile.email}</label>
                        <input
                          type="email"
                          value={currentEmail}
                          disabled
                          className="w-full bg-app-bg/50 border border-app-border rounded-xl px-4 py-3 text-app-text-muted cursor-not-allowed font-bold"
                        />
                      </div>

                      {error && <div className="text-sm text-red-500 font-bold bg-red-500/5 p-4 rounded-xl border border-red-500/10">{error}</div>}

                      <div className="flex justify-end pt-4">
                        <Button
                          onClick={handleEditToggle}
                          variant={isEditing ? 'success' : 'primary'}
                          className="px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest"
                        >
                          {isEditing ? 'Save Changes' : 'Edit Profile'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'visibility' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <header>
                  <h1 className="text-3xl font-black text-app-text-main tracking-tight uppercase">Visibility & AI</h1>
                  <p className="text-app-text-sub font-bold text-sm uppercase tracking-widest mt-1">Control your tutoring experience</p>
                </header>

                <div className="bg-app-bg-alt rounded-3xl border border-app-border p-8 space-y-6">
                  {/* AI Tutor Answer Style */}
                  <div className="p-6 bg-app-bg rounded-2xl border border-app-border group transition-all hover:border-primary/50 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-sm transition-transform group-hover:scale-110">
                          <Zap size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-app-text-main uppercase tracking-tight">{t.settings.aiTutorSettings.answerStyle}</p>
                          <p className="text-[10px] text-app-text-sub font-black uppercase tracking-widest opacity-60">How the AI tutor responds to you</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 p-1 bg-app-bg-alt border border-app-border rounded-xl">
                        {(['Short', 'Detailed'] as const).map((style) => (
                          <button
                            key={style}
                            onClick={() => {
                              updateAiTutor({ answerStyle: style });
                              showSaveMessage(t.settings.changesSaved);
                            }}
                            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                              settings.aiTutor.answerStyle === style
                                ? 'bg-primary text-white shadow-md'
                                : 'text-app-text-sub hover:bg-app-bg hover:text-app-text-main'
                            }`}
                          >
                            {style === 'Short' ? t.settings.aiTutorSettings.short : t.settings.aiTutorSettings.detailed}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <label className="flex items-center justify-between p-6 bg-app-bg rounded-2xl border border-app-border cursor-pointer group transition-all hover:border-primary/50 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-sm transition-transform group-hover:scale-110">
                        <Eye size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-app-text-main uppercase tracking-tight">{t.settings.aiTutorSettings.showChatHistory}</p>
                        <p className="text-[10px] text-app-text-sub font-black uppercase tracking-widest opacity-60">Visibility of your tutoring sessions</p>
                      </div>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.aiTutor.showChatHistory}
                        onChange={(e) => {
                          updateAiTutor({ showChatHistory: e.target.checked });
                          showSaveMessage(t.settings.changesSaved);
                        }}
                      />
                      <div className="w-14 h-8 bg-app-bg-alt border border-app-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:start-1 after:bg-white after:border-gray-200 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                    </div>
                  </label>
                  
                  <div className="p-6 bg-secondary/5 rounded-2xl border border-secondary/10">
                    <p className="text-xs text-secondary font-bold uppercase tracking-widest leading-relaxed">
                      Your learning progress and activity are private by default. Currently, only you can see your dashboard.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <header>
                  <h1 className="text-3xl font-black text-app-text-main tracking-tight uppercase">Data Privacy</h1>
                  <p className="text-app-text-sub font-bold text-sm uppercase tracking-widest mt-1">Manage your data and exports</p>
                </header>

                <div className="bg-app-bg-alt rounded-3xl border border-app-border p-8 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-black uppercase tracking-tight">Personal Data Management</h3>
                    <p className="text-sm text-app-text-sub font-medium">You have full control over your data. You can delete your AI history at any time.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      onClick={handleClearChatHistory}
                      className="flex items-center gap-3 px-6 py-4 rounded-xl bg-red-500/10 text-red-600 font-bold text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 size={18} />
                      Clear Chat History
                    </button>
                    
                    <button
                      onClick={() => showSaveMessage('Data export started...')}
                      className="flex items-center gap-3 px-6 py-4 rounded-xl bg-app-bg border border-app-border text-app-text-main font-bold text-xs uppercase tracking-widest hover:bg-app-bg-alt transition-all shadow-sm"
                    >
                      <Lock size={18} />
                      Download My Data
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'advertising' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <header>
                  <h1 className="text-3xl font-black text-app-text-main tracking-tight uppercase">Advertising Data</h1>
                  <p className="text-app-text-sub font-bold text-sm uppercase tracking-widest mt-1">Learnburner Ad Preferences</p>
                </header>

                <div className="bg-app-bg-alt rounded-3xl border border-app-border p-8 space-y-6">
                  <div className="p-8 bg-primary/5 rounded-2xl border border-primary/10 text-center">
                    <div className="flex items-center justify-center mb-4 text-primary opacity-40">
                      <Layout size={48} />
                    </div>
                    <h3 className="font-black uppercase tracking-tighter text-xl mb-2">Clean Experience Guaranteed</h3>
                    <p className="text-sm text-app-text-sub font-medium max-w-md mx-auto">
                      LearnBridge AI is an educational platform. We do not sell your data or serve third-party advertisements in our app.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <header>
                  <h1 className="text-3xl font-black text-app-text-main tracking-tight uppercase">Notifications</h1>
                  <p className="text-app-text-sub font-bold text-sm uppercase tracking-widest mt-1">Control how you're notified</p>
                </header>

                <div className="bg-app-bg-alt rounded-3xl border border-app-border p-8 space-y-8">
                  <div className="grid grid-cols-1 gap-6">
                    <label className="flex items-center justify-between p-6 bg-app-bg rounded-2xl border border-app-border cursor-pointer hover:border-primary/50 transition-all shadow-sm group">
                      <div className="space-y-1">
                        <span className="text-sm font-black text-app-text-main uppercase tracking-tight group-hover:text-primary transition-colors">Assignment Reminders</span>
                        <p className="text-[10px] text-app-text-sub font-bold uppercase tracking-widest opacity-60">When assignments are due</p>
                      </div>
                      <input
                        type="checkbox"
                        className="w-6 h-6 rounded-lg border-2 border-app-border bg-app-bg text-primary focus:ring-primary shadow-sm"
                        checked={settings.notifications.assignmentReminders}
                        onChange={(e) => {
                          updateNotifications({ assignmentReminders: e.target.checked });
                          showSaveMessage(t.settings.changesSaved);
                        }}
                      />
                    </label>
                    <label className="flex items-center justify-between p-6 bg-app-bg rounded-2xl border border-app-border cursor-pointer hover:border-primary/50 transition-all shadow-sm group">
                      <div className="space-y-1">
                        <span className="text-sm font-black text-app-text-main uppercase tracking-tight group-hover:text-primary transition-colors">New Lesson Notifications</span>
                        <p className="text-[10px] text-app-text-sub font-bold uppercase tracking-widest opacity-60">When new content is available</p>
                      </div>
                      <input
                        type="checkbox"
                        className="w-6 h-6 rounded-lg border-2 border-app-border bg-app-bg text-primary focus:ring-primary shadow-sm"
                        checked={settings.notifications.newLessonNotifications}
                        onChange={(e) => {
                          updateNotifications({ newLessonNotifications: e.target.checked });
                          showSaveMessage(t.settings.changesSaved);
                        }}
                      />
                    </label>
                  </div>

                  <div className="p-6 bg-app-bg rounded-2xl border border-app-border space-y-4">
                    <label className="text-[10px] font-black text-app-text-sub uppercase tracking-widest ml-1">Frequency</label>
                    <div className="flex flex-wrap gap-2">
                      {['Daily', 'Weekly', 'Off'].map((freq) => (
                        <button
                          key={freq}
                          onClick={() => {
                            updateNotifications({ reminderFrequency: freq as ReminderFrequency });
                            showSaveMessage(t.settings.changesSaved);
                          }}
                          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            settings.notifications.reminderFrequency === freq
                              ? 'bg-primary text-white'
                              : 'bg-app-bg-alt text-app-text-sub border border-app-border hover:bg-app-bg'
                          }`}
                        >
                          {freq}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'aitutor' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <header>
                  <h1 className="text-3xl font-black text-app-text-main tracking-tight uppercase">AI Tutor Settings</h1>
                  <p className="text-app-text-sub font-bold text-sm uppercase tracking-widest mt-1">Configure your personal learning assistant</p>
                </header>

                <div className="bg-app-bg-alt rounded-3xl border border-app-border p-8 space-y-8">
                  <label className="flex items-center justify-between p-6 bg-app-bg rounded-2xl border border-app-border cursor-pointer hover:border-primary/50 transition-all shadow-sm group">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-purple-500/10 shadow-sm transition-transform group-hover:scale-110 text-purple-600">
                        <MessageSquare size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-app-text-main uppercase tracking-tight">Enable AI Tutor</p>
                        <p className="text-[10px] text-app-text-sub font-black uppercase tracking-widest opacity-60">Get instant help from our AI models</p>
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
                      <div className="w-14 h-8 bg-app-bg-alt border border-app-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:start-1 after:bg-white after:border-gray-200 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                    </div>
                  </label>

                  <div className="p-6 bg-app-bg rounded-2xl border border-app-border space-y-4">
                    <label className="text-[10px] font-black text-app-text-sub uppercase tracking-widest ml-1">{t.settings.aiTutorSettings.answerStyle}</label>
                    <div className="flex flex-wrap gap-2">
                      {['Short', 'Detailed'].map((style) => (
                        <button
                          key={style}
                          onClick={() => {
                            updateAiTutor({ answerStyle: style as AnswerStyle });
                            showSaveMessage(t.settings.changesSaved);
                          }}
                          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            settings.aiTutor.answerStyle === style
                              ? 'bg-purple-600 text-white'
                              : 'bg-app-bg-alt text-app-text-sub border border-app-border hover:bg-app-bg'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <header>
                  <h1 className="text-3xl font-black text-app-text-main tracking-tight uppercase">Appearance & Theme</h1>
                  <p className="text-app-text-sub font-bold text-sm uppercase tracking-widest mt-1">Personalize your workspace</p>
                </header>

                {/* Theme Selection - Matching Image 1 */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3 ml-1 mb-6 text-primary">
                    <Palette size={20} />
                    <h3 className="font-black uppercase tracking-widest text-sm text-app-text-main">Select Your Theme</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ThemeCard 
                      id={"Academic Maroon" as ThemeMode} 
                      title="Academic Maroon" 
                      desc="Our signature institutional theme with deep maroon accents" 
                      icon={Moon} 
                      current={settings.themeAccessibility.theme}
                      onClick={(id) => updateThemeAccessibility({ theme: id })}
                      previewClass="bg-red-900"
                      accentClass="bg-red-700"
                    />
                    <ThemeCard 
                      id={"Harry Potter" as ThemeMode} 
                      title="Harry Potter" 
                      desc="Authentic cinematic wizarding academy theme" 
                      icon={Sparkles} 
                      current={settings.themeAccessibility.theme}
                      onClick={(id) => updateThemeAccessibility({ theme: id })}
                      previewClass="bg-[#0b0c10]"
                      accentClass="bg-[#d9b25f]"
                    />
                    <ThemeCard 
                      id={"Premium Dark" as ThemeMode} 
                      title="Premium Dark" 
                      desc="Modern, high-end professional dark workspace" 
                      icon={Shield} 
                      current={settings.themeAccessibility.theme}
                      onClick={(id) => updateThemeAccessibility({ theme: id })}
                      previewClass="bg-[#0B0F14]"
                      accentClass="bg-[#B45309]"
                    />
                    <ThemeCard 
                      id={"WEDNESDAY" as ThemeMode} 
                      title="Wednesday" 
                      desc="Gothic Nevermore Academy aesthetic" 
                      icon={Moon} 
                      current={settings.themeAccessibility.theme}
                      onClick={(id) => updateThemeAccessibility({ theme: id })}
                      previewClass="bg-[#0a0a0c]"
                      accentClass="bg-[#a78bfa]"
                    />
                    <ThemeCard 
                      id={"Midnight Void" as ThemeMode} 
                      title="Midnight Void" 
                      desc="Deep space aesthetic with slate and cyan accents" 
                      icon={Moon} 
                      current={settings.themeAccessibility.theme}
                      onClick={(id) => updateThemeAccessibility({ theme: id })}
                      previewClass="bg-[#020617]"
                      accentClass="bg-[#3b82f6]"
                    />
                    <ThemeCard 
                      id={"Crystal Light" as ThemeMode} 
                      title="Crystal Light" 
                      desc="Pristine white and blue clarity theme" 
                      icon={Sparkles} 
                      current={settings.themeAccessibility.theme}
                      onClick={(id) => updateThemeAccessibility({ theme: id })}
                      previewClass="bg-[#ffffff]"
                      accentClass="bg-[#2563eb]"
                    />
                  </div>
                </section>

                {/* Extra Accessibility Controls */}
                <section className="bg-app-bg-alt rounded-3xl border border-app-border p-8 space-y-8">
                  <div className="flex items-center gap-3 text-primary">
                    <Lock size={20} />
                    <h3 className="font-black uppercase tracking-widest text-sm text-app-text-main">Accessibility Controls</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-app-text-sub uppercase tracking-widest ml-1">Font Size</label>
                      <div className="flex gap-2">
                        {(['Small', 'Medium', 'Large'] as FontSize[]).map((size) => (
                           <button
                            key={size}
                            onClick={() => updateThemeAccessibility({ fontSize: size })}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                              settings.themeAccessibility.fontSize === size
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'bg-app-bg text-app-text-sub border border-app-border hover:bg-app-bg-alt'
                            }`}
                           >
                            {size}
                           </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-app-text-sub uppercase tracking-widest ml-1">Voice Accent</label>
                      <select
                        value={settings.themeAccessibility.voiceLanguage}
                        onChange={(e) => updateThemeAccessibility({ voiceLanguage: e.target.value as SupportedLanguage })}
                        className="w-full bg-app-bg border border-app-border rounded-xl px-4 py-3 text-app-text-main outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                      >
                         <option value="English">English</option>
                         <option value="Telugu">Telugu</option>
                         <option value="Hindi">Hindi</option>
                      </select>
                    </div>

                    <div className="col-span-full border-t border-app-border pt-8 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <label className="flex items-center justify-between p-4 bg-app-bg rounded-2xl border border-app-border cursor-pointer hover:border-primary/50 transition-all">
                          <span className="text-xs font-black uppercase tracking-tight text-app-text-main">High Contrast</span>
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={settings.themeAccessibility.highContrast}
                            onChange={(e) => updateThemeAccessibility({ highContrast: e.target.checked })}
                          />
                          <div className="w-10 h-5 bg-app-bg-alt rounded-full peer peer-checked:bg-primary relative after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-5"></div>
                        </label>
                        
                        <label className="flex items-center justify-between p-4 bg-app-bg rounded-2xl border border-app-border cursor-pointer hover:border-primary/50 transition-all">
                          <span className="text-xs font-black uppercase tracking-tight text-app-text-main">Reduce Motion</span>
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={settings.themeAccessibility.reduceMotion}
                            onChange={(e) => updateThemeAccessibility({ reduceMotion: e.target.checked })}
                          />
                          <div className="w-10 h-5 bg-app-bg-alt rounded-full peer peer-checked:bg-primary relative after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-5"></div>
                        </label>

                        <label className="flex items-center justify-between p-4 bg-app-bg rounded-2xl border border-app-border cursor-pointer hover:border-primary/50 transition-all">
                          <div className="flex flex-col">
                            <span className="text-xs font-black uppercase tracking-tight text-app-text-main">Low Power</span>
                          </div>
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={settings.themeAccessibility.lowPowerMode}
                            onChange={(e) => updateThemeAccessibility({ lowPowerMode: e.target.checked })}
                          />
                          <div className="w-10 h-5 bg-app-bg-alt rounded-full peer peer-checked:bg-primary relative after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-5"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'offline' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <header>
                  <h1 className="text-3xl font-black text-app-text-main tracking-tight uppercase">Offline Data & Sync</h1>
                  <p className="text-app-text-sub font-bold text-sm uppercase tracking-widest mt-1">Manage your offline capabilities</p>
                </header>

                <div className="grid grid-cols-1 gap-8">
                  {/* Sync Status Card */}
                  <div className="bg-app-bg-alt rounded-3xl border border-app-border p-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                          isOffline 
                            ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600' 
                            : 'bg-secondary/10 dark:bg-secondary/20 text-secondary'
                        }`}>
                          {isOffline ? <WifiOff size={32} /> : <Cloud size={32} />}
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-app-text-main uppercase">
                            {isOffline ? 'Currently Offline' : 'Connected to Cloud'}
                          </h3>
                          <p className="text-app-text-sub text-sm font-bold uppercase tracking-wider">
                            {isOffline 
                              ? 'Your changes are being saved locally' 
                              : 'All data is synchronized and safe'}
                          </p>
                        </div>
                      </div>
                      
                      <Button 
                        variant="primary" 
                        disabled={isOffline || syncInProgress}
                        onClick={() => triggerSync()}
                        className="w-full md:w-auto min-w-40"
                      >
                        {syncInProgress ? (
                          <>
                            <RefreshCw size={18} className="mr-2 animate-spin" />
                            SYNCING...
                          </>
                        ) : (
                          <>
                            <RefreshCw size={18} className="mr-2" />
                            SYNC NOW
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Cache Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section className="bg-app-bg-alt rounded-3xl border border-app-border p-8 space-y-4">
                      <div className="flex items-center gap-3 text-primary mb-2">
                        <Database size={24} />
                        <h3 className="font-black text-lg uppercase tracking-tight">Offline Queue</h3>
                      </div>
                      <p className="text-sm text-app-text-sub font-bold uppercase leading-relaxed">
                        Actions waiting to be synced once you regain connectivity.
                      </p>
                      <div className="flex items-end justify-between pt-4">
                        <div>
                          <span className="text-4xl font-black text-app-text-main tracking-tighter">
                            {JSON.parse(localStorage.getItem('offline_sync_queue') || '[]').length}
                          </span>
                          <span className="text-xs font-black text-app-text-sub ml-2 uppercase tracking-widest">Pending Actions</span>
                        </div>
                      </div>
                    </section>

                    <section className="bg-app-bg-alt rounded-3xl border border-app-border p-8 space-y-4 opacity-50">
                      <div className="flex items-center gap-3 text-primary mb-2">
                        <Images size={24} />
                        <h3 className="font-black text-lg uppercase tracking-tight">Local Storage</h3>
                      </div>
                      <p className="text-sm text-app-text-sub font-bold uppercase leading-relaxed">
                        Pre-loaded lessons and video assets for offline viewing.
                      </p>
                      <div className="flex items-end justify-between pt-4">
                        <div>
                          <span className="text-4xl font-black text-app-text-main tracking-tighter">42MB</span>
                          <span className="text-xs font-black text-app-text-sub ml-2 uppercase tracking-widest">Downloaded</span>
                        </div>
                        <Button variant="outline" disabled className="px-4 py-2 text-[10px] font-black uppercase">
                          MANAGE STORAGE
                        </Button>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

/* Sub-component: Theme Card matching Image 1 exactly */
const ThemeCard = ({ 
  id, 
  title, 
  desc, 
  icon: Icon, 
  current, 
  onClick,
  previewClass,
  accentClass
}: { 
  id: ThemeMode, 
  title: string, 
  desc: string, 
  icon: LucideIcon, 
  current: ThemeMode, 
  onClick: (id: ThemeMode) => void,
  previewClass: string,
  accentClass: string
}) => {
  const isSelected = current === id;
  
  return (
    <button
      onClick={() => onClick(id)}
      className={`group flex flex-col items-start p-1 rounded-4xl transition-all duration-500 text-left ${
        isSelected 
          ? 'ring-2 ring-primary p-0.5' 
          : 'hover:-translate-y-1'
      }`}
    >
      <div className={`w-full aspect-16/10 ${previewClass} rounded-[1.8rem] relative overflow-hidden mb-6 p-4 shadow-inner`}>
        {/* Mock UI Preview in card */}
        <div className="h-full w-full flex gap-2">
          <div className="w-1/4 h-full bg-black/10 rounded-lg p-2 space-y-1">
             <div className={`h-2 w-full rounded-full ${accentClass} opacity-80`} />
             <div className="h-1 w-2/3 bg-black/20 rounded-full" />
             <div className="h-1 w-full bg-black/20 rounded-full" />
             <div className="h-1 w-1/2 bg-black/20 rounded-full" />
          </div>
          <div className="flex-1 h-full space-y-2">
            <div className="flex gap-2 h-1/3">
              <div className="flex-1 rounded-lg bg-black/5 border border-black/5" />
              <div className="flex-1 rounded-lg bg-black/5 border border-black/5" />
            </div>
            <div className="flex-1 h-2/3 rounded-lg bg-black/5 border border-black/5 p-2 flex items-end justify-center">
               <div className="flex gap-1">
                 <div className="w-3 h-3 rounded bg-black/10" />
                 <div className="w-3 h-3 rounded bg-black/10" />
                 <div className={`w-3 h-3 rounded ${accentClass}`} />
                 <div className="w-3 h-3 rounded bg-black/10" />
                 <div className="w-3 h-3 rounded bg-black/10" />
               </div>
            </div>
          </div>
        </div>
        
        {isSelected && (
          <div className="absolute top-3 right-3 h-7 w-7 bg-primary rounded-full flex items-center justify-center border-4 border-app-bg shadow-lg scale-110 animate-in zoom-in duration-300 text-white">
            <Check size={16} />
          </div>
        )}
      </div>

      <div className="px-6 pb-6 space-y-1">
        <div className="flex items-center gap-2 text-primary">
          <Icon size={20} />
          <h4 className="font-black text-lg tracking-tight uppercase text-app-text-main">{title}</h4>
        </div>
        <p className="text-xs text-app-text-sub font-bold leading-relaxed uppercase tracking-tight opacity-60">
          {desc}
        </p>
      </div>
    </button>
  );
};

export default Settings;

