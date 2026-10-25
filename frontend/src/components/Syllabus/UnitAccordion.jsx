import { useState } from 'react';
import { ChevronDown, ChevronRight, PlayCircle, BookOpen } from 'lucide-react';

const UnitAccordion = ({ units, onSelectTopic, selectedTopic }) => {
  const [expandedUnit, setExpandedUnit] = useState(units[0]?.unit || null);

  return (
    <div className="space-y-3">
      {units.map((unit) => {
        const isExpanded = expandedUnit === unit.unit;

        return (
          <div
            key={unit.unit}
            className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden transition-all duration-200 bg-white dark:bg-slate-900 shadow-xs"
          >
            <button
              onClick={() => setExpandedUnit(isExpanded ? null : unit.unit)}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <BookOpen size={16} />
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {unit.unit}
                </span>
              </div>
              <div className="text-slate-400 shrink-0 ml-2">
                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </div>
            </button>

            {isExpanded && (
              <div className="p-3 pt-0 space-y-1.5 border-t border-slate-100 dark:border-slate-800/80">
                <div className="grid grid-cols-1 gap-1.5 pt-2">
                  {unit.topics.map((topic) => {
                    const isSelected = selectedTopic === topic;

                    return (
                      <button
                        key={topic}
                        onClick={() => onSelectTopic(unit.unit, topic)}
                        className={`group flex items-center justify-between p-3 rounded-xl transition-all duration-150 text-left cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white font-bold shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400'
                        }`}
                      >
                        <span className="text-xs font-semibold flex-1 leading-snug">
                          {topic}
                        </span>
                        <PlayCircle
                          size={16}
                          className={`shrink-0 ml-2 ${
                            isSelected
                              ? 'text-white'
                              : 'text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default UnitAccordion;
