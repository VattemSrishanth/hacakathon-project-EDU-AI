import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useOffline } from './OfflineContext';
import { offlineSyncService } from '../services/offlineSync';
import { offlineContentService } from '../services/offlineContent';
const CommunityContext = createContext(undefined);

export const CommunityProvider = ({ children }) => {
  const { auth } = useAuth();
  const { isOffline } = useOffline();
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadDoubts = useCallback(async (filters) => {
    setLoading(true);
    try {
      // Load from local IndexedDB first
      const localDoubts = await offlineContentService.getAllDoubts();

      if (!isOffline) {
        // Build query string from filters
        let queryParams = new URLSearchParams();
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value) queryParams.append(key, String(value));
          });
        }

        // If online, fetch from server too
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/community/doubts${queryParams.toString() ? '?' + queryParams.toString() : ''}`);
        const result = await response.json();
        if (result.success) {
          // Merge server doubts with local unsynced doubts
          const serverDoubts = result.doubts.map((d) => ({
            id: d.id,
            question: d.question,
            subject: d.subject,
            topic: d.topic,
            classLevel: d.class_level,
            username: d.username,
            createdAt: new Date(d.created_at).getTime(),
            repliesCount: d.replies_count,
            viewsCount: d.views_count,
            isVerified: d.is_verified,
            helpfulCount: d.helpful_count,
            status: d.status
          }));

          setDoubts([...serverDoubts]);
          return;
        }
      }

      setDoubts(localDoubts);
    } catch (e) {
      console.error('Failed to load doubts', e);
    } finally {
      setLoading(false);
    }
  }, [isOffline]);

  useEffect(() => {
    loadDoubts();
  }, [loadDoubts]);

  const postDoubt = async (question, subject, topic, classLevel) => {
    const newDoubt = {
      id: crypto.randomUUID(),
      question,
      subject,
      topic,
      classLevel,
      username: auth?.user?.username || 'Guest',
      createdAt: Date.now(),
      repliesCount: 0,
      viewsCount: 0,
      helpfulCount: 0,
      isVerified: false,
      status: 'open'
    };

    // Save locally
    await offlineContentService.saveDoubt(newDoubt);
    setDoubts((prev) => [newDoubt, ...prev]);

    // Queue for sync
    offlineSyncService.queueAction('COMMUNITY_POST', {
      question,
      subject,
      topic,
      class_level: classLevel,
      username: newDoubt.username
    });

    if (!isOffline) {



      // Optional: trigger immediate sync if online
      // In this case, we rely on the existing triggerSync in OfflineProvider 
      // or we could call it here if needed.
    }};return (
    <CommunityContext.Provider value={{ doubts, postDoubt, loading, refreshDoubts: loadDoubts }}>
      {children}
    </CommunityContext.Provider>);

};

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) throw new Error('useCommunity must be used within CommunityProvider');
  return context;
};