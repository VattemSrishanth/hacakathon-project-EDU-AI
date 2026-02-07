import React from 'react';
import { WifiOff, Loader2, RefreshCw } from 'lucide-react';
import { useOffline } from '../context/OfflineContext';

const OfflineBanner: React.FC = () => {
  const { isOffline, syncInProgress, lastSyncTime, triggerSync } = useOffline();

  if (!isOffline && !syncInProgress) return null;

  return (
    <div className={`
      border-b px-4 py-2 text-sm text-center font-black uppercase tracking-widest sticky top-0 z-100 animate-in slide-in-from-top duration-300 backdrop-blur-md
      ${isOffline ? 'bg-amber-100/90 text-amber-800 border-amber-200' : 'bg-emerald-100/90 text-emerald-800 border-emerald-200'}
    `}>
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          {syncInProgress ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Synchronizing Workspace...</span>
            </>
          ) : isOffline ? (
            <>
              <WifiOff size={16} />
              <span>Offline Mode Active</span>
            </>
          ) : (
            <>
              <RefreshCw size={16} className="text-emerald-600" />
              <span>Back Online - Changes Synced</span>
            </>
          )}
        </div>

        {lastSyncTime && (
          <span className="text-[10px] opacity-60 normal-case hidden sm:inline">
            Last sync: {new Date(lastSyncTime).toLocaleTimeString()}
          </span>
        )}

        {!isOffline && !syncInProgress && (
          <button 
            onClick={() => triggerSync()}
            className="text-[10px] underline hover:no-underline"
          >
            Retry Sync
          </button>
        )}
      </div>
    </div>
  );
};

export default OfflineBanner;
