import React, { useEffect, useState, useMemo } from 'react';
import { 
  Bell, 
  Clock, 
  Newspaper, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Zap, 
  BookOpen, 
  ChevronRight,
  TrendingUp,
  Globe,
  Play,
  Heart,
  Share2,
  BookMarked,
  Filter,
  MapPin,
  CloudSun,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { userDataAPI } from '../../services/api';
import type { Notification, EducationNews } from '../../types';

// Mock additional data for the enhanced layout
const CATEGORIES = ['All', 'Exams', 'Scholarships', 'Policies', 'Opportunities', 'Career Tips'];

const Notifications: React.FC = () => {
  const { auth } = useAuth();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [news, setNews] = useState<EducationNews[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth?.user?.id) return;
      
      setLoadingNotifs(true);
      setLoadingNews(true);
      
      try {
        const [notifData, newsData] = await Promise.all([
          userDataAPI.getNotifications(String(auth.user.id)),
          userDataAPI.getEducationNews()
        ]);
        
        if (notifData.success) {
          setNotifications(notifData.notifications);
        }
        
        if (newsData.success) {
          setNews(newsData.news);
        }
      } catch (err) {
        console.error('Failed to fetch notifications page data', err);
        setError('Failed to load information. Please try again.');
      } finally {
        setLoadingNotifs(false);
        setLoadingNews(false);
      }
    };
    
    fetchData();
  }, [auth]);

  // Featured news for carousel (top 3)
  const featuredNews = useMemo(() => news.slice(0, 3), [news]);
  
  // Trending news (the rest)
  const filteredNews = useMemo(() => {
    let result = news;
    if (activeCategory !== 'All') {
       result = news.filter(item => 
         item.title.toLowerCase().includes(activeCategory.toLowerCase()) || 
         item.description.toLowerCase().includes(activeCategory.toLowerCase())
       );
    }
    return result;
  }, [news, activeCategory]);

  const latestAlert = useMemo(() => {
    return notifications.find(n => !n.is_read) || notifications[0];
  }, [notifications]);

  const nextCarousel = () => setCarouselIndex((prev) => (prev + 1) % featuredNews.length);
  const prevCarousel = () => setCarouselIndex((prev) => (prev - 1 + featuredNews.length) % featuredNews.length);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="text-red-500" size={32} />
        </div>
        <h2 className="text-xl font-black text-app-text-main uppercase tracking-tight">Something went wrong</h2>
        <p className="text-app-text-sub mt-2 max-w-xs font-bold text-xs uppercase tracking-widest">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-3 bg-primary text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg transition-colors duration-300">
      {/* Dynamic News Ticker */}
      <div className="w-full bg-app-bg-alt border-b border-app-border/50 py-2 overflow-hidden whitespace-nowrap">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-8 animate-in slide-in-from-right-full duration-[40s] repeat-infinite">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-app-text-muted">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            LIVE: CBSE EXAM RESULTS IN 2 DAYS
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-app-text-muted">
             <TrendingUp size={12} className="text-secondary" />
             SCHOLARSHIP PORTAL OPEN FOR 2026
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-app-text-muted">
             <Globe size={12} className="text-primary" />
             GLOBAL: AI LITERACY MANDATE UPDATES
          </div>
          {/* Duplicate for seamless scroll */}
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-app-text-muted">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            UGC: NEW CAREER GUIDELINES RELEASED
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-black text-[10px] tracking-[0.3em] uppercase mb-2">
              <span className="w-8 h-px bg-primary" />
              Intelligence Hub
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-app-text-main tracking-tight uppercase leading-none">
              The <span className="text-primary italic">Education</span> Gazette
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <div className="text-[10px] font-black text-app-text-muted uppercase tracking-widest">February 21, 2026</div>
                <div className="text-xs font-bold text-app-text-main uppercase tracking-tight">Student Edition</div>
             </div>
             <div className="w-px h-10 bg-app-border" />
             <div className="flex items-center gap-2 px-4 py-2 bg-app-bg-alt rounded-2xl border border-app-border">
                <CloudSun size={18} className="text-amber-500" />
                <span className="text-xs font-black text-app-text-main">24°C</span>
             </div>
          </div>
        </header>

        {/* Quick Alert Panel */}
        {latestAlert && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-between gap-4 group cursor-pointer hover:bg-primary/15 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
                <Bell size={16} className="text-white" />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] font-black text-primary uppercase tracking-widest mb-0.5">1 New Alert</span>
                <p className="text-xs font-bold text-app-text-main truncate">{latestAlert.title}</p>
              </div>
            </div>
            <button className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
              View <ChevronRight size={12} />
            </button>
          </motion.div>
        )}

        {/* Section 1: Featured Carousel */}
        <section className="mb-12">
          {!loadingNews && featuredNews.length > 0 ? (
            <div className="relative h-100 md:h-125 w-full rounded-[40px] overflow-hidden group shadow-2xl shadow-primary/10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={carouselIndex}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.7 }}
                  className="absolute inset-0"
                >
                  <img 
                    src={featuredNews[carouselIndex].image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070'} 
                    alt={featuredNews[carouselIndex].title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-app-bg via-app-bg/40 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full max-w-4xl space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                        Featured
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-black text-white/80 uppercase tracking-widest">
                        <TrendingUp size={12} className="text-secondary" />
                        Trending Now
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight">
                      {featuredNews[carouselIndex].title}
                    </h2>
                    <div className="flex items-center gap-4 text-xs font-bold text-white/70 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5 font-black text-primary uppercase">
                        <Newspaper size={14} />
                        {featuredNews[carouselIndex].source}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {new Date(featuredNews[carouselIndex].publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="pt-4 flex items-center gap-4">
                       <a 
                         href={featuredNews[carouselIndex].url}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="px-8 py-4 bg-white text-app-bg font-black rounded-2xl text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all"
                       >
                         Read Full Story
                       </a>
                       <button className="p-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl hover:bg-white/20 transition-all">
                          <Share2 size={20} />
                       </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows */}
              <div className="absolute top-1/2 -translate-y-1/2 w-full px-6 flex justify-between pointer-events-none">
                <button 
                  onClick={prevCarousel}
                  className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white pointer-events-auto hover:bg-primary transition-all group/btn"
                >
                  <ChevronLeft className="group-hover/btn:-translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={nextCarousel}
                  className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white pointer-events-auto hover:bg-primary transition-all group/btn"
                >
                  <ChevronRightIcon className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Indicators */}
              <div className="absolute top-8 right-8 flex gap-2">
                 {featuredNews.map((_, i) => (
                   <button 
                     key={i}
                     onClick={() => setCarouselIndex(i)}
                     className={`w-2 h-2 rounded-full transition-all duration-300 ${carouselIndex === i ? 'w-8 bg-primary' : 'bg-white/30'}`}
                   />
                 ))}
              </div>
            </div>
          ) : (
            <div className="h-100 w-full rounded-[40px] bg-app-bg-alt animate-pulse flex items-center justify-center">
               <Newspaper className="text-app-border animate-bounce" size={48} />
            </div>
          )}
        </section>

        {/* Section: Category Filters */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-app-text-main uppercase tracking-tight flex items-center gap-3">
               <Filter size={20} className="text-primary" />
               Browse News
            </h3>
            <div className="flex items-center gap-1 text-[10px] font-black text-app-text-muted uppercase tracking-widest">
               <LayoutGrid size={14} className="text-primary" />
               Grid View
            </div>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`
                  px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border
                  ${activeCategory === cat 
                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                    : 'bg-app-bg-alt border-app-border text-app-text-sub hover:border-primary/50'}
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Section 2: Trending News Grid */}
            <section className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {loadingNews ? (
                   Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-80 bg-app-bg-alt rounded-3xl animate-pulse" />
                   ))
                 ) : filteredNews.slice(0, 4).map((item, i) => (
                   <NewsItemCard key={item.id || i} item={item} />
                 ))}
               </div>
            </section>

            {/* Section 3: Featured Video Card */}
            <section>
               <div className="relative group rounded-[40px] overflow-hidden border border-app-border shadow-xl">
                  <div className="aspect-video relative overflow-hidden">
                     <img 
                       src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070" 
                       alt="Education Briefing" 
                       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                     />
                     <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                     <button className="absolute inset-0 m-auto w-20 h-20 bg-primary/90 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300">
                        <Play fill="currentColor" size={32} />
                     </button>
                     <div className="absolute top-6 left-6 flex items-center gap-2">
                        <div className="bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-[0.2em] animate-pulse">
                           Live Briefing
                        </div>
                        <div className="bg-black/30 backdrop-blur-md text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-[0.2em] border border-white/10">
                           <Video size={10} className="inline mr-1" />
                           Career Guidance
                        </div>
                     </div>
                  </div>
                  <div className="p-8 bg-app-bg-alt">
                     <h3 className="text-2xl font-black text-app-text-main uppercase tracking-tight mb-3">
                        Mastering Competitive Exams 2026: The AI Strategy
                     </h3>
                     <p className="text-sm text-app-text-sub font-bold uppercase tracking-widest leading-relaxed opacity-70 mb-6">
                        Watch our latest education briefing on how to leverage AI tools for national entrance exams.
                     </p>
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                              <Zap className="text-primary" size={20} />
                           </div>
                           <div>
                              <div className="text-xs font-black text-app-text-main uppercase tracking-tight">AI Academic Team</div>
                              <div className="text-[10px] font-bold text-app-text-muted uppercase tracking-widest">12K Students Watching</div>
                           </div>
                        </div>
                        <button className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all">
                           Watch Now <ChevronRight size={14} />
                        </button>
                     </div>
                  </div>
               </div>
            </section>

            {/* Section 4: Top Stories List (Scholarships, etc) */}
            <section className="space-y-6">
               <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-app-text-main uppercase tracking-tight flex items-center gap-3">
                     <List size={22} className="text-secondary" />
                     Briefings & Updates
                  </h3>
                  <button className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">View All</button>
               </div>
               <div className="space-y-4">
                  {[
                    { title: "National PM Scholarship 2026: Application Portal Now Live", type: "Scholarship", date: "2h ago", color: "text-emerald-500" },
                    { title: "New UGC Policy on Credits for Online Internships", type: "Policy", date: "5h ago", color: "text-blue-500" },
                    { title: "JEE Main 2026 Attempt 1 Schedule Published", type: "Exams", date: "8h ago", color: "text-amber-500" },
                    { title: "Top 10 Emerging AI Careers for Graduates in 2026", type: "Career", date: "1d ago", color: "text-purple-500" }
                  ].map((story, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ x: 10 }}
                      className="group p-5 bg-app-bg-alt/50 border border-app-border rounded-2xl flex items-center justify-between gap-4 cursor-pointer hover:bg-app-bg-alt transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-1.5 h-10 rounded-full ${story.color.replace('text-', 'bg-')}`} />
                        <div>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${story.color}`}>{story.type}</span>
                          <h4 className="text-sm font-black text-app-text-main uppercase tracking-tight group-hover:text-primary transition-colors">{story.title}</h4>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-app-text-muted uppercase tracking-widest">{story.date}</span>
                    </motion.div>
                  ))}
               </div>
            </section>

            {/* Load More Button */}
            <div className="pt-8 text-center">
               <button className="px-12 py-5 bg-app-bg-alt border border-app-border rounded-[28px] text-xs font-black text-app-text-main uppercase tracking-[0.3em] hover:bg-primary hover:text-white hover:border-primary transition-all shadow-xl shadow-black/5 flex items-center gap-3 mx-auto">
                  <Zap size={16} />
                  See More Updates
               </button>
            </div>

          </div>

          {/* Right Sidebar Column */}
          <div className="lg:col-span-4 space-y-10 lg:sticky lg:top-8">
            
            {/* Sidebar Widget 1: Notifications */}
            <section className="bg-app-bg-alt rounded-[40px] border border-app-border p-8 shadow-sm">
               <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black text-app-text-main uppercase tracking-tight flex items-center gap-3">
                    <Bell className="text-primary" size={24} />
                    Personal
                  </h2>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg">
                    {notifications.filter(n => !n.is_read).length} New
                  </span>
               </div>
               
               <div className="space-y-6 max-h-125 overflow-y-auto pr-2 custom-scrollbar">
                  {loadingNotifs ? (
                    Array.from({ length: 3 }).map((_, i) => (
                       <div key={i} className="flex gap-4 animate-pulse">
                          <div className="w-10 h-10 bg-app-border rounded-xl" />
                          <div className="flex-1 space-y-2">
                             <div className="h-3 bg-app-border rounded-full w-2/3" />
                             <div className="h-2 bg-app-border rounded-full w-full" />
                          </div>
                       </div>
                    ))
                  ) : notifications.length === 0 ? (
                    <div className="py-12 text-center opacity-40">
                       <Zap size={40} className="mx-auto mb-4" />
                       <p className="text-[10px] font-black uppercase tracking-widest">No Alerts</p>
                    </div>
                  ) : (
                    notifications.slice(0, 5).map(notif => (
                       <div key={notif.id} className="relative group flex gap-4 cursor-pointer">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${notif.is_read ? 'bg-app-bg border-app-border' : 'bg-primary/10 border-primary/20'}`}>
                             {getNotifIcon(notif.type, notif.priority)}
                          </div>
                          <div className="min-w-0">
                             <div className="flex items-center justify-between gap-2">
                                <h4 className={`text-xs font-black uppercase tracking-tight truncate ${!notif.is_read ? 'text-app-text-main' : 'text-app-text-sub'}`}>
                                   {notif.title}
                                </h4>
                                <span className="text-[8px] font-bold text-app-text-muted uppercase tracking-widest whitespace-nowrap">
                                   {new Date(notif.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </span>
                             </div>
                             <p className="text-[10px] font-bold text-app-text-sub uppercase tracking-widest line-clamp-2 mt-1 opacity-60">
                                {notif.message}
                             </p>
                          </div>
                       </div>
                    ))
                  )}
               </div>
               
               <button className="w-full mt-8 py-4 border-2 border-dashed border-app-border rounded-2xl text-[9px] font-black text-app-text-muted uppercase tracking-[0.2em] hover:border-primary hover:text-primary transition-all">
                  Open Inbox
               </button>
            </section>

            {/* Sidebar Widget 2: Local Academic Updates */}
            <section className="bg-secondary/5 rounded-[40px] border border-secondary/10 p-8">
               <div className="flex items-center gap-3 mb-6">
                  <MapPin className="text-secondary" size={24} />
                  <h2 className="text-xl font-black text-app-text-main uppercase tracking-tight">Local Alerts</h2>
               </div>
               <div className="space-y-5">
                  {[
                    { title: "District Science Fair 2026 starts tomorrow", time: "Local Event" },
                    { title: "Monsoon schedule for schools in your area", time: "Admin Update" },
                  ].map((local, i) => (
                    <div key={i} className="flex gap-4 items-start group cursor-pointer">
                       <div className="w-2 h-2 rounded-full bg-secondary mt-1.5 group-hover:scale-150 transition-transform" />
                       <div>
                          <p className="text-xs font-black text-app-text-main uppercase tracking-tight leading-tight group-hover:text-secondary transition-colors">{local.title}</p>
                          <span className="text-[9px] font-bold text-app-text-muted uppercase tracking-widest">{local.time}</span>
                       </div>
                    </div>
                  ))}
               </div>
            </section>

            {/* Sidebar Widget 3: AI Learning Insight */}
            <div className="relative p-8 bg-app-text-main rounded-[40px] text-white overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Zap size={100} fill="currentColor" />
               </div>
               <div className="relative z-10 space-y-4">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                     <BookOpen className="text-primary" size={24} />
                  </div>
                  <h4 className="text-xl font-black uppercase tracking-tight italic">Learn Smarter</h4>
                  <p className="text-xs font-bold text-white/70 uppercase tracking-widest leading-relaxed">
                     Students who check news daily are 40% more likely to discover exclusive scholarships.
                  </p>
                  <button className="w-full py-4 bg-primary text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 transition-all">
                     View Recommended
                  </button>
               </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

