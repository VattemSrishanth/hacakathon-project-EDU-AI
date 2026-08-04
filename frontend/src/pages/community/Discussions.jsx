import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MessageSquare, ChevronLeft, ThumbsUp, Send, Bookmark,
  CheckCircle2, Award, ShieldCheck, Clock,
  Share2, Flag, RefreshCw } from
'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOffline } from '../../context/OfflineContext';
import Button from '../../components/Button';
import Card from '../../components/Card';


























const Discussions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { isOffline } = useOffline();

  const [doubt, setDoubt] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDoubtData = useCallback(async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      const [doubtRes, commentsRes] = await Promise.all([
      fetch(`${baseUrl}/community/doubts/${id}`),
      fetch(`${baseUrl}/community/doubts/${id}/comments`)]
      );

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

  const handlePostComment = async (e) => {
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
    } catch (e) {console.error(e);}
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-app-bg">
      <RefreshCw size={40} className="text-primary animate-spin" />
    </div>);


  if (!doubt) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-app-bg space-y-4">
      <h2 className="text-2xl font-bold text-app-text-main">Discussion Not Found</h2>
      <Button onClick={() => navigate('/community')}>Back to Community</Button>
    </div>);


  return (
    <div className="min-h-screen bg-app-bg py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation */}
        <button
          onClick={() => navigate('/community')}
          className="flex items-center gap-2 text-app-text-sub hover:text-primary transition-all font-semibold text-sm">
          
          <ChevronLeft size={18} />
          Back to Community
        </button>

        {/* Primary Thread Question */}
        <Card className="p-0 overflow-hidden border">
          <div className="p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-app-border/40 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-app-bg border border-app-border flex items-center justify-center text-app-text-sub font-bold text-lg">
                  {doubt.username.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-app-text-main flex items-center gap-2">
                    {doubt.username}
                    {doubt.is_verified && <ShieldCheck size={16} className="text-primary" />}
                  </h4>
                  <div className="flex items-center gap-3 text-xs font-medium text-app-text-muted">
                    <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(doubt.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="uppercase font-bold tracking-wider text-primary">{doubt.subject}</span>
                    <span>•</span>
                    <span className="font-bold text-app-text-sub">{doubt.class_level || 'Class 10'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2.5 rounded-xl border border-app-border text-app-text-muted hover:bg-app-bg-alt">
                  <Bookmark size={18} />
                </button>
                <button className="p-2.5 rounded-xl border border-app-border text-app-text-muted hover:bg-app-bg-alt">
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-bold border border-primary/20 uppercase tracking-widest">
                  {doubt.topic || 'General Topic'}
                </span>
                {doubt.status === 'solved' &&
                <span className="px-2.5 py-1 rounded-md bg-success/15 text-success text-[10px] font-bold border border-success/35 uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 size={10} />
                    Resolved
                  </span>
                }
              </div>
              <h1 className="text-2xl font-bold text-app-text-main leading-snug">
                {doubt.question}
              </h1>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-app-border/40">
              <div className="flex items-center gap-6">
                <button
                  onClick={handleUpvote}
                  className="flex items-center gap-2 text-app-text-sub hover:text-primary transition-colors font-bold text-sm">
                  
                  <ThumbsUp size={18} />
                  Helpful ({doubt.helpful_count})
                </button>
                <div className="flex items-center gap-2 text-app-text-muted font-bold text-sm">
                  <MessageSquare size={18} />
                  {doubt.replies_count} Replies
                </div>
              </div>
              <button className="flex items-center gap-2 text-app-text-muted hover:text-primary transition-colors font-bold text-sm">
                <Flag size={16} />
                Report
              </button>
            </div>
          </div>
        </Card>

        {/* Replies Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-app-text-main uppercase tracking-wider flex items-center gap-3">
              Discussion
              <span className="bg-app-bg text-app-text-sub border border-app-border text-xs px-2 py-0.5 rounded-full font-bold">
                {comments.length}
              </span>
            </h3>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-app-text-muted">
              Sort By: <span className="text-app-text-main cursor-pointer">Best Answer</span>
            </div>
          </div>

          <div className="space-y-4">
            {comments.map((comment) =>
            <div key={comment.id} className={`p-6 bg-app-bg-alt border border-app-border rounded-3xl space-y-4 relative ${comment.is_verified ? 'border-primary ring-4 ring-primary/10' : ''}`}>
                {comment.is_verified &&
              <div className="absolute top-6 right-6 flex items-center gap-2 text-primary bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20 text-[10px] font-black uppercase tracking-widest">
                    <CheckCircle2 size={14} />
                    Best Answer
                  </div>
              }
                
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${comment.role === 'teacher' ? 'bg-warning/10 text-warning border border-warning/20' : 'bg-app-bg text-app-text-sub border border-app-border'}`}>
                    {comment.username.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-app-text-main text-sm">{comment.username}</span>
                      {comment.role === 'teacher' &&
                    <span className="bg-warning/10 text-warning border border-warning/20 text-[9px] px-2 py-0.5 rounded flex items-center gap-0.5 font-black uppercase">
                          <Award size={10} />
                          Teacher
                        </span>
                    }
                      {comment.role === 'admin' &&
                    <span className="bg-primary/10 text-primary border border-primary/20 text-[9px] px-2 py-0.5 rounded flex items-center gap-0.5 font-black uppercase">
                          <ShieldCheck size={10} />
                          Expert
                        </span>
                    }
                    </div>
                    <span className="text-[10px] font-medium text-app-text-muted uppercase tracking-wider">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="text-app-text-sub text-sm font-medium leading-relaxed pl-1">
                  {comment.text}
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <button className="flex items-center gap-1.5 text-app-text-muted hover:text-primary transition-colors text-[11px] font-bold">
                    <ThumbsUp size={14} />
                    {comment.helpful_count || 0} Helpful
                  </button>
                  <button className="text-app-text-muted hover:text-primary transition-colors text-[11px] font-bold">
                    Reply
                  </button>
                </div>
              </div>
            )}

            {comments.length === 0 &&
            <div className="p-12 text-center bg-app-bg-alt border border-app-border rounded-3xl">
                <p className="text-app-text-muted font-medium">No replies yet. Start the academic discussion!</p>
              </div>
            }
          </div>
        </div>

        {/* Quick Reply Form */}
        {!isOffline &&
        <form onSubmit={handlePostComment} className="pt-4 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <Card className="p-3 overflow-hidden border">
              <div className="flex items-center gap-3">
                <div className="flex-1 px-4">
                  <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Contribute to the discussion..."
                  className="w-full h-24 bg-transparent border-none focus:ring-0 text-app-text-main font-medium placeholder:text-app-text-muted resize-none py-4"
                  required />
                
                </div>
                <div className="pr-4 py-4 self-end">
                  <Button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="px-8 py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold transition-all shadow-md active:scale-95 flex items-center gap-2">
                  
                    {isSubmitting ? 'Posting...' : 'Post Reply'}
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          </form>
        }
      </div>
    </div>);

};

export default Discussions;