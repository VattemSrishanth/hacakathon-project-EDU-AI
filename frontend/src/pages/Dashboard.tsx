import { useEffect, useState, useMemo } from 'react';
import Card from '../components/Card';
import LoginTracker from '../components/LoginTracker';
import { useSettings } from '../context/SettingsContext';

// Import all board syllabi for metrics
import ncertSyllabus from '../data/ncert_syllabus.json';
import telanganaSyllabus from '../data/telangana_syllabus.json';
import apSyllabus from '../data/andhra_pradesh_syllabus.json';

import { 
  BookOpen, 
  ShieldCheck, 
  LineChart, 
  Clock, 
  CheckCircle2, 
  Star, 
  Zap,
  CircleHelp
} from 'lucide-react';

const Dashboard = () => {
  const { settings, t } = useSettings();

  // Select syllabus based on board setting
  const activeSyllabus = useMemo(() => {
    switch (settings.learning.board) {
      case 'Telangana': return telanganaSyllabus;
      case 'Andhra Pradesh': return apSyllabus;
      case 'NCERT':
      default: return ncertSyllabus;
    }
  }, [settings.learning.board]);
  
  const [lessonMetrics, setLessonMetrics] = useState({
    completed: 0,
    total: 10, // Default fallback
    percentage: 0,
    certificates: 0
  });

  const [lastQuiz, setLastQuiz] = useState<{ pdfName: string; score: number; total: number; submittedAt: string } | null>(null);
  
  const [goalsProgress, setGoalsProgress] = useState({
    lessons: 0,
    ai: 0,
    quiz: 0
  });
  
  useEffect(() => {
    // Calculate total lessons from active syllabus
    let totalTopics = 0;
    try {
      const classes = (activeSyllabus as any).classes;
      Object.keys(classes).forEach(grade => {
        const subjects = classes[grade].subjects;
        Object.keys(subjects).forEach(sub => {
          subjects[sub].forEach((unit: any) => {
            totalTopics += unit.topics.length;
          });
        });
      });
    } catch (e) {
      totalTopics = 50; // Fallback
    }

    try {
      const stored = localStorage.getItem('lesson_completion_tracker');
      if (stored) {
        const completedIds = JSON.parse(stored) as string[];
        const count = completedIds.length;
        const percentage = Math.round((count / totalTopics) * 100);
        setLessonMetrics({
          completed: count,
          total: totalTopics,
          percentage: percentage,
          certificates: Math.floor(count / 5) // Certificate every 5 lessons
        });
        setGoalsProgress(prev => ({ ...prev, lessons: Math.min(percentage * 5, 100) })); // Scaling for goal visibility
      } else {
        setLessonMetrics(prev => ({ ...prev, total: totalTopics }));
      }
    } catch (e) {
      console.error('Failed to load lesson metrics', e);
    }

    try {
      const quizRaw = localStorage.getItem('quiz_results');
      if (quizRaw) {
        const quizzes = JSON.parse(quizRaw) as { pdfName: string; score: number; total: number; submittedAt: string }[];
        if (quizzes.length > 0) {
          setLastQuiz(quizzes[0]);
          const bestScore = Math.max(...quizzes.map(q => (q.score / q.total) * 100));
          setGoalsProgress(prev => ({ ...prev, quiz: Math.round(bestScore) }));
        }
      }
    } catch (e) {
      console.error('Failed to load quiz results', e);
    }

    try {
      const chatSessionsRaw = localStorage.getItem('ai_chat_sessions');
      if (chatSessionsRaw) {
        const sessions = JSON.parse(chatSessionsRaw) as any[];
        const aiProg = Math.min(sessions.length * 33, 100); // 3 sessions for 100%
        setGoalsProgress(prev => ({ ...prev, ai: aiProg }));
      }
    } catch (e) {
      console.error('Failed to load AI sessions', e);
    }
  }, [activeSyllabus]);

  const { level, contentPreference } = settings.learning;
  
  const getLevelLabel = (lvl: string) => {
    switch (lvl) {
      case 'Beginner':
        return t.lessons.beginner;
      case 'Intermediate':
        return t.lessons.intermediate;
      case 'Advanced':
        return t.lessons.advanced;
      default:
        return lvl;
    }
  };

  return (
    <div className="min-h-screen bg-app-bg-alt py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-app-text-main tracking-tight">
                {t.dashboard.title}
              </h1>
              <p className="text-app-text-sub mt-2 text-lg font-medium">
                {t.dashboard.subtitle}
              </p>
            </div>
            <div className="flex items-center gap-4 bg-app-bg p-4 rounded-2xl border border-app-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Star size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-app-text-muted uppercase tracking-widest">
                  Active Goal
                </p>
                <p className="text-app-text-main font-bold">
                  {getLevelLabel(level)} • {contentPreference}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full transition-all group-hover:scale-110" />
                <div className="flex flex-col">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                    <BookOpen size={24} />
                  </div>
                  <h3 className="text-3xl font-black text-app-text-main">{lessonMetrics.completed}</h3>
                  <p className="text-app-text-sub font-bold text-sm">{t.dashboard.lessonsCompleted}</p>
                </div>
              </Card>
              
              <Card className="relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-secondary/5 rounded-bl-full transition-all group-hover:scale-110" />
                <div className="flex flex-col">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 text-secondary">
                    <ShieldCheck size={24} />
                  </div>
                  <h3 className="text-3xl font-black text-app-text-main">{lessonMetrics.certificates}</h3>
                  <p className="text-app-text-sub font-bold text-sm">{t.dashboard.certificatesEarned}</p>
                </div>
              </Card>

              <Card className="relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full transition-all group-hover:scale-110" />
                <div className="flex flex-col">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                    <LineChart size={24} />
                  </div>
                  <h3 className="text-3xl font-black text-app-text-main">{lessonMetrics.percentage}%</h3>
                  <p className="text-app-text-sub font-bold text-sm">{t.dashboard.progressRate}</p>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <Card>
                <div className="flex items-center gap-2 mb-6 text-primary">
                  <Clock size={24} />
                  <h2 className="text-xl font-black text-app-text-main tracking-tight">
                    {t.dashboard.recentActivity}
                  </h2>
                </div>
                <div className="space-y-6">
                  {[
                    { text: t.dashboard.activities.completedMath, icon: <CheckCircle2 size={20} className="text-green-500" /> },
                    { text: t.dashboard.activities.earnedBadge, icon: <Zap size={20} className="text-amber-500" /> },
                    { text: t.dashboard.activities.startedEnglish, icon: <BookOpen size={20} className="text-primary" /> },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-app-bg-alt transition-colors group">
                      <div className="shrink-0">{activity.icon}</div>
                      <p className="text-app-text-main font-bold text-sm grow">{activity.text}</p>
                      <div className="w-1.5 h-1.5 rounded-full bg-app-border group-hover:bg-primary transition-colors" />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Learning Goals */}
              <Card>
                <div className="flex items-center gap-2 mb-6 text-primary">
                  <Star size={24} />
                  <h2 className="text-xl font-black text-app-text-main tracking-tight">
                    {t.dashboard.learningGoals}
                  </h2>
                </div>
                <div className="space-y-6">
                  {[
                    { goal: t.dashboard.goals.completeLessons, progress: goalsProgress.lessons, color: 'bg-primary' },
                    { goal: t.dashboard.goals.practiceAI, progress: goalsProgress.ai, color: 'bg-secondary' },
                    { goal: t.dashboard.goals.achieveScore, progress: goalsProgress.quiz, color: 'bg-primary' },
                  ].map((item, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-app-text-main font-bold">{item.goal}</span>
                        <span className="text-app-text-sub font-black">{item.progress}%</span>
                      </div>
                      <div className="w-full bg-app-bg-alt rounded-full h-3 p-1 border border-app-border overflow-hidden">
                        <div
                          className={`${item.color} h-full rounded-full transition-all duration-1000 ease-out shadow-sm`}
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-1">
            {lastQuiz && (
              <Card className="mb-8">
                <div className="flex items-center gap-2 mb-4 text-primary">
                  <CircleHelp size={24} />
                  <h2 className="text-xl font-black text-app-text-main tracking-tight">Last Quiz</h2>
                </div>
                <div className="space-y-3">
                  <p className="text-app-text-main font-bold">{lastQuiz.pdfName}</p>
                  <p className="text-app-text-sub font-medium">Score: {lastQuiz.score}/{lastQuiz.total}</p>
                  <p className="text-xs font-black uppercase tracking-widest text-app-text-muted">
                    {new Date(lastQuiz.submittedAt).toLocaleString()}
                  </p>
                </div>
              </Card>
            )}
            <LoginTracker />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
