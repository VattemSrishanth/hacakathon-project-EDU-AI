import { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  Zap,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Wifi,
  WifiOff,
  RefreshCw,
  Award,
  BookOpen,
  FileText,
  Clock,
  Sparkles,
  Lightbulb,
  Target,
  Trophy,
  BarChart2,
  Download,
  Shield,
  User,
  Globe,
  Hand,
  Type,
  Volume2
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import { useSettings } from '../context/SettingsContext';
import { useProgress } from '../context/ProgressContext';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useOffline } from '../context/OfflineContext';
import { syllabusAPI } from '../services/api';

// Vector 3D Graduation Cap on Stack of Books Illustration matching the reference design
const GraduationIllustration = () => (
  <svg
    viewBox="0 0 180 140"
    className="w-full h-full drop-shadow-md select-none"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Floating Stars / Sparkles */}
    <path d="M35 25L37 32L44 34L37 36L35 43L33 36L26 34L33 32L35 25Z" fill="white" opacity="0.9" />
    <path d="M155 18L156.5 23L162 24.5L156.5 26L155 31L153.5 26L148 24.5L153.5 23L155 18Z" fill="white" opacity="0.85" />
    <path d="M140 60L141.5 64L146 65.5L141.5 67L140 71L138.5 67L134 65.5L138.5 64L140 60Z" fill="white" opacity="0.75" />
    <circle cx="24" cy="55" r="1.5" fill="white" opacity="0.7" />
    <circle cx="165" cy="48" r="2" fill="white" opacity="0.6" />

    {/* Stack of Books with Mortarboard */}
    <g transform="translate(10, 10)">
      {/* Bottom Book - Gold / Amber */}
      <path d="M40 100L90 118L145 96L95 78L40 100Z" fill="#F59E0B" />
      <path d="M40 100L40 108L90 126L90 118L40 100Z" fill="#D97706" />
      <path d="M90 118L90 126L145 104L145 96L90 118Z" fill="#FDE68A" />
      <path d="M42 101L90 119L143 97" stroke="white" strokeWidth="1.5" opacity="0.8" />
      <path d="M42 104L90 122L143 100" stroke="white" strokeWidth="1.5" opacity="0.6" />

      {/* Middle Book - Cyan / Sky */}
      <path d="M45 86L95 104L140 84L90 66L45 86Z" fill="#0284C7" />
      <path d="M45 86L45 94L95 112L95 104L45 86Z" fill="#0369A1" />
      <path d="M95 104L95 112L140 92L140 84L95 104Z" fill="#7DD3FC" />
      <path d="M47 87L95 105L138 85" stroke="white" strokeWidth="1.5" opacity="0.8" />

      {/* Top Book - Royal Blue */}
      <path d="M50 72L95 88L132 72L87 56L50 72Z" fill="#2563EB" />
      <path d="M50 72L50 80L95 96L95 88L50 72Z" fill="#1D4ED8" />
      <path d="M95 88L95 96L132 80L132 72L95 88Z" fill="#93C5FD" />
      <path d="M52 73L95 89L130 73" stroke="white" strokeWidth="1.5" opacity="0.8" />

      {/* Mortarboard Cap Base */}
      <path d="M74 46C74 46 74 56 90 59C106 56 106 46 106 46" fill="#0F172A" />

      {/* Mortarboard Diamond Top */}
      <path d="M90 22L128 37L90 52L52 37L90 22Z" fill="#1E293B" />
      <path d="M90 22L128 37L90 39L52 37L90 22Z" fill="#334155" opacity="0.6" />

      {/* Gold Center Button on Cap */}
      <ellipse cx="90" cy="37" rx="3" ry="2" fill="#FBBF24" />

      {/* Gold Tassel String & Hanging Tassel */}
      <path d="M90 37Q114 39 123 52" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <path d="M123 52L121 66L125 66L123 52Z" fill="#F59E0B" />
      <circle cx="123" cy="53" r="2" fill="#FBBF24" />
    </g>
  </svg>
);

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
  const name = user?.name || user?.username || 'Demo Student';

  // State for browsing calendar months
  const [currentCalendarDate, setCurrentCalendarDate] = useState(() => new Date());

  const [activeSyllabus, setActiveSyllabus] = useState({ board: settings.learning.board, classes: {} });

  useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        const res = await syllabusAPI.getBoard(settings.learning.board);
        if (res.success && res.syllabus) {
          setActiveSyllabus(res.syllabus);
        } else {
          setActiveSyllabus({ board: settings.learning.board, classes: {} });
        }
      } catch (e) {
        setActiveSyllabus({ board: settings.learning.board, classes: {} });
      }
    };
    fetchSyllabus();
  }, [settings.learning.board]);

  useEffect(() => {
    let totalTopics = 0;
    try {
      const classes = activeSyllabus.classes || {};
      const grade = settings.learning.level.toString();

      if (classes[grade]) {
        const subjects = classes[grade].subjects;
        Object.keys(subjects).forEach((sub) => {
          subjects[sub].forEach((unit) => {
            totalTopics += (unit.topics || []).length;
          });
        });
      } else {
        Object.keys(classes).forEach((gradeKey) => {
          const subjects = classes[gradeKey].subjects;
          Object.keys(subjects).forEach((sub) => {
            subjects[sub].forEach((unit) => {
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

  // Derived metrics
  const percentage = getProgressPercentage();
  const timeData = getTimeSpentData();
  const completedCount = progress.lessonsCompleted.length;

  const lastLesson = useMemo(() => {
    return progress.activityLog.find((a) => a.type === 'lesson');
  }, [progress.activityLog]);

  // Calendar Calculation
  const calendarData = useMemo(() => {
    const now = new Date();
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0: Sun, 1: Mon...
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const activityDates = new Set(
      progress.activityLog.map((a) => new Date(a.timestamp).toDateString())
    );

    const days = [];
    // Previous month leading days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        active: false,
        isHighlighted: false
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateStr = new Date(year, month, d).toDateString();
      const isToday = d === now.getDate() && month === now.getMonth() && year === now.getFullYear();
      // Match reference day 22 highlight or actual today
      const isHighlighted = (year === 2026 && month === 9 && d === 22) || isToday;

      days.push({
        day: d,
        isCurrentMonth: true,
        active: activityDates.has(dateStr),
        isHighlighted
      });
    }

    // Trailing next month days (up to 35 slots for clean 5-row grid)
    const remainingSlots = 35 - days.length;
    if (remainingSlots > 0) {
      for (let d = 1; d <= remainingSlots; d++) {
        days.push({
          day: d,
          isCurrentMonth: false,
          active: false,
          isHighlighted: false
        });
      }
    }

    return {
      days,
      monthName: new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentCalendarDate),
      year
    };
  }, [currentCalendarDate, progress.activityLog]);

  const handlePrevMonth = () => {
    setCurrentCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 transition-colors duration-300">
      {/* SECTION: WELCOME HEADER */}
      <header className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-app-text-main tracking-tight flex items-center gap-2">
          <span>Welcome back,</span>
          <span className="text-blue-600 dark:text-blue-400">{name}!</span>
          <span role="img" aria-label="wave">👋</span>
        </h1>
        <p className="text-xs md:text-sm text-app-text-muted">
          Continue your learning journey with LearnBridge AI
        </p>
      </header>

      {/* MAIN TWO-COLUMN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: HERO, SUGGESTIONS, STUDY TIME & CALENDAR, ACCESSIBILITY (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. HERO BANNER: "Start your first lesson" */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 p-6 md:p-8 text-white shadow-lg shadow-indigo-500/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              
              {/* Left Content */}
              <div className="space-y-3.5 max-w-md">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider text-white">
                    GET STARTED
                  </span>
                  <span className="text-xs text-white/90 font-medium flex items-center gap-1.5">
                    <Star size={12} fill="currentColor" className="text-amber-300" />
                    Start your learning journey
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
                    {lastLesson ? lastLesson.label : "Start your first lesson"}
                  </h2>
                  <p className="text-xs md:text-sm text-white/80 mt-1 leading-relaxed">
                    {lastLesson 
                      ? `Continue topic: ${lastLesson.referenceId}` 
                      : "Use LearnBridge AI to learn, practice and improve with personalized study materials."}
                  </p>
                </div>

                <div className="pt-2 max-w-xs">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-white/80 mb-1">
                    <span>LEARNING PROGRESS</span>
                    <span>{percentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden backdrop-blur-xs">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-1000"
                      style={{ width: `${Math.max(percentage, 0)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Right Illustration & Button */}
              <div className="flex flex-col items-center md:items-end justify-center gap-3">
                <div className="w-36 h-28 md:w-44 md:h-32 flex items-center justify-center">
                  <GraduationIllustration />
                </div>

                <button
                  onClick={() => lastLesson ? navigate(`/lessons/${lastLesson.referenceId}`) : navigate('/lessons')}
                  className="bg-white hover:bg-slate-50 text-blue-600 font-bold text-xs md:text-sm px-6 py-2.5 rounded-full shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>{lastLesson ? "Resume Lesson" : "Start Learning"}</span>
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <ChevronRight size={13} strokeWidth={3} />
                  </div>
                </button>
              </div>

            </div>
          </div>

          {/* 2. AI STUDY SUGGESTIONS */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb size={18} className="text-amber-500 fill-amber-500" />
              <h3 className="text-sm font-bold text-app-text-main">AI Study Suggestions</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Suggestion 1: Next Topic */}
              <div
                onClick={() => navigate('/lessons')}
                className="bg-[#F0F8FF] dark:bg-sky-950/20 border border-[#E0F2FE] dark:border-sky-900/30 rounded-2xl p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-all group shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FileText size={16} />
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug truncate">
                    Next: Intro to Algebraic Equations
                  </p>
                </div>
                <ChevronRight size={15} className="text-blue-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </div>

              {/* Suggestion 2: Revision */}
              <div
                onClick={() => navigate('/lessons')}
                className="bg-[#FFF6F6] dark:bg-rose-950/20 border border-[#FEE2E2] dark:border-rose-900/30 rounded-2xl p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:border-rose-300 dark:hover:border-rose-700 transition-all group shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FileText size={16} />
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors leading-snug truncate">
                    Revise Rational Numbers
                  </p>
                </div>
                <ChevronRight size={15} className="text-rose-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </div>

              {/* Suggestion 3: Practice */}
              <div
                onClick={() => navigate('/lessons/quiz')}
                className="bg-[#F1FAF5] dark:bg-emerald-950/20 border border-[#DCFCE7] dark:border-emerald-900/30 rounded-2xl p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <BarChart2 size={16} />
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug truncate">
                    5 Questions to Improve accuracy
                  </p>
                </div>
                <ChevronRight size={15} className="text-emerald-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </section>

          {/* 3. TWO-COLUMN SUB-GRID: STUDY TIME THIS WEEK & CALENDAR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            
            {/* Study Time This Week */}
            <div className="bg-app-bg-alt border border-app-border rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 size={17} className="text-blue-500" />
                  <h3 className="text-sm font-bold text-app-text-main">Study Time This Week</h3>
                </div>

                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeData} margin={{ top: 12, right: 12, left: -22, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#E2E8F0'} />
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: isDark ? '#94A3B8' : '#64748B', fontSize: 11, fontWeight: '500' }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        ticks={[0, 60, 120]}
                        tickFormatter={(val) => `${val / 60}h`}
                        tick={{ fill: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }}
                        domain={[0, 120]}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                          borderColor: isDark ? '#334155' : '#E2E8F0',
                          fontSize: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                        }}
                        formatter={(value) => [`${value} mins`, 'Study Time']}
                      />
                      <Line
                        type="monotone"
                        dataKey="minutes"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', stroke: '#FFFFFF', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#2563EB' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bottom Tip */}
              <div className="mt-4 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-100/60 dark:border-blue-900/30 flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Target size={14} />
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Try a little every day for a long way!
                </p>
              </div>
            </div>

            {/* Monthly Calendar */}
            <div className="bg-app-bg-alt border border-app-border rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen size={17} className="text-blue-500" />
                    <h3 className="text-sm font-bold text-app-text-main">
                      {calendarData.monthName} {calendarData.year}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePrevMonth}
                      aria-label="Previous Month"
                      className="p-1 rounded-lg hover:bg-app-bg text-app-text-muted hover:text-app-text-main transition-colors cursor-pointer"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={handleNextMonth}
                      aria-label="Next Month"
                      className="p-1 rounded-lg hover:bg-app-bg text-app-text-muted hover:text-app-text-main transition-colors cursor-pointer"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                    <span key={idx} className="text-xs font-bold text-slate-400 py-1">
                      {day}
                    </span>
                  ))}
                </div>

                {/* Dates Grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {calendarData.days.map((item, idx) => (
                    <div key={idx} className="h-8 flex items-center justify-center">
                      <span
                        className={`text-xs w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
                          item.isHighlighted
                            ? 'bg-blue-600 text-white font-bold shadow-xs'
                            : item.isCurrentMonth
                            ? 'text-slate-800 dark:text-slate-200 font-medium hover:bg-blue-50 dark:hover:bg-slate-800'
                            : 'text-slate-300 dark:text-slate-600 font-normal'
                        }`}
                      >
                        {item.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calendar Footer Link */}
              <div
                onClick={() => navigate('/lessons')}
                className="mt-3 pt-3 border-t border-app-border/50 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Target size={14} className="text-blue-500" />
                  <span>Set a study goal for this month!</span>
                </div>
                <ChevronRight size={14} />
              </div>
            </div>

          </div>

          {/* 4. QUICK ACCESSIBILITY TOOLS */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap size={17} className="text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-app-text-main">Quick Accessibility Tools</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Sign Language */}
              <div
                onClick={toggleSignLanguage}
                className="bg-[#F0F8FF] dark:bg-sky-950/20 border border-[#E0F2FE] dark:border-sky-900/30 rounded-2xl p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-all group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Globe size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      Sign Language
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                      {signLanguageEnabled ? 'ON' : 'OFF'}
                    </p>
                  </div>
                </div>
                <ChevronRight size={15} className="text-blue-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </div>

              {/* Captions */}
              <div
                onClick={toggleCaptions}
                className="bg-[#F9F5FF] dark:bg-purple-950/20 border border-[#F3E8FF] dark:border-purple-900/30 rounded-2xl p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition-all group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Type size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      Captions
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                      {captionsEnabled ? 'ON' : 'OFF'}
                    </p>
                  </div>
                </div>
                <ChevronRight size={15} className="text-purple-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </div>

              {/* Speech Assist */}
              <div
                onClick={toggleSpeechAssist}
                className="bg-[#FFF6F6] dark:bg-rose-950/20 border border-[#FEE2E2] dark:border-rose-900/30 rounded-2xl p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:border-rose-300 dark:hover:border-rose-700 transition-all group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <Volume2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      Speech Assist
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                      {speechAssistEnabled ? 'ON' : 'OFF'}
                    </p>
                  </div>
                </div>
                <ChevronRight size={15} className="text-rose-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: LEARNING PULSE, ACHIEVEMENTS, OFFLINE LEARNING (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* 1. LEARNING PULSE (2x2 STATS GRID) */}
          <div className="bg-app-bg-alt border border-app-border rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 size={17} className="text-blue-500" />
              <h3 className="text-sm font-bold text-app-text-main">Learning Pulse</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Lessons Completed */}
              <div
                onClick={() => navigate('/lessons')}
                className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/60 dark:border-blue-900/30 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:border-blue-300 transition-all shadow-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <FileText size={16} />
                </div>
                <div>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-white leading-none">
                    {completedCount}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                    Lessons Completed
                  </p>
                </div>
              </div>

              {/* Assignments */}
              <div
                onClick={() => navigate('/assignments')}
                className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/60 dark:border-emerald-900/30 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:border-emerald-300 transition-all shadow-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-white leading-none">
                    3
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                    Assignments
                  </p>
                </div>
              </div>

              {/* Exams Taken */}
              <div
                onClick={() => navigate('/exams')}
                className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/60 dark:border-amber-900/30 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:border-amber-300 transition-all shadow-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Award size={16} />
                </div>
                <div>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-white leading-none">
                    {progress.quizScores?.length || 0}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                    Exams Taken
                  </p>
                </div>
              </div>

              {/* Certificates */}
              <div
                onClick={() => navigate('/certificates')}
                className="bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100/60 dark:border-purple-900/30 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:border-purple-300 transition-all shadow-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Trophy size={16} />
                </div>
                <div>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-white leading-none">
                    0
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                    Certificates
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. ACHIEVEMENTS */}
          <div className="bg-app-bg-alt border border-app-border rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={17} className="text-amber-500" />
              <h3 className="text-sm font-bold text-app-text-main">Achievements</h3>
            </div>

            <div className="py-5 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <Award size={26} strokeWidth={1.5} />
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                No achievements yet
              </h4>
              <p className="text-[11px] text-slate-400 max-w-[220px] mx-auto mt-1 leading-relaxed">
                Complete lessons, assignments or exams to earn badges and certificates.
              </p>
            </div>
          </div>

          {/* 3. OFFLINE LEARNING */}
          <div className="bg-app-bg-alt border border-app-border rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wifi size={17} className="text-emerald-500" />
                <h3 className="text-sm font-bold text-app-text-main">Offline Learning</h3>
              </div>
              <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Ready
              </span>
            </div>

            <div className="space-y-3">
              {/* Sync Status Row */}
              <div className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
                  <User size={15} />
                  <span>Sync Status</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                  <span className={`w-2 h-2 rounded-full ${isOffline ? 'bg-amber-500' : 'bg-amber-500'}`} />
                  <span>{isOffline ? "Pending Sync" : "Not Synced"}</span>
                </div>
              </div>

              {/* Downloaded Content Row */}
              <div className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
                  <Shield size={15} />
                  <span>Downloaded Content</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>{downloadedLessons.length} resources</span>
                </div>
              </div>

              {/* Sync Button */}
              <button
                onClick={() => navigate('/lessons/uploaded')}
                className="w-full mt-3 border border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl py-2.5 px-4 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {syncInProgress ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Download size={14} />
                )}
                <span>Sync for Offline Access</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
