import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, ChevronLeft, ThumbsUp, Send, Bookmark, 
  CheckCircle2, Award, ShieldCheck, Clock, 
  Share2, Flag, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOffline } from '../../context/OfflineContext';
import Button from '../../components/Button';
import Card from '../../components/Card';

interface Comment {
  id: string;
  text: string;
  username: string;
  role: string;
  is_verified: boolean;
  helpful_count: number;
  created_at: string;
}

interface Doubt {
  id: string;
  question: string;
  subject: string;
  topic?: string;
  class_level?: string;
  username: string;
  status: string;
  is_verified: boolean;
  replies_count: number;
  views_count: number;
  helpful_count: number;
  created_at: string;
}

const Discussions = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { isOffline } = useOffline();
  
  const [doubt, setDoubt] = useState<Doubt | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDoubtData = useCallback(async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      
      const [doubtRes, commentsRes] = await Promise.all([
        fetch(`${baseUrl}/community/doubts/${id}`),
        fetch(`${baseUrl}/community/doubts/${id}/comments`)
      ]);
      
      const doubtData = await doubtRes.json();
      const commentsData = await commentsRes.json();
      
      if (doubtData.success) setDoubt(doubtData.doubt);
      if (commentsData.success) setComments(commentsData.comments);
    } catch (e) {
      console.error('Failed to fetch discussion data', e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDoubtData();
  }, [fetchDoubtData]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseUrl}/community/doubts/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newComment,
          username: auth?.user?.username || 'Guest',
          user_id: auth?.user?.id,
          role: auth?.user?.role || 'student'
        })
      });
      
      if (response.ok) {
        setNewComment('');
        fetchDoubtData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      await fetch(`${baseUrl}/community/doubts/${id}/helpful`, { method: 'POST' });
      fetchDoubtData();
    } catch (e) { console.error(e); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <RefreshCw size={40} className="text-indigo-600 animate-spin" />
    </div>
  );

  if (!doubt) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] space-y-4">
      <h2 className="text-2xl font-bold text-slate-900">Discussion Not Found</h2>
      <Button onClick={() => navigate('/community')}>Back to Community</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation */}
        <button 
          onClick={() => navigate('/community')}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-all font-semibold text-sm"
        >
          <ChevronLeft size={18} />
          Back to Community
        </button>

        {/* Primary Thread Question */}
        <Card className="p-0 border-slate-200 bg-white shadow-sm rounded-3xl overflow-hidden border">
          <div className="p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-50 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg">
                  {doubt.username.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    {doubt.username}
                    {doubt.is_verified && <ShieldCheck size={16} className="text-indigo-600" />}
                  </h4>
                  <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
                    <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(doubt.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="uppercase font-bold tracking-wider text-indigo-600">{doubt.subject}</span>
                    <span>•</span>
                    <span className="font-bold text-slate-500">{doubt.class_level || 'Class 10'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:bg-slate-50">
                  <Bookmark size={18} />
                </button>
                <button className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:bg-slate-50">
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100 uppercase tracking-widest">
                  {doubt.topic || 'General Topic'}
                </span>
                {doubt.status === 'solved' && (
                  <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100 uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 size={10} />
                    Resolved
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-slate-900 leading-snug">
                {doubt.question}
              </h1>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
              <div className="flex items-center gap-6">
                <button 
                  onClick={handleUpvote}
                  className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold text-sm"
                >
                  <ThumbsUp size={18} />
                  Helpful ({doubt.helpful_count})
                </button>
                <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                  <MessageSquare size={18} />
                  {doubt.replies_count} Replies
                </div>
              </div>
              <button className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors font-bold text-sm">
                <Flag size={16} />
                Report
              </button>
            </div>
          </div>
        </Card>

        {/* Replies Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wider flex items-center gap-3">
              Discussion
              <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full font-bold">
                {comments.length}
              </span>
            </h3>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Sort By: <span className="text-slate-900 cursor-pointer">Best Answer</span>
            </div>
          </div>

          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className={`p-6 bg-white border border-slate-200 rounded-3xl space-y-4 relative ${comment.is_verified ? 'border-indigo-300 ring-4 ring-indigo-50' : ''}`}>
                {comment.is_verified && (
                  <div className="absolute top-6 right-6 flex items-center gap-2 text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 text-[10px] font-black uppercase tracking-widest">
                    <CheckCircle2 size={14} />
                    Best Answer
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${comment.role === 'teacher' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                    {comment.username.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{comment.username}</span>
                      {comment.role === 'teacher' && (
                        <span className="bg-amber-100 text-amber-700 text-[9px] px-2 py-0.5 rounded flex items-center gap-0.5 font-black uppercase border border-amber-200">
                          <Award size={10} />
                          Teacher
                        </span>
                      )}
                      {comment.role === 'admin' && (
                        <span className="bg-indigo-100 text-indigo-700 text-[9px] px-2 py-0.5 rounded flex items-center gap-0.5 font-black uppercase border border-indigo-200">
                          <ShieldCheck size={10} />
                          Expert
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="text-slate-700 text-sm font-medium leading-relaxed pl-1">
                  {comment.text}
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <button className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-600 transition-colors text-[11px] font-bold">
                    <ThumbsUp size={14} />
                    {comment.helpful_count || 0} Helpful
                  </button>
                  <button className="text-slate-400 hover:text-slate-600 transition-colors text-[11px] font-bold">
                    Reply
                  </button>
                </div>
              </div>
            ))}

            {comments.length === 0 && (
              <div className="p-12 text-center bg-white border border-slate-100 rounded-3xl">
                <p className="text-slate-400 font-medium">No replies yet. Start the academic discussion!</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Reply Form */}
        {!isOffline && (
          <form onSubmit={handlePostComment} className="pt-4 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <Card className="p-3 border-slate-200 bg-white shadow-lg rounded-[2.5rem] border overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="flex-1 px-4">
                  <textarea 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Contribute to the discussion..."
                    className="w-full h-24 bg-transparent border-none focus:ring-0 text-slate-800 font-medium placeholder:text-slate-400 resize-none py-4"
                    required
                  />
                </div>
                <div className="pr-4 py-4 self-end">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !newComment.trim()}
                    className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
                  >
                    {isSubmitting ? 'Posting...' : 'Post Reply'}
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          </form>
        )}
      </div>
    </div>
  );
};

export default Discussions;

