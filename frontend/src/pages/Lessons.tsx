import { useEffect, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import type { Lesson } from '../types';
import { lessonsAPI } from '../services/api';
import { useSettings } from '../context/SettingsContext';

const Lessons = () => {
  const { settings, t } = useSettings();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState<string>('');

  // Get user's preferred level
  const preferredLevel = settings.learning.level;

  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true);
      try {
        const data = await lessonsAPI.getAll();
        setLessons(data || []);
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
  const filteredLessons = filterLevel
    ? lessons.filter((lesson) => lesson.level === filterLevel)
    : lessons;

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t.lessons.title}</h1>
          <p className="text-gray-900 mt-2">{t.lessons.subtitle}</p>
          <p className="text-sm text-gray-600 mt-1">
            {t.settings.learning.level}: {getLevelLabel(preferredLevel)}
          </p>
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
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">{lesson.title}</h3>
                    <p className="text-gray-900 mb-4">{lesson.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-900 mb-4">
                      <span>{lesson.duration}</span>
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">
                        {getLevelLabel(lesson.level)}
                      </span>
                    </div>
                  </div>
                  <Button variant="primary" className="w-full">{t.lessons.startLesson}</Button>
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
