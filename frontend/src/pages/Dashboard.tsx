import Card from '../components/Card';
import { useSettings } from '../context/SettingsContext';

const Dashboard = () => {
  const { settings, t } = useSettings();
  
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t.dashboard.title}</h1>
          <p className="text-gray-900 mt-2">{t.dashboard.subtitle}</p>
          <div className="mt-2 text-sm text-gray-600">
            {t.settings.learning.level}: {getLevelLabel(level)} | {t.settings.learning.contentPreference}: {contentPreference}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-primary">12</h3>
              <p className="text-gray-900">{t.dashboard.lessonsCompleted}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-secondary">8</h3>
              <p className="text-gray-900">{t.dashboard.certificatesEarned}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-primary">85%</h3>
              <p className="text-gray-900">{t.dashboard.progressRate}</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">{t.dashboard.recentActivity}</h2>
            <div className="space-y-4">
              {[
                t.dashboard.activities.completedMath,
                t.dashboard.activities.earnedBadge,
                t.dashboard.activities.startedEnglish,
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <p className="text-gray-900">{activity}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">{t.dashboard.learningGoals}</h2>
            <div className="space-y-4">
              {[
                { goal: t.dashboard.goals.completeLessons, progress: 60 },
                { goal: t.dashboard.goals.practiceAI, progress: 40 },
                { goal: t.dashboard.goals.achieveScore, progress: 75 },
              ].map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-900">{item.goal}</span>
                    <span className="text-gray-900">{item.progress}%</span>
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
    </div>
  );
};

export default Dashboard;
