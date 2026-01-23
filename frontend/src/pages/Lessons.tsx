import { useEffect, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import type { Lesson } from '../types';
import { lessonsAPI } from '../services/api';

const Lessons = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    const fetchLessons = async () => {
      const data = await lessonsAPI.getAll();
      setLessons(data);
    };

    fetchLessons();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lessons</h1>
          <p className="text-gray-900 mt-2">Explore our curated learning content</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <Card key={lesson.id} hover>
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">{lesson.title}</h3>
                  <p className="text-gray-900 mb-4">{lesson.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-900 mb-4">
                    <span>{lesson.duration}</span>
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">
                      {lesson.level}
                    </span>
                  </div>
                </div>
                <Button variant="primary" className="w-full">Start Lesson</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Lessons;
