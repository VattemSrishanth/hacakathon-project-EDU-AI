import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Send,
  Zap,
  FileText,
  CheckSquare,
  GraduationCap,
  Trophy,
  BookOpen,
  Bell,
  Bookmark,
  TrendingUp,
  User,
  List,
  LayoutGrid,
  ListTodo,
  Database,
  Calendar,
  BarChart3,
  Compass,
  AlertCircle,
  CheckCircle2,
  Info,
  X,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { userDataAPI } from '../../services/api';

// Curated default academic items matching reference design
const DEFAULT_HERO_SLIDES = [
  {
    id: 'hero-1',
    badge: 'LATEST UPDATE',
    title: 'ISRO Assistant, JPA Result 2026 Declared at isro.gov.in',
    subtitle: 'Skill Test on November 1 | Direct link to download scorecards available now.',
    url: 'https://www.isro.gov.in',
    image: 'https://images.unsplash.com/photo-1517976487507-5b3df1182e32?q=80&w=1200'
  },
  {
    id: 'hero-2',
    badge: 'EXAM ALERT',
    title: 'GATE 2027 Registration Portal Officially Live',
    subtitle: 'Check eligibility, paper combinations, and online application guidelines.',
    url: 'https://gate.iitk.ac.in',
    image: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?q=80&w=1200'
  },
  {
    id: 'hero-3',
    badge: 'SCHOLARSHIP',
    title: 'National Scholarship Scheme 2026 For STEM Undergrads',
    subtitle: 'Direct financial assistance up to ₹50,000 for top performing students.',
    url: 'https://scholarships.gov.in',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200'
  }
];

const DEFAULT_ARTICLES = [
  {
    id: 'art-1',
    title: 'ISRO Assistant, JPA Result 2026 Declared at isro.gov.in',
    description: 'Skill Test on November 1. Direct link to download scorecards here.',
    url: 'https://www.isro.gov.in',
    image: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?q=80&w=800',
    timeAgo: '2 hours ago',
    tag: 'Results',
    tagColor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
  },
  {
    id: 'art-2',
    title: 'TS Intermediate Supplementary Results 2026',
    description: 'Check complete details, important dates and direct links.',
    url: 'https://tsbie.cgg.gov.in',
    image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800',
    timeAgo: '5 hours ago',
    tag: 'Exam',
    tagColor: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300'
  },
  {
    id: 'art-3',
    title: 'JNTUH B.Tech Admissions 2026 – Important Dates',
    description: 'Application process, eligibility, counselling details and more.',
    url: 'https://jntuh.ac.in',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=800',
    timeAgo: '1 day ago',
    tag: 'Admission',
    tagColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
  }
];

const DEFAULT_BRIEFINGS = [
  {
    id: 'brief-1',
    title: 'TS EAMCET 2026: Web Options Entry Schedule Released',
    description: 'Complete schedule and instructions for option entry process.',
    url: 'https://eamcet.tsche.ac.in',
    timeAgo: '3h ago',
    dotColor: 'bg-emerald-500'
  },
  {
    id: 'brief-2',
    title: 'GATE 2027: Application Process to Begin in August',
    description: 'Check eligibility, important dates and exam pattern.',
    url: 'https://gate.iitk.ac.in',
    timeAgo: '5h ago',
    dotColor: 'bg-amber-500'
  },
  {
    id: 'brief-3',
    title: 'UPSC Civil Services 2026: Notification Expected Soon',
    description: 'Stay updated with latest news and preparation resources.',
    url: 'https://upsc.gov.in',
    timeAgo: '1d ago',
    dotColor: 'bg-rose-500'
  },
  {
    id: 'brief-4',
    title: 'Recent Scholarship Opportunities for Engineering Students',
    description: 'Explore government and private scholarships with deadlines.',
    url: 'https://scholarships.gov.in',
    timeAgo: '2d ago',
    dotColor: 'bg-purple-500'
  }
];

