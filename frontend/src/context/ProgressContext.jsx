import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from './AuthContext';
import { userDataAPI } from '../services/api';

// ==================== Types ====================
// ==================== Constants ====================
const PROGRESS_KEY = 'learnbridge_progress_v1';

const getLocalIsoDate = (date = new Date()) => {
  const offset = date.getTimezoneOffset();
  const adjusted = new Date(date.getTime() - offset * 60 * 1000);
  return adjusted.toISOString().split('T')[0];
};

const initialProgress = {
  lessonsCompleted: [],
  totalLessons: 50, // Default fallback
  timeSpent: {
    totalMinutes: 0,
    byLesson: {},
    byDay: {}
  },
  quizScores: [],
  activityLog: [],
  lastActivityTimestamp: Date.now(),
  questionsAsked: 0
};

// ==================== Context Implementation ====================
const ProgressContext = createContext(undefined);

const sanitizeProgress = (data) => {
  if (!data || typeof data !== 'object') return initialProgress;

  // Normalize lessonsCompleted
  let lessonsCompleted = [];
  if (Array.isArray(data.lessonsCompleted)) {
    lessonsCompleted = data.lessonsCompleted;
  } else if (Array.isArray(data.lessons_completed)) {
    lessonsCompleted = data.lessons_completed;
  }

  // Normalize timeSpent
  const timeSpent = {
    totalMinutes: 0,
    byLesson: data.timeSpent?.byLesson || data.time_spent?.byLesson || {},
    byDay: data.timeSpent?.byDay || data.time_spent?.by_day || {}
  };

  if (typeof data.timeSpent?.totalMinutes === 'number') {
    timeSpent.totalMinutes = data.timeSpent.totalMinutes;
  } else if (typeof data.time_spent === 'number') {
    timeSpent.totalMinutes = data.time_spent;
  } else if (typeof data.time_spent?.totalMinutes === 'number') {
    timeSpent.totalMinutes = data.time_spent.totalMinutes;
  }

  return {
    ...initialProgress,
    ...data,
    lessonsCompleted,
    totalLessons: typeof data.totalLessons === 'number' ? data.totalLessons : initialProgress.totalLessons,
    timeSpent,
    quizScores: Array.isArray(data.quizScores) ? data.quizScores : Array.isArray(data.quiz_scores) ? data.quiz_scores : [],
    activityLog: Array.isArray(data.activityLog) ? data.activityLog : Array.isArray(data.activities) ? data.activities : [],
    questionsAsked: data.questionsAsked || data.questions_asked || 0,
    lastActivityTimestamp: typeof data.lastActivityTimestamp === 'number' ? data.lastActivityTimestamp : Date.now()
  };
};

