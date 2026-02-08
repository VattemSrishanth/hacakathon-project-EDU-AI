import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { offlineSyncService } from '../services/offlineSync';
import { offlineContentService } from '../services/offlineContent';
import type { OfflineLesson } from '../services/offlineContent';
import { useAuth } from './AuthContext';
import { lessonsAPI } from '../services/api';

interface OfflineContextType {
  isOffline: boolean;
  lastSyncTime: number | null;
  syncInProgress: boolean;
  triggerSync: () => Promise<boolean>;
  downloadedLessons: string[];
  downloadingIds: string[];
  downloadLesson: (lessonId: string) => Promise<boolean>;
  saveOfflineLesson: (lesson: OfflineLesson) => Promise<void>;
  removeLesson: (lessonId: string) => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('last_sync_time');
    return saved ? parseInt(saved, 10) : null;
  });
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [downloadedLessons, setDownloadedLessons] = useState<string[]>([]);
  const [downloadingIds, setDownloadingIds] = useState<string[]>([]);
  const { auth } = useAuth();

  // Load downloaded lessons on mount
  const loadDownloaded = useCallback(async () => {
    if (!auth?.user?.id) {
        setDownloadedLessons([]);
        return;
    }
    try {
      const lessons = await offlineContentService.getAllLessons(String(auth.user.id));
      setDownloadedLessons(lessons.map(l => l.id));
    } catch (error) {
      console.error('Failed to load downloaded lessons:', error);
    }
  }, [auth?.user?.id]);

  useEffect(() => {
    loadDownloaded();
    window.addEventListener('offline-lesson-updated', loadDownloaded);
    return () => window.removeEventListener('offline-lesson-updated', loadDownloaded);
  }, [loadDownloaded]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      triggerSync();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (navigator.onLine) {
      triggerSync();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [auth?.user?.id]);

  const triggerSync = async (): Promise<boolean> => {
    if (!navigator.onLine || !auth?.user?.id || syncInProgress) return false;

    setSyncInProgress(true);
    try {
      const success = await offlineSyncService.syncAll(String(auth.user.id));
      if (success) {
        const now = Date.now();
        setLastSyncTime(now);
        localStorage.setItem('last_sync_time', now.toString());
        return true;
      }
      return false;
    } catch (error) {
      console.error('Manual sync failed:', error);
      return false;
    } finally {
      setSyncInProgress(false);
    }
  };

  const saveOfflineLesson = async (lesson: OfflineLesson): Promise<void> => {
    if (!auth?.user?.id) return;
    try {
      const lessonWithUser = { ...lesson, userId: String(auth.user.id) };
      await offlineContentService.saveLesson(lessonWithUser);
      setDownloadedLessons(prev => [...new Set([...prev, lesson.id])]);
    } catch (error) {
      console.error('Failed to save manual offline lesson:', error);
    }
  };

  const downloadLesson = async (lessonId: string): Promise<boolean> => {
    if (!auth?.user?.id) return false;
    if (downloadingIds.includes(lessonId) || downloadedLessons.includes(lessonId)) {
      return false;
    }

    setDownloadingIds(prev => [...prev, lessonId]);
    try {
      // Fetch lesson content from API
      const res = await lessonsAPI.getOne(lessonId);
      const lessonData = res.lesson;
      const content = await lessonsAPI.getContent(lessonId);

      const offlineLesson: OfflineLesson = {
        id: lessonId,
        userId: String(auth.user.id),
        title: lessonData.title,
        subject: lessonData.subject,
        content: content,
        downloadedAt: Date.now()
      };

      await offlineContentService.saveLesson(offlineLesson);
      setDownloadedLessons(prev => [...prev, lessonId]);
      return true;
    } catch (error) {
      console.error(`Failed to download lesson ${lessonId}:`, error);
      return false;
    } finally {
      setDownloadingIds(prev => prev.filter(id => id !== lessonId));
    }
  };

  const removeLesson = async (lessonId: string): Promise<void> => {
    if (!auth?.user?.id) return;
    try {
      await offlineContentService.deleteLesson(String(auth.user.id), lessonId);
      setDownloadedLessons(prev => prev.filter(id => id !== lessonId));
    } catch (error) {
      console.error(`Failed to remove lesson ${lessonId}:`, error);
    }
  };

  return (
    <OfflineContext.Provider value={{ 
      isOffline, 
      lastSyncTime, 
      syncInProgress, 
      triggerSync,
      downloadedLessons,
      downloadingIds,
      downloadLesson,
      saveOfflineLesson,
      removeLesson
    }}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};