const Notifications = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [news, setNews] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);
  const [error, setError] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [aiQuery, setAiQuery] = useState('');
  const [savedArticles, setSavedArticles] = useState([]);
  const [showNotifModal, setShowNotifModal] = useState(false);

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
          setNotifications(notifData.notifications || []);
        }

        if (newsData.success && Array.isArray(newsData.news) && newsData.news.length > 0) {
          setNews(newsData.news);
        }
      } catch (err) {
        console.error('Failed to fetch education page data', err);
        setError('Failed to load real-time updates. Default academic resources are active.');
      } finally {
        setLoadingNotifs(false);
        setLoadingNews(false);
      }
    };

    fetchData();
  }, [auth]);

  // Slides for Hero carousel
  const heroSlides = useMemo(() => {
    if (news.length >= 3) {
      return news.slice(0, 3).map((item, idx) => ({
        id: item.id || `news-${idx}`,
        badge: idx === 0 ? 'LATEST UPDATE' : idx === 1 ? 'EXAM ALERT' : 'TRENDING NOW',
        title: item.title,
        subtitle: item.description || DEFAULT_HERO_SLIDES[idx].subtitle,
        url: item.url,
        image: item.image || DEFAULT_HERO_SLIDES[idx].image
      }));
    }
    return DEFAULT_HERO_SLIDES;
  }, [news]);

  // Auto-advance hero carousel
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Latest 3 Articles for Row 3
  const articlesList = useMemo(() => {
    if (news.length >= 3) {
      const tags = [
        { tag: 'Results', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
        { tag: 'Exam', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' },
        { tag: 'Admission', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' }
      ];
      return news.slice(0, 3).map((item, idx) => ({
        id: item.id || `art-${idx}`,
        title: item.title,
        description: item.description || DEFAULT_ARTICLES[idx].description,
        url: item.url,
        image: item.image || DEFAULT_ARTICLES[idx].image,
        timeAgo: item.publishedAt ? new Date(item.publishedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : `${idx * 3 + 2} hours ago`,
        tag: tags[idx % tags.length].tag,
        tagColor: tags[idx % tags.length].color
      }));
    }
    return DEFAULT_ARTICLES;
  }, [news]);

  // Briefings List for Row 4
  const briefingsList = useMemo(() => {
    if (news.length > 3) {
      const dots = ['bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500'];
      return news.slice(3, 7).map((item, idx) => ({
        id: item.id || `brief-${idx}`,
        title: item.title,
        description: item.description || 'Check eligibility, guidelines, and direct portals.',
        url: item.url,
        timeAgo: item.publishedAt ? new Date(item.publishedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : `${(idx + 1) * 3}h ago`,
        dotColor: dots[idx % dots.length]
      }));
    }
    return DEFAULT_BRIEFINGS;
  }, [news]);

  const activeHero = heroSlides[carouselIndex] || heroSlides[0];

  const handleAiSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const query = aiQuery.trim();
    if (!query) {
      navigate('/ai-tutor');
      return;
    }
    navigate('/ai-tutor', { state: { initialPrompt: query } });
  };

  const handleAiChipClick = (chip) => {
    navigate('/ai-tutor', { state: { initialPrompt: `Tell me about ${chip}` } });
  };

  const handleQuickAccess = (id) => {
    switch (id) {
      case 'results':
        navigate('/exams/results');
        break;
      case 'syllabus':
        navigate('/lessons/uploaded');
        break;
      case 'admissions':
        navigate('/lessons');
        break;
      case 'scholarships':
        navigate('/ai-tutor', { state: { initialPrompt: 'Show me available educational scholarships and eligibility criteria.' } });
        break;
      case 'notifications':
        setShowNotifModal(true);
        break;
      case 'updates':
      default:
        window.scrollTo({ top: 350, behavior: 'smooth' });
        break;
    }
  };

  const toggleSaveArticle = (articleId) => {
    setSavedArticles((prev) =>
      prev.includes(articleId) ? prev.filter((id) => id !== articleId) : [...prev, articleId]
    );
  };

  const quickAccessCards = [
    {
      id: 'updates',
      label: 'Latest Updates',
      sub: 'Government & Private',
      icon: FileText,
      iconColor: 'text-rose-600 dark:text-rose-400',
      bgClass: 'bg-rose-50/80 dark:bg-rose-950/25 border-rose-200/70 dark:border-rose-900/40 hover:border-rose-300 dark:hover:border-rose-700'
    },
    {
      id: 'results',
      label: 'Results',
      sub: 'Check Exam Results',
      icon: CheckSquare,
      iconColor: 'text-sky-600 dark:text-sky-400',
      bgClass: 'bg-sky-50/80 dark:bg-sky-950/25 border-sky-200/70 dark:border-sky-900/40 hover:border-sky-300 dark:hover:border-sky-700'
    },
    {
      id: 'admissions',
      label: 'Admissions',
      sub: 'Colleges & Courses',
      icon: GraduationCap,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bgClass: 'bg-emerald-50/80 dark:bg-emerald-950/25 border-emerald-200/70 dark:border-emerald-900/40 hover:border-emerald-300 dark:hover:border-emerald-700'
    },
    {
      id: 'scholarships',
      label: 'Scholarships',
      sub: 'Find Opportunities',
      icon: Trophy,
      iconColor: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-50/80 dark:bg-amber-950/25 border-amber-200/70 dark:border-amber-900/40 hover:border-amber-300 dark:hover:border-amber-700'
    },
    {
      id: 'syllabus',
      label: 'Syllabus',
      sub: 'Download PDFs',
      icon: BookOpen,
      iconColor: 'text-purple-600 dark:text-purple-400',
      bgClass: 'bg-purple-50/80 dark:bg-purple-950/25 border-purple-200/70 dark:border-purple-900/40 hover:border-purple-300 dark:hover:border-purple-700'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      sub: 'Important Alerts',
      icon: Bell,
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgClass: 'bg-blue-50/80 dark:bg-blue-950/25 border-blue-200/70 dark:border-blue-900/40 hover:border-blue-300 dark:hover:border-blue-700'
    }
  ];

  const personalItems = [
    {
      id: 'my-exams',
      title: 'My Exams',
      sub: 'Manage your exam dates',
      icon: FileText,
      iconBg: 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
      onClick: () => navigate('/exams')
    },
    {
      id: 'saved-articles',
      title: 'Saved Articles',
      sub: `${savedArticles.length > 0 ? savedArticles.length : 'Your'} bookmarked content`,
      icon: Bookmark,
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
      onClick: () => setShowNotifModal(true)
    },
    {
      id: 'my-certificates',
      title: 'My Certificates',
      sub: 'View and download',
      icon: Trophy,
      iconBg: 'bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400',
      onClick: () => navigate('/certificates')
    },
    {
      id: 'study-progress',
      title: 'Study Progress',
      sub: 'Track your learning journey',
      icon: TrendingUp,
      iconBg: 'bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
      onClick: () => navigate('/dashboard')
    },
    {
      id: 'notifications-item',
      title: 'Notifications',
      sub: `${notifications.filter((n) => !n.is_read).length || 'Latest'} updates and alerts`,
      icon: Bell,
      iconBg: 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
      onClick: () => setShowNotifModal(true)
    }
  ];

  const toolsCards = [
    {
      id: 'previous-papers',
      label: 'Previous Papers',
      icon: ListTodo,
      iconColor: 'text-rose-600 dark:text-rose-400',
      bgClass: 'bg-rose-50/80 dark:bg-rose-950/25 border-rose-200/70 dark:border-rose-900/40 hover:border-rose-300 dark:hover:border-rose-700',
      route: '/exams'
    },
    {
      id: 'question-banks',
      label: 'Question Banks',
      icon: Database,
      iconColor: 'text-sky-600 dark:text-sky-400',
      bgClass: 'bg-sky-50/80 dark:bg-sky-950/25 border-sky-200/70 dark:border-sky-900/40 hover:border-sky-300 dark:hover:border-sky-700',
      route: '/lessons/quiz'
    },
    {
      id: 'study-material',
      label: 'Study Material',
      icon: BookOpen,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bgClass: 'bg-emerald-50/80 dark:bg-emerald-950/25 border-emerald-200/70 dark:border-emerald-900/40 hover:border-emerald-300 dark:hover:border-emerald-700',
      route: '/lessons'
    },
    {
      id: 'exam-calendar',
      label: 'Exam Calendar',
      icon: Calendar,
      iconColor: 'text-purple-600 dark:text-purple-400',
      bgClass: 'bg-purple-50/80 dark:bg-purple-950/25 border-purple-200/70 dark:border-purple-900/40 hover:border-purple-300 dark:hover:border-purple-700',
      route: '/exams'
    },
    {
      id: 'college-predictor',
      label: 'College Predictor',
      icon: BarChart3,
      iconColor: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-50/80 dark:bg-amber-950/25 border-amber-200/70 dark:border-amber-900/40 hover:border-amber-300 dark:hover:border-amber-700',
      route: '/insights'
    },
    {
      id: 'career-guidance',
      label: 'Career Guidance',
      icon: Compass,
      iconColor: 'text-orange-600 dark:text-orange-400',
      bgClass: 'bg-orange-50/80 dark:bg-orange-950/25 border-orange-200/70 dark:border-orange-900/40 hover:border-orange-300 dark:hover:border-orange-700',
      route: '/ai-tutor',
      prompt: 'Provide career guidance and roadmap for my studies.'
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 transition-colors duration-300">
      {/* Page Header */}
      <header className="space-y-1">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider hover:underline transition-all cursor-pointer"
        >
          <ChevronLeft size={14} />
          <span>EDUCATION HUB</span>
        </button>
        <h1 className="text-3xl md:text-4xl font-extrabold text-app-text-main tracking-tight">
          Educ<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">ation</span>
        </h1>
        <p className="text-xs md:text-sm text-app-text-muted">
          All your academic resources, updates and tools in one place
        </p>
      </header>

      {/* Row 1: Hero Carousel Banner (8 cols) + AI Assistant Card (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Hero Carousel Banner */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          <div className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-[#0B1021] border border-slate-800 p-6 md:p-8 flex flex-col justify-between min-h-[240px] shadow-sm group">
            {/* Background Graphic: Space/Rocket visual on right with gradient fade */}
            <div className="absolute right-0 top-0 bottom-0 w-3/5 md:w-1/2 overflow-hidden pointer-events-none select-none">
              <img
                src={activeHero.image}
                alt={activeHero.title}
                className="w-full h-full object-cover object-center opacity-85 transition-opacity duration-700"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1517976487507-5b3df1182e32?q=80&w=1200';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0B1021] via-[#0B1021]/80 to-transparent" />
            </div>

            {/* Banner Content (Locked dark theme colors to guarantee contrast on cosmic card) */}
            <div className="relative z-10 max-w-lg space-y-2.5">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-pink-600 text-white shadow-xs">
                {activeHero.badge}
              </span>
              <h2 className="text-lg md:text-2xl font-extrabold text-white leading-snug line-clamp-2">
                {activeHero.title}
              </h2>
              <p className="text-xs md:text-sm text-slate-200 line-clamp-2 leading-relaxed">
                {activeHero.subtitle}
              </p>
            </div>

            {/* Banner Actions & Pagination Dots */}
            <div className="relative z-10 flex items-center justify-between pt-5 mt-auto">
              <a
                href={activeHero.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-xs px-4 py-2 rounded-full inline-flex items-center gap-1.5 shadow-md hover:scale-105 transition-all cursor-pointer"
                style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
              >
                <span>Read Full Article</span>
                <ChevronRight size={13} />
              </a>

              {/* Dots */}
              <div className="flex items-center gap-1.5">
                {heroSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCarouselIndex(i)}
                    aria-label={`Slide ${i + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      carouselIndex === i ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: AI Assistant Card */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          <div className="bg-app-bg-alt border border-app-border rounded-2xl md:rounded-3xl p-5 flex flex-col justify-between shadow-sm h-full">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-purple-600 dark:text-purple-400" />
                  <h3 className="font-bold text-sm md:text-base text-app-text-main">AI Assistant</h3>
                </div>
                <button
                  onClick={() => navigate('/ai-tutor')}
                  className="text-xs font-semibold px-3 py-1 rounded-full border border-app-border text-app-text-sub hover:text-primary hover:border-primary transition-all cursor-pointer"
                >
                  Try Now
                </button>
              </div>
              <p className="text-xs text-app-text-muted leading-relaxed mb-4">
                Ask any educational query, get instant answers, study materials, and more.
              </p>

              {/* Prompt Input */}
              <form onSubmit={handleAiSubmit} className="relative mb-3">
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Ask about exams, results, syllabus..."
                  className="w-full bg-app-bg border border-app-border rounded-xl pl-3.5 pr-11 py-2.5 text-xs text-app-text-main placeholder:text-app-text-muted focus:outline-none focus:border-primary transition-all"
                />
                <button
                  type="submit"
                  aria-label="Send query"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-sm"
                >
                  <Send size={12} className="translate-x-[-1px] translate-y-[-1px] rotate-45" />
                </button>
              </form>
            </div>

            {/* Suggestion Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {['Exam Info', 'Syllabus', 'Scholarships', 'Results', 'Study Tips'].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleAiChipClick(chip)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-app-bg border border-app-border text-app-text-sub hover:text-primary hover:border-primary transition-all cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Quick Access (6 Pastel Cards) */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-amber-500 fill-amber-500" />
            <h3 className="text-sm font-bold text-app-text-main">Quick Access</h3>
          </div>
          <button
            onClick={() => handleQuickAccess('updates')}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            View All <ChevronRight size={12} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickAccessCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => handleQuickAccess(card.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer group hover:-translate-y-0.5 hover:shadow-xs flex flex-col justify-between ${card.bgClass}`}
              >
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-black/20 flex items-center justify-center mb-3 shadow-xs">
                  <Icon size={16} className={card.iconColor} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-app-text-main group-hover:text-primary transition-colors leading-tight">
                    {card.label}
                  </h4>
                  <p className="text-[10px] text-app-text-muted mt-0.5 truncate">
                    {card.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Row 3: Latest Articles (8 cols) + Personal (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Latest Articles (3 Cards) */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-app-text-main">Latest Articles</h3>
              </div>
              <button
                onClick={() => handleQuickAccess('updates')}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                View All <ChevronRight size={12} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {articlesList.map((item) => (
                <article
                  key={item.id}
                  className="bg-app-bg-alt border border-app-border rounded-2xl overflow-hidden flex flex-col hover:border-primary/40 hover:shadow-sm transition-all group"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-app-bg">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?q=80&w=800';
                      }}
                    />
                  </div>
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${item.tagColor}`}>
                          {item.tag}
                        </span>
                        <span className="text-[10px] text-app-text-muted font-medium">
                          {item.timeAgo}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-app-text-main line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-app-text-muted line-clamp-2 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-app-border/40 flex items-center justify-between">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Read More <ChevronRight size={12} />
                      </a>
                      <button
                        onClick={() => toggleSaveArticle(item.id)}
                        aria-label="Save article"
                        className={`p-1 rounded-md transition-colors ${
                          savedArticles.includes(item.id)
                            ? 'text-emerald-600 fill-emerald-600'
                            : 'text-app-text-muted hover:text-app-text-main'
                        }`}
                      >
                        <Bookmark size={14} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        {/* Personal Card */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          <div className="bg-app-bg-alt border border-app-border rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-sm h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-app-border/50">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-blue-600 dark:text-blue-400" />
                  <h3 className="font-bold text-sm md:text-base text-app-text-main">Personal</h3>
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  View Profile
                </button>
              </div>

              <div className="space-y-1">
                {personalItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={item.onClick}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-app-bg transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.iconBg}`}>
                          <Icon size={15} />
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-app-text-main group-hover:text-primary transition-colors leading-tight truncate">
                            {item.title}
                          </h5>
                          <p className="text-[10px] text-app-text-muted truncate mt-0.5">
                            {item.sub}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-app-text-muted group-hover:text-app-text-main group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Briefings & Updates (8 cols) + Tools & Resources (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Briefings & Updates */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          <div className="bg-app-bg-alt border border-app-border rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-sm h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-app-border/50">
                <div className="flex items-center gap-2">
                  <List size={16} className="text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-bold text-app-text-main">Briefings & Updates</h3>
                </div>
                <button
                  onClick={() => handleQuickAccess('updates')}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  View All <ChevronRight size={12} />
                </button>
              </div>

              <div className="space-y-3">
                {briefingsList.map((briefing) => (
                  <div
                    key={briefing.id}
                    onClick={() => briefing.url && window.open(briefing.url, '_blank')}
                    className="flex items-start justify-between gap-3 p-1 rounded-xl hover:bg-app-bg transition-all cursor-pointer group border-b border-app-border/40 last:border-b-0 pb-3 last:pb-1"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${briefing.dotColor}`} />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-app-text-main group-hover:text-primary transition-colors leading-snug">
                          {briefing.title}
                        </h4>
                        <p className="text-[11px] text-app-text-muted mt-0.5 line-clamp-1">
                          {briefing.description}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-app-text-muted group-hover:text-primary transition-colors whitespace-nowrap flex items-center gap-0.5 shrink-0 pt-0.5">
                      {briefing.timeAgo} <ChevronRight size={11} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tools & Resources (6 Grid Buttons) */}
        <div className="lg:col-span-4 flex flex-col justify-between">
          <div className="bg-app-bg-alt border border-app-border rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-sm h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-app-border/50">
                <div className="flex items-center gap-2">
                  <LayoutGrid size={16} className="text-purple-600 dark:text-purple-400" />
                  <h3 className="text-sm font-bold text-app-text-main">Tools & Resources</h3>
                </div>
                <button
                  onClick={() => navigate('/lessons')}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  View All <ChevronRight size={12} />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2.5">
                {toolsCards.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <div
                      key={tool.id}
                      onClick={() => {
                        if (tool.prompt) {
                          navigate(tool.route, { state: { initialPrompt: tool.prompt } });
                        } else {
                          navigate(tool.route);
                        }
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer group hover:-translate-y-0.5 hover:shadow-xs flex flex-col items-center justify-center text-center ${tool.bgClass}`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-white dark:bg-black/20 flex items-center justify-center mb-1.5 shadow-xs">
                        <Icon size={14} className={tool.iconColor} />
                      </div>
                      <span className="text-xs font-bold text-app-text-main group-hover:text-primary transition-colors leading-tight">
                        {tool.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Modal */}
      <AnimatePresence>
        {showNotifModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-app-bg border border-app-border rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-app-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Bell size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-app-text-main">Academic Notifications</h3>
                    <p className="text-[11px] text-app-text-muted">
                      {notifications.filter((n) => !n.is_read).length} unread updates
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNotifModal(false)}
                  className="p-1.5 rounded-xl hover:bg-app-bg-alt text-app-text-muted hover:text-app-text-main transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                {loadingNotifs ? (
                  <div className="py-8 text-center text-xs text-app-text-muted flex items-center justify-center gap-2">
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Loading your notifications...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-12 text-center text-app-text-muted">
                    <Bell size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-xs font-semibold">No notifications at the moment</p>
                    <p className="text-[10px] mt-0.5 opacity-70">You're completely caught up with all academic alerts!</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                        notif.is_read
                          ? 'bg-app-bg-alt/50 border-app-border/60'
                          : 'bg-primary/5 border-primary/20'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-app-bg flex items-center justify-center shrink-0 mt-0.5 border border-app-border">
                        {notif.priority === 'high' ? (
                          <AlertCircle size={14} className="text-red-500" />
                        ) : notif.type === 'assignment' ? (
                          <BookOpen size={14} className="text-blue-500" />
                        ) : (
                          <Bell size={14} className="text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-app-text-main truncate">
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-app-text-muted shrink-0">
                            {new Date(notif.timestamp || notif.created_at || Date.now()).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] text-app-text-sub mt-0.5 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-app-border flex justify-end">
                <button
                  onClick={() => setShowNotifModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-white hover:opacity-90 transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;
