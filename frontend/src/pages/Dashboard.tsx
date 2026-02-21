import { useMemo, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useSettings } from '../context/SettingsContext';
import { useProgress } from '../context/ProgressContext';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useOffline } from '../context/OfflineContext';
import { useNavigate, Link } from 'react-router-dom';

// Import all board syllabi for metrics
import ncertSyllabus from '../data/ncert_syllabus.json';
import telanganaSyllabus from '../data/telangana_syllabus.json';
import apSyllabus from '../data/andhra_pradesh_syllabus.json';

import { 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

import { 
  BookOpen, 
  Clock, 
  Star, 
  Zap,
  CheckCircle2,
  ArrowRight,
  Wifi,
  WifiOff,
  RefreshCw,
  Award,
  Hand,
  Volume2,
  Type,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  History,
  Lightbulb,
  Target,
  FileBarChart,
  Trophy
} from 'lucide-react';

const Dashboard = () => {
  const { settings, isDark } = useSettings();
  const { auth } = useAuth();
  const { 
    progress, 
    getProgressPercentage, 
    getTimeSpentData, 
    setTotalLessons
  } = useProgress();
  const { 
    signLanguageEnabled, toggleSignLanguage,
    captionsEnabled, toggleCaptions,
    speechAssistEnabled, toggleSpeechAssist
  } = useAccessibility();
  const { isOffline, downloadedLessons, syncInProgress } = useOffline();
  const navigate = useNavigate();

  const user = auth?.user;
  const name = user?.name || user?.username || 'Learner';
  const role = user?.role || 'student';

  // Calendar Data Calculation
  const calendarData = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const activityDates = new Set(
      progress.activityLog.map(a => new Date(a.timestamp).toDateString())
    );

    const days = [];
    // Leading empty slots
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push({ day: null, active: false });
    }
    // Month days
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = new Date(year, month, d).toDateString();
        days.push({ 
          day: d, 
          active: activityDates.has(dateStr),
          isToday: d === now.getDate() && month === now.getMonth() && year === now.getFullYear()
        });
    }
    return {
      days,
      monthName: new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now),
      year
    };
  }, [progress.activityLog]);

  // Select syllabus based on board setting
  const activeSyllabus = useMemo(() => {
    switch (settings.learning.board) {
      case 'Telangana': return telanganaSyllabus;
      case 'Andhra Pradesh': return apSyllabus;
      case 'NCERT':
      default: return ncertSyllabus;
    }
  }, [settings.learning.board]);

  useEffect(() => {
    let totalTopics = 0;
    try {
      const classes = (activeSyllabus as any).classes;
      // Filter syllabus strictly to student's level for better motivation
      const grade = settings.learning.level.toString();
      
      if (classes[grade]) {
        const subjects = classes[grade].subjects;
        Object.keys(subjects).forEach(sub => {
          subjects[sub].forEach((unit: any) => {
            totalTopics += (unit.topics || []).length;
          });
        });
      } else {
        // Fallback: total across all if grade not found
        Object.keys(classes).forEach(gradeKey => {
          const subjects = classes[gradeKey].subjects;
          Object.keys(subjects).forEach(sub => {
            subjects[sub].forEach((unit: any) => {
              totalTopics += (unit.topics || []).length;
            });
          });
        });
      }
    } catch (e) {
      totalTopics = 50; 
    }
    setTotalLessons(totalTopics);
  }, [activeSyllabus, setTotalLessons, settings.learning.level]);

  // Derived data
  const percentage = getProgressPercentage();
  const timeData = getTimeSpentData();
  const completedCount = progress.lessonsCompleted.length;
  
  // Calculate Streak from activity log (simplified daily check)
  const streakCount = useMemo(() => {
    const dates = new Set(progress.activityLog.map(a => new Date(a.timestamp).toDateString()));
    let streak = 0;
    const today = new Date();
    const checkDate = new Date(today);
    
    while (dates.has(checkDate.toDateString())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    // If not active today, check if active yesterday to maintain streak for display
    if (streak === 0) {
      checkDate.setDate(today.getDate() - 1);
      while (dates.has(checkDate.toDateString())) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }
    return streak;
  }, [progress.activityLog]);

  const lastLesson = useMemo(() => {
    return progress.activityLog.find(a => a.type === 'lesson');
  }, [progress.activityLog]);

  // Color System Constants - Student Friendly
  const COLORS = useMemo(() => ({
    PRIMARY: '#7F1D1D', // Maroon
    SECONDARY: '#F59E0B', // Amber
    SUCCESS: '#10B981', // Emerald
    GRAY: isDark ? '#374151' : '#E5E7EB',
    TEXT_MUTED: isDark ? '#9CA3AF' : '#6B7280'
  }), [isDark]);

  if (role !== 'student' && role !== 'user' && role !== 'admin') {
     return (
       <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
          <ShieldAlert className="w-16 h-16 text-error mb-4" />
          <h1 className="text-2xl font-bold">Access Restricted</h1>
          <p className="text-app-text-sub mt-2">The standard dashboard is optimized for student learning views.</p>
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-app-bg pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* SECTION 1: WELCOME & GUIDANCE PANEL */}
        <header className="pt-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-app-text-main tracking-tight">
                Welcome back, <span className="text-secondary">{name}</span>!
              </h1>
              <div className="mt-3 flex items-center gap-2">
                <div className="bg-success/10 text-success px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <Star size={14} fill="currentColor" />
                  {completedCount === 0 ? "Start your first lesson to begin your learning journey." : 
                   streakCount > 0 ? `Great job! Keep your ${streakCount}-day streak alive.` : 
                   "Ready to continue your progress?"}
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-3">
               <div className="text-right">
                  <p className="text-[10px] font-black text-app-text-muted uppercase tracking-widest">Studying For</p>
                  <p className="text-sm font-bold text-app-text-main">{settings.learning.board} • Grade {settings.learning.level}</p>
               </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Area (8/12) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* SECTION 2: CONTINUE LEARNING (COMPACT & PERFECTED) */}
            <Card className="relative overflow-hidden border-none bg-linear-to-br from-[#7F1D1D] via-primary-hover to-[#7F1D1D] text-white p-0 shadow-2xl shadow-primary/30 group/card flex">
              {/* Background Decorative Elements */}
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-secondary/10 rounded-full blur-3xl group-hover/card:bg-secondary/20 transition-colors duration-700" />
              
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover/card:scale-110 group-hover/card:opacity-10 transition-all duration-700">
                <BookOpen size={160} />
              </div>

              <div className="p-8 md:p-10 relative z-10 w-full flex flex-col md:flex-row md:items-end justify-between gap-8 h-full">
                <div className="space-y-6 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 bg-white/10 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-white/90 border border-white/10">
                      Up Next
                    </span>
                    <div className="flex items-center gap-1.5 text-secondary animate-pulse">
                      <Sparkles size={12} fill="currentColor" />
                      <span className="text-[9px] font-black uppercase tracking-widest">AI Pick</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl md:text-3xl font-black leading-tight text-white drop-shadow-md">
                      {lastLesson ? lastLesson.label : "Start your first lesson"}
                    </h3>
                    <div className="flex items-center gap-2 text-primary-50/80 font-bold text-xs">
                      <Target size={14} className="text-secondary" />
                      {lastLesson ? `Topic: ${lastLesson.referenceId}` : "Your learning journey begins here."}
                    </div>
                  </div>
                  
                  <div className="space-y-2 max-w-sm pt-4">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">Syllabus Mastery</span>
                      <span className="text-sm font-black text-white">{percentage}%</span>
                    </div>
                    <div className="relative h-2.5 bg-white/10 rounded-full overflow-hidden border border-white/5 backdrop-blur-sm">
                      <div 
                        className="absolute inset-y-0 left-0 bg-linear-to-r from-secondary via-amber-400 to-secondary transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.4)]" 
                        style={{ width: `${percentage}%` }} 
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center md:items-end gap-3 self-end mb-1">
                  <button 
                    className="relative group/btn flex items-center justify-center w-full md:w-auto"
                    onClick={() => lastLesson ? navigate(`/lessons/${lastLesson.referenceId}`) : navigate('/lessons')}
                  >
                    {/* Glowing background for button */}
                    <div className="absolute inset-0 bg-secondary rounded-xl blur-md opacity-20 group-hover/btn:opacity-40 transition-opacity" />
                    
                    <div className="relative bg-white text-secondary px-8 py-4 rounded-xl font-black text-base flex items-center gap-3 shadow-xl transition-all duration-300 group-hover/btn:-translate-y-1 group-hover/btn:shadow-2xl active:scale-95 border-b-4 border-secondary/20">
                      <span className="text-primary uppercase tracking-wider">{lastLesson ? "Resume Lesson" : "Start Learning"}</span>
                      <div className="bg-secondary text-white rounded-lg p-1 group-hover/btn:translate-x-1 transition-transform">
                        <ArrowRight size={18} strokeWidth={4} />
                      </div>
                    </div>
                  </button>
                  <p className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] mr-2">Est. 12m left</p>
                </div>
              </div>
            </Card>

            {/* SECTION 9: AI STUDY SUGGESTIONS */}
            <Card className="bg-app-bg border-2 border-primary/20 p-6 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Sparkles size={64} className="text-primary" />
              </div>
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-primary/10 rounded-xl text-primary">
                    <Lightbulb size={20} />
                 </div>
                 <h3 className="text-sm font-black text-app-text-main uppercase tracking-widest">AI Study Suggestions</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="p-4 rounded-xl border border-app-border bg-app-bg hover:border-primary transition-all group flex flex-col gap-2">
                    <span className="text-[10px] font-black text-app-text-muted uppercase tracking-widest">Recommended</span>
                    <p className="text-sm font-bold text-app-text-main group-hover:text-primary">Next: Intro to Algebraic Equations</p>
                    <ArrowRight size={14} className="text-app-text-muted mt-auto" />
                 </div>
                 <div className="p-4 rounded-xl border border-app-border bg-app-bg hover:border-secondary transition-all group flex flex-col gap-2">
                    <span className="text-[10px] font-black text-app-text-muted uppercase tracking-widest">Revision</span>
                    <p className="text-sm font-bold text-app-text-main group-hover:text-secondary">Revise: Rational Numbers</p>
                    <ArrowRight size={14} className="text-app-text-muted mt-auto" />
                 </div>
                 <div className="p-4 rounded-xl border border-app-border bg-app-bg hover:border-success transition-all group flex flex-col gap-2">
                    <span className="text-[10px] font-black text-app-text-muted uppercase tracking-widest">Practice</span>
                    <p className="text-sm font-bold text-app-text-main group-hover:text-success">5 questions to improve accuracy</p>
                    <ArrowRight size={14} className="text-app-text-muted mt-auto" />
                 </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* SECTION 5: TIME SPENT VISUALIZATION */}
              <Card className="bg-app-bg border border-app-border p-6 shadow-xs flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-black text-app-text-main uppercase tracking-widest flex items-center gap-2">
                    <div className="p-1.5 bg-secondary/15 rounded-lg">
                      <Clock size={18} className="text-secondary" />
                    </div>
                    Study Time This Week
                  </h3>
                </div>
                <div className="h-48 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timeData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#2D3748' : '#F1F5F9'} />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: COLORS.TEXT_MUTED, fontSize: 12, fontWeight: '700' }} 
                        dy={10}
                      />
                      <YAxis hide domain={[0, 'auto']} />
                      <Tooltip 
                        cursor={{ fill: COLORS.GRAY, opacity: 0.1 }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        formatter={(value) => [`${value} minutes`, 'Time']}
                      />
                      <Bar dataKey="minutes" radius={[6, 6, 0, 0]} barSize={28}>
                        {timeData.map((entry, index) => {
                          const today = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date());
                          const isCurrentDay = entry.day === today;
                          
                          let fill = COLORS.GRAY;
                          if (entry.minutes > 30) fill = COLORS.SUCCESS;
                          else if (entry.minutes > 0) fill = COLORS.SECONDARY;
                          
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={fill}
                              fillOpacity={isCurrentDay ? 1 : 0.8}
                              stroke={isCurrentDay && entry.minutes > 0 ? fill : 'none'}
                              strokeWidth={2}
                            />
                          );
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-8 text-center bg-app-bg-alt py-3 rounded-xl border border-app-border">
                  <p className="text-[11px] text-app-text-main font-black uppercase tracking-widest italic flex items-center justify-center gap-2">
                    <Sparkles size={14} className="text-secondary" />
                    Tip: A little every day goes a long way!
                  </p>
                </div>
              </Card>

              {/* SECTION 4: LEARNING CONSISTENCY (MONTHLY CALENDAR) */}
              <Card className="bg-app-bg border border-app-border p-6 shadow-xs flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black text-app-text-main uppercase tracking-widest flex items-center gap-2">
                    <History size={20} className="text-secondary" /> {calendarData.monthName} {calendarData.year}
                  </h3>
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-secondary/15 text-secondary-hover rounded-full border border-secondary/20">
                    <Zap size={16} fill="currentColor" className="animate-pulse" />
                    <span className="text-sm font-black">{streakCount} Day Streak!</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="text-[11px] font-black text-app-text-main text-center py-2">
                      {day}
                    </div>
                  ))}
                  {calendarData.days.map((d, i) => (
                    <div 
                      key={i} 
                      className={`
                        aspect-square rounded-xl flex items-center justify-center text-xs font-black border-2 transition-all group
                        ${d.day ? 'hover:scale-105 cursor-default' : 'opacity-0'}
                        ${d.active ? 'bg-success border-success text-white shadow-md shadow-success/20' : 'bg-transparent border-app-border text-app-text-muted'}
                        ${d.isToday ? 'border-secondary ring-2 ring-secondary/20 z-10 bg-secondary/5 scale-105 shadow-lg shadow-secondary/10' : ''}
                      `}
                    >
                      {d.day && (
                        <div className="relative">
                          {d.day}
                          {d.active && <CheckCircle2 size={10} className="absolute -top-1.5 -right-2 text-white/80" fill="currentColor" />}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 pt-4 border-t border-app-border">
                  <p className="text-sm font-black text-app-text-main flex items-center gap-3">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <Trophy size={18} className="text-secondary" />
                    </div>
                    {streakCount > 0 ? (
                      `Great consistency! You've learned for ${streakCount} days straight.`
                    ) : (
                      "Study 1 more day to start your streak!"
                    )}
                  </p>
                </div>
                
                <div className="mt-6 flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                     <div className="w-3.5 h-3.5 bg-success rounded-md shadow-sm" />
                     <span className="text-[11px] font-bold text-app-text-sub">Study Day</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-3.5 h-3.5 bg-transparent border-2 border-app-border rounded-md" />
                     <span className="text-[11px] font-bold text-app-text-sub">No Activity</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* SECTION 6: ACCESSIBILITY QUICK ACCESS */}
            <div className="space-y-4">
               <h2 className="text-xs font-black text-app-text-muted uppercase tracking-[0.2em] px-1">Quick Accessibility Tools</h2>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    { id: 'sign', label: 'Sign Language', icon: Hand, active: signLanguageEnabled, toggle: toggleSignLanguage, color: 'text-amber-500' },
                    { id: 'captions', label: 'Captions', icon: Type, active: captionsEnabled, toggle: toggleCaptions, color: 'text-blue-500' },
                    { id: 'speech', label: 'Speech Assist', icon: Volume2, active: speechAssistEnabled, toggle: toggleSpeechAssist, color: 'text-purple-500' }
                  ].map((tool) => (
                    <button 
                      key={tool.id}
                      onClick={tool.toggle}
                      className={`flex flex-col items-start p-5 rounded-2xl border-2 transition-all text-left group ${
                        tool.active 
                        ? 'border-secondary bg-secondary/5 shadow-lg shadow-secondary/5' 
                        : 'border-app-border bg-app-bg hover:border-app-text-main'
                      }`}
                    >
                      <div className={`p-2 rounded-xl mb-4 transition-transform group-hover:scale-110 ${tool.active ? 'bg-secondary text-white' : 'bg-app-bg border border-app-border ' + tool.color}`}>
                        <tool.icon size={20} />
                      </div>
                      <span className="text-[11px] font-black text-app-text-muted uppercase tracking-widest mb-1">{tool.label}</span>
                      <p className={`text-sm font-bold ${tool.active ? 'text-secondary' : 'text-app-text-main'}`}>
                        {tool.active ? 'ON' : 'OFF'}
                      </p>
                    </button>
                  ))}
               </div>
            </div>
          </div>

          {/* Sidebar Area (4/12) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* SECTION 3: LEARNING PROGRESS OVERVIEW */}
            <Card className="bg-app-bg border border-app-border p-6 shadow-xs divide-y divide-app-border">
               <div className="pb-6">
                  <h3 className="text-xs font-black text-app-text-muted uppercase tracking-widest mb-6">Learning Pulse</h3>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <p className="text-2xl font-black text-app-text-main">{completedCount}</p>
                        <p className="text-[10px] font-black text-app-text-muted uppercase tracking-widest">Lessons Completed</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
                        <MessageSquare size={24} />
                      </div>
                      <div>
                        <p className="text-2xl font-black text-app-text-main">{progress.questionsAsked || 0}</p>
                        <p className="text-[10px] font-black text-app-text-muted uppercase tracking-widest">AI Doubts Solved</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
                        <Zap size={24} />
                      </div>
                      <div>
                        <p className="text-2xl font-black text-app-text-main">{streakCount}</p>
                        <p className="text-[10px] font-black text-app-text-muted uppercase tracking-widest">Current Streak</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <Clock size={24} />
                      </div>
                      <div>
                        <p className="text-2xl font-black text-app-text-main">{progress.timeSpent.totalMinutes}</p>
                        <p className="text-[10px] font-black text-app-text-muted uppercase tracking-widest">Minutes Studied</p>
                      </div>
                    </div>
                  </div>

                  {/* WEEKLY LEARNING GOAL SECTION */}
                  <div className="mt-8 pt-8 border-t border-app-border">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-[10px] font-black text-app-text-muted uppercase tracking-widest flex items-center gap-2">
                        <Target size={14} className="text-primary" /> Weekly Learning Goal
                      </h3>
                      <span className="text-xs font-black text-app-text-main">{Math.min(completedCount, 5)} / 5 lessons</span>
                    </div>
                    <div className="w-full h-2 bg-app-bg-alt rounded-full overflow-hidden border border-app-border">
                      <div 
                        className="h-full bg-linear-to-r from-primary to-secondary transition-all duration-1000" 
                        style={{ width: `${(Math.min(completedCount, 5) / 5) * 100}%` }} 
                      />
                    </div>
                    <p className="mt-4 text-[10px] text-app-text-muted font-bold italic">
                      {completedCount >= 5 ? "Goal reached! Excellent effort." : "Keep it up, you're almost there!"}
                    </p>
                  </div>
               </div>

               {/* SECTION 8: ACHIEVEMENTS & MOTIVATION */}
               <div className="py-6">
                  <h3 className="text-xs font-black text-app-text-muted uppercase tracking-widest mb-4">Achievements</h3>
                  <div className="flex flex-wrap gap-2">
                    {streakCount >= 1 && (
                      <div className="group relative cursor-help">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white ring-2 ring-white shadow-md">
                          <Zap size={18} />
                        </div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-black text-white text-[9px] rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          Learning Streak
                        </div>
                      </div>
                    )}
                    {completedCount >= 1 && (
                      <div className="group relative cursor-help">
                        <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center text-white ring-2 ring-white shadow-md">
                          <BookOpen size={18} />
                        </div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-black text-white text-[9px] rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          First Lesson Done
                        </div>
                      </div>
                    )}
                    <button 
                      onClick={() => navigate('/certificates')}
                      className="w-10 h-10 rounded-full bg-app-bg border border-app-border flex items-center justify-center text-app-text-muted hover:text-app-text-main transition-colors"
                    >
                      <Award size={18} />
                    </button>
                  </div>
                  <div className="mt-6 p-4 bg-app-bg-alt rounded-2xl border border-app-border italic text-xs text-app-text-sub">
                    "Success is the sum of small efforts, repeated day in and day out."
                  </div>
               </div>
            </Card>

            {/* SECTION 7: OFFLINE & LOW DATA STATUS */}
            <Card className={`border shadow-xs p-6 ${isOffline ? 'bg-error/5 border-error/20' : 'bg-app-bg border-app-border'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                   {isOffline ? <WifiOff className="text-error" size={20} /> : <Wifi className="text-success" size={20} />}
                   <h3 className="text-sm font-black text-app-text-main uppercase tracking-widest">Offline Learning</h3>
                </div>
                {syncInProgress && <RefreshCw size={16} className="animate-spin text-app-text-muted" />}
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-app-text-sub font-medium">Ready for Offline:</span>
                  <span className="font-black text-app-text-main">{downloadedLessons.length} lessons</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-app-text-sub font-medium">Sync Status:</span>
                  <span className={`font-black ${isOffline ? 'text-error' : 'text-success'}`}>
                    {isOffline ? "Pending Sync" : "Up to date"}
                  </span>
                </div>

                {/* LOW DATA MODE INDICATOR */}
                <div className="p-3 bg-success/5 rounded-xl border border-success/10 flex flex-col gap-1">
                   <p className="text-[10px] font-black text-success uppercase tracking-widest flex items-center gap-1.5">
                      <Zap size={10} fill="currentColor" /> Low Data Mode Active
                   </p>
                   <p className="text-[9px] font-bold text-app-text-sub">Optimized for slow internet & low mobile data</p>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full text-[10px] py-3 rounded-xl uppercase tracking-widest font-black"
                  onClick={() => navigate('/lessons/uploaded')}
                >
                  Manage Downloads
                </Button>
              </div>
            </Card>

            {/* Quick Navigation Card */}
            <Card className="bg-app-bg border border-app-border p-6">
              <h4 className="text-[10px] font-black text-app-text-muted tracking-[0.2em] uppercase mb-4">Shortcuts</h4>
              <div className="grid grid-cols-2 gap-3">
                 <Link to="/ai-tutor" className="p-3 bg-app-bg border border-app-border rounded-xl flex flex-col items-center gap-2 hover:border-primary transition-all group">
                    <Sparkles size={20} className="text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black uppercase text-app-text-main">AI Tutor</span>
                 </Link>
                 <Link to="/lessons" className="p-3 bg-app-bg border border-app-border rounded-xl flex flex-col items-center gap-2 hover:border-success transition-all group">
                    <BookOpen size={20} className="text-success group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black uppercase text-app-text-main">Lessons</span>
                 </Link>
                 <Link to="/exams" className="p-3 bg-app-bg border border-app-border rounded-xl flex flex-col items-center gap-2 hover:border-secondary transition-all group">
                    <Award size={20} className="text-secondary group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black uppercase text-app-text-main">Exams</span>
                 </Link>
                 <Link to="/lessons/uploaded" className="p-3 bg-app-bg border border-app-border rounded-xl flex flex-col items-center gap-2 hover:border-amber-500 transition-all group">
                    <WifiOff size={20} className="text-amber-500 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black uppercase text-app-text-main">Offline</span>
                 </Link>
              </div>
            </Card>

            {/* TEACHER / PARENT INSIGHT (MINIMAL) */}
            <div className="p-4 bg-app-bg-alt rounded-2xl border border-app-border flex items-center gap-3">
               <div className="p-2 bg-app-text-muted/10 rounded-lg text-app-text-muted">
                  <FileBarChart size={16} />
               </div>
               <p className="text-[11px] font-bold text-app-text-sub">
                  Teacher Portal: <span className="text-success">Weekly progress report ready</span>
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

