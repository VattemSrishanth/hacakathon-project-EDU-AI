import { 
  Calculator, 
  FlaskConical, 
  BookOpen, 
  Globe2, 
  Leaf 
} from 'lucide-react';
import Card from '../Card';

interface SubjectListProps {
  subjects: string[];
  onSelectSubject: (subject: string) => void;
  selectedSubject: string | null;
}

const subjectIcons: Record<string, any> = {
  Maths: Calculator,
  Mathematics: Calculator,
  Science: FlaskConical,
  English: BookOpen,
  'Social Science': Globe2,
  'Social Studies': Globe2,
  EVS: Leaf,
  Environmental: Leaf
};

const SubjectList = ({ subjects, onSelectSubject, selectedSubject }: SubjectListProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {subjects.map((subject) => {
        const Icon = subjectIcons[subject] || BookOpen;
        const colorClass = 
          subject.includes('Math') ? 'bg-blue-500/10 text-blue-500' :
          subject.includes('Sci') ? 'bg-green-500/10 text-green-500' :
          subject.includes('Soc') ? 'bg-orange-500/10 text-orange-500' :
          subject.includes('Eng') ? 'bg-purple-500/10 text-purple-500' :
          'bg-indigo-500/10 text-indigo-500';

        return (
          <Card
            key={subject}
            onClick={() => onSelectSubject(subject)}
            className={`cursor-pointer transition-all duration-300 rounded-4xl border-2 group p-6 active:scale-95 ${
              selectedSubject === subject
                ? 'bg-app-bg border-primary shadow-xl ring-4 ring-primary/10'
                : 'bg-app-bg border-app-border hover:border-primary/30'
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className={`p-4 rounded-3xl ${colorClass.split(' ')[0]} transition-transform group-hover:scale-110`}>
                <Icon size={32} />
              </div>
              <span className="text-lg font-black text-app-text-main text-center leading-tight">
                {subject}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default SubjectList;
