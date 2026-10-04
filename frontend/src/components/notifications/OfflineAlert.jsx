import React from 'react';
import { WifiOff, Database, RefreshCw } from 'lucide-react';
import { useOffline } from '../../context/OfflineContext';

const OfflineAlert = () => {
  const { isOffline, syncInProgress, triggerSync } = useOffline();

  if (!isOffline) return null;

  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600">
          <WifiOff size={16} />
        </div>
        <div>
          <h4 className="text-xs font-black uppercase text-app-text-main">Offline Mode Active</h4>
          <p className="text-[10px] text-app-text-muted font-bold uppercase mt-0.5">
            Your progress is saved locally and will sync once connected.
          </p>
        </div>
      </div>
      
      <button
        disabled={syncInProgress}
        onClick={() => triggerSync()}
        className="px-4 py-2 bg-amber-500 text-white rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-amber-600 transition-colors flex items-center gap-1.5"
      >
        <RefreshCw size={12} className={syncInProgress ? 'animate-spin' : ''} />
        Force Sync Check
      </button>
    </div>
  );
};

export default OfflineAlert;