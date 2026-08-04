import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Award,
  Activity,
  BookOpen,
  Calendar,
  Cpu,
  Bell,
  Sparkles,
  ShieldAlert,
  BarChart3,
  Server,
  Settings as SettingsIcon,
  RefreshCw,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { adminAPI, syllabusAPI } from '../services/api';

// Subcomponents
import DashboardHome from './Admin/DashboardHome';
import UserManagement from './Admin/UserManagement';
import TeacherVerification from './Admin/TeacherVerification';
import LiveMentorNetwork from './Admin/LiveMentorNetwork';
import EducationModule from './Admin/EducationModule';
import SmartTimetable from './Admin/SmartTimetable';
import Automations from './Admin/Automations';
import NotificationManager from './Admin/NotificationManager';
import AIModule from './Admin/AIModule';
import ChatModeration from './Admin/ChatModeration';
import Reports from './Admin/Reports';
import SystemHealth from './Admin/SystemHealth';
import Settings from './Admin/Settings';

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSyllabus, setActiveSyllabus] = useState({ board: 'NCERT', classes: {} });

  // Syllabus form state
  const [syllabusForm, setSyllabusForm] = useState({
    board: 'NCERT',
    class: '',
    subject: '',
    topic: '',
    description: '',
    pdf_base64: ''
  });

  // Preserved effect to load syllabus details when board selection changes
  useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        const res = await syllabusAPI.getBoard(syllabusForm.board);
        if (res.success && res.syllabus) {
          setActiveSyllabus(res.syllabus);
        } else {
          setActiveSyllabus({ board: syllabusForm.board, classes: {} });
          setError(res.message || 'Failed to load syllabus');
        }
      } catch (err) {
        setActiveSyllabus({ board: syllabusForm.board, classes: {} });
        setError('Failed to load syllabus');
      }
    };
    fetchSyllabus();
  }, [syllabusForm.board]);

  const availableClasses = useMemo(() => Object.keys(activeSyllabus.classes), [activeSyllabus]);
  const availableSubjects = useMemo(() => {
    if (!syllabusForm.class) return [];
    return Object.keys(activeSyllabus.classes[syllabusForm.class]?.subjects || {});
  }, [syllabusForm.class, activeSyllabus]);

  const availableTopics = useMemo(() => {
    if (!syllabusForm.class || !syllabusForm.subject) return [];
    const subjects = activeSyllabus.classes[syllabusForm.class]?.subjects?.[syllabusForm.subject] || [];
    return subjects.flatMap((s) => s.topics || []);
  }, [syllabusForm.class, syllabusForm.subject, activeSyllabus]);

  // Fetch existing content when topic selection changes
  useEffect(() => {
    const fetchExisting = async () => {
      if (syllabusForm.board && syllabusForm.class && syllabusForm.subject && syllabusForm.topic) {
        try {
          const res = await syllabusAPI.getContent(
            syllabusForm.board,
            syllabusForm.class,
            syllabusForm.subject,
            syllabusForm.topic
          );
          if (res.success && res.content) {
            setSyllabusForm((prev) => ({
              ...prev,
              description: res.content.description || '',
              pdf_base64: res.content.pdf_data_url || ''
            }));
            setSuccess('Loaded existing content for this topic.');
          } else {
            setSyllabusForm((prev) => ({ ...prev, description: '', pdf_base64: '' }));
          }
        } catch (err) {
          console.error('Failed to fetch syllabus content', err);
        }
      }
    };
    fetchExisting();
  }, [syllabusForm.board, syllabusForm.class, syllabusForm.subject, syllabusForm.topic]);

  // Lesson form state
  const [isEditing, setIsEditing] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    category: '',
    level: 'Beginner',
    duration: '',
    topics: '',
    pdf_path: ''
  });

  const fetchStats = async () => {
    try {
      const auth = JSON.parse(localStorage.getItem('auth') || '{}');
      const adminId = auth.user?.id;

      if (!adminId) {
        setError('Admin ID not found. Please login.');
        setLoading(false);
        return;
      }

      const data = await adminAPI.getStats(adminId);
      if (data.success) {
        setStats(data.stats);
      } else {
        setError(data.error || 'Failed to fetch admin stats');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred fetching stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...lessonForm,
        topics: lessonForm.topics.split(',').map((t) => t.trim()).filter((t) => t)
      };

      let res;
      if (isEditing) {
        res = await adminAPI.updateLesson(isEditing, payload);
      } else {
        res = await adminAPI.createLesson(payload);
      }

      if (res.success) {
        setSuccess(isEditing ? 'Lesson updated!' : 'Lesson created!');
        setIsEditing(null);
        setLessonForm({ title: '', description: '', category: '', level: 'Beginner', duration: '', topics: '', pdf_path: '' });
        await fetchStats();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save lesson');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (lesson) => {
    setIsEditing(lesson.id);
    setActiveTab('Education Module');
    setLessonForm({
      title: lesson.title || '',
      description: lesson.description || '',
      category: lesson.category || '',
      level: lesson.level || 'Beginner',
      duration: lesson.duration || '',
      topics: (lesson.topics || []).join(', '),
      pdf_path: lesson.pdf_path || ''
    });
  };

  const handleSyllabusPdfUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      if (file.size > 12 * 1024 * 1024) {
        setError('PDF file too large. Please use a file smaller than 12MB.');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setSyllabusForm({ ...syllabusForm, pdf_base64: event.target?.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteSyllabusContent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this custom topic content?')) return;
    setLoading(true);
    try {
      await adminAPI.deleteSyllabusContent(id);
      setSuccess('Topic content deleted successfully');
      await fetchStats();
    } catch (err) {
      setError('Failed to delete content');
    } finally {
      setLoading(false);
    }
  };

  const handleSyllabusSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        board: syllabusForm.board,
        class_level: syllabusForm.class,
        subject: syllabusForm.subject,
        topic: syllabusForm.topic,
        description: syllabusForm.description,
        pdf_data_url: syllabusForm.pdf_base64
      };

      const res = await adminAPI.saveSyllabusContent(payload);
      if (res.success) {
        setSuccess('Syllabus content saved successfully!');
        setSyllabusForm({ ...syllabusForm, description: '', pdf_base64: '' });
        await fetchStats();
      } else {
        setError(res.error || 'Failed to save syllabus content');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save syllabus content');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;

    setLoading(true);
    try {
      const res = await adminAPI.deleteLesson(id);
      if (res.success) {
        setSuccess('Lesson deleted');
        await fetchStats();
      }
    } catch (err) {
      setError('Failed to delete lesson');
    } finally {
      setLoading(false);
    }
  };

  // Sidebar modules list
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Users', icon: Users },
    { name: 'Teacher Verification', icon: Award },
    { name: 'Live Mentor Network', icon: Activity },
    { name: 'Education Module', icon: BookOpen },
    { name: 'Smart Timetable', icon: Calendar },
    { name: 'Automations', icon: Cpu },
    { name: 'Notifications', icon: Bell },
    { name: 'AI Module', icon: Sparkles },
    { name: 'Chat Moderation', icon: ShieldAlert },
    { name: 'Reports', icon: BarChart3 },
    { name: 'System Health', icon: Server },
    { name: 'Settings', icon: SettingsIcon }
  ];

  // Component switcher
  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <DashboardHome
            stats={stats}
            onNavigate={setActiveTab}
          />
        );
      case 'Users':
        return <UserManagement />;
      case 'Teacher Verification':
        return (
          <TeacherVerification
            initialVerifications={stats?.teacher_verifications || []}
            onRefreshStats={fetchStats}
          />
        );
      case 'Live Mentor Network':
        return <LiveMentorNetwork />;
      case 'Education Module':
        return (
          <EducationModule
            stats={stats}
            syllabusForm={syllabusForm}
            setSyllabusForm={setSyllabusForm}
            lessonForm={lessonForm}
            setLessonForm={setLessonForm}
            handleLessonSubmit={handleLessonSubmit}
            handleSyllabusSubmit={handleSyllabusSubmit}
            handleSyllabusPdfUpload={handleSyllabusPdfUpload}
            handleDeleteSyllabusContent={handleDeleteSyllabusContent}
            handleDeleteLesson={handleDeleteLesson}
            handleEditClick={handleEditClick}
            availableClasses={availableClasses}
            availableSubjects={availableSubjects}
            availableTopics={availableTopics}
            loading={loading}
            isEditing={isEditing}
          />
        );
      case 'Smart Timetable':
        return <SmartTimetable />;
      case 'Automations':
        return <Automations />;
      case 'Notifications':
        return <NotificationManager />;
      case 'AI Module':
        return <AIModule stats={stats} />;
      case 'Chat Moderation':
        return <ChatModeration />;
      case 'Reports':
        return <Reports />;
      case 'System Health':
        return <SystemHealth />;
      case 'Settings':
        return <Settings />;
      default:
        return <div className="p-8 text-center text-app-text-muted">Component not found.</div>;
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-app-bg text-app-text-main flex items-center justify-center font-bold">
        Loading Command Center Data...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg text-app-text-main flex">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-app-bg-alt border-r border-app-border flex-col justify-between hidden md:flex shrink-0">
        <div className="flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-app-border">
            <span className="font-extrabold tracking-wider text-primary text-base uppercase">Edu AI Admin</span>
          </div>
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === item.name
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-app-text-muted hover:bg-gray-100 hover:text-app-text-main'
                }`}>
                <item.icon size={16} />
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Sidebar - Mobile drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-64 bg-app-bg-alt border-r border-app-border flex flex-col z-10">
              <div className="h-16 flex items-center justify-between px-6 border-b border-app-border">
                <span className="font-extrabold tracking-wider text-primary uppercase text-sm">Edu AI Console</span>
                <button onClick={() => setIsSidebarOpen(false)} className="text-app-text-muted hover:text-app-text-main">
                  <X size={20} />
                </button>
              </div>
              <nav className="p-4 space-y-1 overflow-y-auto flex-1">
                {menuItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      setActiveTab(item.name);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === item.name
                        ? 'bg-primary text-white'
                        : 'text-app-text-muted hover:bg-gray-100 hover:text-app-text-main'
                    }`}>
                    <item.icon size={16} />
                    <span>{item.name}</span>
                  </button>
                ))}
              </nav>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Console Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar Header */}
        <header className="h-16 bg-app-bg-alt border-b border-app-border flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-app-text-muted hover:text-app-text-main">
              <Menu size={20} />
            </button>
            <h2 className="text-sm font-extrabold text-app-text-main">{activeTab}</h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchStats()}
              className="p-2 border border-app-border hover:bg-gray-100 rounded-lg text-app-text-muted hover:text-app-text-main transition-colors bg-white">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('auth');
                window.location.reload();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-lg text-xs font-bold transition-colors bg-white">
              <LogOut size={14} /> Log Out
            </button>
          </div>
        </header>

        {/* Dynamic scrollable body panel */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-app-bg">
          {error && <div className="bg-error/15 border border-error text-error p-4 rounded-xl mb-6 text-sm font-semibold">{error}</div>}
          {success && <div className="bg-emerald-50 border border-emerald-400 text-emerald-800 p-4 rounded-xl mb-6 text-sm font-semibold">{success}</div>}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}>
              {renderActiveComponent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Admin;