export const ProgressProvider = ({ children }) => {
  const authContext = useAuth();
  const auth = authContext?.auth;
  const isAuthenticated = authContext?.isAuthenticated;

  const userId = auth?.user?.id;
  const isFetched = useRef(false);

  const [progress, setProgress] = useState(() => {
    try {
      const stored = localStorage.getItem(PROGRESS_KEY);
      if (!stored) return initialProgress;
      const parsed = JSON.parse(stored);
      return sanitizeProgress(parsed);
    } catch (e) {
      console.warn("[Progress] Restoration fallback", e);
      return initialProgress;
    }
  });

  const activeTimersRef = useRef({});

  // Sync from server on login
  useEffect(() => {
    if (isAuthenticated && userId) {
      console.log("[Progress] Fetching sync for user", userId);
      userDataAPI.getProgress(userId.toString()).
      then((res) => {
        if (res?.success && res?.progress) {
          setProgress(sanitizeProgress(res.progress));
        }
        isFetched.current = true;
      }).
      catch((err) => {
        console.error("[Progress] Fetch failed", err);
        isFetched.current = true;
      });
    } else {
      isFetched.current = false;
    }
  }, [isAuthenticated, userId]);

  // Persist to Backend
  useEffect(() => {
    if (isAuthenticated && userId && isFetched.current) {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));

      const timeoutId = setTimeout(() => {
        userDataAPI.updateProgress(userId.toString(), progress).
        catch((err) => console.error("[Progress] Save failed", err));
      }, 3000);
      return () => clearTimeout(timeoutId);
    } else {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    }
  }, [progress, isAuthenticated, userId]);

  const logActivity = useCallback((type, referenceId, label) => {
    setProgress((prev) => ({
      ...prev,
      activityLog: [
      { type, referenceId, timestamp: Date.now(), label },
      ...prev.activityLog].
      slice(0, 50), // Keep last 50 activities
      lastActivityTimestamp: Date.now()
    }));
  }, []);

  const markLessonCompleted = useCallback((lessonId, label) => {
    setProgress((prev) => {
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

  const startLessonTimer = useCallback((lessonId) => {
    activeTimersRef.current[lessonId] = Date.now();
  }, []);

  const stopLessonTimer = useCallback((lessonId) => {
    const startTime = activeTimersRef.current[lessonId];
    if (!startTime) {
      console.warn(`[Progress] Attempted to stop timer for ${lessonId} but no start record found.`);
      return;
    }

    const durationMinutes = Math.round((Date.now() - startTime) / 60000);

    // Clear the timer immediately to prevent duplicate recording
    delete activeTimersRef.current[lessonId];

    if (durationMinutes < 1) {
      console.log(`[Progress] Burst active for ${lessonId} (<1 min), ignoring.`);
      return;
    }

    const todayStr = getLocalIsoDate();
    console.log(`[Progress] Recording ${durationMinutes} minutes for ${todayStr}`);

    setProgress((prev) => ({
      ...prev,
      timeSpent: {
        totalMinutes: prev.timeSpent.totalMinutes + durationMinutes,
        byLesson: {
          ...prev.timeSpent.byLesson,
          [lessonId]: (prev.timeSpent.byLesson[lessonId] || 0) + durationMinutes
        },
        byDay: {
          ...prev.timeSpent.byDay,
          [todayStr]: (prev.timeSpent.byDay[todayStr] || 0) + durationMinutes
        }
      },
      lastActivityTimestamp: Date.now()
    }));
  }, []);

  const recordQuizScore = useCallback((lessonId, score, maxScore, label) => {
    const quizEntry = { lessonId, score, maxScore, timestamp: Date.now() };
    setProgress((prev) => ({
      ...prev,
      quizScores: [...prev.quizScores, quizEntry],
      lastActivityTimestamp: Date.now()
    }));
    logActivity('quiz', lessonId, label || `Scored ${score}/${maxScore} in quiz`);
  }, [logActivity]);
  const recordAiQuestion = useCallback((question) => {
    setProgress((prev) => ({
      ...prev,
      questionsAsked: (prev.questionsAsked || 0) + 1,
      lastActivityTimestamp: Date.now()
    }));
    logActivity('ai_tutor', 'ai', `Asked AI: ${question.slice(0, 30)}...`);
  }, [logActivity]);
  const setTotalLessons = useCallback((total) => {
    setProgress((prev) => {
      if (prev.totalLessons === total) return prev;
      return { ...prev, totalLessons: total };
    });
  }, []);

  const getProgressPercentage = useCallback(() => {
    if (progress.totalLessons === 0) return 0;
    return Math.round(progress.lessonsCompleted.length / progress.totalLessons * 100);
  }, [progress.lessonsCompleted.length, progress.totalLessons]);

  const getWeeklyActivity = useCallback(() => {
    const days = 7;
    const result = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = getLocalIsoDate(d);

      const count = progress.activityLog.filter((act) =>
      getLocalIsoDate(new Date(act.timestamp)) === dateStr
      ).length;

      result.push({ date: dateStr, count });
    }
    return result;
  }, [progress.activityLog]);

  const getTimeSpentData = useCallback(() => {
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();

    // Calculate current week starting from Monday
    const currentDay = now.getDay(); // 0: Sun, 1: Mon, ...
    const diff = currentDay === 0 ? 6 : currentDay - 1; // Days since Monday
    const monday = new Date(now);
    monday.setDate(now.getDate() - diff);
    monday.setHours(0, 0, 0, 0);

    return dayLabels.map((day, index) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + index);
      const dateStr = getLocalIsoDate(d);

      const minutes = progress.timeSpent.byDay[dateStr] || 0;

      let status = 'low';
      if (minutes >= 60) status = 'productive';else
      if (minutes >= 20) status = 'moderate';

      return { day, minutes, status };
    });
  }, [progress.timeSpent.byDay]);

  const getQuizStats = useCallback(() => {
    if (progress.quizScores.length === 0) return [
    { name: 'Correct', value: 0 },
    { name: 'Incorrect', value: 0 },
    { name: 'Unanswered', value: 100 }];


    const totalPossible = progress.quizScores.reduce((acc, q) => acc + q.maxScore, 0);
    const totalCorrect = progress.quizScores.reduce((acc, q) => acc + q.score, 0);
    const totalUnanswered = 0; // Simplified
    const totalIncorrect = totalPossible - totalCorrect;

    return [
    { name: 'Correct', value: totalCorrect },
    { name: 'Incorrect', value: totalIncorrect },
    { name: 'Unanswered', value: totalUnanswered }];

  }, [progress.quizScores]);

  const value = useMemo(() => ({
    progress,
    markLessonCompleted,
    startLessonTimer,
    stopLessonTimer,
    recordQuizScore,
    recordAiQuestion,
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
  recordAiQuestion,
  setTotalLessons,
  logActivity,
  getProgressPercentage,
  getWeeklyActivity,
  getTimeSpentData,
  getQuizStats]
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>);

};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};