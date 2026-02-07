import { Type, Minus, Plus } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';

const FontAdjuster = () => {
  const { largeTextEnabled, toggleLargeText } = useAccessibility();

  return (
    <div className="flex items-center gap-4 p-4 bg-app-bg-alt rounded-2xl border border-app-border">
      <div className="p-2 bg-primary/10 rounded-lg text-primary">
        <Type size={20} />
      </div>
      
      <div className="flex-1">
        <p className="text-sm font-black text-app-text-main uppercase tracking-tight">Text Size</p>
        <p className="text-[10px] text-app-text-muted font-bold uppercase tracking-widest">
          {largeTextEnabled ? 'Large Display Active' : 'Standard Display'}
        </p>
      </div>

      <div className="flex items-center bg-app-bg rounded-xl border border-app-border overflow-hidden">
        <button 
          onClick={() => largeTextEnabled && toggleLargeText()}
          className={`px-3 py-2 hover:bg-app-bg-alt transition-colors ${!largeTextEnabled ? 'opacity-30 cursor-not-allowed' : ''}`}
          disabled={!largeTextEnabled}
          aria-label="Decrease font size"
        >
          <Minus size={16} />
        </button>
        <div className="w-px h-6 bg-app-border" />
        <button 
          onClick={() => !largeTextEnabled && toggleLargeText()}
          className={`px-3 py-2 hover:bg-app-bg-alt transition-colors ${largeTextEnabled ? 'opacity-30 cursor-not-allowed' : ''}`}
          disabled={largeTextEnabled}
          aria-label="Increase font size"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};

export default FontAdjuster;
