import { useMemo, useEffect } from 'react';
import Card from '../components/Card';
import LoginTracker from '../components/LoginTracker';
import { useSettings } from '../context/SettingsContext';
import { useProgress } from '../context/ProgressContext';
import { useNavigate } from 'react-router-dom';

// Import all board syllabi for metrics
import ncertSyllabus from '../data/ncert_syllabus.json';
import telanganaSyllabus from '../data/telangana_syllabus.json';
import apSyllabus from '../data/andhra_pradesh_syllabus.json';

import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

import { 
  BookOpen, 
  Trophy,
  Clock, 
  Star, 
  Zap,
  FileText,
  ClipboardCheck,
  HelpCircle,
  TrendingUp,
  History
} from 'lucide-react';

const Dashboard = () => {
  const { settings, t, isDark } = useSettings();
  const { 
    progress, 
    getProgressPercentage, 
    getWeeklyActivity, 
    getTimeSpentData, 
    getQuizStats,
    setTotalLessons
  } = useProgress();
  const navigate = useNavigate();

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
      Object.keys(classes).forEach(grade => {
        const subjects = classes[grade].subjects;
        Object.keys(subjects).forEach(sub => {
          subjects[sub].forEach((unit: any) => {
            totalTopics += (unit.topics || []).length;
          });
        });
      });
    } catch (e) {
      totalTopics = 50; 
    }
    setTotalLessons(totalTopics);
  }, [activeSyllabus, setTotalLessons]);

  // Color System Constants - Unified Theme aware
  const COLORS = useMemo(() => {
    if (settings.themeAccessibility.theme === 'Harry Potter') {
      return {
        GREEN: '#d9b25f',   // Gold
        RED: '#740001',     // Gryffindor Red
        YELLOW: '#4a78c8',  // Ravenclaw Blue
        BLACK: '#e6dfd1',   // Light parchment
        GRAY: '#b5ad9a'
      };
    }
    if (settings.themeAccessibility.theme === 'Premium Dark') {
      return {
        GREEN: '#B45309',   // Copper
        RED: '#DC2626',     // Red
        YELLOW: '#7C3AED',  // Violet
        BLACK: '#f8fafc',   // Light slate
        GRAY: '#9CA3AF'
      };
    }
    return {
      GREEN: '#F59E0B',   // Good/Completed -> Amber
      RED: '#B91C1C',     // Low/Missing/Error -> Red
      YELLOW: '#6B7280',  // Neutral/Pending -> Gray
      BLACK: isDark ? '#FFFFFF' : '#000000',
      GRAY: isDark ? '#374151' : '#E5E7EB'
    };
  }, [settings.themeAccessibility.theme, isDark]);

  const percentage = getProgressPercentage();
  const weeklyData = getWeeklyActivity();
  const timeData = getTimeSpentData();
  const quizData = getQuizStats();

  const getProgressColor = (val: number) => {
    if (val > 70) return COLORS.GREEN;  // Amber
    if (val >= 30) return COLORS.YELLOW; // Gray
    return COLORS.RED;                    // Red
  };

  const { level, contentPreference } = settings.learning;

  const lastActivities = useMemo(() => progress.activityLog.slice(0, 3), [progress.activityLog]);
  const certificatesCount = Math.floor(progress.lessonsCompleted.length / 5);

  return (
    <div className="min-h-screen bg-app-bg py-12">
      <div className="dashboard-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-app-text-main tracking-tight uppercase">
                {t.dashboard.title}
              </h1>
              <p className="text-app-text-sub mt-2 text-lg font-medium">
                {t.dashboard.subtitle}
              </p>
            </div>
            <div className="flex items-center gap-4 bg-app-bg p-4 rounded-2xl border border-app-border">
              <div className="w-12 h-12 rounded-xl bg-app-text-main flex items-center justify-center text-app-bg">
                <Star size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-app-text-muted uppercase tracking-widest">
                  Learning Mode
                </p>
                <p className="text-app-text-main font-bold">
                  {level} • {contentPreference}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-app-bg border-2 border-app-border shadow-none">
                <div className="flex flex-col">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-white ${progress.lessonsCompleted.length > 0 ? 'bg-secondary' : 'bg-app-text-muted'}`}>
                    <BookOpen size={24} />
                  </div>
                  <h3 className="text-4xl font-black text-app-text-main">{progress.lessonsCompleted.length}</h3>
                  <p className="text-app-text-muted font-bold text-xs uppercase tracking-widest">{t.dashboard.lessonsCompleted}</p>
                </div>
              </Card>
              
              <Card className="bg-app-bg border-2 border-app-border shadow-none">
                <div className="flex flex-col">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-white ${certificatesCount > 0 ? 'bg-secondary' : 'bg-app-text-muted'}`}>
                    <Trophy size={24} />
                  </div>
                  <h3 className="text-4xl font-black text-app-text-main">{certificatesCount}</h3>
                  <p className="text-app-text-muted font-bold text-xs uppercase tracking-widest">Certificates</p>
                </div>
              </Card>

              <Card className="bg-app-bg border-2 border-app-border shadow-none">
                <div className="flex flex-col">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-white"
                    style={{ backgroundColor: getProgressColor(percentage) }}
                  >
                    <TrendingUp size={24} />
                  </div>
                  <h3 className="text-4xl font-black text-app-text-main">{percentage}%</h3>
                  <p className="text-app-text-muted font-bold text-xs uppercase tracking-widest">{t.dashboard.progressRate}</p>
                </div>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Consistency Line Chart */}
              <Card className="bg-app-bg border-2 border-app-border shadow-none min-h-100 flex flex-col" aria-label="Learning Consistency Weekly Chart">
                <h3 className="text-sm font-black text-app-text-muted mb-8 uppercase tracking-[0.2em] flex items-center gap-2">
                  <History size={18} /> Consistency
                </h3>
                <div className="flex-1 w-full pb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={COLORS.GRAY} />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: COLORS.GRAY, fontSize: 9, fontWeight: '900' }} 
                        tickFormatter={(str) => str.split('-').slice(2).join('/')}
                      />
                      <YAxis hide domain={[0, 'auto']} />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '12px', 
                          backgroundColor: isDark ? '#1f2937' : '#ffffff',
                          border: `2px solid ${isDark ? '#374151' : '#000000'}`, 
                          color: isDark ? '#ffffff' : '#000000',
                          boxShadow: 'none' 
                        }}
                      />
                      <Line 
                        type="stepAfter" 
                        dataKey="count" 
                        stroke={COLORS.BLACK} 
                        strokeWidth={3} 
                        dot={(props: any) => {
                          const { cx, cy, payload } = props;
                          const color = payload.count > 0 ? COLORS.GREEN : COLORS.RED;
                          return <circle cx={cx} cy={cy} r={5} fill={color} stroke="white" strokeWidth={2} />;
                        }}
                        activeDot={{ r: 7, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-auto pt-6 flex gap-6 text-[9px] font-black tracking-widest uppercase border-t border-app-border">
                  <span className="flex items-center gap-2 text-app-text-sub"><div className="w-2 h-2 rounded-full bg-secondary" /> Active Day</span>
                  <span className="flex items-center gap-2 text-app-text-sub"><div className="w-2 h-2 rounded-full bg-error" /> Inactive Day</span>
                </div>
              </Card>

              {/* Time Spent Bar Chart */}
              <Card className="bg-app-bg border-2 border-app-border shadow-none min-h-100 flex flex-col" aria-label="Time Spent Learning Bar Chart">
                <h3 className="text-sm font-black text-app-text-muted mb-8 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Clock size={18} /> Time Spent
                </h3>
                <div className="flex-1 w-full pb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={COLORS.GRAY} />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: COLORS.GRAY, fontSize: 10, fontWeight: '900' }} 
                      />
                      <YAxis hide />
                      <Tooltip cursor={{ fill: COLORS.GRAY, opacity: 0.1 }} />
                      <Bar dataKey="minutes" radius={[4, 4, 4, 4]} barSize={32}>
                        {timeData.map((entry, index) => {
                          let color = COLORS.RED;
                          if (entry.status === 'productive') color = COLORS.GREEN;
                          else if (entry.status === 'moderate') color = COLORS.YELLOW;
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-auto pt-6 flex flex-wrap gap-4 text-[9px] font-black tracking-widest uppercase border-t border-app-border">
                  <span className="flex items-center gap-1.5 text-app-text-sub"><div className="w-2 h-2 rounded-full bg-secondary" /> Productive</span>
                  <span className="flex items-center gap-1.5 text-app-text-sub"><div className="w-2 h-2 rounded-full bg-gray-500" /> Moderate</span>
                  <span className="flex items-center gap-1.5 text-app-text-sub"><div className="w-2 h-2 rounded-full bg-error" /> Low</span>
                </div>
              </Card>
            </div>

            {/* Quiz Performance */}
            <Card className="relative bg-app-bg border-2 border-app-border shadow-none overflow-hidden" aria-label="Quiz Performance Doughnut Chart">
               <div className="flex flex-col md:flex-row items-center gap-12">
                  <div className="relative h-64 w-64 shrink-0 mx-auto md:mx-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={quizData}
                          innerRadius={70}
                          outerRadius={90}
                          paddingAngle={8}
                          dataKey="value"
                          stroke="none"
                        >
                          <Cell fill={COLORS.GREEN} />
                          <Cell fill={COLORS.RED} />
                          <Cell fill={COLORS.YELLOW} />
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '12px', 
                            backgroundColor: isDark ? '#1f2937' : '#ffffff',
                            border: `2px solid ${isDark ? '#374151' : '#000000'}`, 
                            color: isDark ? '#ffffff' : '#000000',
                            boxShadow: 'none' 
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <p className="text-3xl font-black text-app-text-main leading-none uppercase">QUIZ</p>
                       <p className="text-[10px] font-black text-app-text-muted uppercase tracking-widest mt-1">STATS</p>
                    </div>
                  </div>
                  <div className="grow w-full space-y-4">
                    <h3 className="text-xl font-black text-app-text-main uppercase tracking-tight text-center md:text-left">Detailed Performance</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-3">
                      {quizData.map((item, i) => (
                        <div key={i} className="flex justify-between items-center p-4 bg-app-bg rounded-2xl border border-app-border group hover:border-app-text-main transition-all">
                           <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: [COLORS.GREEN, COLORS.RED, COLORS.YELLOW][i] }} />
                              <span className="font-bold text-app-text-main text-sm uppercase tracking-tight">{item.name}</span>
                           </div>
                           <span className="font-black text-app-text-main text-lg">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
               </div>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-8">
            {/* Recent Activity */}
            <Card className="bg-app-bg border-2 border-app-border shadow-none flex flex-col">
              <div className="flex items-center gap-2 mb-8 text-app-text-main">
                <Clock size={24} />
                <h2 className="text-xl font-black text-app-text-main tracking-tight uppercase">
                  Recent Activity
                </h2>
              </div>
              <div className="space-y-4 flex-1">
                {lastActivities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
                    <History size={48} className="text-app-text-muted mb-4" />
                    <p className="text-app-text-sub font-bold text-xs uppercase tracking-widest">
                      No recent activity
                    </p>
                  </div>
                ) : (
                  lastActivities.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 rounded-2xl border border-app-border bg-app-bg hover:border-app-text-main hover:shadow-lg transition-all group cursor-default">
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-app-bg border border-app-border flex items-center justify-center text-app-text-main group-hover:bg-app-text-main group-hover:text-app-bg transition-colors">
                        {activity.type === 'lesson' ? <BookOpen size={20} /> : 
                         activity.type === 'quiz' ? <ClipboardCheck size={20} /> : 
                         <Zap size={20} />}
                      </div>
                      <div className="grow min-w-0">
                        <p className="text-app-text-main font-black text-[10px] uppercase tracking-tight leading-tight truncate">{activity.label || activity.type}</p>
                        <p className="text-[9px] text-app-text-muted font-bold uppercase tracking-widest mt-1">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {lastActivities.length > 0 && (
                <button 
                  onClick={() => navigate('/notifications')}
                  className="w-full mt-8 pt-6 text-[10px] font-black text-app-text-muted hover:text-app-text-main uppercase tracking-widest transition-colors border-t border-app-border"
                >
                  View Full History
                </button>
              )}
            </Card>

            <LoginTracker />

            {/* Quick Access List */}
            <Card className="bg-app-bg border-2 border-app-border shadow-none">
              <h2 className="text-[10px] font-black text-app-text-muted tracking-[0.2em] uppercase mb-6">Explore Platform</h2>
              <div className="space-y-2">
                {[
                  { label: 'Exams & Assessments', icon: ClipboardCheck, to: '/exams', color: 'bg-primary' },
                  { label: 'Platform Reports', icon: FileText, to: '/reports', color: 'bg-secondary' },
                  { label: 'Getting Started', icon: HelpCircle, to: '/onboarding', color: 'bg-purple-900' }
                ].map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={() => navigate(item.to)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-transparent hover:border-app-text-main hover:bg-app-bg/50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl ${item.color} text-white group-hover:scale-110 transition-transform`}>
                        <item.icon size={16} />
                      </div>
                      <span className="text-[11px] font-black text-app-text-main uppercase tracking-tight">{item.label}</span>
                    </div>
                    <Star size={12} className="text-app-text-muted group-hover:text-app-text-main" />
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

