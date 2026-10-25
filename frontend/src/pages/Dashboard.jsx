import { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  Zap,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Wifi,
  RefreshCw,
  Award,
  BookOpen,
  FileText,
  Clock,
  Lightbulb,
  Target,
  Trophy,
  BarChart2,
  Download,
  Shield,
  User,
  Quote,
  Calculator,
  Hand,
  Mic
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

// Vector 3D Graduation Cap on Stack of Books with Play Tile and Floating Note Documents
const GraduationIllustration = () => (
  <svg
    viewBox="0 0 240 170"
    className="w-full h-full drop-shadow-xl select-none"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Floating Stars / Sparkles */}
    <path d="M42 24L44 31L51 33L44 35L42 42L40 35L33 33L40 31L42 24Z" fill="white" opacity="0.9" />
    <path d="M205 18L206.5 23L212 24.5L206.5 26L205 31L203.5 26L198 24.5L203.5 23L205 18Z" fill="white" opacity="0.85" />
    <path d="M120 72L121.5 76L126 77.5L121.5 79L120 83L118.5 79L114 77.5L118.5 76L120 72Z" fill="white" opacity="0.8" />
    <circle cx="28" cy="56" r="1.5" fill="white" opacity="0.7" />
    <circle cx="220" cy="48" r="2" fill="white" opacity="0.6" />

    {/* Floating Play Button Tile (Left) */}
    <g transform="translate(16, 52)">
      <rect x="0" y="0" width="38" height="38" rx="10" fill="#0284C7" transform="rotate(-10)" />
      <rect x="0" y="0" width="38" height="38" rx="10" fill="#38BDF8" opacity="0.95" transform="rotate(-10)" />
      <path d="M14 11L26 19L14 27Z" fill="white" transform="rotate(-10 19 19)" />
    </g>

    {/* Floating Note 1 (Top Blue Document) */}
    <g transform="translate(125, 14) rotate(16)">
      <rect width="24" height="30" rx="4" fill="#38BDF8" opacity="0.95" />
      <line x1="5" y1="8" x2="19" y2="8" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="5" y1="13" x2="17" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="5" y1="18" x2="13" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </g>

    {/* Floating Note 2 (Top-Right Pink Document) */}
    <g transform="translate(195, 20) rotate(-12)">
      <rect width="22" height="28" rx="4" fill="#F43F5E" opacity="0.9" />
      <line x1="5" y1="7" x2="17" y2="7" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="5" y1="12" x2="15" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="5" y1="17" x2="11" y2="17" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </g>

    {/* Stack of Books with Mortarboard */}
    <g transform="translate(56, 12)">
      {/* Bottom Book - Warm Gold / Amber */}
      <path d="M40 106L90 124L145 102L95 84L40 106Z" fill="#F59E0B" />
      <path d="M40 106L40 114L90 132L90 124L40 106Z" fill="#D97706" />
      <path d="M90 124L90 132L145 110L145 102L90 124Z" fill="#FDE68A" />
      <path d="M42 107L90 125L143 103" stroke="white" strokeWidth="1.5" opacity="0.8" />
      <path d="M42 110L90 128L143 106" stroke="white" strokeWidth="1.5" opacity="0.6" />

      {/* Middle Book - Pink / Magenta */}
      <path d="M45 92L95 110L140 90L90 72L45 92Z" fill="#E11D48" />
      <path d="M45 92L45 100L95 118L95 110L45 92Z" fill="#BE123C" />
      <path d="M95 110L95 118L140 98L140 90L95 110Z" fill="#FDA4AF" />
      <path d="M47 93L95 111L138 91" stroke="white" strokeWidth="1.5" opacity="0.8" />

      {/* Top Book - Royal Blue */}
      <path d="M50 78L95 94L132 78L87 62L50 78Z" fill="#2563EB" />
      <path d="M50 78L50 86L95 102L95 94L50 78Z" fill="#1D4ED8" />
      <path d="M95 94L95 102L132 86L132 78L95 94Z" fill="#93C5FD" />
      <path d="M52 79L95 95L130 79" stroke="white" strokeWidth="1.5" opacity="0.8" />

      {/* Mortarboard Cap Skull Base */}
      <path d="M74 52C74 52 74 62 90 65C106 62 106 52 106 52" fill="#0F172A" />

      {/* Mortarboard Diamond Top */}
      <path d="M90 28L128 43L90 58L52 43L90 28Z" fill="#1E293B" />
      <path d="M90 28L128 43L90 45L52 43L90 28Z" fill="#334155" opacity="0.6" />

      {/* Gold Center Button on Cap */}
      <ellipse cx="90" cy="43" rx="3.5" ry="2.2" fill="#FBBF24" />

      {/* Gold Tassel String & Hanging Tassel */}
      <path d="M90 43Q114 45 123 58" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <path d="M123 58L121 72L125 72L123 58Z" fill="#F59E0B" />
      <circle cx="123" cy="59" r="2" fill="#FBBF24" />
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
  const examsCount = progress.quizScores?.length || 2;

  const lastLesson = useMemo(() => {
    return progress.activityLog.find((a) => a.type === 'lesson');
  }, [progress.activityLog]);

  // Calendar Calculation
  const calendarData = useMemo(() => {
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
      // Match reference: day 22 highlighted in active month
      const isHighlighted = d === 22;

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
      
      {/* TOP ROW: WELCOME GREETING (8 COLS) + MOTIVATIONAL QUOTE (4 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Greeting */}
        <div className="lg:col-span-8 space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Welcome back,</span>
            <span className="text-blue-600 dark:text-blue-400">{name}!</span>
            <span role="img" aria-label="clapping hands">👏</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Continue your learning journey with LearnBridge AI
          </p>
        </div>

        {/* Right: Motivational Quote Card */}
        <div className="lg:col-span-4">
          <div className="bg-[#EFF6FF] dark:bg-blue-950/30 border border-[#DBEAFE] dark:border-blue-900/40 rounded-2xl p-3.5 flex items-center gap-3.5 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Quote size={18} fill="currentColor" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                “Small steps every day lead to big results.”
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Keep learning, keep growing!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: HERO, SUGGESTIONS, STUDY TIME & CALENDAR, ACCESSIBILITY (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. HERO BANNER: "Start your first lesson" */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-600 p-6 md:p-8 text-white shadow-lg shadow-indigo-500/15">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              
              {/* Left Content */}
              <div className="space-y-3.5 max-w-md">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider text-white">
                    GET STARTED
                  </span>
                  <span className="text-xs text-white/95 font-medium flex items-center gap-1.5">
                    <Star size={13} className="text-amber-300 fill-amber-300" />
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
              <div className="flex flex-col items-center md:items-end justify-center gap-2">
                <div className="w-44 h-32 md:w-56 md:h-40 flex items-center justify-center">
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb size={18} className="text-amber-500 fill-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Study Suggestions</h3>
              </div>
              <button
                onClick={() => navigate('/ai-tutor')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                View All <ChevronRight size={13} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Suggestion 1: Next Topic */}
              <div
                onClick={() => navigate('/lessons')}
                className="bg-[#F0F8FF] dark:bg-blue-950/40 border border-[#E0F2FE] dark:border-blue-900/50 rounded-2xl p-4 flex items-center justify-between gap-3 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-all group shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <BookOpen size={16} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                      Next: Intro to Algebraic Equations
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-300 mt-0.5">
                      Based on your learning goals
                    </p>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full border border-blue-200 dark:border-blue-800 text-blue-500 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <ArrowRight size={12} />
                </div>
              </div>

              {/* Suggestion 2: Revision */}
              <div
                onClick={() => navigate('/lessons')}
                className="bg-[#FFF5F5] dark:bg-rose-950/40 border border-[#FEE2E2] dark:border-rose-900/50 rounded-2xl p-4 flex items-center justify-between gap-3 cursor-pointer hover:border-rose-300 dark:hover:border-rose-700 transition-all group shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Calculator size={16} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors leading-snug">
                      Revise Rational Numbers
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-300 mt-0.5">
                      Strengthen your basics
                    </p>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full border border-rose-200 dark:border-rose-800 text-rose-500 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:bg-rose-500 group-hover:text-white transition-all">
                  <ArrowRight size={12} />
                </div>
              </div>

              {/* Suggestion 3: Practice */}
              <div
                onClick={() => navigate('/lessons/quiz')}
                className="bg-[#F0FDF4] dark:bg-emerald-950/40 border border-[#DCFCE7] dark:border-emerald-900/50 rounded-2xl p-4 flex items-center justify-between gap-3 cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <BarChart2 size={16} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                      5 Questions to Improve accuracy
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-300 mt-0.5">
                      Practice recommended for you
                    </p>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full border border-emerald-200 dark:border-emerald-800 text-emerald-500 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <ArrowRight size={12} />
                </div>
              </div>
            </div>
          </section>

          {/* 3. TWO-COLUMN SUB-GRID: STUDY TIME THIS WEEK & CALENDAR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            
            {/* Study Time This Week */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart2 size={17} className="text-blue-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Study Time This Week</h3>
                  </div>
                  <button
                    onClick={() => navigate('/insights')}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    View Details <ChevronRight size={13} />
                  </button>
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

              {/* Bottom Tip with Clock Icon */}
              <div className="mt-4 p-3 rounded-xl bg-[#F0F8FF] dark:bg-blue-950/40 border border-[#E0F2FE] dark:border-blue-900/50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    Try a little every day for a long way!
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-300 mt-0.5">
                    Consistency leads to success.
                  </p>
                </div>
              </div>
            </div>

            {/* Monthly Calendar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen size={17} className="text-blue-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {calendarData.monthName} {calendarData.year}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePrevMonth}
                      aria-label="Previous Month"
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={handleNextMonth}
                      aria-label="Next Month"
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                    >
                      <ChevronRight size={14} />
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
                className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs cursor-pointer group transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Target size={14} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                      Set a study goal for this month!
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Stay consistent and achieve more.
                    </p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

          </div>

          {/* 4. QUICK ACCESSIBILITY TOOLS */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap size={17} className="text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Quick Accessibility Tools</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Sign Language */}
              <div
                onClick={toggleSignLanguage}
                className="bg-[#F0F8FF] dark:bg-blue-950/40 border border-[#E0F2FE] dark:border-blue-900/50 rounded-2xl p-4 flex items-center justify-between gap-3 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-all group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Hand size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      Sign Language
                    </h4>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold mt-0.5">
                      {signLanguageEnabled ? 'ON' : 'OFF'}
                    </p>
                  </div>
                </div>
                <ChevronRight size={15} className="text-blue-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </div>

              {/* Captions */}
              <div
                onClick={toggleCaptions}
                className="bg-[#FAF5FF] dark:bg-purple-950/40 border border-[#F3E8FF] dark:border-purple-900/50 rounded-2xl p-4 flex items-center justify-between gap-3 cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition-all group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 font-bold text-xs tracking-tighter shadow-xs">
                    CC
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      Captions
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-300 font-semibold mt-0.5">
                      {captionsEnabled ? 'ON' : 'OFF'}
                    </p>
                  </div>
                </div>
                <ChevronRight size={15} className="text-purple-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </div>

              {/* Speech Assist */}
              <div
                onClick={toggleSpeechAssist}
                className="bg-[#FFF5F5] dark:bg-rose-950/40 border border-[#FEE2E2] dark:border-rose-900/50 rounded-2xl p-4 flex items-center justify-between gap-3 cursor-pointer hover:border-rose-300 dark:hover:border-rose-700 transition-all group shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <Mic size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 leading-tight">
                      Speech Assist
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-300 font-semibold mt-0.5">
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart2 size={17} className="text-blue-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Learning Pulse</h3>
              </div>
              <button
                onClick={() => navigate('/insights')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                View Details <ChevronRight size={13} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Lessons Completed */}
              <div
                onClick={() => navigate('/lessons')}
                className="bg-[#F0F8FF] dark:bg-blue-950/30 border border-[#E0F2FE] dark:border-blue-900/40 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:border-blue-300 transition-all shadow-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <BookOpen size={16} />
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
                className="bg-[#F0FDF4] dark:bg-emerald-950/30 border border-[#DCFCE7] dark:border-emerald-900/40 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:border-emerald-300 transition-all shadow-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <FileText size={16} />
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
                className="bg-[#FFFBEB] dark:bg-amber-950/30 border border-[#FEF3C7] dark:border-amber-900/40 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:border-amber-300 transition-all shadow-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Award size={16} />
                </div>
                <div>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-white leading-none">
                    {examsCount}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                    Exams Taken
                  </p>
                </div>
              </div>

              {/* Certificates */}
              <div
                onClick={() => navigate('/certificates')}
                className="bg-[#FAF5FF] dark:bg-purple-950/30 border border-[#F3E8FF] dark:border-purple-900/40 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:border-purple-300 transition-all shadow-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy size={17} className="text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Achievements</h3>
              </div>
              <button
                onClick={() => navigate('/certificates')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                View All <ChevronRight size={13} />
              </button>
            </div>

            <div className="py-6 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <Award size={26} strokeWidth={1.5} />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                No achievements yet
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[220px] mx-auto mt-1 leading-relaxed">
                Complete lessons, assignments or exams to earn badges and certificates.
              </p>
            </div>
          </div>

          {/* 3. OFFLINE LEARNING */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wifi size={17} className="text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Offline Learning</h3>
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
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
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

              {/* Footer Subtext */}
              <p className="text-[10px] text-slate-400 text-center pt-1">
                Access your materials anytime, anywhere.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
