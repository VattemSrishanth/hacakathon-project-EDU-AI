import { useEffect, useState } from 'react';
import Card from '../components/Card';
import LoginTracker from '../components/LoginTracker';
import { useSettings } from '../context/SettingsContext';

const Dashboard = () => {
  const { settings, t } = useSettings();
  
  /**
   * LESSON PROGRESS SYSTEM (Independent)
   * Tracks academic metrics based strictly on completed lesson IDs.
   * Does not depend on login frequency or engagement streaks.
   */
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

  /**
   * LOGIN PROGRESS SYSTEM (Independent)
   * Handled by the <LoginTracker /> component.
   * Tracks daily engagement streaks starting from join date.
   * Does not affect or depend on lesson completion data.
   */

  // Get learning preferences
  const { level, contentPreference } = settings.learning;
  
  // Translate level
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
    <div className="min-h-screen bg-app-bg-alt py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-app-text-main">{t.dashboard.title}</h1>
          <p className="text-app-text-main mt-2">{t.dashboard.subtitle}</p>
          <div className="mt-2 text-sm text-app-text-sub">
            {t.settings.learning.level}: {getLevelLabel(level)} | {t.settings.learning.contentPreference}: {contentPreference}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-primary">{lessonMetrics.completed}</h3>
                  <p className="text-app-text-main">{t.dashboard.lessonsCompleted}</p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-secondary">{lessonMetrics.certificates}</h3>
                  <p className="text-app-text-main">{t.dashboard.certificatesEarned}</p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-primary">{lessonMetrics.percentage}%</h3>
                  <p className="text-app-text-main">{t.dashboard.progressRate}</p>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <h2 className="text-xl font-semibold mb-4 text-app-text-main">{t.dashboard.recentActivity}</h2>
                <div className="space-y-4">
                  {[
                    t.dashboard.activities.completedMath,
                    t.dashboard.activities.earnedBadge,
                    t.dashboard.activities.startedEnglish,
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <p className="text-app-text-main">{activity}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h2 className="text-xl font-semibold mb-4 text-app-text-main">{t.dashboard.learningGoals}</h2>
                <div className="space-y-4">
                  {[
                    { goal: t.dashboard.goals.completeLessons, progress: 60 },
                    { goal: t.dashboard.goals.practiceAI, progress: 40 },
                    { goal: t.dashboard.goals.achieveScore, progress: 75 },
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-2">
                        <span className="text-app-text-main">{item.goal}</span>
                        <span className="text-app-text-main">{item.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
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
