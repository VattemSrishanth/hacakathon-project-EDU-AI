import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, Plus, Search, HelpCircle, Clock, Filter,
  RefreshCw, WifiOff, ThumbsUp, Reply, Bookmark, Eye,
  CheckCircle2, Award, UserCheck, ChevronRight } from
'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { useOffline } from '../../context/OfflineContext';
import Button from '../../components/Button';
import Card from '../../components/Card';

const CommunityHome = () => {
  const navigate = useNavigate();
  const { doubts, loading, refreshDoubts } = useCommunity();
  const { isOffline } = useOffline();
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Recent');

  const filters = ['All', 'Mathematics', 'Science', 'English', 'Social Studies', 'Physics'];
  const sortOptions = ['Recent', 'Solved', 'Unanswered', 'Most Helpful', 'Teacher Answered'];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Professional Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider">
              Discussion Forum
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Academic Peer Learning</h1>
            <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
              Collaborate on complex topics and share verified knowledge
              {isOffline &&
              <span className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 font-bold text-[10px]">
                  <WifiOff size={10} />
                  OFFLINE
                </span>
              }
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => refreshDoubts()}
              disabled={loading || isOffline}
              className="rounded-xl flex items-center gap-2 px-5 py-3 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs">
              
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh Feed
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate('/community/ask')}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 px-6 py-3 font-bold text-xs shadow-sm shadow-indigo-200">
              
              <Plus size={16} />
              New Discussion
            </Button>
          </div>
        </div>

        {/* Search & Advanced Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search by topic, keyword, or problem statement..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-4 text-slate-800 font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 outline-none transition-all shadow-sm" />
              
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {filters.map((filter) =>
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2.5 rounded-lg border text-xs font-bold whitespace-nowrap transition-all ${
                activeFilter === filter ?
                'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' :
                'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`
                }>
                
                  {filter}
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <Filter size={14} className="text-indigo-600" />
              Filter By
            </div>
            <div className="grid grid-cols-2 gap-2">
              {sortOptions.map((option) =>
              <button
                key={option}
                onClick={() => {
                  setActiveSort(option);
                  refreshDoubts({ filter: option.toLowerCase().replace(' ', '_') });
                }}
                className={`px-3 py-2 rounded-lg text-[10px] font-bold text-left transition-all ${
                activeSort === option ?
                'bg-slate-900 text-white' :
                'bg-slate-50 text-slate-500 hover:bg-slate-100'}`
                }>
                
                  {option}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading && doubts.length === 0 ?
        <div className="py-24 flex flex-col items-center justify-center space-y-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
              <HelpCircle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-200" size={24} />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Synchronizing discussions...</p>
          </div> :
        doubts.length > 0 ?
        <div className="grid grid-cols-1 gap-5">
            {doubts.map((doubt) =>
          <Card key={doubt.id} className={`group bg-white border border-slate-200 overflow-hidden hover:border-indigo-300 transition-all hover:shadow-md rounded-2xl ${doubt.isVerified ? 'border-l-4 border-l-emerald-500' : ''}`}>
                <div className="p-6">
                  {/* Context Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200 uppercase">{doubt.subject}</span>
                        <span className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100 uppercase">{doubt.topic || 'General'}</span>
                        <span className="px-2.5 py-1 rounded bg-slate-50 text-slate-500 text-[10px] font-bold border border-slate-100 uppercase">{doubt.classLevel || 'Class 10'}</span>
                      </div>
                      {doubt.status === 'solved' &&
                  <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-100">
                          <CheckCircle2 size={12} />
                          RESOLVED
                        </div>
                  }
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <Clock size={12} />
                        {new Date(doubt.createdAt).toLocaleDateString()}
                      </div>
                      <button className="text-slate-300 hover:text-indigo-600 transition-colors">
                        <Bookmark size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="cursor-pointer" onClick={() => navigate(`/community/discussion/${doubt.id}`)}>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-3">
                      {doubt.question}
                    </h3>
                  </div>

                  {/* Credentials & Indicators */}
                  <div className="flex flex-wrap items-center justify-between gap-6 pt-5 border-t border-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                          {doubt.username.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            {doubt.username}
                            {doubt.username.includes('Teacher') &&
                        <span className="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0.5 rounded flex items-center gap-0.5 font-black uppercase">
                                <Award size={10} />
                                Teacher
                              </span>
                        }
                          </p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Top Contributor</p>
                        </div>
                      </div>
                      <div className="h-4 w-px bg-slate-100 hidden sm:block" />
                      <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-black uppercase tracking-widest bg-emerald-50/50 px-2 py-1 rounded">
                        <UserCheck size={12} />
                        Verified Expert
                      </div>
                    </div>

                    {/* Metrics & Quick Actions */}
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[11px]">
                          <MessageSquare size={14} className="text-slate-400" />
                          {doubt.repliesCount || 0} Replies
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[11px]">
                          <Eye size={14} className="text-slate-400" />
                          {doubt.viewsCount || 0} Views
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100 group/btn">
                          <ThumbsUp size={14} className="group-hover/btn:scale-110 transition-transform" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Helpful ({doubt.helpfulCount || 0})</span>
                        </button>
                        <button
                      onClick={() => navigate(`/community/discussion/${doubt.id}`)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all border border-indigo-600 shadow-sm group/reply">
                      
                          <Reply size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">View Thread</span>
                          <ChevronRight size={14} className="group-hover/reply:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
          )}
          </div> :

        <div className="py-24 flex flex-col items-center justify-center space-y-6 bg-white rounded-3xl border border-slate-100 shadow-sm text-center px-10">
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
              <MessageSquare size={40} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Start the Conversation</h3>
              <p className="text-slate-500 mt-2 font-medium max-w-sm">There are no discussions in this area yet. Be the first to ask a doubt or start an academic thread!</p>
            </div>
            <Button
            variant="primary"
            onClick={() => navigate('/community/ask')}
            className="rounded-xl px-10 py-4 font-bold bg-indigo-600">
            
              Ask First Doubt
            </Button>
          </div>
        }
      </div>
    </div>);

};

export default CommunityHome;