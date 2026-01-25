import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { lessonsAPI } from '../services/api';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  PlayCircle,
  GraduationCap,
  Sparkles
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  category: string;
  topics: string[];
  pdf_path?: string;
  progress?: number;
}

const Lessons = () => {
  const navigate = useNavigate();
  const { t, settings } = useSettings();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Load lessons from API
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await lessonsAPI.getAll();
        if (response.success && response.lessons) {
          setLessons(response.lessons);
        }
      } catch (error) {
        console.error('Failed to fetch lessons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();

    const savedProgress = localStorage.getItem('lesson_progress');
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
  }, []);

  // Filter lessons
  const filteredLessons = lessons.filter(lesson => {
    const matchesCategory = filter === 'All' || lesson.category === filter;
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['All', ...Array.from(new Set(lessons.map(l => l.category)))];

  const handleStartLearning = (lessonId: string) => {
    navigate(`/lessons/${lessonId}`);
  };

  const handleMarkProgress = (lessonId: string) => {
    const currentProgress = progress[lessonId] || 0;
    const newProgress = currentProgress >= 100 ? 0 : Math.min(currentProgress + 25, 100);
    
    const updatedProgress = {
      ...progress,
      [lessonId]: newProgress
    };
    
    setProgress(updatedProgress);
    localStorage.setItem('lesson_progress', JSON.stringify(updatedProgress));

    if (settings.themeAccessibility.accessibilityMode === 'Blind' && 'speechSynthesis' in window) {
      const lesson = lessons.find(l => l.id === lessonId);
      const utterance = new SpeechSynthesisUtterance(
        `${lesson?.title} progress updated to ${newProgress} percent`
      );
      utterance.lang = settings.themeAccessibility.voiceLanguage === 'English' ? 'en-US' : 'hi-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const getProgressColor = (percent: number) => {
    if (percent === 0) return 'bg-app-border';
    if (percent < 50) return 'bg-secondary';
    if (percent < 100) return 'bg-primary';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-app-text-sub font-bold animate-pulse">Loading Lessons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg-alt py-12 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4">
            <GraduationCap size={14} />
            Learning Catalog
          </div>
          <h1 className="text-5xl font-black text-app-text-main tracking-tight sm:text-6xl">
            {t.lessons.title}
          </h1>
          <p className="text-xl text-app-text-sub max-w-2xl mx-auto font-medium">
            {t.lessons.subtitle}
          </p>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          {/* Search */}
          <div className="lg:col-span-2 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-app-text-muted group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Search lessons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-app-bg border border-app-border rounded-2xl py-4 pl-12 pr-4 text-app-text-main font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            />
          </div>

          {/* Categories */}
          <div className="lg:col-span-2 flex flex-wrap gap-2 items-center justify-center lg:justify-end">
            <Filter size={18} className="text-app-text-muted mr-2" />
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                  filter === category
                    ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105'
                    : 'bg-app-bg text-app-text-main hover:bg-primary/5 hover:text-primary border border-app-border'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Lessons Grid */}
        {filteredLessons.length === 0 ? (
          <Card className="py-20 text-center">
            <div className="w-20 h-20 bg-app-bg-alt rounded-3xl flex items-center justify-center mx-auto mb-6 text-app-text-muted">
              <Search size={40} />
            </div>
            <h3 className="text-2xl font-black text-app-text-main mb-2">No Lessons Found</h3>
            <p className="text-app-text-sub font-medium">Try adjusting your filters or search query.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredLessons.map((lesson) => {
              const lessonProgress = progress[lesson.id] || 0;
              
              return (
                <Card key={lesson.id} hover className="group flex flex-col h-full overflow-hidden">
                  {/* Decorative Header */}
                  <div className="h-2 w-full bg-linear-to-r from-primary/40 to-secondary/40 absolute top-0 left-0" />
                  
                  <div className="pt-2">
                    {/* Category & Level */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="bg-primary/5 text-primary px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary/10">
                        {lesson.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border ${
                        lesson.level === 'Beginner' ? 'bg-green-500/5 text-green-500 border-green-500/20' :
                        lesson.level === 'Intermediate' ? 'bg-secondary/5 text-secondary border-secondary/20' :
                        'bg-red-500/5 text-red-500 border-red-500/20'
                      }`}>
                        {lesson.level}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-app-text-main mb-4 leading-tight group-hover:text-primary transition-colors">
                      {lesson.title}
                    </h3>

                    <p className="text-app-text-sub mb-6 grow font-medium leading-relaxed line-clamp-3">
                      {lesson.description}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-app-text-muted mb-6">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                        <Clock size={14} className="text-primary" />
                        {lesson.duration}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                        <BookOpen size={14} className="text-secondary" />
                        {lesson.topics?.length || 0} Topics
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-3 mb-8">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-app-text-muted uppercase tracking-widest">Progress</span>
                        <span className="text-xs font-black text-primary">{lessonProgress}%</span>
                      </div>
                      <div className="w-full bg-app-bg-alt rounded-full h-2.5 p-0.5 border border-app-border overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(lessonProgress)}`}
                          style={{ width: `${lessonProgress}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-app-border">
                      <Button
                        variant="primary"
                        onClick={() => handleStartLearning(lesson.id)}
                        className="flex-1 rounded-xl py-3 flex items-center justify-center gap-2 group/btn font-black uppercase tracking-widest text-[10px]"
                      >
                        <PlayCircle size={16} className="transition-transform group-hover/btn:scale-110" />
                        Start Learning
                      </Button>
                      <button
                        onClick={() => handleMarkProgress(lesson.id)}
                        className={`w-12 flex items-center justify-center rounded-xl border-2 transition-all duration-300 ${
                          lessonProgress >= 100 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'bg-app-bg border-app-border text-app-text-muted hover:border-primary hover:text-primary'
                        }`}
                        title="Mark progress"
                      >
                        {lessonProgress >= 100 ? <CheckCircle2 size={20} /> : <Sparkles size={20} />}
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Lessons;
