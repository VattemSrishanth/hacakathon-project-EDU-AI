import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, MessageSquare, ChevronLeft, Send, Sparkles, BookOpen } from 'lucide-react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { useCommunity } from '../../context/CommunityContext';
import { useOffline } from '../../context/OfflineContext';

const AskDoubt = () => {
  const navigate = useNavigate();
  const { postDoubt } = useCommunity();
  const { isOffline } = useOffline();
  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState('General');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsSubmitting(true);
    try {
      await postDoubt(question, subject);
      navigate('/community');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Navigation */}
        <button 
          onClick={() => navigate('/community')}
          className="flex items-center gap-2 text-app-text-sub hover:text-primary transition-all font-black text-xs uppercase tracking-widest"
        >
          <ChevronLeft size={16} />
          Back to Community
        </button>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
            <HelpCircle size={12} />
            Doubt Clearing
          </div>
          <h1 className="text-4xl font-black text-app-text-main tracking-tight uppercase leading-none">Ask the Community</h1>
          <p className="text-app-text-sub font-bold text-sm uppercase tracking-widest opacity-70">Get help from AI and fellow students</p>
        </div>

        <Card className="p-8 border-app-border shadow-2xl rounded-[2.5rem] bg-app-bg-alt relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <MessageSquare size={120} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-app-text-sub">Select Subject</label>
              <select 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-app-bg border border-app-border rounded-2xl p-4 text-app-text-main font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                {['General', 'Mathematics', 'Science', 'English', 'Social Studies'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-app-text-sub">Your Question</label>
              <textarea 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What are you struggling with? Be as specific as possible..."
                className="w-full h-48 bg-app-bg border border-app-border rounded-4xl p-6 text-app-text-main font-bold placeholder:opacity-40 focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                required
              />
            </div>

            {isOffline && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center gap-3">
                <Sparkles size={20} />
                <p className="text-xs font-black uppercase tracking-widest">Offline Mode: Your post will be synced later</p>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isSubmitting || !question.trim()}
              className="w-full py-5 rounded-3xl flex items-center justify-center gap-3 group"
            >
              {isSubmitting ? 'Posting...' : 'Post Question'}
              <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Button>
          </form>
        </Card>

        {/* Learning Tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-app-bg border border-app-border flex gap-4">
            <div className="p-3 h-fit rounded-xl bg-orange-500/10 text-orange-600">
              <Sparkles size={20} />
            </div>
            <div>
              <h4 className="font-black text-sm uppercase text-app-text-main">AI Suggestion</h4>
              <p className="text-xs font-medium text-app-text-sub mt-1">Try to include which part of the lesson you're stuck on.</p>
            </div>
          </div>
          <div className="p-6 rounded-3xl bg-app-bg border border-app-border flex gap-4">
            <div className="p-3 h-fit rounded-xl bg-blue-500/10 text-blue-600">
              <BookOpen size={20} />
            </div>
            <div>
              <h4 className="font-black text-sm uppercase text-app-text-main">Clear Subject</h4>
              <p className="text-xs font-medium text-app-text-sub mt-1">Categorizing help experts find your question faster.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskDoubt;
