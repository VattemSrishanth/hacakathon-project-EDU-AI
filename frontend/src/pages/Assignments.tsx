import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import Card from '../components/Card';
import Button from '../components/Button';

const Assignments = () => {
  const navigate = useNavigate();
  useSettings();

  const sampleAssignments = [
    {
      id: 1,
      title: 'Mathematics: Algebra Basics',
      description: 'Solve the first 10 problems in the Algebra workbook. Focus on linear equations and variables.',
      dueDate: 'Jan 30, 2026',
      status: 'Pending'
    },
    {
      id: 2,
      title: 'Science: Ecosystems Report',
      description: 'Write a short report on the local ecosystem. Mention 3 native plants and animals.',
      dueDate: 'Feb 05, 2026',
      status: 'Submitted'
    },
    {
      id: 3,
      title: 'English: Narrative Essay',
      description: 'Write a 200-word story about a personal experience using the past tense correctly.',
      dueDate: 'Feb 10, 2026',
      status: 'Pending'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
            <p className="text-gray-600 mt-2">Track your academic tasks and deadlines here.</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/lessons')} className="w-fit">
            Back to Lessons
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleAssignments.map((assignment) => (
            <Card key={assignment.id} className="popup-interactive flex flex-col h-full border border-gray-100">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{assignment.title}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4 italic">{assignment.description}</p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium font-bold uppercase tracking-wider text-[10px]">Due Date</span>
                  <span className="text-gray-900 font-semibold">{assignment.dueDate}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium font-bold uppercase tracking-wider text-[10px]">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    assignment.status === 'Submitted' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {assignment.status}
                  </span>
                </div>
                {assignment.status === 'Pending' ? (
                  <Button variant="primary" className="w-full mt-2 py-2 text-sm">
                    Submit Now
                  </Button>
                ) : (
                  <Button variant="outline" disabled className="w-full mt-2 py-2 text-sm border-gray-200 text-gray-400">
                    Completed
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Assignments;
