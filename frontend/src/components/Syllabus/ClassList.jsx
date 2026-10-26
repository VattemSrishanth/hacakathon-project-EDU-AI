import { GraduationCap, ArrowRight } from 'lucide-react';

const GRADE_THEME = {
  bg: 'bg-gradient-to-br from-white via-white to-primary/5 dark:from-slate-900 dark:via-slate-900 dark:to-primary/10',
  border: 'border-slate-200/90 dark:border-slate-800 hover:border-primary/60',
  iconBg: 'bg-primary/10 text-primary',
  arrowBg: 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white',
  selected: 'ring-2 ring-primary border-primary shadow-md'
};

const ClassList = ({ onSelectClass, selectedGrade }) => {
  const grades = Array.from({ length: 10 }, (_, i) => (i + 1).toString());

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-5">
      {grades.map((grade) => {
        const theme = GRADE_THEME;
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