const NewsItemCard: React.FC<{ item: EducationNews }> = ({ item }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="group bg-app-bg-alt border border-app-border rounded-4xl overflow-hidden flex flex-col shadow-sm hover:shadow-xl transition-all duration-500"
  >
    <div className="relative h-48 overflow-hidden">
      <img 
        src={item.image || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070'} 
        alt={item.title} 
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
         <div className="flex gap-4">
            <button className="p-2 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/40"><Heart size={16} /></button>
            <button className="p-2 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/40"><BookMarked size={16} /></button>
         </div>
      </div>
      <div className="absolute top-4 left-4 flex gap-2">
         <div className="px-3 py-1 bg-black/40 backdrop-blur-md border border-white/20 text-white text-[8px] font-black uppercase tracking-widest rounded-lg">
           {item.source}
         </div>
      </div>
    </div>
    <div className="p-6 flex-1 flex flex-col">
      <h3 className="text-sm font-black text-app-text-main uppercase tracking-tight group-hover:text-primary transition-colors line-clamp-2 leading-relaxed mb-3">
        {item.title}
      </h3>
      <div className="mt-auto flex items-center justify-between border-t border-app-border pt-4">
        <div className="flex items-center gap-2 text-[9px] font-bold text-app-text-muted uppercase tracking-widest">
           <Clock size={12} />
           {new Date(item.publishedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
        </div>
        <a 
          href={item.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[9px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-1 group-hover:gap-2 transition-all"
        >
          View Story <ChevronRight size={12} />
        </a>
      </div>
    </div>
  </motion.div>
);

const getNotifIcon = (type: string, priority?: string) => {
  if (priority === 'high') return <AlertCircle className="text-red-500" size={18} />;
  
  switch (type) {
    case 'assignment': return <BookOpen className="text-blue-500" size={18} />;
    case 'info': return <Info className="text-secondary" size={18} />;
    case 'success': return <CheckCircle2 className="text-emerald-500" size={18} />;
    case 'system': return <Zap className="text-amber-500" size={18} />;
    default: return <Bell className="text-app-text-muted" size={18} />;
  }
};

export default Notifications;

