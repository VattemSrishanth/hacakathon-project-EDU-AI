import { useState, useEffect, useRef, ChangeEvent } from 'react';
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
  Sparkles,
  UploadCloud
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const pdfData = reader.result as string; // base64 data URL
      const pdfUrl = URL.createObjectURL(file);
      navigate('/lessons/uploaded', { state: { pdfUrl, pdfName: file.name, pdfData } });
    };
    reader.readAsDataURL(file);

    // Reset input so the same file can be selected again
    event.target.value = '';
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
          <div className="lg:col-span-4 flex flex-wrap gap-3 justify-center lg:justify-start">
            <Button
              variant="primary"
              onClick={handleUploadClick}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-black uppercase tracking-widest text-[10px]"
            >
              <UploadCloud size={16} />
              Upload PDF
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

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

        {/* Lessons disabled placeholder */}
        <div className="py-16 px-8 bg-app-bg border border-app-border rounded-3xl text-center shadow-sm">
          <div className="w-20 h-20 bg-app-bg-alt rounded-3xl flex items-center justify-center mx-auto mb-6 text-app-text-muted">
            <Search size={40} />
          </div>
          <h3 className="text-2xl font-black text-app-text-main mb-3">Lessons are currently unavailable</h3>
          <p className="text-app-text-sub font-medium">Please check back soon for updated content.</p>
        </div>
      </div>
    </div>
  );
};

export default Lessons;
