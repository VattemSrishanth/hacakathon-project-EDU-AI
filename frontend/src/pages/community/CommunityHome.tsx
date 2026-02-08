import { useNavigate } from 'react-router-dom';
import { MessageSquare, Plus, Search, HelpCircle, Clock, Filter, RefreshCw, WifiOff } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { useOffline } from '../../context/OfflineContext';
import Button from '../../components/Button';
import Card from '../../components/Card';

const CommunityHome = () => {
  const navigate = useNavigate();
  const { doubts, loading, refreshDoubts } = useCommunity();
  const { isOffline } = useOffline();

  return (
    <div className="min-h-screen bg-app-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
              <MessageSquare size={12} />
              Student Community
            </div>
            <h1 className="text-5xl font-black text-app-text-main tracking-tight uppercase leading-[0.9]">Peer Learning Area</h1>
            <p className="text-app-text-sub font-bold text-sm uppercase tracking-widest opacity-70 flex items-center gap-3">
              Learn together, grow together
              {isOffline && (
                <span className="flex items-center gap-1 text-secondary bg-secondary/10 px-2 py-0.5 rounded-lg border border-secondary/20">
                  <WifiOff size={12} />
                  Offline Mode
                </span>
              )}
            </p>
          </div>

          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={refreshDoubts} 
              disabled={loading || isOffline}
              className="rounded-2xl flex items-center gap-2 px-6 py-4"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <Button 
              variant="primary" 
              onClick={() => navigate('/community/ask')}
              className="rounded-2xl group flex items-center gap-3 px-8 py-4 shadow-inst"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform" />
              Ask a Doubt
            </Button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in scale-95 duration-700">
          <div className="flex-1 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-app-text-muted group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search for questions, subjects, or keywords..."
              className="w-full bg-app-bg-alt border border-app-border rounded-4xl pl-14 pr-6 py-5 text-app-text-main font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {['All', 'Mathematics', 'Science', 'English', 'Social'].map(filter => (
              <button 
                key={filter}
                className="px-6 py-4 rounded-2xl bg-app-bg border border-app-border text-app-text-sub font-black text-[10px] uppercase tracking-widest hover:border-primary/30 hover:text-primary whitespace-nowrap transition-all flex items-center gap-2"
              >
                <Filter size={14} />
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        {loading && doubts.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <RefreshCw size={48} className="text-primary animate-spin" />
            <p className="text-app-text-sub font-black uppercase tracking-widest text-xs">Fetching community activity...</p>
          </div>
        ) : doubts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {doubts.map((doubt) => (
              <Card key={doubt.id} className="group bg-app-bg-alt p-1 rounded-[2.5rem] border-app-border hover:border-primary/20 transition-all hover:shadow-inst">
                <div className="bg-app-bg p-8 rounded-[2.3rem] h-full flex flex-col space-y-6">
                  {/* Post Meta */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black">
                        {doubt.username.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-app-text-main leading-none uppercase">{doubt.username}</h4>
                        <div className="flex items-center gap-3 text-[10px] font-black text-app-text-muted uppercase tracking-[0.15em] mt-1.5">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(doubt.createdAt).toLocaleDateString()}
                          </span>
                          <span className="w-1 h-1 bg-app-border rounded-full" />
                          <span className="flex items-center gap-1 text-primary">
                            <HelpCircle size={12} />
                            {doubt.subject}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="flex-1">
                    <p className="text-app-text-main text-lg font-bold leading-relaxed line-clamp-3 group-hover:text-primary transition-colors">
                      {doubt.question}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-6 border-t border-app-border flex items-center justify-between">
                    <div className="flex -space-x-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full bg-app-bg-alt border-2 border-app-bg flex items-center justify-center text-[10px] font-black text-app-text-muted">
                          {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                      <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-app-bg flex items-center justify-center text-[8px] font-black text-primary">
                        +5
                      </div>
                    </div>
                    <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-2">
                      View Discussion
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 bg-app-bg-alt rounded-[4rem] border-4 border-dashed border-app-border opacity-60">
            <div className="w-24 h-24 rounded-4xl bg-app-bg border border-app-border flex items-center justify-center text-app-text-muted">
              <MessageSquare size={48} />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-app-text-main uppercase tracking-tight">Community is quiet</h3>
              <p className="text-app-text-sub font-bold max-w-sm mx-auto">Be the first to start a discussion or ask a doubt!</p>
            </div>
            <Button variant="primary" onClick={() => navigate('/community/ask')} className="rounded-2xl px-10 py-5">
              Start Discussion
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityHome;
