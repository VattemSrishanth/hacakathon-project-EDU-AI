import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import type { Lesson } from '../types';
import { lessonsAPI } from '../services/api';
import { useSettings } from '../context/SettingsContext';

const Lessons = () => {
  const navigate = useNavigate();
  const { settings, t } = useSettings();
  const { accessibilityMode } = settings.themeAccessibility;
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState<string>('');

  // Load completed lessons from independent localStorage key
  useEffect(() => {
    const stored = localStorage.getItem('lesson_completion_tracker');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCompletedIds(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error('Failed to parse completed lessons', e);
        setCompletedIds([]);
      }
    }
  }, []);

  const toggleLessonCompletion = (id: string) => {
    const newCompleted = completedIds.includes(id)
      ? completedIds.filter(cid => cid !== id)
      : [...completedIds, id];
    
    setCompletedIds(newCompleted);
    localStorage.setItem('lesson_completion_tracker', JSON.stringify(newCompleted));
  };

  // Get user's preferred level
  const preferredLevel = settings.learning.level;

  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true);
      try {
        const data = await lessonsAPI.getAll();
        // The API returns { success: true, lessons: [], total: 0 }
        const lessonData = data?.lessons || [];
        setLessons(Array.isArray(lessonData) ? lessonData : []);
      } catch (error) {
        console.error('Failed to fetch lessons:', error);
        setLessons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  // Filter lessons by selected level or show all
  const filteredLessons = Array.isArray(lessons) 
    ? (filterLevel
        ? lessons.filter((lesson) => lesson.level === filterLevel)
        : lessons)
    : [];

  // Translate level names
  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'Beginner':
        return t.lessons.beginner;
      case 'Intermediate':
        return t.lessons.intermediate;
      case 'Advanced':
        return t.lessons.advanced;
      default:
        return level;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Accessibility Mode Banner */}
        {accessibilityMode !== 'Normal' && (
          <div className={`mb-6 p-4 rounded-xl flex items-center justify-between ${
            accessibilityMode === 'Blind' ? 'bg-purple-100 text-purple-900 border-2 border-purple-300' :
            accessibilityMode === 'Deaf' ? 'bg-yellow-100 text-yellow-900 border-2 border-yellow-300' :
            'bg-orange-100 text-orange-900 border-2 border-orange-300'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {accessibilityMode === 'Blind' ? '👁️' : accessibilityMode === 'Deaf' ? '👂' : '🗣️'}
              </span>
              <div>
                <h2 className="font-bold underline">{accessibilityMode} Mode Active</h2>
                <p className="text-sm opacity-80">
                  {accessibilityMode === 'Blind' ? 'Voice guidance and screen optimization active.' :
                   accessibilityMode === 'Deaf' ? 'Visual captions and enhanced feedback active.' :
                   'Text-priority interaction active.'}
                </p>
              </div>
            </div>
            {accessibilityMode === 'Blind' && (
              <Button 
                variant="primary" 
                onClick={() => {
                  const speech = new SpeechSynthesisUtterance(`You are on the lessons page. There are ${lessons.length} lessons available.`);
                  window.speechSynthesis.speak(speech);
                }}
              >
                Read Summary
              </Button>
            )}
            {accessibilityMode === 'Deaf' && (
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-yellow-200 rounded text-xs font-bold">CC</span>
                <span className="px-2 py-1 bg-yellow-200 rounded text-xs font-bold">Sign Support</span>
              </div>
            )}
          </div>
        )}

        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t.lessons.title}</h1>
            <p className="text-gray-900 mt-2">{t.lessons.subtitle}</p>
            <p className="text-sm text-gray-600 mt-1">
              {t.settings.learning.level}: {getLevelLabel(preferredLevel)}
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate('/assignments')}
            className="flex items-center gap-2 popup-interactive"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14l2 2 4-4"></path></svg>
            Assignments
          </Button>
        </div>

        {/* Filter Section */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilterLevel('')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterLevel === ''
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilterLevel('Beginner')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterLevel === 'Beginner'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {t.lessons.beginner}
          </button>
          <button
            type="button"
            onClick={() => setFilterLevel('Intermediate')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterLevel === 'Intermediate'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {t.lessons.intermediate}
          </button>
          <button
            type="button"
            onClick={() => setFilterLevel('Advanced')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterLevel === 'Advanced'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {t.lessons.advanced}
          </button>
          {/* Quick filter to user's preferred level */}
          <button
            type="button"
            onClick={() => setFilterLevel(preferredLevel)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterLevel === preferredLevel
                ? 'bg-secondary text-white'
                : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
            }`}
          >
            {t.settings.learning.level}: {getLevelLabel(preferredLevel)}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">{t.common.loading}</p>
          </div>
        ) : filteredLessons.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">{t.lessons.noLessons}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map((lesson) => (
              <Card key={lesson.id} hover>
                <div 
                  className="flex flex-col h-full"
                  role="article"
                  aria-label={`Lesson: ${lesson.title}. Duration: ${lesson.duration}. Level: ${lesson.level}.`}
                >
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 flex justify-between items-start">
                      {lesson.title}
                      {accessibilityMode === 'Deaf' && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded border border-yellow-200">
                          VISUAL
                        </span>
                      )}
                    </h3>
                    <p className="text-gray-900 mb-4">{lesson.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-900 mb-4">
                      <span>{lesson.duration}</span>
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">
                        {getLevelLabel(lesson.level)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Button 
                      variant="primary" 
                      className="w-full"
                      onClick={() => {
                        if (accessibilityMode === 'Blind') {
                          const speech = new SpeechSynthesisUtterance(`Starting lesson: ${lesson.title}`);
                          window.speechSynthesis.speak(speech);
                        }
                      }}
                    >
                      {t.lessons.startLesson}
                    </Button>
                    <button
                      onClick={() => {
                        toggleLessonCompletion(lesson.id);
                        if (accessibilityMode === 'Blind') {
                          const status = completedIds.includes(lesson.id) ? 'marked incomplete' : 'marked complete';
                          const speech = new SpeechSynthesisUtterance(`${lesson.title} ${status}`);
                          window.speechSynthesis.speak(speech);
                        }
                      }}
                      className={`w-full py-2 text-sm font-medium rounded-lg border transition-all ${
                        completedIds.includes(lesson.id)
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {completedIds.includes(lesson.id) ? '✓ Completed' : 'Mark as Completed'}
                    </button>
                    {accessibilityMode === 'Blind' && (
                      <button
                        onClick={() => {
                          const speech = new SpeechSynthesisUtterance(`Lesson Info: ${lesson.title}. Description: ${lesson.description}. Duration: ${lesson.duration}.`);
                          window.speechSynthesis.speak(speech);
                        }}
                        className="w-full text-xs text-blue-600 underline py-1"
                      >
                        Hear Details
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Lessons;
