import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

// ==================== Types ====================
export type ActivityType = "lesson" | "quiz" | "ai_tutor";

export interface QuizScore {
  lessonId: string;
  score: number;
  maxScore: number;
  timestamp: number;
}

export interface ActivityEntry {
  type: ActivityType;
  referenceId: string;
  timestamp: number;
  label?: string; // Descriptive label for activity log
}

export interface ProgressState {
  lessonsCompleted: string[]; // List of unique completed lesson IDs
  totalLessons: number;
  timeSpent: {
    totalMinutes: number;
    byLesson: Record<string, number>;
  };
  quizScores: QuizScore[];
  activityLog: ActivityEntry[];
  lastActivityTimestamp: number;
}

interface ProgressContextValue {
  progress: ProgressState;
  markLessonCompleted: (lessonId: string, label?: string) => void;
  startLessonTimer: (lessonId: string) => void;
  stopLessonTimer: (lessonId: string) => void;
  recordQuizScore: (lessonId: string, score: number, maxScore: number, label?: string) => void;
  setTotalLessons: (total: number) => void;
  logActivity: (type: ActivityType, referenceId: string, label?: string) => void;
  getProgressPercentage: () => number;
  getWeeklyActivity: () => { date: string; count: number }[];
  getTimeSpentData: () => { day: string; minutes: number; status: 'low' | 'moderate' | 'productive' }[];
  getQuizStats: () => { name: string; value: number }[];
}

// ==================== Constants ====================
const PROGRESS_KEY = 'learnbridge_progress_v1';

const initialProgress: ProgressState = {
  lessonsCompleted: [],
  totalLessons: 50, // Default fallback
  timeSpent: {
    totalMinutes: 0,
    byLesson: {}
  },
  quizScores: [],
  activityLog: [],
  lastActivityTimestamp: Date.now()
};

// ==================== Context Implementation ====================
const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<ProgressState>(() => {
    const stored = localStorage.getItem(PROGRESS_KEY);
    return stored ? JSON.parse(stored) : initialProgress;
  });

  const [activeTimers, setActiveTimers] = useState<Record<string, number>>({});

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }, [progress]);

  const logActivity = useCallback((type: ActivityType, referenceId: string, label?: string) => {
    setProgress(prev => ({
      ...prev,
      activityLog: [
        { type, referenceId, timestamp: Date.now(), label },
        ...prev.activityLog
      ].slice(0, 50), // Keep last 50 activities
      lastActivityTimestamp: Date.now()
    }));
  }, []);

  const markLessonCompleted = useCallback((lessonId: string, label?: string) => {
    setProgress(prev => {
      if (prev.lessonsCompleted.includes(lessonId)) return prev;
      
      const updated = {
        ...prev,
        lessonsCompleted: [...prev.lessonsCompleted, lessonId],
        lastActivityTimestamp: Date.now()
      };
      
      return updated;
    });
    logActivity('lesson', lessonId, label || 'Completed a lesson');
  }, [logActivity]);

  const startLessonTimer = useCallback((lessonId: string) => {
    setActiveTimers(prev => ({ ...prev, [lessonId]: Date.now() }));
  }, []);

  const stopLessonTimer = useCallback((lessonId: string) => {
    const startTime = activeTimers[lessonId];
    if (!startTime) return;

    const durationMinutes = Math.round((Date.now() - startTime) / 60000);
    if (durationMinutes < 1) return; // Ignore very short bursts

    setProgress(prev => ({
      ...prev,
      timeSpent: {
        totalMinutes: prev.timeSpent.totalMinutes + durationMinutes,
        byLesson: {
          ...prev.timeSpent.byLesson,
          [lessonId]: (prev.timeSpent.byLesson[lessonId] || 0) + durationMinutes
        }
      },
      lastActivityTimestamp: Date.now()
    }));

    setActiveTimers(prev => {
      const { [lessonId]: _, ...rest } = prev;
      return rest;
    });
  }, [activeTimers]);

  const recordQuizScore = useCallback((lessonId: string, score: number, maxScore: number, label?: string) => {
    const quizEntry = { lessonId, score, maxScore, timestamp: Date.now() };
    setProgress(prev => ({
      ...prev,
      quizScores: [...prev.quizScores, quizEntry],
      lastActivityTimestamp: Date.now()
    }));
    logActivity('quiz', lessonId, label || `Scored ${score}/${maxScore} in quiz`);
  }, [logActivity]);

  const setTotalLessons = useCallback((total: number) => {
    setProgress(prev => {
      if (prev.totalLessons === total) return prev;
      return { ...prev, totalLessons: total };
    });
  }, []);

  const getProgressPercentage = useCallback(() => {
    if (progress.totalLessons === 0) return 0;
    return Math.round((progress.lessonsCompleted.length / progress.totalLessons) * 100);
  }, [progress.lessonsCompleted.length, progress.totalLessons]);

  const getWeeklyActivity = useCallback(() => {
    const days = 7;
    const result = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const count = progress.activityLog.filter(act => 
        new Date(act.timestamp).toISOString().split('T')[0] === dateStr
      ).length;

      result.push({ date: dateStr, count });
    }
    return result;
  }, [progress.activityLog]);

  const getTimeSpentData = useCallback(() => {
    // This is a simplified version mapping lessons to "days" for chart distribution
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => {
      // Mocking day-wise distribution from total for visualization purposes
      // since we only store total/per-lesson minutes currently
      const baseMinutes = Math.floor(progress.timeSpent.totalMinutes / 7);
      const minutes = baseMinutes + Math.floor(Math.random() * 10); // add variability
      
      let status: 'low' | 'moderate' | 'productive' = 'low';
      if (minutes > 30) status = 'productive';
      else if (minutes >= 10) status = 'moderate';

      return { day, minutes, status };
    });
  }, [progress.timeSpent.totalMinutes]);

  const getQuizStats = useCallback(() => {
    if (progress.quizScores.length === 0) return [
      { name: 'Correct', value: 0 },
      { name: 'Incorrect', value: 0 },
      { name: 'Unanswered', value: 100 }
    ];

    const totalPossible = progress.quizScores.reduce((acc, q) => acc + q.maxScore, 0);
    const totalCorrect = progress.quizScores.reduce((acc, q) => acc + q.score, 0);
    const totalUnanswered = 0; // Simplified
    const totalIncorrect = totalPossible - totalCorrect;

    return [
      { name: 'Correct', value: totalCorrect },
      { name: 'Incorrect', value: totalIncorrect },
      { name: 'Unanswered', value: totalUnanswered }
    ];
  }, [progress.quizScores]);

  const value = useMemo(() => ({
    progress,
    markLessonCompleted,
    startLessonTimer,
    stopLessonTimer,
    recordQuizScore,
    setTotalLessons,
    logActivity,
    getProgressPercentage,
    getWeeklyActivity,
    getTimeSpentData,
    getQuizStats
  }), [
    progress,
    markLessonCompleted,
    startLessonTimer,
    stopLessonTimer,
    recordQuizScore,
    setTotalLessons,
    logActivity,
    getProgressPercentage,
    getWeeklyActivity,
    getTimeSpentData,
    getQuizStats
  ]);

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
