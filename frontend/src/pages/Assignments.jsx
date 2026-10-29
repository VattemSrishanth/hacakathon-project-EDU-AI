import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
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
  const [assignments, setAssignments] = useState([]);
  const [completedAssignments, setCompletedAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = async () => {
    try {
      const data = await userDataAPI.getAssignments();
      if (data.success) {
        const all = data.assignments || [];
        setAssignments(all.filter((a) => a.status !== 'Submitted'));
        setCompletedAssignments(all.filter((a) => a.status === 'Submitted'));
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

  // Format due date from ISO string to clean human-readable date
  const formatDueDate = (dateStr) => {
    if (!dateStr) return 'No due date';
    if (typeof dateStr === 'string' && (dateStr.includes('Today') || dateStr.includes('Tomorrow'))) {
      return dateStr;
    }
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const target = new Date(d);
      target.setHours(0, 0, 0, 0);
      const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Tomorrow';
      if (diffDays === -1) return 'Yesterday';
      if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;

      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const checkIsUrgent = (dateStr) => {
    if (!dateStr) return false;
    if (typeof dateStr === 'string' && (dateStr.includes('Today') || dateStr.includes('Tomorrow'))) {
      return true;
    }
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return false;
      const diffDays = (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return diffDays <= 2 && diffDays >= -1;
    } catch {
      return false;
    }
  };

  // Dynamic Summary Metrics based purely on fetched assignments
  const summary = useMemo(() => {
    const pending = assignments.length;
    const completedThisWeek = completedAssignments.length;
    const totalCount = pending + completedThisWeek;
    const urgentCount = assignments.filter((a) => checkIsUrgent(a.dueDate)).length;

    return {
      pending,
      completedThisWeek,
      urgentCount,
      totalCount
    };
  }, [assignments, completedAssignments]);

  // Dynamic Due Soon list sorted by due date
  const dueSoonList = useMemo(() => {
    return [...assignments]
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3);
  }, [assignments]);

  const handleSubmit = async (assignmentId) => {
    try {
      try {
        await userDataAPI.submitAssignment(assignmentId);
      } catch (err) {
        console.warn('Backend submission API unavailable, using state transition:', err);
      }

      const idStr = String(assignmentId);
      const target = assignments.find((a) => String(a.id || a._id) === idStr);
      if (target) {
        setAssignments((prev) => prev.filter((a) => String(a.id || a._id) !== idStr));
        setCompletedAssignments((prev) => [
          {
            ...target,
            status: 'Submitted',
            updatedAt: new Date().toISOString()
          },
          ...prev
        ]);
      }

      logActivity('lesson', assignmentId, `Submitted assignment: ${assignmentId}`);
    } catch (e) {
      console.error('Submission failed', e);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <header className="pt-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-2xl text-primary shadow-xs">
                  <ListTodo size={26} strokeWidth={2.5} />
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-app-text-main tracking-tight">
                  Task <span className="text-primary-hover">Hub</span>
                </h1>
              </div>
              <p className="text-xs sm:text-sm font-medium text-app-text-sub tracking-normal ml-1">
                Personalized practice & assignments for your level
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/lessons')}
                className="group flex items-center gap-2 px-5 py-2.5 bg-app-bg border border-app-border rounded-xl text-xs font-bold uppercase tracking-wider text-app-text-main hover:border-primary hover:text-primary transition-all shadow-xs cursor-pointer"
              >
                <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
                Back to Learning
              </button>
            </div>
          </div>
        </header>

        {/* SECTION 1: DYNAMIC TASK SUMMARY & PROGRESS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-5 bg-app-bg border border-app-border rounded-2xl shadow-xs flex flex-col justify-between hover:border-primary/30 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <Clock size={22} strokeWidth={2.5} />
              </div>
              <AlertCircle size={18} className={summary.urgentCount > 0 ? "text-error animate-pulse" : "text-app-text-muted/30"} />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-app-text-main">{summary.pending}</p>
              <p className="text-[11px] font-bold text-app-text-muted uppercase tracking-wider">Pending Tasks</p>
            </div>
          </div>

          <div className="p-5 bg-app-bg border border-app-border rounded-2xl shadow-xs flex flex-col justify-between hover:border-success/30 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-success/10 rounded-xl text-success">
                <CheckCircle2 size={22} strokeWidth={2.5} />
              </div>
              <TrendingUp size={18} className="text-success" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-app-text-main">{summary.completedThisWeek}</p>
              <p className="text-[11px] font-bold text-app-text-muted uppercase tracking-wider">Completed This Week</p>
            </div>
          </div>

          {/* DYNAMIC GOAL INDICATOR */}
          <div className="sm:col-span-2 p-5 bg-app-bg border border-app-border rounded-2xl shadow-xs flex flex-col justify-center">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-secondary/10 rounded-xl text-secondary">
                  <Trophy size={18} strokeWidth={2.5} />
                </div>
                <p className="text-xs font-bold text-app-text-main uppercase tracking-wider">Goal Progress</p>
              </div>
              <span className="text-xs sm:text-sm font-black text-app-text-main">
                {summary.completedThisWeek} / {summary.totalCount}
              </span>
            </div>
            <div className="w-full h-2.5 bg-app-bg-alt rounded-full overflow-hidden border border-app-border mb-2.5">
              <div
                className="h-full bg-linear-to-r from-success to-primary-hover transition-all duration-1000 shadow-[0_0_10px_rgba(34,197,94,0.3)] rounded-full"
                style={{
                  width: `${summary.totalCount > 0 ? Math.min((summary.completedThisWeek / summary.totalCount) * 100, 100) : 0}%`
                }}
              />
            </div>
            <p className="text-[11px] font-medium text-app-text-sub">
              {summary.totalCount === 0
                ? 'No assignments currently scheduled.'
                : summary.completedThisWeek >= summary.totalCount
                  ? 'All tasks completed! Excellent effort.'
                  : `${summary.pending} task${summary.pending === 1 ? '' : 's'} remaining to complete.`}
            </p>
          </div>
        </div>

        {/* MAIN TWO-COLUMN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Task List Area (8/12) */}
          <div className="lg:col-span-8 space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 bg-app-bg border border-app-border rounded-2xl">
                <div className="w-9 h-9 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-app-text-muted">Loading your workspace...</p>
              </div>
            ) : assignments.length === 0 && completedAssignments.length === 0 ? (
              /* EMPTY STATE */
              <div className="p-10 md:p-12 bg-app-bg border border-app-border rounded-3xl text-center shadow-xs border-dashed relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                  <Sparkles size={140} className="text-primary" />
                </div>

                <div className="relative z-10">
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <CheckCircle2 size={32} className="text-success animate-bounce" />
                  </div>
                  <h3 className="text-2xl font-black text-app-text-main mb-2">You're all caught up!</h3>
                  <p className="max-w-md mx-auto text-app-text-sub font-medium text-xs md:text-sm leading-relaxed mb-6">
                    Great job! No assignments found. Explore curriculum lessons or practice with AI Tutor.
                  </p>

                  <Button
                    variant="primary"
                    onClick={() => navigate('/lessons')}
                    className="px-8 py-3 rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg shadow-primary/20 hover:scale-105 transition-transform flex items-center gap-2 mx-auto"
                  >
                    <span>Browse Lessons</span>
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* PENDING ASSIGNMENTS */}
                {assignments.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <h3 className="text-sm font-bold text-app-text-main uppercase tracking-wider flex items-center gap-2">
                        <ListTodo size={18} className="text-primary" /> Pending Tasks
                      </h3>
                      <span className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {assignments.length} Action {assignments.length === 1 ? 'Item' : 'Items'}
                      </span>
                    </div>

                    <div className={`grid grid-cols-1 ${assignments.length > 1 ? 'md:grid-cols-2' : ''} gap-4`}>
                      {assignments.map((assignment) => {
                        const isUrgent = checkIsUrgent(assignment.dueDate);
                        const formattedDate = formatDueDate(assignment.dueDate);
                        const assignmentId = assignment.id || assignment._id;

                        return (
                          <div
                            key={assignmentId}
                            className={`group relative bg-app-bg border ${
                              isUrgent ? 'border-error/40 ring-1 ring-error/15' : 'border-app-border'
                            } rounded-2xl p-5 md:p-6 hover:shadow-lg hover:border-primary/40 transition-all duration-200 flex flex-col justify-between`}
                          >
                            <div>
                              {/* Top row with real attributes */}
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="flex items-center flex-wrap gap-2">
                                  {assignment.subject && (
                                    <span className="px-2.5 py-1 bg-app-bg-alt rounded-lg text-[10px] font-bold uppercase tracking-wider text-primary border border-app-border">
                                      {assignment.subject}
                                    </span>
                                  )}
                                  {assignment.class_level && (
                                    <span className="px-2.5 py-1 bg-secondary/10 rounded-lg text-[10px] font-bold uppercase tracking-wider text-secondary border border-secondary/20">
                                      Class {assignment.class_level}
                                    </span>
                                  )}
                                  {assignment.board && (
                                    <span className="px-2.5 py-1 bg-app-bg-alt rounded-lg text-[10px] font-bold uppercase tracking-wider text-app-text-muted border border-app-border">
                                      {assignment.board}
                                    </span>
                                  )}
                                </div>
                                {isUrgent && (
                                  <span className="flex items-center gap-1 px-2 py-0.5 bg-error/10 text-error rounded-md text-[10px] font-bold animate-pulse">
                                    <AlertCircle size={12} /> Due Soon
                                  </span>
                                )}
                              </div>

                              {/* Title & Description */}
                              <div className="space-y-2 mb-4">
                                <h3 className="text-lg md:text-xl font-bold text-app-text-main group-hover:text-primary transition-colors leading-snug">
                                  {assignment.title}
                                </h3>
                                {assignment.description && (
                                  <div className="p-3.5 bg-app-bg-alt rounded-xl border border-app-border flex items-start gap-2.5">
                                    <FileText size={16} className="text-app-text-muted shrink-0 mt-0.5" />
                                    <p className="text-xs md:text-sm font-medium text-app-text-sub leading-relaxed">
                                      {assignment.description}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Real Task Status Indicator */}
                              <div className="flex items-center gap-2 mb-5 pt-1">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                <span className="text-xs font-medium text-app-text-sub">
                                  Status: <strong className="text-app-text-main font-semibold">{assignment.status || 'Pending'}</strong>
                                </span>
                              </div>
                            </div>

                            {/* Footer with Due Date & Action Button */}
                            <div className="pt-4 border-t border-app-border flex items-center justify-between gap-4">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-app-text-muted uppercase tracking-wider">Due Date</span>
                                <div className={`flex items-center gap-1.5 text-xs font-bold ${isUrgent ? 'text-error' : 'text-app-text-main'}`}>
                                  <Calendar size={13} /> {formattedDate}
                                </div>
                              </div>
                              <Button
                                variant="primary"
                                onClick={() => handleSubmit(assignmentId)}
                                className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-primary/20 hover:scale-102 active:scale-98 transition-all flex items-center gap-1.5"
                              >
                                <span>Submit</span>
                                <ChevronRight size={14} />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* COMPLETED ASSIGNMENTS */}
                {completedAssignments.length > 0 && (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="text-sm font-bold text-app-text-main uppercase tracking-wider flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-success" /> Completed Assignments
                      </h3>
                      <span className="text-[10px] font-bold text-success bg-success/10 px-2.5 py-0.5 rounded-full border border-success/20">
                        {completedAssignments.length} Submitted
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {completedAssignments.map((a) => (
                        <div
                          key={a.id || a._id || a.title}
                          className="p-4 bg-app-bg border border-app-border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-success/30 transition-all shadow-xs"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-success/10 text-success rounded-xl shrink-0 mt-0.5">
                              <CheckCircle2 size={18} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                {a.subject && (
                                  <span className="text-[10px] font-bold text-app-text-muted uppercase tracking-wider">
                                    {a.subject}
                                  </span>
                                )}
                                {a.class_level && (
                                  <span className="text-[10px] font-bold text-app-text-muted uppercase tracking-wider">
                                    • Class {a.class_level}
                                  </span>
                                )}
                                {a.score && (
                                  <span className="text-[9px] font-black text-success bg-success/10 px-1.5 py-0.2 rounded border border-success/20">
                                    Score: {a.score}%
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-bold text-app-text-main">{a.title}</h4>
                              {a.description && (
                                <p className="text-xs text-app-text-sub mt-0.5">{a.description}</p>
                              )}
                              {a.updatedAt && (
                                <p className="text-[10px] text-app-text-muted mt-1">
                                  Submitted {formatDueDate(a.updatedAt)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            <span className="text-xs font-bold text-success flex items-center gap-1 bg-success/10 px-3 py-1.5 rounded-xl border border-success/20">
                              Submitted <CheckCircle2 size={13} />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar Hub (4/12) */}
          <div className="lg:col-span-4 space-y-5">
            {/* DYNAMIC UPCOMING DEADLINES */}
            <div className="bg-app-bg border border-app-border p-5 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-app-text-main uppercase tracking-wider flex items-center gap-2">
                  <Calendar size={16} className="text-secondary" /> Due Soon
                </h4>
                <span className="text-[10px] font-bold text-app-text-muted">
                  {dueSoonList.length} Upcoming
                </span>
              </div>
              <div className="space-y-2.5">
                {dueSoonList.length > 0 ? (
                  dueSoonList.map((item, i) => {
                    const isUrgent = checkIsUrgent(item.dueDate);
                    const formattedDate = formatDueDate(item.dueDate);
                    const itemId = item.id || item._id || i;

                    return (
                      <div
                        key={itemId}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border ${
                          isUrgent ? 'bg-error/5 border-error/15' : 'bg-app-bg-alt border-app-border'
                        } hover:border-primary/30 transition-all cursor-pointer`}
                      >
                        <div
                          className={`w-11 h-11 rounded-lg flex flex-col items-center justify-center font-bold text-center shrink-0 ${
                            isUrgent ? 'bg-error text-white shadow-xs' : 'bg-app-bg text-app-text-main border border-app-border'
                          }`}
                        >
                          <Calendar size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-app-text-main truncate">{item.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-semibold ${isUrgent ? 'text-error' : 'text-app-text-sub'}`}>
                              {formattedDate}
                            </span>
                            {item.subject && (
                              <span className="text-[9px] text-app-text-muted uppercase">
                                • {item.subject}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 border border-dashed border-app-border rounded-xl px-3">
                    <p className="text-xs font-medium text-app-text-muted">No pending deadlines</p>
                  </div>
                )}
              </div>
            </div>

            {/* DYNAMIC RECENT WINS */}
            <div className="bg-app-bg border border-app-border p-5 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-app-text-main uppercase tracking-wider flex items-center gap-2">
                  <Award size={16} className="text-success" /> Recent Wins
                </h4>
                {completedAssignments.length > 0 && (
                  <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-md border border-success/20">
                    {completedAssignments.length} Done
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {completedAssignments.length > 0 ? (
                  completedAssignments.slice(0, 3).map((a, i) => (
                    <div
                      key={a.id || a._id || i}
                      className="p-3 bg-app-bg-alt rounded-xl border border-app-border space-y-1.5"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-xs font-bold text-app-text-main leading-tight truncate">{a.title}</p>
                        <span className="text-[10px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded shrink-0 flex items-center gap-1">
                          Done <CheckCircle2 size={10} />
                        </span>
                      </div>
                      <p className="text-[10px] text-app-text-muted">
                        {a.subject ? `${a.subject} • ` : ''}
                        {a.updatedAt ? formatDueDate(a.updatedAt) : 'Completed'}
                      </p>
                      {a.feedback && (
                        <div className="p-2 bg-success/5 border border-success/15 rounded-lg mt-1">
                          <p className="text-[11px] font-medium text-success leading-relaxed">
                            "{a.feedback}"
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 border border-dashed border-app-border rounded-xl px-3">
                    <p className="text-xs font-medium text-app-text-muted">No completed assignments yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* OFFLINE STATUS */}
            <div className="bg-app-bg border border-app-border p-4 rounded-2xl shadow-xs space-y-3">
              <div
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  isOffline ? 'bg-amber-500/5 border-amber-500/20' : 'bg-success/5 border-success/20'
                }`}
              >
                <div
                  className={`p-2.5 rounded-lg shrink-0 ${
                    isOffline ? 'bg-amber-500 text-white' : 'bg-success text-white'
                  }`}
                >
                  {isOffline ? <WifiOff size={18} /> : <Wifi size={18} />}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-app-text-main uppercase tracking-wide">
                    {isOffline ? 'Offline Active' : 'Online Sync'}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-app-text-sub mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shrink-0" />
                    <span className="truncate">{isOffline ? 'Learning from local storage' : 'Tasks are up to date'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/lessons/uploaded')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-app-border text-xs font-bold uppercase tracking-wider text-app-text-muted hover:bg-app-bg-alt hover:text-app-text-main transition-all cursor-pointer"
              >
                <Download size={13} /> Offline Access Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assignments;
