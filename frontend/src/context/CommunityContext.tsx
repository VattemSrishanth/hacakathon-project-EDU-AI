import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useOffline } from './OfflineContext';
import { offlineSyncService } from '../services/offlineSync';
import { offlineContentService, type OfflineDoubt } from '../services/offlineContent';

interface CommunityContextType {
  doubts: OfflineDoubt[];
  postDoubt: (question: string, subject: string) => Promise<void>;
  loading: boolean;
  refreshDoubts: () => Promise<void>;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export const CommunityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { auth } = useAuth();
  const { isOffline } = useOffline();
  const [doubts, setDoubts] = useState<OfflineDoubt[]>([]);
  const [loading, setLoading] = useState(false);

  const loadDoubts = useCallback(async () => {
    setLoading(true);
    try {
      // Load from local IndexedDB first
      const localDoubts = await offlineContentService.getAllDoubts();
      
      if (!isOffline) {
        // If online, fetch from server too
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/community/doubts`);
        const result = await response.json();
        if (result.success) {
          // Merge server doubts with local unsynced doubts
          const serverDoubts = result.doubts.map((d: any) => ({
            id: d.id,
            question: d.question,
            subject: d.subject,
            username: d.username,
            createdAt: new Date(d.created_at).getTime()
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

  const postDoubt = async (question: string, subject: string) => {
    const newDoubt: OfflineDoubt = {
      id: crypto.randomUUID(),
      question,
      subject,
      username: auth?.user?.username || 'Guest',
      createdAt: Date.now()
    };

    // Save locally
    await offlineContentService.saveDoubt(newDoubt);
    setDoubts(prev => [newDoubt, ...prev]);

    // Queue for sync
    offlineSyncService.queueAction('COMMUNITY_POST', {
      question,
      subject,
      username: newDoubt.username
    });

    if (!isOffline) {
       // Optional: trigger immediate sync if online
       // In this case, we rely on the existing triggerSync in OfflineProvider 
       // or we could call it here if needed.
    }
  };

  return (
    <CommunityContext.Provider value={{ doubts, postDoubt, loading, refreshDoubts: loadDoubts }}>
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) throw new Error('useCommunity must be used within CommunityProvider');
  return context;
};
