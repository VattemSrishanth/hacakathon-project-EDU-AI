import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, MessageSquare, ChevronLeft, Send, Paperclip, GraduationCap, Layout, Book } from 'lucide-react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { useCommunity } from '../../context/CommunityContext';

const AskDoubt = () => {
  const navigate = useNavigate();
  const { postDoubt } = useCommunity();
  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [topic, setTopic] = useState('');
  const [classLevel, setClassLevel] = useState('Class 10');
  const [attachment, setAttachment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsSubmitting(true);
    try {
      await postDoubt(question, subject, topic, classLevel);
      navigate('/community');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation */}
        <button
          onClick={() => navigate('/community')}
          className="flex items-center gap-2 text-app-text-sub hover:text-primary transition-all font-semibold text-sm">
          
          <ChevronLeft size={18} />
          Back to Discussions
        </button>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
            <HelpCircle size={14} />
            Academic Support
          </div>
          <h1 className="text-3xl font-bold text-app-text-main tracking-tight">Create a Discussion</h1>
          <p className="text-app-text-sub font-medium">Ask a structured question to get quality responses from teachers and peers.</p>
        </div>

        <Card className="p-0 border-app-border shadow-sm rounded-3xl overflow-hidden border">
          <div className="bg-app-bg-alt border-b border-app-border p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg text-white">
                <MessageSquare size={20} />
              </div>
              <h2 className="font-bold text-app-text-main">Discussion Details</h2>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-app-text-muted bg-app-bg px-3 py-1 rounded-full border border-app-border">
              Structured Support
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-app-text-sub flex items-center gap-2">
                  <Book size={16} className="text-app-text-muted" />
                  Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-app-bg-alt border border-app-border rounded-xl p-3.5 text-app-text-main font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none">
                  
                  {['Mathematics', 'Science', 'English', 'Social Studies', 'Telugu', 'Hindi', 'Physics', 'Chemistry', 'Biology'].map((s) =>
                  <option key={s} value={s}>{s}</option>
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-app-text-sub flex items-center gap-2">
                  <Layout size={16} className="text-app-text-muted" />
                  Chapter / Topic
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Algebra, Photosynthesis"
                  className="w-full bg-app-bg-alt border border-app-border rounded-xl p-3.5 text-app-text-main font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  required />
                
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-app-text-sub flex items-center gap-2">
                  <GraduationCap size={16} className="text-app-text-muted" />
                  Class Level
                </label>
                <select
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                  className="w-full bg-app-bg-alt border border-app-border rounded-xl p-3.5 text-app-text-main font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none">
                  
                  {['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Inter 1st Year', 'Inter 2nd Year'].map((c) =>
                  <option key={c} value={c}>{c}</option>
                  )}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-app-text-sub">Question Content</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Explain the core problem you're facing. What have you tried so far?"
                className="w-full h-56 bg-app-bg-alt border border-app-border rounded-2xl p-6 text-app-text-main font-medium placeholder:text-app-text-muted focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none shadow-inner-sm"
                required />
              
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4 border-t border-app-border/40">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 px-5 py-3 rounded-xl bg-app-bg border border-app-border text-app-text-sub hover:bg-app-bg-alt cursor-pointer transition-all group">
                  <Paperclip size={18} className="group-hover:rotate-12 transition-transform" />
                  <span className="text-sm font-bold">Attach Resources</span>
                  <input type="file" className="hidden" onChange={(e) => setAttachment(e.target.files?.[0] || null)} />
                </label>
                {attachment &&
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                    {attachment.name}
                  </span>
                }
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !question.trim() || !topic.trim()}
                className="w-full md:w-auto px-10 py-4 rounded-xl flex items-center justify-center gap-3 bg-primary hover:bg-primary-hover text-white font-bold transition-all shadow-md active:scale-95">
                
                {isSubmitting ? 'Publishing...' : 'Publish Question'}
                <Send size={18} />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>);

};

export default AskDoubt;