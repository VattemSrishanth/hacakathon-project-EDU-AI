import { useState } from 'react';
import { ChevronDown, ChevronRight, PlayCircle, BookOpen } from 'lucide-react';












const UnitAccordion = ({ units, onSelectTopic, selectedTopic }) => {
  const [expandedUnit, setExpandedUnit] = useState(units[0]?.unit || null);

  return (
    <div className="space-y-4">
      {units.map((unit) =>
      <div
        key={unit.unit}
        className="border-2 border-app-border rounded-4xl overflow-hidden transition-all duration-300 bg-app-bg shadow-sm">
        
          <button
          onClick={() => setExpandedUnit(expandedUnit === unit.unit ? null : unit.unit)}
          className="w-full p-6 flex items-center justify-between hover:bg-app-bg-alt/50 transition-colors">
          
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <BookOpen size={20} />
              </div>
              <span className="text-xl font-black text-app-text-main text-left">
                {unit.unit}
              </span>
            </div>
            {expandedUnit === unit.unit ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
          </button>

          {expandedUnit === unit.unit &&
        <div className="p-6 pt-0 space-y-2">
              <div className="grid grid-cols-1 gap-2">
                {unit.topics.map((topic) =>
            <button
              key={topic}
              onClick={() => onSelectTopic(unit.unit, topic)}
              className={`group flex items-center justify-between p-4 rounded-3xl transition-all duration-200 text-left border-2 ${
              selectedTopic === topic ?
              'bg-primary border-primary text-white shadow-lg translate-x-1' :
              'bg-app-bg-alt border-transparent hover:border-primary/30 hover:translate-x-1 text-app-text-main'}`
              }>
              
                    <span className="font-bold flex-1">{topic}</span>
                    <PlayCircle
                size={20}
                className={selectedTopic === topic ? 'text-white' : 'text-primary opacity-0 group-hover:opacity-100 transition-opacity'} />
              
                  </button>
            )}
              </div>
            </div>
        }
        </div>
      )}
    </div>);

};

export default UnitAccordion;