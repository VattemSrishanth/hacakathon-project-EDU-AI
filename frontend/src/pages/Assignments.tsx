import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { 
  ListTodo, 
  Clock, 
  CheckCircle2, 
  ArrowLeft, 
  Calendar, 
  FileText,
  Layout
} from 'lucide-react';
import { userDataAPI } from '../services/api';

const Assignments = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = async () => {
    try {
      const data = await userDataAPI.getAssignments();
      if (data.success) {
        setAssignments(data.assignments);
      }
    } catch (err) {
      console.error('Failed to fetch assignments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleSubmit = async (assignmentId: string) => {
    try {
      const authData = localStorage.getItem('auth');
      if (!authData) return;
      
      // In a real app, this would send the update to the backend
      alert(`Assignment ${assignmentId} submitted successfully!`);
      
      // Refresh list
      fetchAssignments();
    } catch (e) {
      console.error('Submission failed', e);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg-alt py-12 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg shadow-primary/5">
              <ListTodo size={32} className="text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-app-text-main tracking-tight">Assignments</h1>
              <p className="text-app-text-sub font-bold uppercase tracking-widest text-[10px] mt-1">Track your academic tasks and deadlines</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/lessons')} className="w-fit flex items-center gap-2 font-black uppercase tracking-widest text-xs border-app-border bg-app-bg text-app-text-main hover:bg-app-bg-alt">
            <ArrowLeft size={16} /> Back to Learning
          </Button>
        </header>

        {loading ? (
          <div className="text-center py-20 text-app-text-sub font-black uppercase tracking-widest">Loading assignments...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {assignments.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-app-bg border border-app-border rounded-3xl text-app-text-sub font-bold italic">
                No assignments found. Great job!
              </div>
            ) : (
              assignments.map((assignment) => (
                <Card key={assignment.id} className="group relative flex flex-col h-full bg-app-bg border border-app-border rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-6">
                      <span className="px-3 py-1 bg-app-bg-alt rounded-lg text-[10px] font-black uppercase tracking-widest text-primary border border-primary/10">
                        {assignment.category}
                      </span>
                      {assignment.status === 'Submitted' ? (
                        <CheckCircle2 size={24} className="text-emerald-500" />
                      ) : (
                        <div className="animate-pulse text-amber-500">
                          <Clock size={24} />
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-black text-app-text-main tracking-tight mb-4 group-hover:text-primary transition-colors">
                      {assignment.title}
                    </h3>
                    
                    <div className="flex items-start gap-3 p-4 bg-app-bg-alt rounded-2xl border border-app-border mb-6">
                      <div className="shrink-0 mt-1 text-primary">
                        <FileText size={24} />
                      </div>
                      <p className="text-sm font-medium text-app-text-muted leading-relaxed">
                        {assignment.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-6 border-t border-app-border">
                    <div className="flex justify-between items-center px-2">
                      <div className="flex items-center gap-2 text-app-text-muted font-black uppercase tracking-widest text-[10px]">
                        <Calendar size={14} /> Due Date
                      </div>
                      <span className="text-sm font-black text-app-text-main">{assignment.dueDate}</span>
                    </div>

                    <div className="flex justify-between items-center px-2">
                      <div className="flex items-center gap-2 text-app-text-muted font-black uppercase tracking-widest text-[10px]">
                        <Layout size={14} /> Status
                      </div>
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                        assignment.status === 'Submitted' 
                          ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                          : 'bg-amber-500 text-white shadow-amber-500/20'
                      }`}>
                        {assignment.status}
                      </span>
                    </div>

                    {assignment.status === 'Pending' ? (
                      <Button 
                        variant="primary" 
                        onClick={() => handleSubmit(assignment.id)}
                        className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/25 mt-4"
                      >
                        Submit Project
                      </Button>
                    ) : (
                      <div className="w-full py-4 rounded-2xl bg-app-bg-alt border border-app-border text-app-text-muted font-black uppercase tracking-widest text-center text-xs mt-4">
                        Already Completed
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Assignments;
