import React, { useState, useEffect } from 'react';
import { WifiOff, Loader2 } from 'lucide-react';
import { offlineSyncService } from '../services/offlineSync';
import { useAuth } from '../context/AuthContext';

const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const { auth } = useAuth();

  useEffect(() => {
    const handleOnline = async () => {
      setIsOffline(false);
      if (auth?.user?.id) {
        setSyncing(true);
        try {
          // Check if service exists first
          if (offlineSyncService) {
            await offlineSyncService.syncAll(String(auth.user.id));
          }
        } catch (e) {
          console.error('Offline sync failed', e);
        } finally {
          setSyncing(false);
        }
      }
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [auth]);

  if (!isOffline && !syncing) return null;

  return (
    <div className="bg-amber-100/90 text-amber-800 border-b border-amber-200 px-4 py-2 text-sm text-center font-black uppercase tracking-widest sticky top-0 z-100 animate-in slide-in-from-top duration-300 backdrop-blur-md">
      <div className="flex items-center justify-center gap-2">
        {syncing ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Syncing your offline work...</span>
          </>
        ) : (
          <>
            <WifiOff size={16} />
            <span>Offline Mode: Progress will sync when you are back online.</span>
          </>
        )}
      </div>
    </div>
  );
};

export default OfflineBanner;
