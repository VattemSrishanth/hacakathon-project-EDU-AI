import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { lessonsAPI } from '../services/api';

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

    // Load progress from localStorage
    const savedProgress = localStorage.getItem('lesson_progress');
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
  }, []);

  // Filter lessons by category
  const filteredLessons = filter === 'All' 
    ? lessons 
    : lessons.filter(lesson => lesson.category === filter);

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(lessons.map(l => l.category)))];

  // Handle start learning
  const handleStartLearning = (lessonId: string) => {
    navigate(`/lessons/${lessonId}`);
  };

  // Handle mark progress
  const handleMarkProgress = (lessonId: string) => {
    const currentProgress = progress[lessonId] || 0;
    const newProgress = currentProgress >= 100 ? 0 : Math.min(currentProgress + 25, 100);
    
    const updatedProgress = {
      ...progress,
      [lessonId]: newProgress
    };
    
    setProgress(updatedProgress);
    localStorage.setItem('lesson_progress', JSON.stringify(updatedProgress));

    // Speak progress if in blind mode
    if (settings.themeAccessibility.accessibilityMode === 'Blind' && 'speechSynthesis' in window) {
      const lesson = lessons.find(l => l.id === lessonId);
      const utterance = new SpeechSynthesisUtterance(
        `${lesson?.title} progress updated to ${newProgress} percent`
      );
      utterance.lang = settings.themeAccessibility.voiceLanguage === 'English' ? 'en-US' : 'hi-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Get progress color
  const getProgressColor = (percent: number) => {
    if (percent === 0) return 'bg-gray-200';
    if (percent < 50) return 'bg-yellow-400';
    if (percent < 100) return 'bg-blue-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading lessons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-8 px-4 transition-colors duration-200">
      <div className="max-w-7xl mx-auto relative">
        {/* Accessibility Status Pill */}
        {settings.themeAccessibility.accessibilityMode !== 'Normal' && (
          <div className="absolute top-0 right-0 z-50 animate-fade-in">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-full shadow-lg border border-white/20 backdrop-blur-sm flex items-center gap-3 hover:shadow-xl transition-all duration-300">
              <div className="relative flex items-center">
                <span className="absolute inline-flex h-4 w-4 rounded-full bg-white opacity-75 animate-ping"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
              </div>
              <div className="flex items-center gap-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-bold uppercase tracking-wider">
                  {settings.themeAccessibility.accessibilityMode}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            📚 {t.lessons.title}
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-200 max-w-2xl mx-auto font-medium">
            {t.lessons.subtitle}
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-300 ${
                filter === category
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 hover:border-primary/30'
              }`}
              aria-label={`Filter by ${category}`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Lessons Grid */}
        {filteredLessons.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
              {t.lessons.noLessons}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map((lesson) => {
              const lessonProgress = progress[lesson.id] || 0;
              
              return (
                <Card key={lesson.id} hover className="flex flex-col">
                  {/* Category Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                      {lesson.category}
                    </span>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      lesson.level === 'Beginner' ? 'bg-green-100 text-green-700 border border-green-200' :
                      lesson.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                      'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {lesson.level}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                    {lesson.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow leading-relaxed">
                    {lesson.description}
                  </p>

                  {/* Topics */}
                  {lesson.topics && lesson.topics.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {lesson.topics.slice(0, 3).map((topic, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md font-medium border border-gray-200 dark:border-gray-600"
                          >
                            {topic}
                          </span>
                        ))}
                        {lesson.topics.length > 3 && (
                          <span className="text-xs px-2.5 py-1 text-gray-500 font-medium">
                            +{lesson.topics.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Duration */}
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4 text-sm font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {lesson.duration}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                        Progress
                      </span>
                      <span className="text-xs font-bold text-primary">
                        {lessonProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${getProgressColor(lessonProgress)}`}
                        style={{ width: `${lessonProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-auto">
                    <Button
                      variant="primary"
                      onClick={() => handleStartLearning(lesson.id)}
                      className="flex-1 flex items-center justify-center gap-2 font-semibold"
                      aria-label={`Start learning ${lesson.title}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Start Learning
                    </Button>
                    <Button
                      variant={lessonProgress >= 100 ? 'primary' : 'outline'}
                      onClick={() => handleMarkProgress(lesson.id)}
                      className="flex items-center justify-center px-4 font-semibold"
                      aria-label={`Mark progress for ${lesson.title}`}
                    >
                      {lessonProgress >= 100 ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      )}
                    </Button>
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
