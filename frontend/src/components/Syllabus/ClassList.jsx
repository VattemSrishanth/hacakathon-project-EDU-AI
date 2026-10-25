import { GraduationCap, ArrowRight } from 'lucide-react';

const GRADE_THEMES = {
  // Column 1: Blue (Class 1 & 6)
  '1': {
    bg: 'bg-gradient-to-br from-white via-white to-blue-50/80 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/40',
    border: 'border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600',
    iconBg: 'bg-blue-50 dark:bg-blue-900/40 text-blue-500 dark:text-blue-400',
    arrowBg: 'bg-blue-50 dark:bg-blue-900/50 text-blue-500 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white',
    selected: 'ring-2 ring-blue-500 border-blue-500 shadow-md'
  },
  '6': {
    bg: 'bg-gradient-to-br from-white via-white to-blue-50/80 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/40',
    border: 'border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600',
    iconBg: 'bg-blue-50 dark:bg-blue-900/40 text-blue-500 dark:text-blue-400',
    arrowBg: 'bg-blue-50 dark:bg-blue-900/50 text-blue-500 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white',
    selected: 'ring-2 ring-blue-500 border-blue-500 shadow-md'
  },

  // Column 2: Purple (Class 2 & 7)
  '2': {
    bg: 'bg-gradient-to-br from-white via-white to-purple-50/80 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950/40',
    border: 'border-slate-200/90 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600',
    iconBg: 'bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
    arrowBg: 'bg-purple-50 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white',
    selected: 'ring-2 ring-purple-500 border-purple-500 shadow-md'
  },
  '7': {
    bg: 'bg-gradient-to-br from-white via-white to-purple-50/80 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950/40',
    border: 'border-slate-200/90 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600',
    iconBg: 'bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
    arrowBg: 'bg-purple-50 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white',
    selected: 'ring-2 ring-purple-500 border-purple-500 shadow-md'
  },

  // Column 3: Pink / Rose (Class 3 & 8)
  '3': {
    bg: 'bg-gradient-to-br from-white via-white to-rose-50/80 dark:from-slate-900 dark:via-slate-900 dark:to-rose-950/40',
    border: 'border-slate-200/90 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-600',
    iconBg: 'bg-rose-50 dark:bg-rose-900/40 text-rose-500 dark:text-rose-400',
    arrowBg: 'bg-rose-50 dark:bg-rose-900/50 text-rose-500 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white',
    selected: 'ring-2 ring-rose-500 border-rose-500 shadow-md'
  },
  '8': {
    bg: 'bg-gradient-to-br from-white via-white to-rose-50/80 dark:from-slate-900 dark:via-slate-900 dark:to-rose-950/40',
    border: 'border-slate-200/90 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-600',
    iconBg: 'bg-rose-50 dark:bg-rose-900/40 text-rose-500 dark:text-rose-400',
    arrowBg: 'bg-rose-50 dark:bg-rose-900/50 text-rose-500 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white',
    selected: 'ring-2 ring-rose-500 border-rose-500 shadow-md'
  },

  // Column 4: Amber / Orange (Class 4 & 9)
  '4': {
    bg: 'bg-gradient-to-br from-white via-white to-amber-50/80 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/40',
    border: 'border-slate-200/90 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600',
    iconBg: 'bg-amber-50 dark:bg-amber-900/40 text-amber-500 dark:text-amber-400',
    arrowBg: 'bg-amber-50 dark:bg-amber-900/50 text-amber-500 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white',
    selected: 'ring-2 ring-amber-500 border-amber-500 shadow-md'
  },
  '9': {
    bg: 'bg-gradient-to-br from-white via-white to-amber-50/80 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/40',
    border: 'border-slate-200/90 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600',
    iconBg: 'bg-amber-50 dark:bg-amber-900/40 text-amber-500 dark:text-amber-400',
    arrowBg: 'bg-amber-50 dark:bg-amber-900/50 text-amber-500 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white',
    selected: 'ring-2 ring-amber-500 border-amber-500 shadow-md'
  },

  // Column 5: Emerald / Teal (Class 5 & 10)
  '5': {
    bg: 'bg-gradient-to-br from-white via-white to-emerald-50/80 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/40',
    border: 'border-slate-200/90 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600',
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-500 dark:text-emerald-400',
    arrowBg: 'bg-emerald-50 dark:bg-emerald-900/50 text-emerald-500 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white',
    selected: 'ring-2 ring-emerald-500 border-emerald-500 shadow-md'
  },
  '10': {
    bg: 'bg-gradient-to-br from-white via-white to-emerald-50/80 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/40',
    border: 'border-slate-200/90 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600',
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-500 dark:text-emerald-400',
    arrowBg: 'bg-emerald-50 dark:bg-emerald-900/50 text-emerald-500 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white',
    selected: 'ring-2 ring-emerald-500 border-emerald-500 shadow-md'
  }
};

const ClassList = ({ onSelectClass, selectedGrade }) => {
  const grades = Array.from({ length: 10 }, (_, i) => (i + 1).toString());

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-5">
      {grades.map((grade) => {
        const theme = GRADE_THEMES[grade] || GRADE_THEMES['1'];
        const isSelected = selectedGrade === grade;

        return (
          <div
            key={grade}
            onClick={() => onSelectClass(grade)}
            className={`group cursor-pointer rounded-2xl md:rounded-3xl p-5 md:p-6 transition-all duration-300 shadow-xs hover:shadow-md hover:-translate-y-1 active:scale-[0.98] border flex flex-col justify-between h-40 md:h-44 ${theme.bg} ${theme.border} ${
              isSelected ? theme.selected : ''
            }`}
          >
            {/* Top Row: Icon badge on left */}
            <div className="flex items-start justify-between">
              <div
                className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center shrink-0 shadow-xs transition-transform duration-300 group-hover:scale-105 ${theme.iconBg}`}
              >
                <GraduationCap size={22} strokeWidth={1.8} />
              </div>
            </div>

            {/* Bottom Row: Class Label + Grade Number on Left, Action Arrow on Right */}
            <div className="flex items-end justify-between pt-2">
              <div>
                <span className="text-[10px] md:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                  CLASS
                </span>
                <span className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-none">
                  {grade}
                </span>
              </div>

              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${theme.arrowBg}`}
              >
                <ArrowRight size={14} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ClassList;
