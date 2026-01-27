import React, { useState, useEffect } from 'react';
<<<<<<< Updated upstream
import { WifiOff } from 'lucide-react';
=======
import { offlineSyncService } from '../services/offlineSync';
import { useAuth } from '../context/AuthContext';
>>>>>>> Stashed changes

const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const { auth } = useAuth();

  useEffect(() => {
    const handleOnline = async () => {
      setIsOffline(false);
      if (auth?.user?.id) {
        setSyncing(true);
        const success = await offlineSyncService.syncAll(auth.user.id);
        setSyncing(false);
        if (success) {
          console.log('All data synced successfully');
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
<<<<<<< Updated upstream
    <div className="bg-amber-100 border-b border-amber-200 text-amber-800 px-4 py-2 text-sm text-center font-bold sticky top-0 z-100 animate-in slide-in-from-top duration-300">
      <div className="flex items-center justify-center gap-2">
        <WifiOff size={18} />
        <span>Offline Mode: You are using the app without internet. Some features may be limited.</span>
=======
    <div className={`${syncing ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'} border-b border-amber-200 px-4 py-2 text-sm text-center font-medium sticky top-0 z-[100] animate-in slide-in-from-top duration-300`}>
      <div className="flex items-center justify-center gap-2">
        {syncing ? (
          <>
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>Syncing your offline work...</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.58 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
            </svg>
            <span>Offline Mode: You are using the app without internet. Progress will sync later.</span>
          </>
        )}
>>>>>>> Stashed changes
      </div>
    </div>
  );
};

export default OfflineBanner;
