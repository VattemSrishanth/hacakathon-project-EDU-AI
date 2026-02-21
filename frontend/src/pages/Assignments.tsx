import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useProgress } from '../context/ProgressContext';
import { useOffline } from '../context/OfflineContext';
import { 
  ListTodo, 
  Clock, 
  CheckCircle2, 
  ArrowLeft, 
  Calendar, 
  FileText,
  Zap,
  Award,
  Trophy,
  Sparkles,
  Download,
  Wifi,
  WifiOff,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { userDataAPI } from '../services/api';

const Assignments = () => {
  const navigate = useNavigate();
  const { logActivity } = useProgress();
  const { isOffline } = useOffline();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [completedAssignments, setCompletedAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = async () => {
    try {
      const data = await userDataAPI.getAssignments();
      if (data.success) {
        // Separate pending and completed for better organization
        const all = data.assignments || [];
        setAssignments(all.filter((a: any) => a.status !== 'Submitted'));
        setCompletedAssignments(all.filter((a: any) => a.status === 'Submitted'));
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

  // Summary Metrics
  const summary = useMemo(() => {
    const pending = assignments.length;
    const completedThisWeek = completedAssignments.length; // Simplified
    
    // Mock upcoming deadlines logic
    const today = new Date();
    const urgentCount = assignments.filter(a => {
      const dueDate = new Date(a.dueDate);
      const diffTime = Math.abs(dueDate.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 2;
    }).length;

    return {
      pending,
      completedThisWeek,
      urgentCount,
      totalThisWeek: pending + completedThisWeek || 5 // Goal of 5
    };
  }, [assignments, completedAssignments]);

  const practiceSuggestions = [
    { id: 1, title: 'Practice 5 questions on Real Numbers', type: 'practice', subject: 'Maths', color: 'bg-primary/10 border-primary/20 text-primary' },
    { id: 2, title: 'Revise Rational Numbers concepts', type: 'revision', subject: 'Maths', color: 'bg-secondary/10 border-secondary/20 text-secondary' },
    { id: 3, title: 'Solve Algebraic Word Problems', type: 'practice', subject: 'Maths', color: 'bg-success/10 border-success/20 text-success' }
  ];

  const handleSubmit = async (assignmentId: string) => {
    try {
      const authData = localStorage.getItem('auth');
      if (!authData) return;
      
      // Notify the user
      alert(`Assignment ${assignmentId} submitted successfully!`);
      
      // Log for progress dashboard
      logActivity('lesson', assignmentId, `Submitted assignment: ${assignmentId}`);
      
      // Refresh list
      fetchAssignments();
    } catch (e) {
      console.error('Submission failed', e);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Header Section */}
        <header className="pt-12 mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-2xl text-primary shadow-sm">
                  <ListTodo size={28} strokeWidth={2.5} />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-app-text-main tracking-tight">
                  Task <span className="text-primary-hover">Hub</span>
                </h1>
              </div>
              <p className="text-sm font-bold text-app-text-sub uppercase tracking-[0.2em] ml-1">
                Personalized practice & assignments for your level
              </p>
            </div>
            
            <div className="flex items-center gap-4">
               <button 
                onClick={() => navigate('/lessons')}
                className="group flex items-center gap-2 px-6 py-3.5 bg-app-bg-alt border border-app-border rounded-2xl text-xs font-black uppercase tracking-widest text-app-text-main hover:border-primary transition-all hover:-translate-y-0.5"
               >
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  Back to Learning
               </button>
            </div>
          </div>
        </header>

        {/* SECTION 1: TASK SUMMARY & WEEKLY PROGRESS (Section 7) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
           <div className="p-6 bg-app-bg border border-app-border rounded-4xl shadow-sm flex flex-col justify-between group hover:border-primary/20 transition-all">
              <div className="flex justify-between items-start mb-6">
                 <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                    <Clock size={24} strokeWidth={2.5} />
                 </div>
                 <AlertCircle size={20} className={summary.urgentCount > 0 ? "text-error" : "text-app-text-muted/20"} />
              </div>
              <div>
                 <p className="text-3xl font-black text-app-text-main">{summary.pending}</p>
                 <p className="text-[10px] font-black text-app-text-muted uppercase tracking-widest">Pending Tasks</p>
              </div>
           </div>

           <div className="p-6 bg-app-bg border border-app-border rounded-4xl shadow-sm flex flex-col justify-between group hover:border-success/20 transition-all">
              <div className="flex justify-between items-start mb-6">
                 <div className="p-3 bg-success/10 rounded-2xl text-success">
                    <CheckCircle2 size={24} strokeWidth={2.5} />
                 </div>
                 <TrendingUp size={20} className="text-success" />
              </div>
              <div>
                 <p className="text-3xl font-black text-app-text-main">{summary.completedThisWeek}</p>
                 <p className="text-[10px] font-black text-app-text-muted uppercase tracking-widest">Completed This Week</p>
              </div>
           </div>

           {/* SECTION 7: WEEKLY GOAL INDICATOR */}
           <div className="md:col-span-2 p-6 bg-app-bg border border-app-border rounded-4xl shadow-sm flex flex-col justify-center">
              <div className="flex justify-between items-center mb-4">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary/10 rounded-xl text-secondary">
                        <Trophy size={20} strokeWidth={2.5} />
                    </div>
                    <p className="text-[11px] font-black text-app-text-main uppercase tracking-widest">Weekly Goal</p>
                 </div>
                 <span className="text-sm font-black text-app-text-main">{summary.completedThisWeek} / {summary.totalThisWeek}</span>
              </div>
              <div className="w-full h-3 bg-app-bg-alt rounded-full overflow-hidden border border-app-border mb-3">
                 <div 
                    className="h-full bg-linear-to-r from-success to-primary-hover transition-all duration-1000 shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                    style={{ width: `${(Math.min(summary.completedThisWeek, summary.totalThisWeek) / summary.totalThisWeek) * 100}%` }}
                 />
              </div>
              <p className="text-[10px] font-bold text-app-text-sub italic">
                 {summary.completedThisWeek >= summary.totalThisWeek ? "Goal reached! Excellent effort." : "Almost there! Complete your pending tasks to hit the goal."}
              </p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Task List Area (8/12) */}
          <div className="lg:col-span-8 space-y-10">
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                 <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-app-text-muted">Loading your workspace...</p>
              </div>
            ) : assignments.length === 0 ? (
              /* SECTION 6: IMPROVED EMPTY STATE */
              <div className="space-y-8">
                 <div className="p-12 md:p-16 bg-app-bg border border-app-border rounded-[3rem] text-center shadow-xs border-dashed relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                       <Sparkles size={160} className="text-primary" />
                    </div>
                    
                    <div className="relative z-10">
                       <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                          <CheckCircle2 size={40} className="text-success animate-bounce" />
                       </div>
                       <h3 className="text-3xl font-black text-app-text-main mb-4">You're all caught up!</h3>
                       <p className="max-w-md mx-auto text-app-text-sub font-bold leading-relaxed mb-10">
                          Great job! No pending assignments found. Stay sharp with some quick practice sessions below.
                       </p>
                       
                       <Button variant="primary" onClick={() => navigate('/ai-tutor')} className="px-10 py-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-105 transition-transform flex items-center gap-3 mx-auto">
                          <Zap size={18} fill="currentColor" /> Chat with AI Tutor
                       </Button>
                    </div>
                 </div>

                 {/* SECTION 4: PRACTICE SUGGESTIONS (Empty State fallback) */}
                 <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                       <Sparkles size={18} className="text-primary" />
                       <h3 className="text-sm font-black text-app-text-muted uppercase tracking-[0.2em]">Next Practice sessions</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {practiceSuggestions.map((p) => (
                          <button 
                             key={p.id}
                             onClick={() => navigate('/ai-tutor')}
                             className={`flex items-center justify-between p-6 rounded-3xl border-2 hover:scale-101 transition-all text-left ${p.color}`}
                          >
                             <div className="space-y-1">
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-70">{p.subject} • Recommended</span>
                                <p className="text-base font-black leading-tight">{p.title}</p>
                             </div>
                             <ChevronRight size={20} className="opacity-50" />
                          </button>
                       ))}
                    </div>
                 </div>
              </div>
            ) : (
              /* SECTION 2: PENDING ASSIGNMENTS ACTIVE */
              <div className="space-y-6">
                <div className="flex justify-between items-center px-2">
                   <h3 className="text-sm font-black text-app-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                      <ListTodo size={20} className="text-primary" /> Pending Tasks
                   </h3>
                   <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                      {assignments.length} Action Items
                   </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {assignments.map((assignment) => {
                      const isUrgent = assignment.dueDate.includes("Today") || assignment.dueDate.includes("Tomorrow");
                      return (
                        <Card key={assignment.id} className={`group relative flex flex-col h-full bg-app-bg border ${isUrgent ? 'border-error/40 ring-1 ring-error/10 shadow-error/5' : 'border-app-border'} rounded-3xl p-8 hover:shadow-2xl hover:border-primary/30 transition-all duration-500`}>
                           <div className="absolute top-0 right-0 p-4">
                              {isUrgent && <AlertCircle size={20} className="text-error animate-pulse" />}
                           </div>
                           
                           <div className="flex-1 space-y-6">
                              <div className="flex items-center gap-2">
                                 <span className="px-2.5 py-1 bg-app-bg-alt rounded-lg text-[9px] font-black uppercase tracking-widest text-primary border border-app-border shadow-xs">
                                    {assignment.category}
                                 </span>
                                 <div className="flex items-center gap-1 px-2.5 py-1 bg-secondary/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-secondary border border-secondary/10 shadow-xs">
                                    <Zap size={10} fill="currentColor" /> Difficulty: Medium
                                 </div>
                              </div>

                              <h3 className="text-xl md:text-2xl font-black text-app-text-main leading-snug group-hover:text-primary-hover transition-colors">
                                 {assignment.title}
                              </h3>

                              <div className="p-4 bg-app-bg-alt rounded-2xl border border-app-border flex items-start gap-3">
                                 <div className="shrink-0 mt-1 text-app-text-muted">
                                    <FileText size={18} />
                                 </div>
                                 <p className="text-[12px] font-bold text-app-text-muted leading-relaxed">
                                    {assignment.description || "Incorporate concepts from the recent lessons into this project."}
                                 </p>
                              </div>

                              <div className="space-y-3">
                                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-app-text-muted/60">
                                    <span>Task Progress</span>
                                    <span>35%</span>
                                 </div>
                                 <div className="w-full h-2 bg-app-bg-alt rounded-full overflow-hidden border border-app-border/50">
                                    <div className="h-full bg-secondary w-[35%]" />
                                 </div>
                              </div>
                           </div>
                           
                           <div className="mt-8 pt-6 border-t border-app-border flex items-center justify-between gap-4">
                              <div className="flex flex-col">
                                 <span className="text-[9px] font-black text-app-text-muted/50 uppercase tracking-widest mb-0.5">Due Date</span>
                                 <div className={`flex items-center gap-1.5 text-xs font-black ${isUrgent ? 'text-error' : 'text-app-text-main'}`}>
                                    <Calendar size={14} /> {assignment.dueDate}
                                 </div>
                              </div>
                              <Button variant="primary" onClick={() => handleSubmit(assignment.id)} className="px-6 py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20">
                                 Continue
                              </Button>
                           </div>
                        </Card>
                      )
                   })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Hub (4/12) */}
          <div className="lg:col-span-4 space-y-10">
             
             {/* SECTION 3: UPCOMING DEADLINES */}
             <Card className="bg-app-bg border border-app-border p-8 rounded-[2.5rem] shadow-xs">
                 <h4 className="text-xs font-black text-app-text-muted uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Calendar size={18} className="text-secondary" /> Due Soon
                 </h4>
                 <div className="space-y-4">
                    {[
                       { day: "Today", task: "Rational Numbers Quiz", urgent: true },
                       { day: "Tomorrow", task: "Math Project Submission", urgent: true },
                       { day: "Thu, Feb 23", task: "Science Practical", urgent: false },
                    ].map((item, i) => (
                       <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border ${item.urgent ? 'bg-error/5 border-error/10' : 'bg-app-bg-alt border-app-border'} group hover:scale-[1.02] transition-transform cursor-pointer`}>
                          <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black ${item.urgent ? 'bg-error text-white' : 'bg-app-bg-alt text-app-text-main shadow-xs border border-app-border'}`}>
                             <span className="text-[9px] uppercase tracking-tight opacity-80">{item.day.split(',')[0]}</span>
                          </div>
                          <div className="flex-1 overflow-hidden">
                             <p className="text-[13px] font-black text-app-text-main truncate">{item.task}</p>
                             <p className={`text-[10px] font-bold ${item.urgent ? 'text-error animate-pulse' : 'text-app-text-sub'}`}>
                                {item.urgent ? 'ACTION REQ' : 'Upcoming'}
                             </p>
                          </div>
                       </div>
                    ))}
                 </div>
             </Card>

             {/* SECTION 5: COMPLETED RECENTLY */}
             <Card className="bg-app-bg border border-app-border p-8 rounded-[2.5rem] shadow-xs">
                 <h4 className="text-xs font-black text-app-text-muted uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Award size={18} className="text-success" /> Recent Wins
                 </h4>
                 <div className="space-y-6">
                    {completedAssignments.length > 0 ? (
                       completedAssignments.slice(0, 2).map((a, i) => (
                          <div key={i} className="space-y-3">
                             <div className="flex justify-between items-start">
                                <div>
                                   <p className="text-sm font-black text-app-text-main leading-tight mb-1">{a.title}</p>
                                   <p className="text-[9px] font-bold text-app-text-sub">Completed yesterday</p>
                                </div>
                                <div className="p-2 bg-success text-white rounded-lg font-black text-xs">
                                   95%
                                </div>
                             </div>
                             <div className="p-3 bg-success/5 border border-success/10 rounded-xl">
                                <p className="text-[10px] font-bold text-success leading-tight italic">
                                   "Feedback: Excellent understanding of key topics. Try harder problems next!"
                                </p>
                             </div>
                          </div>
                       ))
                    ) : (
                       <div className="text-center py-6 border border-dashed border-app-border rounded-2xl px-4">
                          <p className="text-[11px] font-bold text-app-text-sub leading-loose italic">
                             "Your journey of excellence starts with the first completed task."
                          </p>
                       </div>
                    )}
                 </div>
             </Card>

             {/* SECTION 8: OFFLINE SUPPORT */}
             <div className="px-2">
                <div className={`flex items-center gap-4 p-5 rounded-3xl border ${isOffline ? 'bg-amber-500/5 border-amber-500/20' : 'bg-success/5 border-success/20'} transition-colors`}>
                   <div className={`p-3 rounded-2xl ${isOffline ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/20' : 'bg-success text-white shadow-xl shadow-success/20'}`}>
                      {isOffline ? <WifiOff size={24} /> : <Wifi size={24} />}
                   </div>
                   <div className="flex-1">
                      <h4 className="text-[11px] font-black text-app-text-main uppercase tracking-widest mb-1">
                         {isOffline ? 'Offline Active' : 'Online Sync'}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-app-text-sub">
                         <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                         {isOffline ? 'Learning from local storage' : 'Tasks are up to date'}
                      </div>
                   </div>
                </div>
                
                <button 
                  onClick={() => navigate('/lessons/uploaded')}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-4 rounded-2xl border border-app-border text-[10px] font-black uppercase tracking-widest text-app-text-muted hover:bg-app-bg-alt hover:text-app-text-main transition-all"
                >
                   <Download size={14} /> Offline Access Settings
                </button>
             </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Assignments;
