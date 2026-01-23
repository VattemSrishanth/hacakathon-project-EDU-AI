import Card from '../components/Card';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-900 mt-2">Track your learning progress and achievements</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-primary">12</h3>
              <p className="text-gray-900">Lessons Completed</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-secondary">8</h3>
              <p className="text-gray-900">Certificates Earned</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-primary">85%</h3>
              <p className="text-gray-900">Progress Rate</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Recent Activity</h2>
            <div className="space-y-4">
              {[
                'Completed Mathematics Basics lesson',
                'Earned Science Explorer badge',
                'Started English Grammar module',
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <p className="text-gray-900">{activity}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Learning Goals</h2>
            <div className="space-y-4">
              {[
                { goal: 'Complete 5 lessons this week', progress: 60 },
                { goal: 'Practice AI tutor daily', progress: 40 },
                { goal: 'Achieve 90% in assessments', progress: 75 },
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
