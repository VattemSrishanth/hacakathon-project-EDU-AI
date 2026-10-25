import {
  Calculator,
  FlaskConical,
  BookOpen,
  Globe2,
  Leaf,
  Languages
} from 'lucide-react';

const subjectIcons = {
  Maths: Calculator,
  Mathematics: Calculator,
  Science: FlaskConical,
  English: BookOpen,
  'Social Science': Globe2,
  'Social Studies': Globe2,
  EVS: Leaf,
  Environmental: Leaf,
  Telugu: Languages,
  Hindi: Languages
};

const SubjectList = ({ subjects, onSelectSubject, selectedSubject }) => {
  return (
    <div className="grid grid-cols-1 gap-2.5">
      {subjects.map((subject) => {
        const Icon = subjectIcons[subject] || BookOpen;
        const isSelected = selectedSubject === subject;

        return (
          <div
            key={subject}
            onClick={() => onSelectSubject(subject)}
            className={`cursor-pointer transition-all duration-200 rounded-2xl border p-4 flex items-center gap-3.5 group active:scale-[0.99] ${
              isSelected
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50/50'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
              }`}
            >
              <Icon size={20} />
            </div>
            <span
              className={`text-sm font-bold leading-tight ${
                isSelected
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {subject}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default SubjectList;
