import { useEffect, useState } from 'react';
import Card from '../components/Card';
import LoginTracker from '../components/LoginTracker';
import { useSettings } from '../context/SettingsContext';
import { 
  BookOpen, 
  Award, 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  Target,
  Zap
} from 'lucide-react';

const Dashboard = () => {
  const { settings, t } = useSettings();
  
  const [lessonMetrics, setLessonMetrics] = useState({
    completed: 0,
    total: 8, 
    percentage: 0,
    certificates: 0
  });
  
  useEffect(() => {
    try {
      const stored = localStorage.getItem('lesson_completion_tracker');
      if (stored) {
        const completedIds = JSON.parse(stored) as string[];
        const count = completedIds.length;
        const total = 8; 
        setLessonMetrics({
          completed: count,
          total: total,
          percentage: Math.round((count / total) * 100),
          certificates: Math.floor(count / 3) 
        });
      }
    } catch (e) {
      console.error('Failed to load lesson metrics', e);
    }
  }, []);

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
                <Target size={24} />
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
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <BookOpen size={20} />
                  </div>
                  <h3 className="text-3xl font-black text-app-text-main">{lessonMetrics.completed}</h3>
                  <p className="text-app-text-sub font-bold text-sm">{t.dashboard.lessonsCompleted}</p>
                </div>
              </Card>
              
              <Card className="relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-secondary/5 rounded-bl-full transition-all group-hover:scale-110" />
                <div className="flex flex-col">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-4">
                    <Award size={20} />
                  </div>
                  <h3 className="text-3xl font-black text-app-text-main">{lessonMetrics.certificates}</h3>
                  <p className="text-app-text-sub font-bold text-sm">{t.dashboard.certificatesEarned}</p>
                </div>
              </Card>

              <Card className="relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full transition-all group-hover:scale-110" />
                <div className="flex flex-col">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <BarChart3 size={20} />
                  </div>
                  <h3 className="text-3xl font-black text-app-text-main">{lessonMetrics.percentage}%</h3>
                  <p className="text-app-text-sub font-bold text-sm">{t.dashboard.progressRate}</p>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <Card>
                <div className="flex items-center gap-2 mb-6">
                  <Clock size={20} className="text-primary" />
                  <h2 className="text-xl font-black text-app-text-main tracking-tight">
                    {t.dashboard.recentActivity}
                  </h2>
                </div>
                <div className="space-y-6">
                  {[
                    { text: t.dashboard.activities.completedMath, icon: <CheckCircle2 className="text-green-500" size={18} /> },
                    { text: t.dashboard.activities.earnedBadge, icon: <Zap className="text-yellow-500" size={18} /> },
                    { text: t.dashboard.activities.startedEnglish, icon: <BookOpen className="text-primary" size={18} /> },
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
                <div className="flex items-center gap-2 mb-6">
                  <Target size={20} className="text-secondary" />
                  <h2 className="text-xl font-black text-app-text-main tracking-tight">
                    {t.dashboard.learningGoals}
                  </h2>
                </div>
                <div className="space-y-6">
                  {[
                    { goal: t.dashboard.goals.completeLessons, progress: 60, color: 'bg-primary' },
                    { goal: t.dashboard.goals.practiceAI, progress: 40, color: 'bg-secondary' },
                    { goal: t.dashboard.goals.achieveScore, progress: 75, color: 'bg-primary' },
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
            <LoginTracker />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
