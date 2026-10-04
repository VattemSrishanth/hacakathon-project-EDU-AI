import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const SystemAlert = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="bg-red-500/10 border-b border-red-500/20 text-red-500 text-xs font-black uppercase tracking-widest px-4 py-3 flex items-center justify-between z-40">
      <div className="flex items-center gap-2">
        <AlertCircle size={14} className="animate-pulse" />
        <span>{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="p-1 hover:bg-red-500/10 rounded">
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default SystemAlert;